import { join } from 'node:path';
import { readJson, exists } from '../utils/fs.js';
import { detectPackageManager } from '../utils/pm.js';
import { detectMonorepo } from '../utils/monorepo.js';
import { detectRepoUrl } from '../utils/git.js';
import type { InitOptions, ResolvedContext } from '../types.js';
import { askLang, askPackageManager, askPreset, askMonorepoChangelog, askPreCommitHook } from '../prompts/index.js';

export async function detectContext(opts: InitOptions): Promise<ResolvedContext> {
  const { cwd, yes } = opts;

  const pkgPath = join(cwd, 'package.json');
  const pkg = (await exists(pkgPath)) ? await readJson<{ type?: string }>(pkgPath) : null;
  const isEsmProject = pkg?.type === 'module';

  const detectedPm = await detectPackageManager(cwd, pkg);
  const pm = opts.pm ?? (yes ? detectedPm : await askPackageManager(detectedPm));

  const lang = opts.lang ?? (yes ? 'en' : await askLang('en'));
  const preset = opts.preset ?? (yes ? 'full' : await askPreset());

  const monorepo = await detectMonorepo(cwd);
  const monorepoChangelog =
    monorepo.isMonorepo && preset === 'full'
      ? yes
        ? 'root'
        : await askMonorepoChangelog()
      : undefined;

  const preCommit = yes ? { kind: 'none' as const } : await askPreCommitHook();

  const repoUrl = await detectRepoUrl(cwd);

  return {
    cwd,
    pm,
    lang,
    preset,
    monorepo,
    repoUrl,
    preCommitHook: preCommit.kind,
    customPreCommit: preCommit.custom,
    monorepoChangelog,
    isEsmProject,
  };
}
