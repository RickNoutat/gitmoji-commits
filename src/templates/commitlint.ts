import type { Lang } from '../types.js';

interface TypeEntry {
  value: string;
  name: string;
  emoji: string;
}

interface Messages {
  type: string;
  scope: string;
  customScope: string;
  subject: string;
  body: string;
  breaking: string;
  footerPrefixesSelect: string;
  customFooterPrefix: string;
  footer: string;
  generatingByAI: string;
  generatedSelectByAI: string;
  confirmCommit: string;
}

const TYPES_EN: TypeEntry[] = [
  { value: 'feat',     name: 'feat:     ✨  A new feature',                          emoji: ':sparkles:' },
  { value: 'fix',      name: 'fix:      🐛  A bug fix',                              emoji: ':bug:' },
  { value: 'docs',     name: 'docs:     📝  Documentation only changes',             emoji: ':memo:' },
  { value: 'style',    name: 'style:    🎨  Code style / formatting',                emoji: ':art:' },
  { value: 'refactor', name: 'refactor: ♻️   Code refactoring',                      emoji: ':recycle:' },
  { value: 'perf',     name: 'perf:     ⚡️  Performance improvements',              emoji: ':zap:' },
  { value: 'test',     name: 'test:     ✅  Adding or updating tests',               emoji: ':white_check_mark:' },
  { value: 'build',    name: 'build:    📦️  Build system or dependency changes',    emoji: ':package:' },
  { value: 'ci',       name: 'ci:       🎡  CI configuration changes',               emoji: ':ferris_wheel:' },
  { value: 'chore',    name: 'chore:    🔨  Other changes (no src or test files)',   emoji: ':hammer:' },
  { value: 'revert',   name: 'revert:   ⏪️  Revert a previous commit',              emoji: ':rewind:' },
  { value: 'wip',      name: 'wip:      🚧  Work in progress',                       emoji: ':construction:' },
];

const TYPES_FR: TypeEntry[] = [
  { value: 'feat',     name: 'feat:     ✨  Nouvelle fonctionnalité',           emoji: ':sparkles:' },
  { value: 'fix',      name: 'fix:      🐛  Correction de bug',                 emoji: ':bug:' },
  { value: 'docs',     name: 'docs:     📝  Documentation',                     emoji: ':memo:' },
  { value: 'style',    name: 'style:    🎨  Formatage / structure du code',     emoji: ':art:' },
  { value: 'refactor', name: 'refactor: ♻️   Refactorisation',                  emoji: ':recycle:' },
  { value: 'perf',     name: 'perf:     ⚡️  Amélioration de performance',      emoji: ':zap:' },
  { value: 'test',     name: 'test:     ✅  Ajout/modification de tests',       emoji: ':white_check_mark:' },
  { value: 'build',    name: 'build:    📦️  Build system ou dépendances',      emoji: ':package:' },
  { value: 'ci',       name: 'ci:       🎡  Configuration CI',                  emoji: ':ferris_wheel:' },
  { value: 'chore',    name: 'chore:    🔨  Tâches diverses',                   emoji: ':hammer:' },
  { value: 'revert',   name: 'revert:   ⏪️  Annulation de commit',             emoji: ':rewind:' },
  { value: 'wip',      name: 'wip:      🚧  Travail en cours',                  emoji: ':construction:' },
];

const MESSAGES_EN: Messages = {
  type: 'Select the type of change you are committing:',
  scope: 'Denote the SCOPE of this change (optional):',
  customScope: 'Denote the SCOPE of this change:',
  subject: 'Write a SHORT, IMPERATIVE description of the change:\n',
  body: 'Provide a LONGER description (optional). Use "|" for line breaks:\n',
  breaking: 'List any BREAKING CHANGES (optional):\n',
  footerPrefixesSelect: 'Select the ISSUES type of changeList by this change (optional):',
  customFooterPrefix: 'Input ISSUES prefix:',
  footer: 'List any ISSUES by this change. E.g.: #31, #34:\n',
  generatingByAI: 'Generating your AI commit subject...',
  generatedSelectByAI: 'Select suitable subject by AI generated:',
  confirmCommit: 'Are you sure you want to proceed with the commit above?',
};

const MESSAGES_FR: Messages = {
  type: 'Sélectionnez le type de changement :',
  scope: 'Indiquez le scope (optionnel) :',
  customScope: 'Précisez le scope :',
  subject: "Description courte à l'impératif :\n",
  body: 'Description détaillée (optionnel). Utilisez "|" pour les sauts de ligne :\n',
  breaking: 'Listez les BREAKING CHANGES (optionnel) :\n',
  footerPrefixesSelect: 'Type de référence dans le footer :',
  customFooterPrefix: 'Précisez le préfixe du footer :',
  footer: 'Issues affectées. Ex: #31, #34 :\n',
  generatingByAI: 'Génération du sujet par IA...',
  generatedSelectByAI: 'Sélectionnez un sujet généré par IA :',
  confirmCommit: 'Confirmer le commit ?',
};

const ISSUE_PREFIX_EN = { value: 'closed', name: 'closed:   ISSUES has been processed' };
const ISSUE_PREFIX_FR = { value: 'closed', name: 'closed:   Issue clôturée par ce commit' };

export function renderCommitlintConfig(lang: Lang): string {
  const types = lang === 'fr' ? TYPES_FR : TYPES_EN;
  const messages = lang === 'fr' ? MESSAGES_FR : MESSAGES_EN;
  const issuePrefix = lang === 'fr' ? ISSUE_PREFIX_FR : ISSUE_PREFIX_EN;

  const typesArray = types
    .map((t) => `      { value: '${t.value}', name: ${JSON.stringify(t.name)}, emoji: '${t.emoji}' }`)
    .join(',\n');

  return `/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert', 'wip'],
    ],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'header-max-length': [2, 'always', 100],
  },
  prompt: {
    alias: { fd: 'docs: fix typos' },
    messages: ${JSON.stringify(messages, null, 6).replace(/\n/g, '\n    ')},
    types: [
${typesArray}
    ],
    useEmoji: true,
    emojiAlign: 'center',
    useAI: false,
    aiNumber: 1,
    themeColorCode: '',
    scopes: [],
    allowCustomScopes: true,
    allowEmptyScopes: true,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    upperCaseSubject: false,
    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix'],
    breaklineNumber: 100,
    breaklineChar: '|',
    skipQuestions: [],
    issuePrefixes: [
      ${JSON.stringify(issuePrefix)},
    ],
    customIssuePrefixAlign: 'top',
    emptyIssuePrefixAlias: 'skip',
    customIssuePrefixAlias: 'custom',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    confirmColorize: true,
    maxHeaderLength: Infinity,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,
    scopeOverrides: undefined,
    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
};
`;
}
