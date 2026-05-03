import type { RepoUrlInfo } from '../types.js';

const PLACEHOLDER = 'https://github.com/OWNER/REPO';

export function renderVersionRc(repo: RepoUrlInfo | null): string {
  const repoUrl = repo?.repoUrl ?? PLACEHOLDER;
  const host = repo?.host ?? 'https://github.com';

  const data = {
    header:
      '# Changelog\n\nAll notable changes to this project will be documented in this file. See [Conventional Commits](https://www.conventionalcommits.org) for commit guidelines.\n',
    types: [
      { type: 'feat', section: '✨ Features' },
      { type: 'fix', section: '🐛 Bug Fixes' },
      { type: 'perf', section: '⚡️ Performance' },
      { type: 'refactor', section: '♻️ Refactor' },
      { type: 'docs', section: '📝 Documentation' },
      { type: 'test', section: '✅ Tests' },
      { type: 'build', section: '📦 Build System' },
      { type: 'ci', section: '🎡 Continuous Integration' },
      { type: 'chore', section: '🔨 Chores', hidden: false },
      { type: 'style', section: '🎨 Styles', hidden: true },
      { type: 'revert', section: '⏪ Reverts' },
      { type: 'wip', section: '🚧 Work in Progress', hidden: true },
    ],
    commitUrlFormat: `${repoUrl}/commit/{{hash}}`,
    compareUrlFormat: `${repoUrl}/compare/{{previousTag}}...{{currentTag}}`,
    issueUrlFormat: `${repoUrl}/issues/{{id}}`,
    userUrlFormat: `${host}/{{user}}`,
    bumpFiles: [{ filename: 'package.json', type: 'json' }],
    skip: { commit: false, tag: false },
  };

  return `${JSON.stringify(data, null, 2)}\n`;
}
