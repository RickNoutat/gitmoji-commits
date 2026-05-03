import { join } from 'node:path';
import { exists } from '../utils/fs.js';
import { gitInit, isInsideGitRepo } from '../utils/git.js';
import { ensurePmInstalled } from '../utils/pm.js';
import { run } from '../utils/exec.js';
import { askConfirm } from '../prompts/index.js';
import { log } from '../utils/logger.js';
import type { PackageManager } from '../types.js';

export interface PrerequisitesResult {
  hasPackageJson: boolean;
}

export async function checkPrerequisites(
  cwd: string,
  pm: PackageManager,
  yes: boolean,
): Promise<PrerequisitesResult> {
  if (!(await isInsideGitRepo(cwd))) {
    const proceed = yes ? true : await askConfirm('Not a git repository. Run `git init` now?', true);
    if (!proceed) {
      log.cancel('A git repository is required.');
      process.exit(1);
    }
    await gitInit(cwd);
    log.success('Initialized git repository.');
  }

  if (!(await ensurePmInstalled(pm))) {
    log.error(`Package manager "${pm}" is not installed. Install it first or use --pm <other>.`);
    process.exit(1);
  }

  const pkgPath = join(cwd, 'package.json');
  let hasPackageJson = await exists(pkgPath);

  if (!hasPackageJson) {
    const proceed = yes ? true : await askConfirm('No package.json found. Run `npm init -y` now?', true);
    if (!proceed) {
      log.cancel('A package.json is required.');
      process.exit(1);
    }
    const { exitCode } = await run('npm', ['init', '-y'], { cwd });
    if (exitCode !== 0) {
      log.error('Failed to initialize package.json.');
      process.exit(1);
    }
    log.success('Created package.json.');
    hasPackageJson = true;
  }

  return { hasPackageJson };
}
