import * as p from '@clack/prompts';
import pc from 'picocolors';

export const log = {
  intro(message: string): void {
    p.intro(pc.bgCyan(pc.black(` ${message} `)));
  },
  outro(message: string): void {
    p.outro(message);
  },
  step(message: string): void {
    p.log.step(message);
  },
  info(message: string): void {
    p.log.info(message);
  },
  success(message: string): void {
    p.log.success(pc.green(message));
  },
  warn(message: string): void {
    p.log.warn(pc.yellow(message));
  },
  error(message: string): void {
    p.log.error(pc.red(message));
  },
  message(message: string): void {
    p.log.message(message);
  },
  spinner(): ReturnType<typeof p.spinner> {
    return p.spinner();
  },
  isCancel(value: unknown): value is symbol {
    return p.isCancel(value);
  },
  cancel(message: string): void {
    p.cancel(message);
  },
};
