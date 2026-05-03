import pc from 'picocolors';
import { log } from '../utils/logger.js';
import type { ResolvedContext } from '../types.js';

export function printSummary(ctx: ResolvedContext): void {
  const pm = ctx.pm;
  const lines: string[] = [
    pc.bold('Setup complete!'),
    '',
    pc.cyan('Make a commit (interactive menu with gitmoji):'),
    `  ${pm} commit`,
    '',
  ];

  if (ctx.preset === 'full') {
    lines.push(
      pc.cyan('Bad commit messages will be auto-rejected by commitlint.'),
      '',
      pc.cyan('Cut a release (auto CHANGELOG + version bump + git tag):'),
      `  ${pm} run release            # auto-detect bump from commit history`,
      `  ${pm} run release:patch      # force patch bump`,
      `  ${pm} run release:minor      # force minor bump`,
      `  ${pm} run release:major      # force major bump`,
      '',
      pc.cyan('Push the release:'),
      '  git push --follow-tags origin main',
    );
  }

  log.message(lines.join('\n'));
}
