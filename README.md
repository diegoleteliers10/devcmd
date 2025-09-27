DevCmd - Development Commands Manager

A powerful Raycast extension for Windows developers that intelligently analyzes your project folders and provides relevant development commands. Execute commands in your preferred terminal (CMD, PowerShell, Windows Terminal, Warp) with just one click.

![DevCmd Extension](assets/extension-icon.png)

## Features

- **🔍 Intelligent Project Analysis**: Automatically detects project types (Node.js, Python, Rust, Go, PHP, Docker, Git)
- **🎯 Smart Command Suggestions**: Shows only relevant commands based on your project structure
- **🖥️ Multiple Terminal Support**: Execute commands in CMD, PowerShell, PowerShell Core, Windows Terminal, or Warp
- **📦 Package Manager Detection**: Automatically identifies npm, yarn, pnpm, or bun based on lock files
- **📋 Custom Scripts Integration**: Reads package.json scripts and adds them as executable commands
- **🏷️ Organized Categories**: Commands grouped by type (Dependencies, Development, Testing, Git, Docker, etc.)
- **⚙️ Terminal Preferences**: Set your preferred terminal as default with easy switching
- **📋 Copy to Clipboard**: Copy any command to clipboard for manual execution
- **🔄 Real-time Detection**: Analyzes project structure every time you select a folder

## Installation

1. Install [Raycast](https://raycast.com/) on your Windows system
2. Clone or download this extension
3. Open terminal in the project directory
4. Run `npm install` to install dependencies
5. Run `npm run dev` to start development mode
6. The extension will be available in Raycast

## Usage

### Opening DevCmd
- Open Raycast (`Alt + Space` by default)
- Type "Devcmd" or search for the extension
- Press Enter to launch the folder selection dialog

### Selecting a Project Folder
1. **Choose Folder**: Use the file picker to select your project directory
2. **Automatic Analysis**: The extension analyzes your project structure
3. **View Commands**: See categorized commands relevant to your project

### Executing Commands
1. **Default Terminal**: Press Enter to execute in your preferred terminal
2. **Choose Terminal**: Use action menu to select a specific terminal
3. **Set Preferences**: Change your default terminal from the action panel
4. **Copy Command**: Copy any command to clipboard for manual execution

### Supported Project Types

| Project Type | Detection Files | Available Commands |
|--------------|-----------------|-------------------|
| **Node.js** | `package.json` | npm/yarn/pnpm/bun commands, custom scripts |
| **Python** | `requirements.txt`, `*.py` files | pip, python, pytest commands |
| **Django** | `manage.py` | Django-specific management commands |
| **Rust** | `Cargo.toml` | cargo build, run, test commands |
| **Go** | `go.mod`, `*.go` files | go run, build, test commands |
| **PHP** | `composer.json`, `*.php` files | composer, artisan commands |
| **Docker** | `Dockerfile`, `docker-compose.yml` | docker build, compose commands |
| **Git** | `.git` folder/file | git status, add, commit, push commands |

### Available Terminals

| Terminal | Windows Command | Auto-Detection |
|----------|----------------|----------------|
| **Command Prompt** | `cmd.exe` | Always available |
| **PowerShell** | `powershell.exe` | System default |
| **PowerShell Core** | `pwsh.exe` | If installed |
| **Windows Terminal** | `wt.exe` | If installed |
| **Warp Terminal** | `warp.exe` | If installed |

### Available Actions

| Action | Description |
|--------|-------------|
| Execute in [Terminal] | Run command in your default terminal |
| Execute in [Other Terminal] | Choose alternative terminal for execution |
| Set [Terminal] as Default | Change your preferred terminal |
| Copy Command | Copy command text to clipboard |

## Technical Details

### System Requirements
- Windows 10/11
- Raycast application
- Node.js 18+ (for development)

### How It Works
The extension performs intelligent project analysis:
1. **File System Scanning**: Reads directory contents to identify project files
2. **Project Type Detection**: Matches files against known patterns (package.json, requirements.txt, etc.)
3. **Package Manager Detection**: Identifies lock files to determine preferred package manager
4. **Custom Scripts Parsing**: Extracts npm scripts from package.json
5. **Terminal Detection**: Checks system for available terminal applications
6. **Command Generation**: Creates relevant command lists based on detected project types

### Architecture
```
devcmd/
├── src/
│   ├── commands.tsx              # Main React component and UI
│   └── index.tsx                 # Entry point and folder selection
├── utils/
│   ├── project-analyzer.ts       # Project detection and analysis logic
│   ├── terminal-detector.ts      # Terminal availability detection
│   ├── terminal-executor.ts      # Command execution in different terminals
│   └── preferences.ts            # User preferences management
├── assets/
│   └── extension-icon.png        # Extension icon
├── manifest/                     # Extension metadata (empty)
├── package.json                  # Extension configuration and dependencies
└── README.md                     # This file
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Raycast CLI

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd devcmd

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Available Scripts
- `npm run dev` - Start development mode with hot reload
- `npm run build` - Build the extension for production
- `npm run lint` - Run ESLint code analysis
- `npm run fix-lint` - Automatically fix ESLint issues
- `npm run publish` - Publish to Raycast Store

### Project Structure Details

#### Core Components
- **`src/index.tsx`**: Entry point with folder selection interface
- **`src/commands.tsx`**: Main commands interface with project analysis and terminal execution

#### Utility Modules
- **`utils/project-analyzer.ts`**: 
  - Detects project types by analyzing files and folders
  - Generates relevant command lists based on project structure
  - Handles custom script extraction from package.json

- **`utils/terminal-detector.ts`**: 
  - Detects available terminals on Windows system
  - Manages terminal availability and command syntax
  - Provides default terminal selection logic

- **`utils/terminal-executor.ts`**: 
  - Executes commands in different terminal applications
  - Handles terminal-specific command formatting
  - Manages command execution errors

- **`utils/preferences.ts`**: 
  - Manages user preferences using Raycast LocalStorage
  - Stores and retrieves preferred terminal settings
  - Handles preference validation and fallbacks

### Adding New Project Types
To add support for a new project type:

1. **Update `utils/project-analyzer.ts`**:
```typescript
// Add detection logic in analyzeProject function
if (files.includes('your-project-file')) {
  analysis.projectType.push('your-project-type');
  analysis.availableCommands.push(...PROJECT_COMMANDS.yourProjectType);
}

// Add command definitions to PROJECT_COMMANDS
const PROJECT_COMMANDS = {
  yourProjectType: [
    { 
      title: "Your Command", 
      value: "your-command", 
      category: "Development", 
      description: "Description" 
    }
  ]
};
```

2. **Update type display mapping**:
```typescript
const typeMap = {
  yourProjectType: 'Your Project Type Display Name'
};
```

### Adding New Terminals
To add support for a new terminal:

1. **Update `utils/terminal-detector.ts`**:
```typescript
// Add terminal configuration to AVAILABLE_TERMINALS
{
  name: "your-terminal",
  displayName: "Your Terminal Name",
  command: "your-terminal.exe",
  args: (folderPath: string, commandToRun: string) => [
    "--your-args", folderPath, commandToRun
  ],
  isAvailable: false,
}
```

2. **Update `utils/terminal-executor.ts`** if special handling is needed:
```typescript
// Add specific execution logic if required
else if (terminal.name === "your-terminal") {
  // Custom execution logic
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Test your changes thoroughly with different project types
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use React hooks for state management
- Implement proper error handling
- Add JSDoc comments for complex functions
- Test with multiple project types and terminals

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**dleteliers_**
- Raycast: [@dleteliers_