import fs from "fs";
import path from "path";

export interface ProjectCommand {
  title: string;
  value: string;
  category: string;
  description?: string;
}

export interface ProjectAnalysis {
  projectType: string[];
  availableCommands: ProjectCommand[];
  packageManager?: string;
  hasGit: boolean;
  hasDocker: boolean;
}

// Comandos por tipo de proyecto
const PROJECT_COMMANDS = {
  npm: [
    { title: "npm install", value: "npm install", category: "Dependencies", description: "Install dependencies" },
    { title: "npm start", value: "npm start", category: "Development", description: "Start the application" },
    { title: "npm run dev", value: "npm run dev", category: "Development", description: "Start development server" },
    { title: "npm run build", value: "npm run build", category: "Build", description: "Build for production" },
    { title: "npm test", value: "npm test", category: "Testing", description: "Run tests" },
    { title: "npm run lint", value: "npm run lint", category: "Code Quality", description: "Run linter" },
    { title: "npm audit", value: "npm audit", category: "Security", description: "Check for vulnerabilities" },
    { title: "npm update", value: "npm update", category: "Dependencies", description: "Update dependencies" },
  ],
  yarn: [
    { title: "yarn install", value: "yarn install", category: "Dependencies", description: "Install dependencies" },
    { title: "yarn start", value: "yarn start", category: "Development", description: "Start the application" },
    { title: "yarn dev", value: "yarn dev", category: "Development", description: "Start development server" },
    { title: "yarn build", value: "yarn build", category: "Build", description: "Build for production" },
    { title: "yarn test", value: "yarn test", category: "Testing", description: "Run tests" },
  ],
  pnpm: [
    { title: "pnpm install", value: "pnpm install", category: "Dependencies", description: "Install dependencies" },
    { title: "pnpm dev", value: "pnpm dev", category: "Development", description: "Start development server" },
    { title: "pnpm build", value: "pnpm build", category: "Build", description: "Build for production" },
    { title: "pnpm test", value: "pnpm test", category: "Testing", description: "Run tests" },
  ],
  bun: [
    { title: "bun install", value: "bun install", category: "Dependencies", description: "Install dependencies" },
    { title: "bun run dev", value: "bun run dev", category: "Development", description: "Start development server" },
    { title: "bun run build", value: "bun run build", category: "Build", description: "Build for production" },
    { title: "bun test", value: "bun test", category: "Testing", description: "Run tests" },
    { title: "bun start", value: "bun start", category: "Development", description: "Start the application" },
  ],
  python: [
    {
      title: "python -m venv venv",
      value: "python -m venv venv",
      category: "Environment",
      description: "Create virtual environment",
    },
    {
      title: "pip install -r requirements.txt",
      value: "pip install -r requirements.txt",
      category: "Dependencies",
      description: "Install Python dependencies",
    },
    { title: "python main.py", value: "python main.py", category: "Development", description: "Run main Python file" },
    {
      title: "python manage.py runserver",
      value: "python manage.py runserver",
      category: "Development",
      description: "Start Django server",
    },
    { title: "python -m pytest", value: "python -m pytest", category: "Testing", description: "Run Python tests" },
    {
      title: "pip freeze > requirements.txt",
      value: "pip freeze > requirements.txt",
      category: "Dependencies",
      description: "Export dependencies",
    },
    {
      title: "python -m pip install --upgrade pip",
      value: "python -m pip install --upgrade pip",
      category: "Dependencies",
      description: "Upgrade pip",
    },
  ],
  docker: [
    { title: "docker build .", value: "docker build .", category: "Docker", description: "Build Docker image" },
    { title: "docker compose up", value: "docker compose up", category: "Docker", description: "Start services" },
    {
      title: "docker compose up -d",
      value: "docker compose up -d",
      category: "Docker",
      description: "Start services in background",
    },
    { title: "docker compose down", value: "docker compose down", category: "Docker", description: "Stop services" },
    { title: "docker ps", value: "docker ps", category: "Docker", description: "List running containers" },
    { title: "docker images", value: "docker images", category: "Docker", description: "List Docker images" },
  ],
  git: [
    { title: "git status", value: "git status", category: "Git", description: "Check repository status" },
    { title: "git add .", value: "git add .", category: "Git", description: "Stage all changes" },
    { title: "git push", value: "git push", category: "Git", description: "Push to remote" },
    { title: "git log --oneline", value: "git log --oneline", category: "Git", description: "View commit history" },
  ],
  rust: [
    { title: "cargo build", value: "cargo build", category: "Build", description: "Build Rust project" },
    { title: "cargo run", value: "cargo run", category: "Development", description: "Run Rust project" },
    { title: "cargo test", value: "cargo test", category: "Testing", description: "Run Rust tests" },
    { title: "cargo check", value: "cargo check", category: "Development", description: "Check code without building" },
    { title: "cargo update", value: "cargo update", category: "Dependencies", description: "Update dependencies" },
  ],
  go: [
    { title: "go run .", value: "go run .", category: "Development", description: "Run Go application" },
    { title: "go build", value: "go build", category: "Build", description: "Build Go application" },
    { title: "go test", value: "go test", category: "Testing", description: "Run Go tests" },
    { title: "go mod tidy", value: "go mod tidy", category: "Dependencies", description: "Clean up dependencies" },
    { title: "go get", value: "go get", category: "Dependencies", description: "Download dependencies" },
  ],
  php: [
    {
      title: "composer install",
      value: "composer install",
      category: "Dependencies",
      description: "Install PHP dependencies",
    },
    {
      title: "composer update",
      value: "composer update",
      category: "Dependencies",
      description: "Update PHP dependencies",
    },
    {
      title: "php artisan serve",
      value: "php artisan serve",
      category: "Development",
      description: "Start Laravel server",
    },
    {
      title: "php -S localhost:8000",
      value: "php -S localhost:8000",
      category: "Development",
      description: "Start PHP dev server",
    },
  ],
  general: [
    { title: "dir", value: "dir", category: "Navigation", description: "List directory contents" },
    { title: "cursor .", value: "cursor .", category: "Utilities", description: "Open in VS Code" },
  ],
};

