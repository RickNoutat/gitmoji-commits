import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readJson } from './fs.js';
import type { MonorepoInfo } from '../types.js';

export async function detectMonorepo(cwd: string): Promise<MonorepoInfo> {
  if (existsSync(join(cwd, 'pnpm-workspace.yaml'))) {
    return { isMonorepo: true, rootDir: cwd, tool: 'pnpm-workspaces' };
  }

  if (existsSync(join(cwd, 'turbo.json'))) {
    return { isMonorepo: true, rootDir: cwd, tool: 'turborepo' };
  }

  if (existsSync(join(cwd, 'nx.json'))) {
    return { isMonorepo: true, rootDir: cwd, tool: 'nx' };
  }

  const pkgPath = join(cwd, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = await readJson<{ workspaces?: unknown }>(pkgPath);
      if (pkg.workspaces) {
        return { isMonorepo: true, rootDir: cwd, tool: 'npm-workspaces' };
      }
    } catch {
      // ignore parse errors
    }
  }

  return { isMonorepo: false, rootDir: cwd, tool: null };
}
