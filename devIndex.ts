import { ChildProcess, spawn } from 'child_process';
import chokidar from 'chokidar';

console.log('Starting dev service');

const watcher = chokidar.watch('./src');
await new Promise((resolve) => void watcher.on('ready', resolve));

function run(): ChildProcess {
  return spawn('yarn', ['start:app'], {
    stdio: 'inherit',
  });
}

let childProcess: ChildProcess = run();

watcher.on('all', () => {
  console.log('Restarting...');
  childProcess.kill();
  childProcess = run();
});
