const { copyFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { spawn } = require('node:child_process');

const root = join(__dirname, '..');
const isWindows = process.platform === 'win32';
const npmBin = isWindows ? 'cmd.exe' : 'npm';

function npmArgs(args) {
  return isWindows ? ['/d', '/s', '/c', 'npm', ...args] : args;
}

function ensureEnv(target, example) {
  if (!existsSync(target)) {
    copyFileSync(example, target);
    console.log(`created ${target.replace(root + '\\', '').replace(root + '/', '')}`);
  }
}

function run(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmBin, npmArgs(args), {
      cwd: root,
      stdio: 'inherit',
      shell: false,
      ...options,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm ${args.join(' ')} exited with code ${code}`));
    });
  });
}

async function retryQuiet(label, task, attempts = 20) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await task();
      return;
    } catch (error) {
      if (attempt === attempts) throw error;
      console.log(`${label} not ready yet, retrying (${attempt}/${attempts})...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

function waitForPort(port, host = '127.0.0.1', attempts = 30) {
  const net = require('node:net');

  return retryQuiet(
    'database',
    () =>
      new Promise((resolve, reject) => {
        const socket = net.createConnection({ host, port });
        socket.once('connect', () => {
          socket.destroy();
          resolve();
        });
        socket.once('error', reject);
        socket.setTimeout(1000, () => {
          socket.destroy();
          reject(new Error('connection timed out'));
        });
      }),
    attempts,
  );
}

async function main() {
  ensureEnv(join(root, 'backend', '.env'), join(root, 'backend', '.env.example'));
  ensureEnv(join(root, 'frontend', '.env.local'), join(root, 'frontend', '.env.local.example'));

  if (!existsSync(join(root, 'backend', 'node_modules'))) {
    await run(['--prefix', 'backend', 'install']);
  }

  if (!existsSync(join(root, 'frontend', 'node_modules'))) {
    await run(['--prefix', 'frontend', 'install']);
  }

  await waitForPort(5432);
  await run(['--prefix', 'backend', 'run', 'migration:run']);
  await run(['--prefix', 'backend', 'run', 'seed']);

  const spawnOptions = { cwd: root, stdio: 'inherit', shell: false };
  const backend = spawn(npmBin, npmArgs(['--prefix', 'backend', 'run', 'start:dev']), spawnOptions);
  const frontend = spawn(npmBin, npmArgs(['--prefix', 'frontend', 'run', 'dev']), spawnOptions);

  const shutdown = () => {
    backend.kill('SIGINT');
    frontend.kill('SIGINT');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  console.error(error.message);
  console.error('Make sure Docker is running and run: docker compose up -d');
  process.exit(1);
});
