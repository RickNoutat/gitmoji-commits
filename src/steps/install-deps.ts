import { installDevDeps } from '../utils/pm.js';
import { log } from '../utils/logger.js';
import type { ResolvedContext } from '../types.js';

const MINIMAL_PACKAGES = ['commitizen', 'cz-git'];
const FULL_PACKAGES = [
  'commitizen',
  'cz-git',
  '@commitlint/cli',
  '@commitlint/config-conventional',
  'husky',
  'commit-and-tag-version',
];

export async function installDeps(ctx: ResolvedContext): Promise<void> {
  const packages = ctx.preset === 'full' ? FULL_PACKAGES : MINIMAL_PACKAGES;
  const spin = log.spinner();
  spin.start(`Installing ${packages.length} dev dependencies with ${ctx.pm}...`);
  const { ok, stderr } = await installDevDeps(ctx.pm, packages, ctx.monorepo.rootDir);
  if (!ok) {
    spin.stop('Install failed.');
    log.error(stderr || 'Unknown install error.');
    process.exit(1);
  }
  spin.stop(`Installed: ${packages.join(', ')}.`);
}
