import { spawn } from 'child_process';
import treeKill from 'tree-kill';

console.log('Starting prod service');

while (true) {
  const { pid: childProcessPid } = spawn('npm', ['run', 'start:app:transpileOnly'], {
    stdio: 'inherit',
  });

  // Wait until the last 5AM CST in two days.
  const nextRestartDate = new Date();
  nextRestartDate.setUTCDate(nextRestartDate.getUTCDate() + 2);
  nextRestartDate.setUTCHours(21, 0, 0, 0);
  await waitForTimeoutMs(nextRestartDate.getTime() - Date.now());

  console.log('Restarting...');
  // Use tree-kill to actually kill the child process.
  const err = await new Promise((resolve) => void treeKill(childProcessPid, resolve));
  if (err) {
    console.error('Error when tree killing child process', err);
  }
}

function waitForTimeoutMs(timeoutMs: number) {
  return new Promise((resolve) => void setTimeout(resolve, timeoutMs));
}
