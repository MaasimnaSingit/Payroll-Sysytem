const { contextBridge, ipcRenderer } = require('electron');

console.log('🚀 Preload script executing in Electron...');

// Verify we're running in Electron
if (typeof process === 'undefined' || !process.versions.electron) {
  console.error('❌ This preload script must run in Electron!');
  throw new Error('Preload script must run in Electron environment');
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication methods
  login: async (credentials) => {
    try {
      console.log('🔐 Login method called with credentials:', credentials);
      const result = await ipcRenderer.invoke('auth:login', credentials);
      console.log('🔐 Login result:', result);
      return result;
    } catch (error) {
      console.error('❌ Login error in preload:', error);
      throw error;
    }
  },
  createUser: async (userData) => {
    try {
      console.log('👤 Create user method called with userData:', userData);
      const result = await ipcRenderer.invoke('auth:createUser', userData);
      console.log('👤 Create user result:', result);
      return result;
    } catch (error) {
      console.error('❌ Create user error in preload:', error);
      throw error;
    }
  },
  getUsers: async () => {
    try {
      console.log('📋 Get users method called');
      const result = await ipcRenderer.invoke('auth:getUsers');
      console.log('📋 Get users result:', result);
      return result;
    } catch (error) {
      console.error('❌ Get users error in preload:', error);
      throw error;
    }
  },
  
  // App info
  getAppVersion: () => process.versions.app,
  getNodeVersion: () => process.versions.node,
  getChromeVersion: () => process.versions.chrome,
  getElectronVersion: () => process.versions.electron,
  
  // Environment check
  isElectron: true,
  isDesktop: true
});

console.log('✅ Electron API exposed to renderer process');

// Additional verification
setTimeout(() => {
  console.log('🔍 Verifying API exposure...');
  console.log('🔍 window.electronAPI in preload:', typeof window !== 'undefined' ? window.electronAPI : 'window not available');
}, 100); 