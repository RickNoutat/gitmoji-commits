import { Command } from 'commander';
import { runInit } from './commands/init.js';
import type { Lang, PackageManager, Preset } from './types.js';

const VALID_LANGS: Lang[] = ['en', 'fr'];
const VALID_PMS: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];
const VALID_PRESETS: Preset[] = ['minimal', 'full'];

function parseEnum<T extends string>(name: string, allowed: readonly T[]): (value: string) => T {
  return (value) => {
    if (!(allowed as readonly string[]).includes(value)) {
      throw new Error(`Invalid value for --${name}: ${value}. Allowed: ${allowed.join(', ')}`);
    }
    return value as T;
  };
}

const program = new Command();

program
  .name('gitmoji-init')
  .description('Set up conventional commits + gitmoji + commitlint + husky in any project.')
  .version('0.0.0');

program
  .command('init', { isDefault: true })
  .description('Initialize the conventional-commits + gitmoji setup in the current directory.')
  .option('-y, --yes', 'Skip all prompts and use defaults', false)
  .option('-f, --force', 'Overwrite existing config files without prompting', false)
  .option('-l, --lang <lang>', 'Language for commit prompts (en|fr)', parseEnum('lang', VALID_LANGS))
  .option('-p, --pm <pm>', 'Package manager to use (pnpm|npm|yarn|bun)', parseEnum('pm', VALID_PMS))
  .option('--preset <preset>', 'Preset to apply (minimal|full)', parseEnum('preset', VALID_PRESETS))
  .option('--cwd <path>', 'Working directory', process.cwd())
  .action(async (opts: {
    yes: boolean;
    force: boolean;
    lang?: Lang;
    pm?: PackageManager;
    preset?: Preset;
    cwd: string;
  }) => {
    try {
      await runInit({
        yes: opts.yes,
        force: opts.force,
        lang: opts.lang,
        pm: opts.pm,
        preset: opts.preset,
        cwd: opts.cwd,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`\n✖ ${message}`);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
