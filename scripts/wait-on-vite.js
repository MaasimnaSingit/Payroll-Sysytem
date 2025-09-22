const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Wait for Vite port file and launch Electron
 */
async function waitForViteAndLaunchElectron() {
  const portFile = path.join(__dirname, '..', '.vite-port');
  const maxRetries = 30;
  let retryCount = 0;

  console.log('🔍 Waiting for Vite dev server to start...');

  while (retryCount < maxRetries) {
    try {
      if (fs.existsSync(portFile)) {
        const port = fs.readFileSync(portFile, 'utf8').trim();
        
        if (port && !isNaN(parseInt(port))) {
          console.log(`✅ Vite port detected: ${port}`);
          console.log(`🚀 Launching Electron on http://localhost:${port}`);
          
          // Launch Electron
          const electronProcess = spawn('electron', ['.'], {
            stdio: 'inherit',
            shell: true,
            env: {
              ...process.env,
              VITE_PORT: port
            }
          });

          electronProcess.on('error', (error) => {
            console.error('❌ Failed to launch Electron:', error);
            process.exit(1);
          });

          electronProcess.on('exit', (code) => {
            console.log(`🔚 Electron exited with code: ${code}`);
            process.exit(code);
          });

          return;
        }
      }
    } catch (error) {
      console.error('❌ Error reading port file:', error);
    }

    retryCount++;
    console.log(`⏳ Waiting for Vite server... (${retryCount}/${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.error('❌ Failed to detect Vite port after all retries');
  console.error('💡 Make sure Vite dev server is running');
  process.exit(1);
}

// Run the script
waitForViteAndLaunchElectron().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
}); 