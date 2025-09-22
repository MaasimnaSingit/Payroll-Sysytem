const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Initialize electron store for app settings
const Store = require('electron-store');
const store = new Store();

// Global database reference
let db;
let mainWindow;

// Development mode check
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * Initialize SQLite database with users table
 */
const initializeDatabase = () => {
  const dbPath = path.join(app.getPath('userData'), 'payroll_system.db');
  console.log('📊 Database path:', dbPath);
  
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Database connection error:', err);
    } else {
      console.log('✅ Connected to SQLite database');
      createTables();
    }
  });
};

/**
 * Create necessary database tables
 */
const createTables = () => {
  // Users table for authentication
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      role TEXT NOT NULL DEFAULT 'employee',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createUsersTable, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err);
    } else {
      console.log('✅ Users table ready');
      // Create default admin account if no users exist
      createDefaultAdmin();
    }
  });
};

/**
 * Create default admin account
 */
const createDefaultAdmin = () => {
  const checkAdmin = 'SELECT COUNT(*) as count FROM users WHERE username = ?';
  db.get(checkAdmin, ['admin'], async (err, row) => {
    if (err) {
      console.error('❌ Error checking admin account:', err);
      return;
    }

    if (row.count === 0) {
      try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const insertAdmin = `
          INSERT INTO users (username, password, full_name, email, role)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(insertAdmin, ['admin', hashedPassword, 'System Administrator', 'admin@company.com', 'admin'], (err) => {
          if (err) {
            console.error('❌ Error creating admin account:', err);
          } else {
            console.log('✅ Default admin account created');
            console.log('👤 Admin credentials: admin / admin123');
          }
        });
      } catch (error) {
        console.error('❌ Error hashing password:', error);
      }
    } else {
      console.log('✅ Admin account already exists');
    }
  });
};

/**
 * Get Vite dev server port with retry logic
 */
const getVitePort = (retryCount = 0) => {
  const maxRetries = 20;
  const portFile = path.join(__dirname, '..', '.vite-port');
  
  try {
    if (fs.existsSync(portFile)) {
      const port = fs.readFileSync(portFile, 'utf8').trim();
      if (port && !isNaN(parseInt(port))) {
        console.log(`🔌 Vite dev server port detected: ${port}`);
        return port;
      }
    }
  } catch (error) {
    console.error('❌ Error reading port file:', error);
  }
  
  if (retryCount < maxRetries) {
    console.log(`⏳ Port file not ready, retrying... (${retryCount + 1}/${maxRetries})`);
    setTimeout(() => getVitePort(retryCount + 1), 500);
    return null;
  }
  
  console.error('❌ Failed to detect Vite port after all retries');
  return '5173'; // Fallback
};

/**
 * Create main application window
 */
const createWindow = () => {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('🔧 Preload script path:', preloadPath);
  console.log('🔧 Preload script exists:', fs.existsSync(preloadPath));
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: preloadPath,
      webSecurity: false,
      allowRunningInsecureContent: false
    },
    show: false,
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  // Load the app based on environment
  if (isDev) {
    loadDevServer();
  } else {
    // Load production build
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ Main window ready');
  });

  // Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  return mainWindow;
};

/**
 * Load development server with dynamic port detection
 */
const loadDevServer = () => {
  const port = getVitePort();
  
  if (!port) {
    // Show loading message while waiting for port
    mainWindow.loadURL(`data:text/html,
      <html>
        <head>
          <title>Starting Payroll System...</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
            }
            .container { text-align: center; }
            .spinner { 
              border: 4px solid rgba(255,255,255,0.3); 
              border-top: 4px solid white; 
              border-radius: 50%; 
              width: 50px; 
              height: 50px; 
              animation: spin 1s linear infinite; 
              margin: 20px auto; 
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Starting Payroll & Attendance System</h1>
            <div class="spinner"></div>
            <p>Initializing development server...</p>
            <p>Please wait while the application loads.</p>
          </div>
        </body>
      </html>
    `);
    
    // Retry loading after a delay
    setTimeout(() => {
      const retryPort = getVitePort();
      if (retryPort) {
        loadDevServerWithPort(retryPort);
      } else {
        // Show error message
        mainWindow.loadURL(`data:text/html,
          <html>
            <head>
              <title>Error - Payroll System</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                  color: white; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  height: 100vh; 
                  margin: 0; 
                }
                .container { text-align: center; max-width: 500px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>❌ Development Server Error</h1>
                <p>The Vite development server could not be started or detected.</p>
                <p>Please ensure you're running the app with:</p>
                <code style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; display: block; margin: 20px 0;">npm run dev</code>
                <p>If the problem persists, try:</p>
                <code style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px; display: block; margin: 20px 0;">npm run reset</code>
              </div>
            </body>
          </html>
        `);
      }
    }, 2000);
  } else {
    loadDevServerWithPort(port);
  }
};

/**
 * Load development server with specific port
 */
const loadDevServerWithPort = (port) => {
  const devUrl = `http://localhost:${port}`;
  console.log(`🌐 Loading development URL: ${devUrl}`);
  
  mainWindow.loadURL(devUrl);
  
  // Open DevTools in development
  mainWindow.webContents.openDevTools();
  
  // Debug preload script loading
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Window finished loading');
    mainWindow.webContents.executeJavaScript(`
      console.log('🔍 Checking window.electronAPI in renderer...');
      console.log('🔍 window.electronAPI:', window.electronAPI);
      console.log('🔍 window.electronAPI?.login:', window.electronAPI?.login);
    `);
  });
  
  // Handle load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Failed to load dev server:', errorCode, errorDescription);
    if (errorCode === -6) { // ERR_CONNECTION_REFUSED
      console.log('🔄 Retrying with different port...');
      setTimeout(() => {
        const newPort = getVitePort();
        if (newPort && newPort !== port) {
          loadDevServerWithPort(newPort);
        }
      }, 1000);
    }
  });
};

