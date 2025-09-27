import { Action, Toast, showToast, List, ActionPanel, Icon, Color } from "@raycast/api";
import { useEffect, useState } from "react";
import { detectAvailableTerminals, getDefaultTerminal, Terminal } from "../utils/terminal-detector";
import { getPreferredTerminal, setPreferredTerminal, getPreferredTerminalFromList } from "../utils/preferences";
import { executeCommandInTerminal, formatCommandForDisplay } from "../utils/terminal-executor";
import { analyzeProject, ProjectAnalysis, ProjectCommand, getProjectTypeDisplay } from "../utils/project-analyzer";

interface CommandsProps {
  folderPath: string;
}

export default function Commands({ folderPath }: CommandsProps) {
  const [loading, setLoading] = useState(true);
  const [availableTerminals, setAvailableTerminals] = useState<Terminal[]>([]);
  const [defaultTerminal, setDefaultTerminal] = useState<Terminal | null>(null);
  const [projectAnalysis, setProjectAnalysis] = useState<ProjectAnalysis | null>(null);

  useEffect(() => {
    async function setupCommandsAndTerminals() {
      try {
        // Analizar el proyecto
        const analysis = analyzeProject(folderPath);
        setProjectAnalysis(analysis);

        // Detectar terminales disponibles
        const terminals = await detectAvailableTerminals();
        setAvailableTerminals(terminals);

        // Obtener terminal preferida del usuario
        const preferredName = await getPreferredTerminal();
        const preferredTerminal = getPreferredTerminalFromList(terminals, preferredName);

        // Si no hay preferida o no está disponible, usar la por defecto
        const terminal = preferredTerminal || getDefaultTerminal(terminals);
        setDefaultTerminal(terminal);
      } catch (error) {
        console.error("Error setting up commands and terminals:", error);
        showToast(Toast.Style.Failure, "Error analyzing project and detecting terminals");
      } finally {
        setLoading(false);
      }
    }

    setupCommandsAndTerminals();
  }, [folderPath]);

  const executeCommand = async (command: ProjectCommand, terminal: Terminal) => {
    try {
      await executeCommandInTerminal(terminal, folderPath, command.value);
      showToast(Toast.Style.Success, `Executing: ${formatCommandForDisplay(terminal, command.value)}`);
    } catch (error) {
      showToast(
        Toast.Style.Failure,
        `Error executing command: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const setAsDefaultTerminal = async (terminal: Terminal) => {
    try {
      await setPreferredTerminal(terminal.name);
      setDefaultTerminal(terminal);
      showToast(Toast.Style.Success, `${terminal.displayName} set as default terminal`);
    } catch {
      showToast(Toast.Style.Failure, "Error setting default terminal");
    }
  };

  // Agrupar comandos por categoría
  const groupedCommands =
    projectAnalysis?.availableCommands.reduce(
      (groups, command) => {
        const category = command.category;
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(command);
        return groups;
      },
      {} as Record<string, ProjectCommand[]>,
    ) || {};

  // Obtener icono para la categoría
  const getCategoryIcon = (category: string): Icon => {
    const iconMap: Record<string, Icon> = {
      Dependencies: Icon.Box,
      Development: Icon.Play,
      Build: Icon.Hammer,
      Testing: Icon.Bug,
      Git: Icon.Git,
      Docker: Icon.Box,
      Navigation: Icon.Folder,
      Utilities: Icon.Gear,
      "Custom Scripts": Icon.Code,
      Django: Icon.Globe,
      Security: Icon.Lock,
      "Code Quality": Icon.CheckCircle,
      Environment: Icon.Cog,
    };
    return iconMap[category] || Icon.Terminal;
  };

  if (loading) {
    return <List isLoading={true} searchBarPlaceholder="Analyzing project..." />;
  }

  return (
    <List searchBarPlaceholder="Search commands..." navigationTitle={`Commands for: ${folderPath.slice(15)}`}>
      <List.Section
        title="Project Information"
        subtitle={projectAnalysis ? `Detected: ${getProjectTypeDisplay(projectAnalysis.projectType)}` : ""}
      >
        <List.Item
          title={`📁 ${folderPath.split("\\").pop() || folderPath}`}
          subtitle={`Project Type: ${projectAnalysis ? getProjectTypeDisplay(projectAnalysis.projectType) : "Unknown"}`}
          accessories={[
            {
              text: defaultTerminal ? `Terminal: ${defaultTerminal.displayName}` : "No terminal",
              icon: Icon.Terminal,
            },
            ...(projectAnalysis?.packageManager
              ? [
                  {
                    text: `Package Manager: ${projectAnalysis.packageManager}`,
                    icon: Icon.Box,
                  },
                ]
              : []),
            ...(projectAnalysis?.hasGit
              ? [
                  {
                    text: "Git",
                    icon: Icon.Git,
                  },
                ]
              : []),
            ...(projectAnalysis?.hasDocker
              ? [
                  {
                    text: "Docker",
                    icon: Icon.Box,
                  },
                ]
              : []),
          ]}
        />
      </List.Section>

      {Object.entries(groupedCommands).map(([category, commands]) => (
        <List.Section key={category} title={category}>
          {commands.map((command, index) => (
            <List.Item
              key={`${category}-${index}`}
              title={command.title}
              subtitle={command.description}
              icon={getCategoryIcon(category)}
              accessories={[
                {
                  text: defaultTerminal ? defaultTerminal.displayName : "No terminal",
                  icon: Icon.Terminal,
                },
              ]}
              actions={
                <ActionPanel>
                  <ActionPanel.Section title="Execute Command">
                    {defaultTerminal && (
                      <Action
                        title={`Execute in ${defaultTerminal.displayName}`}
                        icon={Icon.Terminal}
                        onAction={() => executeCommand(command, defaultTerminal)}
                      />
                    )}
                    {availableTerminals
                      .filter((terminal) => terminal !== defaultTerminal)
                      .map((terminal) => (
                        <Action
                          key={terminal.name}
                          title={`Execute in ${terminal.displayName}`}
                          icon={{ source: Icon.Terminal, tintColor: Color.SecondaryText }}
                          onAction={() => executeCommand(command, terminal)}
                        />
                      ))}
                  </ActionPanel.Section>

                  {availableTerminals.length > 1 && (
                    <ActionPanel.Section title="Terminal Preferences">
                      {availableTerminals.map((terminal) => (
                        <Action
                          key={`set-default-${terminal.name}`}
                          title={`Set ${terminal.displayName} as Default`}
                          icon={
                            terminal === defaultTerminal
                              ? { source: Icon.CheckCircle, tintColor: Color.Green }
                              : Icon.Circle
                          }
                          onAction={() => setAsDefaultTerminal(terminal)}
                        />
                      ))}
                    </ActionPanel.Section>
                  )}

                  <ActionPanel.Section title="Information">
                    <Action.CopyToClipboard
                      title="Copy Command"
                      content={command.value}
                      shortcut={{ modifiers: ["cmd"], key: "c" }}
                    />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      ))}
    </List>
  );
}
