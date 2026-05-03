import { run } from './exec.js';
import type { RepoUrlInfo } from '../types.js';

export async function isInsideGitRepo(cwd: string): Promise<boolean> {
  const { exitCode } = await run('git', ['rev-parse', '--is-inside-work-tree'], { cwd });
  return exitCode === 0;
}

export async function gitInit(cwd: string): Promise<void> {
  await run('git', ['init'], { cwd });
}

export async function getRemoteUrl(cwd: string): Promise<string | null> {
  const { stdout, exitCode } = await run('git', ['remote', 'get-url', 'origin'], { cwd });
  if (exitCode !== 0) return null;
  return stdout.trim() || null;
}

export function parseRemoteUrl(url: string): RepoUrlInfo | null {
  const trimmed = url.trim().replace(/\.git$/, '');

  const sshMatch = trimmed.match(/^git@([^:]+):([^/]+)\/(.+)$/);
  if (sshMatch) {
    const [, host, user, project] = sshMatch;
    if (host && user && project) {
      return {
        repoUrl: `https://${host}/${user}/${project}`,
        host: `https://${host}`,
        user,
        project,
      };
    }
  }

  const httpsMatch = trimmed.match(/^https?:\/\/([^/]+)\/([^/]+)\/(.+)$/);
  if (httpsMatch) {
    const [, host, user, project] = httpsMatch;
    if (host && user && project) {
      return {
        repoUrl: `https://${host}/${user}/${project}`,
        host: `https://${host}`,
        user,
        project,
      };
    }
  }

  return null;
}

export async function detectRepoUrl(cwd: string): Promise<RepoUrlInfo | null> {
  const url = await getRemoteUrl(cwd);
  if (!url) return null;
  return parseRemoteUrl(url);
}
