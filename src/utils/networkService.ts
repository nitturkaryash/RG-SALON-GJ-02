// Network connectivity service
import { useState, useEffect, useCallback } from 'react';

type NetworkStatus = {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  lastOnlineTime: number | null;
  lastOfflineTime: number | null;
};

type NetworkEventCallback = (status: NetworkStatus) => void;

class NetworkService {
  private listeners: Set<NetworkEventCallback> = new Set();
  private status: NetworkStatus = {
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
    lastOnlineTime: navigator.onLine ? Date.now() : null,
    lastOfflineTime: !navigator.onLine ? Date.now() : null,
  };

  constructor() {
    this.init();
  }

  private init(): void {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Check connection type if available
    this.checkConnectionType();

    // Periodically check connection quality
    this.startConnectionQualityCheck();
  }

  private handleOnline = (): void => {
    console.log('🌐 Network: Back online');
    this.status.isOnline = true;
    this.status.lastOnlineTime = Date.now();
    this.checkConnectionType();
    this.notifyListeners();
  };

  private handleOffline = (): void => {
    console.log('📡 Network: Gone offline');
    this.status.isOnline = false;
    this.status.lastOfflineTime = Date.now();
    this.notifyListeners();
  };

  private checkConnectionType(): void {
    // Check if Network Information API is available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        this.status.connectionType = connection.effectiveType || 'unknown';
        this.status.isSlowConnection = ['slow-2g', '2g'].includes(connection.effectiveType);
      }
    }
  }

  private startConnectionQualityCheck(): void {
    // Check connection quality every 30 seconds when online
    setInterval(() => {
      if (this.status.isOnline) {
        this.checkConnectionQuality();
      }
    }, 30000);
  }

  private async checkConnectionQuality(): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Try to fetch a small resource to test connection
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });

      const endTime = Date.now();
      const latency = endTime - startTime;

      // Consider connection slow if latency > 1000ms
      this.status.isSlowConnection = latency > 1000 || !response.ok;
      
      this.checkConnectionType();
      this.notifyListeners();
    } catch (error) {
      // If fetch fails, we might be offline
      if (this.status.isOnline) {
        console.warn('⚠️ Connection quality check failed:', error);
        this.status.isSlowConnection = true;
        this.notifyListeners();
      }
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.status });
      } catch (error) {
        console.error('❌ Error notifying network listener:', error);
      }
    });
  }

  // Public methods
  public getStatus(): NetworkStatus {
    return { ...this.status };
  }

  public isOnline(): boolean {
    return this.status.isOnline;
  }

  public isSlowConnection(): boolean {
    return this.status.isSlowConnection;
  }

  public addListener(callback: NetworkEventCallback): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  public removeListener(callback: NetworkEventCallback): void {
    this.listeners.delete(callback);
  }

  // Test internet connectivity by pinging a reliable service
  public async testConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // Try multiple endpoints to ensure reliability
      const testUrls = [
        'https://www.google.com/favicon.ico',
        'https://httpbin.org/status/200',
        'https://jsonplaceholder.typicode.com/posts/1'
      ];

      for (const url of testUrls) {
        try {
          // Create abort controller for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const response = await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          return true; // If any test succeeds, we're online
        } catch (error) {
          continue; // Try next URL
        }
      }

      return false;
    } catch (error) {
      console.warn('⚠️ Connectivity test failed:', error);
      return false;
    }
  }

  // Clean up event listeners
  public destroy(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.listeners.clear();
  }
}

// Create singleton instance
export const networkService = new NetworkService();

// React hook for using network status
export function useNetworkStatus(): NetworkStatus & {
  testConnectivity: () => Promise<boolean>;
} {
  const [status, setStatus] = useState<NetworkStatus>(networkService.getStatus());

  useEffect(() => {
    const unsubscribe = networkService.addListener(setStatus);
    return unsubscribe;
  }, []);

  const testConnectivity = useCallback(() => {
    return networkService.testConnectivity();
  }, []);

  return {
    ...status,
    testConnectivity,
  };
}

// Hook for simple online/offline detection
export function useOnlineStatus(): boolean {
  const { isOnline } = useNetworkStatus();
  return isOnline;
}

// Export types
export type { NetworkStatus, NetworkEventCallback };
export { NetworkService }; 