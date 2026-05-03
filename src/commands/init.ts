import { log } from '../utils/logger.js';
import { checkPrerequisites } from '../steps/check-prerequisites.js';
import { detectContext } from '../steps/detect-context.js';
import { installDeps } from '../steps/install-deps.js';
import { updatePackageJson } from '../steps/update-package-json.js';
import { writeCommitlint } from '../steps/write-commitlint.js';
import { setupHusky } from '../steps/setup-husky.js';
import { writeVersionRc } from '../steps/write-versionrc.js';
import { printSummary } from '../steps/print-summary.js';
import { detectPackageManager } from '../utils/pm.js';
import type { InitOptions } from '../types.js';

export async function runInit(opts: InitOptions): Promise<void> {
  log.intro('gitmoji-commits');

  const initialPm = opts.pm ?? (await detectPackageManager(opts.cwd));
  await checkPrerequisites(opts.cwd, initialPm, opts.yes);

  const ctx = await detectContext(opts);

  if (ctx.monorepo.isMonorepo) {
    log.info(`Monorepo detected (${ctx.monorepo.tool}). Installing at root.`);
  }

  await installDeps(ctx);
  await updatePackageJson(ctx);
  await writeCommitlint(ctx, opts.force, opts.yes);
  await setupHusky(ctx);
  await writeVersionRc(ctx, opts.force, opts.yes);

  printSummary(ctx);
  log.outro('Happy committing!');
}
