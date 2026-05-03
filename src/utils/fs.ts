import { existsSync } from 'node:fs';
import { copyFile, readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export async function exists(path: string): Promise<boolean> {
  return existsSync(path);
}

export async function readJson<T = unknown>(path: string): Promise<T> {
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw) as T;
}

export async function writeJson(path: string, data: unknown): Promise<void> {
  await writeFileSafe(path, `${JSON.stringify(data, null, 2)}\n`);
}

export async function writeFileSafe(path: string, content: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

export async function backup(path: string): Promise<string | null> {
  if (!existsSync(path)) return null;
  const backupPath = `${path}.bak`;
  await copyFile(path, backupPath);
  return backupPath;
}

type JsonObject = Record<string, unknown>;

export function mergePackageJson(existing: JsonObject, additions: JsonObject): JsonObject {
  const out: JsonObject = { ...existing };
  for (const [key, value] of Object.entries(additions)) {
    const current = out[key];
    if (
      current &&
      typeof current === 'object' &&
      !Array.isArray(current) &&
      value &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      out[key] = { ...(current as JsonObject), ...(value as JsonObject) };
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function mergeScripts(
  existing: Record<string, string> | undefined,
  additions: Record<string, string>,
): { merged: Record<string, string>; conflicts: string[] } {
  const current = existing ?? {};
  const merged: Record<string, string> = { ...current };
  const conflicts: string[] = [];

  for (const [name, cmd] of Object.entries(additions)) {
    if (name === 'prepare' && current.prepare && !current.prepare.includes('husky')) {
      merged.prepare = `${current.prepare} && husky`;
      continue;
    }
    if (current[name] && current[name] !== cmd) {
      conflicts.push(name);
      continue;
    }
    merged[name] = cmd;
  }

  return { merged, conflicts };
}
