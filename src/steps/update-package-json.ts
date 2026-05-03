import { join } from 'node:path';
import { mergeScripts, readJson, writeJson } from '../utils/fs.js';
import { log } from '../utils/logger.js';
import type { ResolvedContext } from '../types.js';

interface PackageJson {
  scripts?: Record<string, string>;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function updatePackageJson(ctx: ResolvedContext): Promise<void> {
  const path = join(ctx.monorepo.rootDir, 'package.json');
  const pkg = await readJson<PackageJson>(path);

  const newScripts: Record<string, string> = { commit: 'git-cz' };

  if (ctx.preset === 'full') {
    newScripts.release = 'commit-and-tag-version';
    newScripts['release:patch'] = 'commit-and-tag-version --release-as patch';
    newScripts['release:minor'] = 'commit-and-tag-version --release-as minor';
    newScripts['release:major'] = 'commit-and-tag-version --release-as major';
    newScripts.prepare = 'husky';
  }

  const { merged, conflicts } = mergeScripts(pkg.scripts, newScripts);
  pkg.scripts = merged;

  if (conflicts.length > 0) {
    log.warn(
      `Kept your existing scripts (not overwritten): ${conflicts.join(', ')}. ` +
        `Add them manually if you want our defaults.`,
    );
  }

  pkg.config = {
    ...(pkg.config ?? {}),
    commitizen: { path: 'node_modules/cz-git' },
  };

  await writeJson(path, pkg);
  log.success('Updated package.json (scripts + commitizen config).');
}