export function analyzeProject(folderPath: string): ProjectAnalysis {
  const analysis: ProjectAnalysis = {
    projectType: [],
    availableCommands: [],
    hasGit: false,
    hasDocker: false,
  };

  try {
    const files = fs.readdirSync(folderPath);

    // Detectar Git
    const gitPath = path.join(folderPath, ".git");
    if (files.includes(".git") || fs.existsSync(gitPath)) {
      // Verificar si es un directorio .git o un archivo .git (para worktrees)
      const gitStat = fs.existsSync(gitPath) ? fs.lstatSync(gitPath) : null;
      if (gitStat && (gitStat.isDirectory() || gitStat.isFile())) {
        analysis.hasGit = true;
        analysis.projectType.push("git");
        analysis.availableCommands.push(...PROJECT_COMMANDS.git);
      }
    }

    // Detectar Docker
    if (files.includes("Dockerfile") || files.includes("docker-compose.yml") || files.includes("docker-compose.yaml")) {
      analysis.hasDocker = true;
      analysis.projectType.push("docker");
      analysis.availableCommands.push(...PROJECT_COMMANDS.docker);
    }

    // Detectar Node.js/JavaScript projects
    if (files.includes("package.json")) {
      analysis.projectType.push("nodejs");

      // Detectar package manager
      if (files.includes("yarn.lock")) {
        analysis.packageManager = "yarn";
        analysis.availableCommands.push(...PROJECT_COMMANDS.yarn);
      } else if (files.includes("pnpm-lock.yaml")) {
        analysis.packageManager = "pnpm";
        analysis.availableCommands.push(...PROJECT_COMMANDS.pnpm);
      } else if (files.includes("bun.lockb")) {
        analysis.packageManager = "bun";
        analysis.availableCommands.push(...PROJECT_COMMANDS.bun);
      } else {
        analysis.packageManager = "npm";
        analysis.availableCommands.push(...PROJECT_COMMANDS.npm);
      }

      // Leer package.json para comandos específicos
      try {
        const packageJsonPath = path.join(folderPath, "package.json");
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

        if (packageJson.scripts) {
          Object.keys(packageJson.scripts).forEach((scriptName) => {
            const packageManager = analysis.packageManager || "npm";
            analysis.availableCommands.push({
              title: `${packageManager} run ${scriptName}`,
              value: `${packageManager} run ${scriptName}`,
              category: "Custom Scripts",
              description: `Run custom script: ${scriptName}`,
            });
          });
        }
      } catch (error) {
        console.error("Error reading package.json:", error);
      }
    }

    // Detectar Python projects
    if (
      files.includes("requirements.txt") ||
      files.includes("pyproject.toml") ||
      files.includes("setup.py") ||
      files.some((f) => f.endsWith(".py"))
    ) {
      analysis.projectType.push("python");
      analysis.availableCommands.push(...PROJECT_COMMANDS.python);

      // Detectar si es Django
      if (files.includes("manage.py")) {
        analysis.availableCommands.push(
          {
            title: "python manage.py migrate",
            value: "python manage.py migrate",
            category: "Django",
            description: "Run database migrations",
          },
          {
            title: "python manage.py createsuperuser",
            value: "python manage.py createsuperuser",
            category: "Django",
            description: "Create admin user",
          },
          {
            title: "python manage.py collectstatic",
            value: "python manage.py collectstatic",
            category: "Django",
            description: "Collect static files",
          },
        );
      }
    }

    // Detectar Rust projects
    if (files.includes("Cargo.toml")) {
      analysis.projectType.push("rust");
      analysis.availableCommands.push(...PROJECT_COMMANDS.rust);
    }

    // Detectar Go projects
    if (files.includes("go.mod") || files.some((f) => f.endsWith(".go"))) {
      analysis.projectType.push("go");
      analysis.availableCommands.push(...PROJECT_COMMANDS.go);
    }

    // Detectar PHP projects
    if (files.includes("composer.json") || files.some((f) => f.endsWith(".php"))) {
      analysis.projectType.push("php");
      analysis.availableCommands.push(...PROJECT_COMMANDS.php);
    }

    // Siempre agregar comandos generales
    analysis.availableCommands.push(...PROJECT_COMMANDS.general);

    // Si no se detectó ningún tipo específico, agregar algunos comandos básicos
    if (analysis.projectType.length === 0) {
      analysis.projectType.push("unknown");
    }
  } catch (error) {
    console.error("Error analyzing project:", error);
    // En caso de error, al menos agregar comandos generales
    analysis.availableCommands.push(...PROJECT_COMMANDS.general);
  }

  return analysis;
}

export function getProjectTypeDisplay(projectTypes: string[]): string {
  const typeMap: { [key: string]: string } = {
    nodejs: "Node.js",
    python: "Python",
    rust: "Rust",
    go: "Go",
    php: "PHP",
    git: "Git",
    docker: "Docker",
    unknown: "General",
  };

  return projectTypes.map((type) => typeMap[type] || type).join(", ");
}
