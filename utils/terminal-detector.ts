import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export interface Terminal {
  name: string;
  displayName: string;
  command: string;
  args: (folderPath: string, commandToRun: string) => string[];
  isAvailable: boolean;
}

export const AVAILABLE_TERMINALS: Terminal[] = [
  {
    name: "cmd",
    displayName: "CMD",
    command: "cmd.exe",
    args: (folderPath: string, commandToRun: string) => [
      "/K",
      `cd /d "${folderPath}" && ${commandToRun}`
    ],
    isAvailable: false,
  },
  {
    name: "powershell",
    displayName: "PowerShell",
    command: "powershell.exe",
    args: (folderPath: string, commandToRun: string) => [
      "-NoExit",
      "-Command",
      `Set-Location -Path '${folderPath}'; ${commandToRun}`
    ],
    isAvailable: false,
  },
  {
    name: "pwsh",
    displayName: "PowerShell Core",
    command: "pwsh.exe",
    args: (folderPath: string, commandToRun: string) => [
      "-NoExit",
      "-Command",
      `Set-Location -Path '${folderPath}'; ${commandToRun}`
    ],
    isAvailable: false,
  },
  {
    name: "wt",
    displayName: "Windows Terminal",
    command: "wt.exe",
    args: (folderPath: string, commandToRun: string) => [
      "-d",
      folderPath,
      "--",
      "cmd.exe",
      "/K",
      commandToRun
    ],
    isAvailable: false,
  },
  {
    name: "warp",
    displayName: "Warp Terminal",
    command: "warp.exe",
    args: (folderPath: string, commandToRun: string) => [
      "--working-directory",
      folderPath,
      "--command",
      commandToRun
    ],
    isAvailable: false,
  }
];

async function checkCommandAvailability(command: string): Promise<boolean> {
  try {
    await execAsync(`where ${command}`);
    return true;
  } catch {
    return false;
  }
}

async function checkWarpAvailability(): Promise<boolean> {
  // Warp suele instalarse en AppData\Local\Programs\Warp
  const warpPaths = [
    path.join(process.env.LOCALAPPDATA || "", "Programs", "Warp", "Warp.exe"),
    path.join(process.env.APPDATA || "", "Warp", "Warp.exe"),
  ];

  return warpPaths.some(warpPath => fs.existsSync(warpPath));
}

export async function detectAvailableTerminals(): Promise<Terminal[]> {
  const terminals = [...AVAILABLE_TERMINALS];

  // Verificar disponibilidad de cada terminal
  await Promise.all(
    terminals.map(async (terminal) => {
      if (terminal.name === "warp") {
        terminal.isAvailable = await checkWarpAvailability();
      } else {
        terminal.isAvailable = await checkCommandAvailability(terminal.command);
      }
    })
  );

  return terminals.filter(terminal => terminal.isAvailable);
}

export function getDefaultTerminal(availableTerminals: Terminal[]): Terminal | null {
  // Orden de preferencia para Windows
  const preferenceOrder = ["cmd", "powershell", "pwsh", "wt", "warp"];

  for (const preferred of preferenceOrder) {
    const terminal = availableTerminals.find(t => t.name === preferred);
    if (terminal) return terminal;
  }

  return availableTerminals[0] || null;
}
