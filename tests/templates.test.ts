import { describe, it, expect } from 'vitest';
import { renderCommitlintConfig } from '../src/templates/commitlint.js';
import { renderVersionRc } from '../src/templates/versionrc.js';

describe('renderCommitlintConfig', () => {
  it('produces valid JS containing French messages when lang=fr', () => {
    const out = renderCommitlintConfig('fr');
    expect(out).toContain("Sélectionnez le type de changement");
    expect(out).toContain("Nouvelle fonctionnalité");
    expect(out).toContain("module.exports");
  });

  it('produces valid JS containing English messages when lang=en', () => {
    const out = renderCommitlintConfig('en');
    expect(out).toContain('Select the type of change');
    expect(out).toContain('A new feature');
  });

  it('always includes the conventional preset', () => {
    expect(renderCommitlintConfig('en')).toContain('@commitlint/config-conventional');
    expect(renderCommitlintConfig('fr')).toContain('@commitlint/config-conventional');
  });
});

describe('renderVersionRc', () => {
  it('substitutes the repo URL when provided', () => {
    const out = renderVersionRc({
      repoUrl: 'https://github.com/foo/bar',
      host: 'https://github.com',
      user: 'foo',
      project: 'bar',
    });
    const parsed = JSON.parse(out);
    expect(parsed.commitUrlFormat).toBe('https://github.com/foo/bar/commit/{{hash}}');
    expect(parsed.compareUrlFormat).toBe(
      'https://github.com/foo/bar/compare/{{previousTag}}...{{currentTag}}',
    );
  });

  it('falls back to placeholder when repo URL is null', () => {
    const out = renderVersionRc(null);
    const parsed = JSON.parse(out);
    expect(parsed.commitUrlFormat).toContain('OWNER/REPO');
  });

  it('produces valid JSON', () => {
    expect(() => JSON.parse(renderVersionRc(null))).not.toThrow();
  });
});
