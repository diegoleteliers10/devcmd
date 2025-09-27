import { LocalStorage } from "@raycast/api";
import { Terminal } from "./terminal-detector";

const PREFERRED_TERMINAL_KEY = "preferred_terminal";

export async function getPreferredTerminal(): Promise<string | null> {
  try {
    const preferred = await LocalStorage.getItem<string>(PREFERRED_TERMINAL_KEY);
    return preferred || null;
  } catch {
    return null;
  }
}

export async function setPreferredTerminal(terminalName: string): Promise<void> {
  try {
    await LocalStorage.setItem(PREFERRED_TERMINAL_KEY, terminalName);
  } catch (error) {
    console.error("Error saving preferred terminal:", error);
  }
}

export function getPreferredTerminalFromList(
  availableTerminals: Terminal[],
  preferredName: string | null
): Terminal | null {
  if (!preferredName) return null;

  const preferred = availableTerminals.find(t => t.name === preferredName);
  return preferred || null;
}

export async function clearPreferredTerminal(): Promise<void> {
  try {
    await LocalStorage.removeItem(PREFERRED_TERMINAL_KEY);
  } catch (error) {
    console.error("Error clearing preferred terminal:", error);
  }
}
