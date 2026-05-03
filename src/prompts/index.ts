import * as p from '@clack/prompts';
import { log } from '../utils/logger.js';
import type {
  ConflictAction,
  Lang,
  MonorepoChangelog,
  PackageManager,
  Preset,
  ResolvedContext,
} from '../types.js';

function cancelIfNeeded<T>(value: T | symbol, message = 'Aborted by user.'): T {
  if (log.isCancel(value)) {
    log.cancel(message);
    process.exit(0);
  }
  return value as T;
}

export async function askLang(defaultLang: Lang = 'en'): Promise<Lang> {
  const value = await p.select({
    message: 'Which language for the commit prompts?',
    options: [
      { value: 'en', label: 'English (default)' },
      { value: 'fr', label: 'Français' },
    ],
    initialValue: defaultLang,
  });
  return cancelIfNeeded(value);
}

export async function askPackageManager(detected: PackageManager): Promise<PackageManager> {
  const value = await p.select({
    message: `Which package manager to use? (detected: ${detected})`,
    options: [
      { value: 'pnpm', label: 'pnpm' },
      { value: 'npm', label: 'npm' },
      { value: 'yarn', label: 'yarn' },
      { value: 'bun', label: 'bun' },
    ],
    initialValue: detected,
  });
  return cancelIfNeeded(value);
}

export async function askPreset(): Promise<Preset> {
  const value = await p.select({
    message: 'Which preset?',
    options: [
      {
        value: 'full',
        label: 'Full',
        hint: 'commitizen + commitlint + husky + commit-and-tag-version (CHANGELOG)',
      },
      {
        value: 'minimal',
        label: 'Minimal',
        hint: 'commitizen + cz-git only (interactive prompts, no validation/release)',
      },
    ],
    initialValue: 'full' as Preset,
  });
  return cancelIfNeeded(value);
}

export async function askPreCommitHook(): Promise<{
  kind: ResolvedContext['preCommitHook'];
  custom?: string;
}> {
  const kind = await p.select({
    message: 'What should run on pre-commit?',
    options: [
      { value: 'none', label: 'Nothing (recommended if you have no lint/test scripts yet)' },
      { value: 'lint', label: 'Run lint script (`pnpm lint`)' },
      { value: 'tests', label: 'Run tests script (`pnpm test`)' },
      { value: 'custom', label: 'Custom command' },
    ],
    initialValue: 'none' as ResolvedContext['preCommitHook'],
  });
  const resolvedKind = cancelIfNeeded(kind);

  if (resolvedKind === 'custom') {
    const cmd = await p.text({
      message: 'Enter the pre-commit command:',
      placeholder: 'pnpm lint && pnpm test',
      validate: (v) => (v.trim().length === 0 ? 'Command cannot be empty' : undefined),
    });
    const customCmd = cancelIfNeeded(cmd);
    return { kind: 'custom', custom: customCmd };
  }

  return { kind: resolvedKind };
}

export async function askMonorepoChangelog(): Promise<MonorepoChangelog> {
  const value = await p.select({
    message: 'Monorepo detected. Where should the CHANGELOG live?',
    options: [
      {
        value: 'root',
        label: 'Root only',
        hint: 'one global CHANGELOG.md at the repo root',
      },
      {
        value: 'per-package',
        label: 'Per package',
        hint: 'consider switching to changesets later for full per-package support',
      },
    ],
    initialValue: 'root' as MonorepoChangelog,
  });
  return cancelIfNeeded(value);
}

export async function askConflict(file: string): Promise<ConflictAction> {
  const value = await p.select({
    message: `${file} already exists. What do you want to do?`,
    options: [
      { value: 'overwrite', label: 'Overwrite (a .bak backup will be created)' },
      { value: 'skip', label: 'Skip (keep existing file)' },
      { value: 'abort', label: 'Abort the whole setup' },
    ],
    initialValue: 'skip' as ConflictAction,
  });
  return cancelIfNeeded(value);
}

export async function askConfirm(message: string, initialValue = true): Promise<boolean> {
  const value = await p.confirm({ message, initialValue });
  return cancelIfNeeded(value);
}
