import { spawn } from 'child_process';

console.log('Starting prod service');

const childProcess = spawn('npm', ['run', 'start:app:transpileOnly'], {
  stdio: 'inherit',
});

// Wait until the last 5AM CST in two days.
const nextRestartDate = new Date();
nextRestartDate.setUTCDate(nextRestartDate.getUTCDate() + 2);
nextRestartDate.setUTCHours(22, 0, 0, 0);
await new Promise(resolve => void setTimeout(resolve, nextRestartDate.getTime() - Date.now()));

console.log('Restarting...');
childProcess.kill();

const nextProdProcess = spawn('npm', ['run', 'start:prod'], {
  detached: true,
  stdio: 'ignore',
});
nextProdProcess.unref();
