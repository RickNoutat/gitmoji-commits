import { describe, it, expect, afterEach } from 'vitest';
import { mkdtemp, rm, readFile, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execa } from 'execa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI = join(__dirname, '..', 'dist', 'cli.js');

async function runCli(
  args: string[],
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const result = await execa('node', [CLI, ...args], { reject: false });
  return {
    exitCode: result.exitCode ?? 1,
    stdout: typeof result.stdout === 'string' ? result.stdout : '',
    stderr: typeof result.stderr === 'string' ? result.stderr : '',
  };
}

function expectSuccess(result: { exitCode: number; stdout: string; stderr: string }): void {
  if (result.exitCode !== 0) {
    throw new Error(
      `CLI exited with code ${result.exitCode}\n--- stdout ---\n${result.stdout}\n--- stderr ---\n${result.stderr}`,
    );
  }
}

async function setupTmpProject(extraFiles: Record<string, string> = {}): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'gitmoji-init-'));
  await execa('git', ['init', '-q'], { cwd: dir });
  await execa('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
  await execa('git', ['config', 'user.name', 'test'], { cwd: dir });
  await writeFile(join(dir, 'package.json'), JSON.stringify({ name: 'tmp', version: '0.0.0' }, null, 2));
  for (const [path, content] of Object.entries(extraFiles)) {
    const full = join(dir, path);
    await mkdir(join(full, '..'), { recursive: true });
    await writeFile(full, content);
  }
  return dir;
}

async function readJson(path: string): Promise<Record<string, unknown>> {
  return JSON.parse(await readFile(path, 'utf8'));
}

describe('gitmoji-init e2e (--yes mode)', () => {
  let tmpDir: string;

  afterEach(async () => {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true });
  });

  it('sets up everything in a clean project', async () => {
    tmpDir = await setupTmpProject();
    expectSuccess(await runCli(['--yes', '--pm', 'npm', '--cwd', tmpDir]));

    const pkg = await readJson(join(tmpDir, 'package.json'));
    expect(pkg.scripts).toMatchObject({
      commit: 'git-cz',
      release: 'commit-and-tag-version',
      prepare: 'husky',
    });
    expect(pkg.config).toMatchObject({ commitizen: { path: 'node_modules/cz-git' } });
    expect((pkg.devDependencies as Record<string, string>).husky).toBeDefined();
    expect((pkg.devDependencies as Record<string, string>)['@commitlint/cli']).toBeDefined();

    const commitlint = await readFile(join(tmpDir, 'commitlint.config.js'), 'utf8');
    expect(commitlint).toContain('@commitlint/config-conventional');
    expect(commitlint).toContain('A new feature');

    const commitMsg = await readFile(join(tmpDir, '.husky', 'commit-msg'), 'utf8');
    expect(commitMsg).toContain('commitlint --edit');

    const versionrc = JSON.parse(await readFile(join(tmpDir, '.versionrc.json'), 'utf8'));
    expect(versionrc.types).toBeInstanceOf(Array);
  }, 120_000);

  it('uses French templates with --lang fr', async () => {
    tmpDir = await setupTmpProject();
    expectSuccess(await runCli(['--yes', '--pm', 'npm', '--lang', 'fr', '--cwd', tmpDir]));
    const commitlint = await readFile(join(tmpDir, 'commitlint.config.js'), 'utf8');
    expect(commitlint).toContain('Nouvelle fonctionnalité');
  }, 120_000);

  it('preserves existing scripts that conflict', async () => {
    tmpDir = await setupTmpProject();
    const pkgPath = join(tmpDir, 'package.json');
    await writeFile(
      pkgPath,
      JSON.stringify(
        { name: 'tmp', version: '0.0.0', scripts: { commit: 'my-custom-commit' } },
        null,
        2,
      ),
    );
    expectSuccess(await runCli(['--yes', '--pm', 'npm', '--cwd', tmpDir]));
    const pkg = await readJson(pkgPath);
    expect((pkg.scripts as Record<string, string>).commit).toBe('my-custom-commit');
  }, 120_000);

  it('skips full preset files in minimal preset', async () => {
    tmpDir = await setupTmpProject();
    expectSuccess(await runCli(['--yes', '--pm', 'npm', '--preset', 'minimal', '--cwd', tmpDir]));
    const pkg = await readJson(join(tmpDir, 'package.json'));
    expect((pkg.scripts as Record<string, string>).commit).toBe('git-cz');
    expect((pkg.scripts as Record<string, string>).release).toBeUndefined();
    expect((pkg.devDependencies as Record<string, string>)['@commitlint/cli']).toBeUndefined();
    expect((pkg.devDependencies as Record<string, string>).husky).toBeUndefined();
  }, 120_000);

  it('writes commitlint.config.cjs (not .js) when target project is ESM', async () => {
    tmpDir = await setupTmpProject();
    await writeFile(
      join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'esm-tmp', version: '0.0.0', type: 'module' }, null, 2),
    );
    expectSuccess(await runCli(['--yes', '--pm', 'npm', '--cwd', tmpDir]));
    const cjs = await readFile(join(tmpDir, 'commitlint.config.cjs'), 'utf8');
    expect(cjs).toContain('@commitlint/config-conventional');
    await expect(readFile(join(tmpDir, 'commitlint.config.js'), 'utf8')).rejects.toThrow();
  }, 120_000);

  it('backs up existing commitlint.config.js when --force is set', async () => {
    tmpDir = await setupTmpProject({ 'commitlint.config.js': '// old config\n' });
    expectSuccess(await runCli(['--yes', '--force', '--pm', 'npm', '--cwd', tmpDir]));
    const bak = await readFile(join(tmpDir, 'commitlint.config.js.bak'), 'utf8');
    expect(bak).toBe('// old config\n');
    const fresh = await readFile(join(tmpDir, 'commitlint.config.js'), 'utf8');
    expect(fresh).toContain('@commitlint/config-conventional');
  }, 120_000);
});