/**
 * IPC Handlers for authentication
 */

// Login handler
ipcMain.handle('auth:login', async (event, { username, password }) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE username = ?';
    
    db.get(query, [username], async (err, user) => {
      if (err) {
        reject({ success: false, message: 'Database error occurred' });
        return;
      }
      
      if (!user) {
        resolve({ success: false, message: 'Invalid username or password' });
        return;
      }
      
      try {
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (isValidPassword) {
          // Don't send password back to renderer
          const { password: _, ...userWithoutPassword } = user;
          resolve({
            success: true,
            user: userWithoutPassword,
            message: 'Login successful'
          });
        } else {
          resolve({ success: false, message: 'Invalid username or password' });
        }
      } catch (bcryptErr) {
        reject({ success: false, message: 'Authentication error occurred' });
      }
    });
  });
});

// Create user handler (admin only)
ipcMain.handle('auth:createUser', async (event, { username, password, role, fullName, email }) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        reject({ success: false, message: 'Error hashing password' });
        return;
      }
      
      const query = `
        INSERT INTO users (username, password, role, full_name, email)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(query, [username, hashedPassword, role, fullName, email], function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            resolve({ success: false, message: 'Username already exists' });
          } else {
            reject({ success: false, message: 'Error creating user' });
          }
        } else {
          resolve({ success: true, message: 'User created successfully', userId: this.lastID });
        }
      });
    });
  });
});

// Get all users handler (admin only)
ipcMain.handle('auth:getUsers', async () => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT id, username, role, full_name, email, created_at FROM users ORDER BY created_at DESC';
    
    db.all(query, (err, users) => {
      if (err) {
        reject({ success: false, message: 'Error fetching users' });
      } else {
        resolve({ success: true, users });
      }
    });
  });
});

// App event handlers
app.whenReady().then(() => {
  initializeDatabase();
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
}); 