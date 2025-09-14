/**
 * Scroll Preservation Utilities
 * Helps prevent scroll reset when right-clicking on appointments or during state updates
 * Now includes localStorage persistence for scroll positions
 */

import React from 'react';

interface ScrollPosition {
  top: number;
  left: number;
}

class ScrollPreservationManager {
  private positions = new Map<string, ScrollPosition>();
  private isRestoring = false;
  private restorationTimeouts = new Map<string, NodeJS.Timeout>();
  private localStoragePrefix = 'scroll_position_';

  /**
   * Store the current scroll position for a given element and persist to localStorage
   */
  saveScrollPosition(
    elementId: string,
    element: HTMLElement,
    persistToStorage = true
  ): void {
    if (!element || this.isRestoring) return;

    const position = {
      top: element.scrollTop,
      left: element.scrollLeft,
    };

    this.positions.set(elementId, position);

    // Persist to localStorage if requested
    if (persistToStorage && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `${this.localStoragePrefix}${elementId}`,
          JSON.stringify(position)
        );
      } catch (error) {
        console.warn('Failed to save scroll position to localStorage:', error);
      }
    }
  }

  /**
   * Load scroll position from localStorage
   */
  loadScrollPositionFromStorage(elementId: string): ScrollPosition | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(
        `${this.localStoragePrefix}${elementId}`
      );
      if (stored) {
        const position = JSON.parse(stored) as ScrollPosition;
        this.positions.set(elementId, position);
        return position;
      }
    } catch (error) {
      console.warn('Failed to load scroll position from localStorage:', error);
    }

    return null;
  }

  /**
   * Restore the saved scroll position for a given element
   */
  restoreScrollPosition(
    elementId: string,
    element: HTMLElement,
    immediate = false
  ): void {
    let position = this.positions.get(elementId);

    // If no position in memory, try to load from localStorage
    if (!position) {
      position = this.loadScrollPositionFromStorage(elementId);
    }

    if (!position || !element) return;

    // Clear any pending restoration
    const existingTimeout = this.restorationTimeouts.get(elementId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const restore = () => {
      this.isRestoring = true;
      element.scrollTo({
        top: position.top,
        left: position.left,
        behavior: immediate ? 'auto' : 'smooth',
      });

      // Reset restoration flag after a short delay
      setTimeout(() => {
        this.isRestoring = false;
      }, 100);
    };

    if (immediate) {
      restore();
    } else {
      // Schedule restoration for next frame to allow DOM updates
      const timeout = setTimeout(restore, 0);
      this.restorationTimeouts.set(elementId, timeout);
    }
  }

  /**
   * Get the saved scroll position without restoring
   */
  getScrollPosition(elementId: string): ScrollPosition | null {
    let position = this.positions.get(elementId);

    // If no position in memory, try to load from localStorage
    if (!position) {
      position = this.loadScrollPositionFromStorage(elementId);
    }

    return position || null;
  }

  /**
   * Clear stored position for an element
   */
  clearScrollPosition(elementId: string, clearFromStorage = true): void {
    this.positions.delete(elementId);
    const timeout = this.restorationTimeouts.get(elementId);
    if (timeout) {
      clearTimeout(timeout);
      this.restorationTimeouts.delete(elementId);
    }

    // Clear from localStorage if requested
    if (clearFromStorage && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${this.localStoragePrefix}${elementId}`);
      } catch (error) {
        console.warn(
          'Failed to clear scroll position from localStorage:',
          error
        );
      }
    }
  }

  /**
   * Check if currently in restoration mode
   */
  isRestoringScroll(): boolean {
    return this.isRestoring;
  }

  /**
   * Preserve scroll position during a state update operation
   */
  withScrollPreservation<T>(
    elementId: string,
    element: HTMLElement,
    operation: () => T
  ): T {
    this.saveScrollPosition(elementId, element);
    const result = operation();

    // Schedule restoration after the operation
    setTimeout(() => {
      this.restoreScrollPosition(elementId, element, true);
    }, 0);

    return result;
  }

  /**
   * Create a scroll-preserving event handler
   */
  createPreservingHandler<T extends Event>(
    elementId: string,
    element: HTMLElement,
    handler: (event: T) => void
  ): (event: T) => void {
    return (event: T) => {
      this.saveScrollPosition(elementId, element);
      handler(event);
      // Restore position after handler completes
      setTimeout(() => {
        this.restoreScrollPosition(elementId, element, true);
      }, 0);
    };
  }

  /**
   * Create a debounced scroll saver for continuous scroll events
   */
  createDebouncedScrollSaver(
    elementId: string,
    element: HTMLElement,
    delay = 200,
    persistToStorage = true
  ): () => void {
    let timeout: NodeJS.Timeout;

    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.saveScrollPosition(elementId, element, persistToStorage);
      }, delay);
    };
  }
}

// Global instance
export const scrollManager = new ScrollPreservationManager();

/**
 * React hook for scroll preservation with localStorage support
 */
export function useScrollPreservation(
  elementRef: React.RefObject<HTMLElement>,
  elementId: string
) {
  const savePosition = React.useCallback(
    (persistToStorage = true) => {
      if (elementRef.current) {
        scrollManager.saveScrollPosition(
          elementId,
          elementRef.current,
          persistToStorage
        );
      }
    },
    [elementRef, elementId]
  );

  const restorePosition = React.useCallback(
    (immediate = false) => {
      if (elementRef.current) {
        scrollManager.restoreScrollPosition(
          elementId,
          elementRef.current,
          immediate
        );
      }
    },
    [elementRef, elementId]
  );

  const loadFromStorage = React.useCallback(() => {
    if (elementRef.current) {
      const position = scrollManager.loadScrollPositionFromStorage(elementId);
      if (position) {
        scrollManager.restoreScrollPosition(
          elementId,
          elementRef.current,
          true
        );
      }
      return position;
    }
    return null;
  }, [elementRef, elementId]);

  const withPreservation = React.useCallback(
    <T>(operation: () => T): T => {
      if (elementRef.current) {
        return scrollManager.withScrollPreservation(
          elementId,
          elementRef.current,
          operation
        );
      }
      return operation();
    },
    [elementRef, elementId]
  );

  const createPreservingHandler = React.useCallback(
    <T extends Event>(handler: (event: T) => void) => {
      if (elementRef.current) {
        return scrollManager.createPreservingHandler(
          elementId,
          elementRef.current,
          handler
        );
      }
      return handler;
    },
    [elementRef, elementId]
  );

  const createDebouncedSaver = React.useCallback(
    (delay = 200, persistToStorage = true) => {
      if (elementRef.current) {
        return scrollManager.createDebouncedScrollSaver(
          elementId,
          elementRef.current,
          delay,
          persistToStorage
        );
      }
      return () => {};
    },
    [elementRef, elementId]
  );

  return {
    savePosition,
    restorePosition,
    loadFromStorage,
    withPreservation,
    createPreservingHandler,
    createDebouncedSaver,
  };
}

/**
 * Prevent scroll reset during context menu operations
 */
export function preventScrollReset(element: HTMLElement): () => void {
  const originalScrollTop = element.scrollTop;
  const originalScrollLeft = element.scrollLeft;

  const restoreScroll = () => {
    if (
      element.scrollTop !== originalScrollTop ||
      element.scrollLeft !== originalScrollLeft
    ) {
      element.scrollTo({
        top: originalScrollTop,
        left: originalScrollLeft,
        behavior: 'auto',
      });
    }
  };

  // Return cleanup function
  return restoreScroll;
}

/**
 * Debounced scroll position saver (deprecated - use scrollManager.createDebouncedScrollSaver instead)
 */
export function createDebouncedScrollSaver(
  element: HTMLElement,
  elementId: string,
  delay = 100
): () => void {
  let timeout: NodeJS.Timeout;

  const savePosition = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      scrollManager.saveScrollPosition(elementId, element);
    }, delay);
  };

  return savePosition;
}
