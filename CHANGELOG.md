[🎉 Initial Release] - v1.0.0

#### ✨ Features Added
- **Intelligent Project Detection**: Automatically identifies Node.js, Python, Rust, Go, PHP, Docker, and Git projects
- **Smart Command Suggestions**: Shows only relevant commands based on project structure
- **Multi-Terminal Support**: Execute commands in CMD, PowerShell, PowerShell Core, Windows Terminal, or Warp
- **Package Manager Detection**: Identifies npm, yarn, pnpm, or bun from lock files
- **Custom Scripts Integration**: Reads and displays package.json scripts as executable commands
- **Terminal Preferences**: Save and manage preferred terminal with easy switching
- **Command Categories**: Organized commands by type (Dependencies, Development, Testing, etc.)
- **Copy to Clipboard**: Copy any command for manual execution
- **Project Information Display**: Shows detected project type, package manager, Git, and Docker status
- **Error Handling**: Robust error handling with user-friendly notifications
- **Windows-Optimized**: Specifically designed for Windows development workflows

#### 🛠️ Technical Implementation
- React-based UI using Raycast's API
- Modular architecture with utilities separated from UI components
- File system analysis for project type detection
- Native Windows terminal integration via child_process
- Local storage for user preferences persistence
- TypeScript for type safety and better development experience

#### 📁 Project Structure
- **Separation of Concerns**: UI components in `src/`, utilities in `utils/`
- **Modular Design**: Each utility handles a specific responsibility
- **Clean Architecture**: Clear separation between analysis, execution, and preferences
- **Extensible Design**: Easy to add new project types and terminals

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/devcmd/issues) page
2. Create a new issue with detailed information including:
   - Your Windows version
   - Raycast version
   - Project type you're working with
   - Terminal you're trying to use
   - Steps to reproduce the issue
   - Error messages (if any)
3. For feature requests, describe your use case and desired functionality

## Roadmap

### Short Term
- [ ] Support for more project types (C#, Java, Ruby, etc.)
- [ ] Custom command definitions per project
- [ ] Command history and recently used commands
- [ ] Better error messages and debugging info

### Medium Term
- [ ] Batch command execution
- [ ] Terminal theme integration
- [ ] Command templates and snippets
- [ ] Project-specific terminal preferences

### Long Term
- [ ] Remote project support
- [ ] Integration with popular IDEs
- [ ] Command performance analytics
- [ ] Multi-language command descriptions

---

**Note**: This extension is specifically designed for Windows development environments. Ensure your system has the necessary permissions to execute commands in different terminals. Some terminals may require additional setup or installation.

**Windows Compatibility**: Tested on Windows 10 and Windows 11. Requires appropriate permissions for terminal execution and file system access.