/**
 * Scroll Preservation Utilities
 * Helps prevent scroll reset when right-clicking on appointments or during state updates
 */

interface ScrollPosition {
  top: number;
  left: number;
}

class ScrollPreservationManager {
  private positions = new Map<string, ScrollPosition>();
  private isRestoring = false;
  private restorationTimeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Store the current scroll position for a given element
   */
  saveScrollPosition(elementId: string, element: HTMLElement): void {
    if (!element || this.isRestoring) return;
    
    this.positions.set(elementId, {
      top: element.scrollTop,
      left: element.scrollLeft
    });
  }

  /**
   * Restore the saved scroll position for a given element
   */
  restoreScrollPosition(elementId: string, element: HTMLElement, immediate = false): void {
    const position = this.positions.get(elementId);
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
        behavior: immediate ? 'auto' : 'smooth'
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
    return this.positions.get(elementId) || null;
  }

  /**
   * Clear stored position for an element
   */
  clearScrollPosition(elementId: string): void {
    this.positions.delete(elementId);
    const timeout = this.restorationTimeouts.get(elementId);
    if (timeout) {
      clearTimeout(timeout);
      this.restorationTimeouts.delete(elementId);
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
}

// Global instance
export const scrollManager = new ScrollPreservationManager();

/**
 * React hook for scroll preservation
 */
export function useScrollPreservation(elementRef: React.RefObject<HTMLElement>, elementId: string) {
  const savePosition = React.useCallback(() => {
    if (elementRef.current) {
      scrollManager.saveScrollPosition(elementId, elementRef.current);
    }
  }, [elementRef, elementId]);

  const restorePosition = React.useCallback((immediate = false) => {
    if (elementRef.current) {
      scrollManager.restoreScrollPosition(elementId, elementRef.current, immediate);
    }
  }, [elementRef, elementId]);

  const withPreservation = React.useCallback(<T,>(operation: () => T): T => {
    if (elementRef.current) {
      return scrollManager.withScrollPreservation(elementId, elementRef.current, operation);
    }
    return operation();
  }, [elementRef, elementId]);

  const createPreservingHandler = React.useCallback(<T extends Event>(
    handler: (event: T) => void
  ) => {
    if (elementRef.current) {
      return scrollManager.createPreservingHandler(elementId, elementRef.current, handler);
    }
    return handler;
  }, [elementRef, elementId]);

  return {
    savePosition,
    restorePosition,
    withPreservation,
    createPreservingHandler
  };
}

/**
 * Prevent scroll reset during context menu operations
 */
export function preventScrollReset(element: HTMLElement): () => void {
  const originalScrollTop = element.scrollTop;
  const originalScrollLeft = element.scrollLeft;
  
  const restoreScroll = () => {
    if (element.scrollTop !== originalScrollTop || element.scrollLeft !== originalScrollLeft) {
      element.scrollTo({
        top: originalScrollTop,
        left: originalScrollLeft,
        behavior: 'auto'
      });
    }
  };

  // Return cleanup function
  return restoreScroll;
}

/**
 * Debounced scroll position saver
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