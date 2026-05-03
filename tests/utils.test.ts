import { describe, it, expect } from 'vitest';
import { parseRemoteUrl } from '../src/utils/git.js';
import { mergeScripts, mergePackageJson } from '../src/utils/fs.js';
import { detectFromPackageJsonField, addDevDepsArgs, execCommand } from '../src/utils/pm.js';

describe('parseRemoteUrl', () => {
  it('parses HTTPS GitHub URL with .git suffix', () => {
    const r = parseRemoteUrl('https://github.com/rickydavinci/gitmoji-commits.git');
    expect(r).toEqual({
      repoUrl: 'https://github.com/rickydavinci/gitmoji-commits',
      host: 'https://github.com',
      user: 'rickydavinci',
      project: 'gitmoji-commits',
    });
  });

  it('parses SSH GitHub URL', () => {
    const r = parseRemoteUrl('git@github.com:rickydavinci/gitmoji-commits.git');
    expect(r?.repoUrl).toBe('https://github.com/rickydavinci/gitmoji-commits');
    expect(r?.user).toBe('rickydavinci');
  });

  it('parses GitLab SSH URL', () => {
    const r = parseRemoteUrl('git@gitlab.com:group/project.git');
    expect(r?.host).toBe('https://gitlab.com');
    expect(r?.user).toBe('group');
    expect(r?.project).toBe('project');
  });

  it('returns null for malformed URLs', () => {
    expect(parseRemoteUrl('not a url')).toBeNull();
    expect(parseRemoteUrl('')).toBeNull();
  });
});

describe('mergeScripts', () => {
  it('adds new scripts when none exist', () => {
    const { merged, conflicts } = mergeScripts(undefined, { commit: 'git-cz' });
    expect(merged).toEqual({ commit: 'git-cz' });
    expect(conflicts).toEqual([]);
  });

  it('preserves existing scripts that conflict', () => {
    const { merged, conflicts } = mergeScripts(
      { test: 'jest' },
      { commit: 'git-cz', test: 'vitest' },
    );
    expect(merged.test).toBe('jest');
    expect(merged.commit).toBe('git-cz');
    expect(conflicts).toEqual(['test']);
  });

  it('appends husky to an existing prepare script', () => {
    const { merged } = mergeScripts({ prepare: 'pnpm build' }, { prepare: 'husky' });
    expect(merged.prepare).toBe('pnpm build && husky');
  });

  it('does not duplicate husky in prepare', () => {
    const { merged } = mergeScripts({ prepare: 'husky' }, { prepare: 'husky' });
    expect(merged.prepare).toBe('husky');
  });
});

describe('mergePackageJson', () => {
  it('deep-merges nested objects', () => {
    const result = mergePackageJson(
      { config: { foo: 'bar' } },
      { config: { commitizen: { path: 'cz-git' } } },
    );
    expect(result.config).toEqual({ foo: 'bar', commitizen: { path: 'cz-git' } });
  });

  it('overwrites primitive values', () => {
    const result = mergePackageJson({ version: '1.0.0' }, { version: '1.1.0' });
    expect(result.version).toBe('1.1.0');
  });
});

describe('detectFromPackageJsonField', () => {
  it('detects pnpm', () => {
    expect(detectFromPackageJsonField({ packageManager: 'pnpm@9.0.0' })).toBe('pnpm');
  });

  it('detects yarn', () => {
    expect(detectFromPackageJsonField({ packageManager: 'yarn@4.0.0' })).toBe('yarn');
  });

  it('returns null when field is missing', () => {
    expect(detectFromPackageJsonField({})).toBeNull();
    expect(detectFromPackageJsonField(null)).toBeNull();
  });
});

describe('addDevDepsArgs', () => {
  it('uses correct flags per pm', () => {
    expect(addDevDepsArgs('pnpm', ['x'])).toEqual(['add', '-D', 'x']);
    expect(addDevDepsArgs('npm', ['x'])).toEqual(['install', '-D', 'x']);
    expect(addDevDepsArgs('yarn', ['x'])).toEqual(['add', '-D', 'x']);
    expect(addDevDepsArgs('bun', ['x'])).toEqual(['add', '-d', 'x']);
  });
});

describe('execCommand', () => {
  it('returns the right exec command per pm', () => {
    expect(execCommand('pnpm')).toBe('pnpm exec');
    expect(execCommand('npm')).toBe('npx');
    expect(execCommand('yarn')).toBe('yarn');
    expect(execCommand('bun')).toBe('bunx');
  });
});
