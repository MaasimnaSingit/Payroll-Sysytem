const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Kill other Node.js and Electron processes (excluding current process)
 */
async function killOtherProcesses() {
  try {
    console.log('Killing other Node and Electron processes...');
    
    // Get current process ID
    const currentPid = process.pid;
    console.log(`Current process PID: ${currentPid}`);
    
    // Windows command to kill node and electron processes, excluding current PID
    const command = `wmic process where "name='node.exe' or name='electron.exe'" get processid /format:csv | findstr /v "${currentPid}" | findstr /r "^[0-9]" | for /f "tokens=2 delims=," %i in ('findstr /r "^[0-9]"') do taskkill /f /pid %i 2>nul || echo No other processes found`;
    
    const { stdout, stderr } = await execAsync(command, { shell: 'cmd' });
    
    if (stdout.trim()) {
      console.log('Killed other processes');
    } else {
      console.log('No other processes found');
    }
    
    if (stderr) {
      console.log('Process kill completed');
    }
    
  } catch (error) {
    console.log('No other processes to kill');
  }
}

// Run the function
killOtherProcesses().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Error killing processes:', error.message);
  process.exit(1);
}); 