import { chmod } from 'node:fs/promises';
import { join } from 'node:path';
import { run } from '../utils/exec.js';
import { writeFileSafe } from '../utils/fs.js';
import { execCommand } from '../utils/pm.js';
import { log } from '../utils/logger.js';
import type { ResolvedContext } from '../types.js';

export async function setupHusky(ctx: ResolvedContext): Promise<void> {
  if (ctx.preset === 'minimal') {
    log.info('Skipping husky setup (minimal preset).');
    return;
  }

  const cwd = ctx.monorepo.rootDir;

  const init = await run(ctx.pm, ['exec', 'husky', 'init'], { cwd });
  if (init.exitCode !== 0) {
    log.error(`husky init failed: ${init.stderr}`);
    process.exit(1);
  }

  const exec = execCommand(ctx.pm);
  const commitMsgPath = join(cwd, '.husky', 'commit-msg');
  await writeFileSafe(commitMsgPath, `${exec} commitlint --edit "$1"\n`);
  await chmod(commitMsgPath, 0o755);

  const preCommitPath = join(cwd, '.husky', 'pre-commit');
  let preCommitContent = '# Add pre-commit checks here (lint, typecheck, etc.)\n';
  switch (ctx.preCommitHook) {
    case 'lint':
      preCommitContent = `${exec === 'pnpm exec' ? 'pnpm' : exec.split(' ')[0]} lint\n`;
      break;
    case 'tests':
      preCommitContent = `${exec === 'pnpm exec' ? 'pnpm' : exec.split(' ')[0]} test\n`;
      break;
    case 'custom':
      preCommitContent = `${ctx.customPreCommit}\n`;
      break;
    case 'none':
      break;
  }
  await writeFileSafe(preCommitPath, preCommitContent);
  await chmod(preCommitPath, 0o755);

  log.success('Configured husky hooks (commit-msg + pre-commit).');
}
