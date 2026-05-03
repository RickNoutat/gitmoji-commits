import { join } from 'node:path';
import { backup, exists, writeFileSafe } from '../utils/fs.js';
import { renderCommitlintConfig } from '../templates/commitlint.js';
import { askConflict } from '../prompts/index.js';
import { log } from '../utils/logger.js';
import type { ResolvedContext } from '../types.js';

export async function writeCommitlint(ctx: ResolvedContext, force: boolean, yes: boolean): Promise<void> {
  if (ctx.preset === 'minimal') {
    log.info('Skipping commitlint config (minimal preset).');
    return;
  }

  const file = ctx.isEsmProject ? 'commitlint.config.cjs' : 'commitlint.config.js';
  const path = join(ctx.monorepo.rootDir, file);
  const content = renderCommitlintConfig(ctx.lang);

  if (await exists(path)) {
    if (!force && !yes) {
      const action = await askConflict(file);
      if (action === 'skip') {
        log.info(`Kept existing ${file}.`);
        return;
      }
      if (action === 'abort') {
        log.cancel('Aborted.');
        process.exit(0);
      }
    }
    const bak = await backup(path);
    if (bak) log.info(`Backed up existing ${file} to ${bak}.`);
  }

  await writeFileSafe(path, content);
  log.success(`Wrote ${file} (${ctx.lang}).`);
}
