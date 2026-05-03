import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { PackageManager } from '../types.js';
import { commandExists, run } from './exec.js';

const LOCKFILES: Record<PackageManager, string> = {
  pnpm: 'pnpm-lock.yaml',
  npm: 'package-lock.json',
  yarn: 'yarn.lock',
  bun: 'bun.lockb',
};

export function detectFromLockfile(cwd: string): PackageManager | null {
  for (const [pm, file] of Object.entries(LOCKFILES) as [PackageManager, string][]) {
    if (existsSync(join(cwd, file))) return pm;
  }
  return null;
}

export function detectFromUserAgent(): PackageManager | null {
  const ua = process.env.npm_config_user_agent ?? '';
  if (ua.startsWith('pnpm/')) return 'pnpm';
  if (ua.startsWith('yarn/')) return 'yarn';
  if (ua.startsWith('bun/')) return 'bun';
  if (ua.startsWith('npm/')) return 'npm';
  return null;
}

export function detectFromPackageJsonField(packageJson: unknown): PackageManager | null {
  if (!packageJson || typeof packageJson !== 'object') return null;
  const pm = (packageJson as { packageManager?: string }).packageManager;
  if (!pm) return null;
  if (pm.startsWith('pnpm@')) return 'pnpm';
  if (pm.startsWith('yarn@')) return 'yarn';
  if (pm.startsWith('npm@')) return 'npm';
  if (pm.startsWith('bun@')) return 'bun';
  return null;
}

export async function detectPackageManager(
  cwd: string,
  packageJson?: unknown,
): Promise<PackageManager> {
  return (
    detectFromPackageJsonField(packageJson) ??
    detectFromLockfile(cwd) ??
    detectFromUserAgent() ??
    'npm'
  );
}

export function addDevDepsArgs(pm: PackageManager, packages: string[]): string[] {
  switch (pm) {
    case 'pnpm':
      return ['add', '-D', ...packages];
    case 'yarn':
      return ['add', '-D', ...packages];
    case 'bun':
      return ['add', '-d', ...packages];
    case 'npm':
      return ['install', '-D', ...packages];
  }
}

export function execCommand(pm: PackageManager): string {
  switch (pm) {
    case 'pnpm':
      return 'pnpm exec';
    case 'yarn':
      return 'yarn';
    case 'bun':
      return 'bunx';
    case 'npm':
      return 'npx';
  }
}

export async function ensurePmInstalled(pm: PackageManager): Promise<boolean> {
  return commandExists(pm);
}

export async function installDevDeps(
  pm: PackageManager,
  packages: string[],
  cwd: string,
): Promise<{ ok: boolean; stderr: string }> {
  const { exitCode, stderr } = await run(pm, addDevDepsArgs(pm, packages), { cwd });
  return { ok: exitCode === 0, stderr };
}
