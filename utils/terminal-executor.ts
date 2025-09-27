import { exec } from "child_process";
import { Terminal } from "./terminal-detector";

export function executeCommandInTerminal(
  terminal: Terminal,
  folderPath: string,
  command: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    let fullCommand: string;

    if (terminal.name === "cmd") {
      fullCommand = `start ${terminal.command} ${terminal.args(folderPath, command).join(" ")}`;
    } else if (terminal.name === "powershell" || terminal.name === "pwsh") {
      const args = terminal.args(folderPath, command);
      fullCommand = `start ${terminal.command} ${args.join(" ")}`;
    } else if (terminal.name === "wt") {
      const args = terminal.args(folderPath, command);
      fullCommand = `${terminal.command} ${args.join(" ")}`;
    } else if (terminal.name === "warp") {
      // Para Warp, necesitamos usar el path completo si no está en PATH
      const warpPath = process.env.LOCALAPPDATA
        ? `"${process.env.LOCALAPPDATA}\\Programs\\Warp\\Warp.exe"`
        : terminal.command;
      const args = terminal.args(folderPath, command);
      fullCommand = `${warpPath} ${args.join(" ")}`;
    } else {
      // Fallback genérico
      const args = terminal.args(folderPath, command);
      fullCommand = `start ${terminal.command} ${args.join(" ")}`;
    }

    exec(fullCommand, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export function formatCommandForDisplay(terminal: Terminal, command: string): string {
  return `${command} (via ${terminal.displayName})`;
}
