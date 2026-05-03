import { join } from 'node:path';
import { backup, exists, writeFileSafe } from '../utils/fs.js';
import { renderVersionRc } from '../templates/versionrc.js';
import { askConflict } from '../prompts/index.js';
import { log } from '../utils/logger.js';
import type { ResolvedContext } from '../types.js';

const FILE = '.versionrc.json';

export async function writeVersionRc(ctx: ResolvedContext, force: boolean, yes: boolean): Promise<void> {
  if (ctx.preset === 'minimal') {
    log.info('Skipping .versionrc.json (minimal preset).');
    return;
  }

  const path = join(ctx.monorepo.rootDir, FILE);
  const content = renderVersionRc(ctx.repoUrl);

  if (await exists(path)) {
    if (!force && !yes) {
      const action = await askConflict(FILE);
      if (action === 'skip') {
        log.info(`Kept existing ${FILE}.`);
        return;
      }
      if (action === 'abort') {
        log.cancel('Aborted.');
        process.exit(0);
      }
    }
    const bak = await backup(path);
    if (bak) log.info(`Backed up existing ${FILE} to ${bak}.`);
  }

  await writeFileSafe(path, content);

  if (!ctx.repoUrl) {
    log.warn(
      `${FILE} written with placeholder repo URL. Run \`git remote add origin <url>\` ` +
        `then re-run this command, or edit ${FILE} manually.`,
    );
  } else {
    log.success(`Wrote ${FILE} (repo: ${ctx.repoUrl.repoUrl}).`);
  }
}
