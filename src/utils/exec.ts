import { execa, type Options } from 'execa';

export async function run(
  command: string,
  args: string[] = [],
  options: Options = {},
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const result = await execa(command, args, {
    reject: false,
    ...options,
  });
  return {
    stdout: typeof result.stdout === 'string' ? result.stdout : '',
    stderr: typeof result.stderr === 'string' ? result.stderr : '',
    exitCode: result.exitCode ?? 1,
  };
}

export async function runOrThrow(
  command: string,
  args: string[] = [],
  options: Options = {},
): Promise<string> {
  const result = await execa(command, args, options);
  return typeof result.stdout === 'string' ? result.stdout : '';
}

export async function commandExists(command: string): Promise<boolean> {
  const { exitCode } = await run('which', [command]);
  return exitCode === 0;
}
