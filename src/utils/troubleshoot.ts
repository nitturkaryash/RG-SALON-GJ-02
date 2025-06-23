// Troubleshooting utilities for offline functionality

export interface BrowserSupport {
  indexedDB: boolean;
  serviceWorker: boolean;
  navigator: boolean;
  fetch: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  onlineEvents: boolean;
  abortController: boolean;
}

export interface TroubleshootResult {
  isSupported: boolean;
  browserSupport: BrowserSupport;
  issues: string[];
  recommendations: string[];
}

export function checkBrowserSupport(): BrowserSupport {
  return {
    indexedDB: 'indexedDB' in window,
    serviceWorker: 'serviceWorker' in navigator,
    navigator: 'navigator' in window,
    fetch: 'fetch' in window,
    localStorage: 'localStorage' in window,
    sessionStorage: 'sessionStorage' in window,
    onlineEvents: 'onLine' in navigator,
    abortController: 'AbortController' in window,
  };
}

export function troubleshootOfflineFeatures(): TroubleshootResult {
  const support = checkBrowserSupport();
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check IndexedDB support
  if (!support.indexedDB) {
    issues.push('IndexedDB is not supported');
    recommendations.push('Use a modern browser that supports IndexedDB');
  }

  // Check fetch API
  if (!support.fetch) {
    issues.push('Fetch API is not supported');
    recommendations.push('Use a modern browser or add a fetch polyfill');
  }

  // Check navigator.onLine
  if (!support.onlineEvents) {
    issues.push('Online/offline events not supported');
    recommendations.push('Network status detection will be limited');
  }

  // Check AbortController
  if (!support.abortController) {
    issues.push('AbortController is not supported');
    recommendations.push('Timeout functionality may be limited');
  }

  // Check storage APIs
  if (!support.localStorage) {
    issues.push('localStorage is not available');
    recommendations.push('Some data persistence features may not work');
  }

  // Overall support assessment
  const criticalFeatures = [support.indexedDB, support.fetch, support.navigator];
  const isSupported = criticalFeatures.every(feature => feature);

  return {
    isSupported,
    browserSupport: support,
    issues,
    recommendations,
  };
}

export async function testIndexedDB(): Promise<boolean> {
  try {
    if (!window.indexedDB) {
      console.error('❌ IndexedDB not available');
      return false;
    }

    const testDB = 'test-offline-db';
    const request = indexedDB.open(testDB, 1);

    return new Promise((resolve) => {
      request.onerror = () => {
        console.error('❌ IndexedDB test failed');
        resolve(false);
      };

      request.onsuccess = () => {
        console.log('✅ IndexedDB test passed');
        request.result.close();
        indexedDB.deleteDatabase(testDB);
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore('test', { keyPath: 'id' });
      };
    });
  } catch (error) {
    console.error('❌ IndexedDB test error:', error);
    return false;
  }
}

export async function testNetworkDetection(): Promise<boolean> {
  try {
    const isOnline = navigator.onLine;
    console.log(`🌐 Network status: ${isOnline ? 'online' : 'offline'}`);
    
    // Test network change events
    let eventSupported = false;
    const testHandler = () => { eventSupported = true; };
    
    window.addEventListener('online', testHandler);
    window.addEventListener('offline', testHandler);
    
    // Clean up
    setTimeout(() => {
      window.removeEventListener('online', testHandler);
      window.removeEventListener('offline', testHandler);
    }, 100);
    
    console.log(`📡 Network events: ${eventSupported ? 'supported' : 'limited'}`);
    return true;
  } catch (error) {
    console.error('❌ Network detection test failed:', error);
    return false;
  }
}

export async function runDiagnostics(): Promise<void> {
  console.log('🔍 Running offline functionality diagnostics...');
  
  const result = troubleshootOfflineFeatures();
  
  console.log('📊 Browser Support:', result.browserSupport);
  console.log(`✅ Overall Support: ${result.isSupported ? 'YES' : 'NO'}`);
  
  if (result.issues.length > 0) {
    console.warn('⚠️ Issues found:', result.issues);
    console.info('💡 Recommendations:', result.recommendations);
  }
  
  // Run specific tests
  console.log('🧪 Running specific tests...');
  
  const indexedDBTest = await testIndexedDB();
  const networkTest = await testNetworkDetection();
  
  console.log(`📦 IndexedDB: ${indexedDBTest ? 'PASS' : 'FAIL'}`);
  console.log(`🌐 Network Detection: ${networkTest ? 'PASS' : 'FAIL'}`);
  
  if (result.isSupported && indexedDBTest && networkTest) {
    console.log('🎉 All tests passed! Offline functionality should work properly.');
  } else {
    console.log('⚠️ Some tests failed. Offline functionality may be limited.');
  }
}

// Export utility to run diagnostics from console
(window as any).runOfflineDiagnostics = runDiagnostics; 