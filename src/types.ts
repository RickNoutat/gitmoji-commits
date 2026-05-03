export type Lang = 'en' | 'fr';

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export type Preset = 'minimal' | 'full';

export type ConflictAction = 'overwrite' | 'skip' | 'abort';

export type MonorepoChangelog = 'root' | 'per-package';

export interface MonorepoInfo {
  isMonorepo: boolean;
  rootDir: string;
  tool: 'pnpm-workspaces' | 'npm-workspaces' | 'turborepo' | 'nx' | null;
}

export interface RepoUrlInfo {
  repoUrl: string;
  host: string;
  user: string;
  project: string;
}

export interface InitOptions {
  yes: boolean;
  force: boolean;
  lang?: Lang;
  pm?: PackageManager;
  preset?: Preset;
  cwd: string;
}

export interface ResolvedContext {
  cwd: string;
  pm: PackageManager;
  lang: Lang;
  preset: Preset;
  monorepo: MonorepoInfo;
  repoUrl: RepoUrlInfo | null;
  preCommitHook: 'none' | 'tests' | 'lint' | 'custom';
  customPreCommit?: string;
  monorepoChangelog?: MonorepoChangelog;
  isEsmProject: boolean;
}
