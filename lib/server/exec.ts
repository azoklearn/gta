import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

export class CommandError extends Error {
  constructor(
    public command: string,
    public code: number | null,
    public stderr: string,
  ) {
    super(`${command} a échoué (code ${code})`);
  }
}

/**
 * Lance une commande et attend sa fin.
 * `onStdoutLine` reçoit la sortie ligne par ligne ; `onStdout` reçoit les octets bruts.
 * La fin de la sortie d'erreur est conservée pour le diagnostic.
 */
export function run(
  command: string,
  args: string[],
  opts: {
    cwd?: string;
    onStdoutLine?: (line: string) => void;
    onStderrLine?: (line: string) => void;
    onStdout?: (chunk: Buffer) => void;
  } = {},
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    const tail: string[] = [];

    if (opts.onStdout) child.stdout.on("data", opts.onStdout);
    else if (opts.onStdoutLine) createInterface({ input: child.stdout }).on("line", opts.onStdoutLine);
    else child.stdout.resume();

    createInterface({ input: child.stderr }).on("line", (line) => {
      tail.push(line);
      if (tail.length > 40) tail.shift();
      opts.onStderrLine?.(line);
    });

    child.on("error", (err) => {
      const missing = (err as NodeJS.ErrnoException).code === "ENOENT";
      reject(new CommandError(command, null, missing ? `${command} est introuvable sur le serveur` : err.message));
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new CommandError(command, code, tail.join("\n")));
    });
  });
}

/** Lance une commande et renvoie toute sa sortie standard. */
export async function capture(command: string, args: string[]): Promise<string> {
  const chunks: Buffer[] = [];
  await run(command, args, { onStdout: (c) => chunks.push(c) });
  return Buffer.concat(chunks).toString("utf8");
}
