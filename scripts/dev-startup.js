const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Clean up stale files
 */
function cleanupFiles() {
  return new Promise((resolve) => {
    console.log('Cleaning up stale files...');
    
    const portFile = path.join(__dirname, '..', '.vite-port');
    const distDir = path.join(__dirname, '..', 'dist');
    
    // Remove stale port file
    if (fs.existsSync(portFile)) {
      fs.unlinkSync(portFile);
      console.log('Removed stale .vite-port file');
    }
    
    // Remove dist directory if it exists
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
      console.log('Cleaned dist directory');
    }
    
    resolve();
  });
}

/**
 * Start Vite dev server
 */
function startViteServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting Vite dev server...');
    
    const viteProcess = spawn('npm', ['run', 'vite-dev'], {
      stdio: 'pipe',
      shell: true,
      cwd: path.join(__dirname, '..')
    });
    
    viteProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Vite] ${output.trim()}`);
    });
    
    viteProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.log(`[Vite Error] ${output.trim()}`);
    });
    
    viteProcess.on('error', (error) => {
      console.error('Failed to start Vite:', error);
      reject(error);
    });

    // Resolve immediately, we'll wait for the port file separately
    resolve(viteProcess);
  });
}

/**
 * Wait for port file and get actual port
 */
function waitForPortFile(maxRetries = 60) {
  return new Promise((resolve, reject) => {
    const portFile = path.join(__dirname, '..', '.vite-port');
    let retryCount = 0;
    
    console.log('Waiting for Vite port file...');
    
    const checkPort = () => {
      try {
        if (fs.existsSync(portFile)) {
          const port = fs.readFileSync(portFile, 'utf8').trim();
          
          if (port && !isNaN(parseInt(port)) && parseInt(port) > 0) {
            console.log(`Port file ready: ${port}`);
            resolve(port);
            return;
          }
        }
      } catch (error) {
        console.error('Error reading port file:', error);
      }
      
      retryCount++;
      if (retryCount >= maxRetries) {
        reject(new Error('Port file not ready after all retries'));
        return;
      }
      
      console.log(`Waiting for port file... (${retryCount}/${maxRetries})`);
      setTimeout(checkPort, 500);
    };
    
    checkPort();
  });
}

/**
 * Launch Electron
 */
function launchElectron(port) {
  return new Promise((resolve, reject) => {
    console.log(`Launching Electron on port ${port}...`);
    
    const electronProcess = spawn('electron', ['.'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        VITE_PORT: port
      }
    });
    
    electronProcess.on('error', (error) => {
      console.error('Failed to launch Electron:', error);
      reject(error);
    });
    
    electronProcess.on('exit', (code) => {
      console.log(`Electron exited with code: ${code}`);
      process.exit(code);
    });
    
    resolve(electronProcess);
  });
}

/**
 * Main startup sequence
 */
async function main() {
  try {
    console.log('Starting Payroll and Attendance System...');
    console.log('=====================================');
    
    // Step 1: Clean up files
    await cleanupFiles();
    
    // Step 2: Start Vite server
    await startViteServer();
    
    // Step 3: Wait for port file
    const port = await waitForPortFile();
    
    // Step 4: Launch Electron
    await launchElectron(port);
    
  } catch (error) {
    console.error('Startup failed:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  process.exit(0);
});

// Run the startup sequence
main(); 