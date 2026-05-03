# gitmoji-commits

[![npm version](https://img.shields.io/npm/v/gitmoji-commits.svg)](https://www.npmjs.com/package/gitmoji-commits)
[![npm downloads](https://img.shields.io/npm/dm/gitmoji-commits.svg)](https://www.npmjs.com/package/gitmoji-commits)
[![CI](https://github.com/rickydavinci/gitmoji-commits/actions/workflows/ci.yml/badge.svg)](https://github.com/rickydavinci/gitmoji-commits/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Zero-config CLI to set up a complete **conventional commits + gitmoji** workflow in any project: interactive commit prompts, message validation, git hooks, automated CHANGELOG and semantic versioning.

One command. Works with **pnpm**, **npm**, **yarn**, and **bun**. Auto-detects monorepos.

## Quick start

```bash
# pnpm (recommended)
pnpm dlx gitmoji-commits

# npm
npx gitmoji-commits

# yarn
yarn dlx gitmoji-commits

# bun
bunx gitmoji-commits
```

That's it. Answer a few prompts (or pass `--yes` to skip), and your repo is configured.

## What it sets up

| Tool | What it does |
|---|---|
| [`commitizen`](https://github.com/commitizen/cz-cli) + [`cz-git`](https://cz-git.qbb.sh/) | Interactive commit menu with gitmoji |
| [`@commitlint/cli`](https://commitlint.js.org/) + `config-conventional` | Validates commit message format |
| [`husky`](https://typicode.github.io/husky/) | Git hooks runner (auto-rejects bad commits) |
| [`commit-and-tag-version`](https://github.com/absolute-version/commit-and-tag-version) | Generates `CHANGELOG.md`, bumps version, creates git tag |

## Usage after setup

```bash
# Interactive commit menu (gitmoji + conventional format)
pnpm commit

# Bad commit messages get auto-rejected:
git commit -m "wip stuff"
# ✖   subject may not be empty [subject-empty]
# ✖   type may not be empty [type-empty]

# Cut a release (auto CHANGELOG + version bump + git tag)
pnpm run release            # auto-detect bump from commit history
pnpm run release:patch      # 1.0.0 → 1.0.1
pnpm run release:minor      # 1.0.0 → 1.1.0
pnpm run release:major      # 1.0.0 → 2.0.0

# Push the release
git push --follow-tags origin main
```

## CLI options

```
gitmoji-init [options]

Options:
  -y, --yes              Skip all prompts and use defaults
  -f, --force            Overwrite existing config files without prompting (a .bak backup is created)
  -l, --lang <lang>      Language for commit prompts: en | fr  (default: en)
  -p, --pm <pm>          Package manager to use: pnpm | npm | yarn | bun  (auto-detected)
      --preset <preset>  minimal | full  (default: full)
      --cwd <path>       Working directory  (default: cwd)
  -V, --version          Output version
  -h, --help             Show help
```

### Examples

```bash
# Fully automated, French prompts
pnpm dlx gitmoji-commits --yes --lang fr

# Minimal preset (no commitlint, no husky, no release tooling — just cz-git)
pnpm dlx gitmoji-commits --preset minimal

# Force overwrite existing config (backups go to .bak files)
pnpm dlx gitmoji-commits --force
```

## Presets

| Preset | Includes |
|---|---|
| `full` *(default)* | All 6 tools — interactive prompts, validation, hooks, CHANGELOG, versioning |
| `minimal` | Only `commitizen` + `cz-git` — interactive prompts only, no validation/release |

## Monorepo support

`gitmoji-commits` auto-detects monorepos using:
- `pnpm-workspace.yaml` (pnpm workspaces)
- `workspaces` field in root `package.json` (npm/yarn workspaces)
- `turbo.json` (Turborepo)
- `nx.json` (Nx)

When detected, all configuration files (commitlint, husky, `.versionrc.json`) are placed at the **root** so they apply to every package.

## Conflict handling

If `commitlint.config.js`, `.versionrc.json`, or husky hooks already exist, you'll be prompted:

- **Overwrite** → keeps a `.bak` copy of the original
- **Skip** → keeps your existing file
- **Abort** → cancels the whole setup

For `package.json`, scripts that conflict with yours are **never overwritten** (we keep yours and warn you).

## FAQ

**Q: Do I need to install `gitmoji-commits` as a dependency?**
No. It's a one-shot setup tool — run it via `npx` / `pnpm dlx`. The actual tools (commitizen, husky, etc.) get installed in your project's `devDependencies`.

**Q: Will it overwrite my existing setup?**
No, not without asking. Configs are prompt-protected (or pass `--force` to overwrite with `.bak` backups). Conflicting `package.json` scripts are always preserved.

**Q: Does it work with workspaces / monorepos?**
Yes. See [Monorepo support](#monorepo-support).

**Q: Can I customize the commit types or emojis?**
Yes — edit the generated `commitlint.config.js` after setup. The full schema is documented in the [cz-git docs](https://cz-git.qbb.sh/).

## Contributing

Issues and PRs welcome. Repo: [github.com/rickydavinci/gitmoji-commits](https://github.com/rickydavinci/gitmoji-commits).

## License

[MIT](./LICENSE) © rickydavinci
