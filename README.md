# project-claude-lw001

Minimal Python project scaffold with Claude integration and Task Management App.

Quick start

- Create a venv: `python -m venv .venv`
- Activate (Windows PowerShell): `.\.venv\Scripts\Activate.ps1`
- Install deps (if any): `pip install -r requirements.txt`
- Set API key: `$env:ANTHROPIC_API_KEY = "your-api-key"`
- Run the CLI: `python -m src.main --name Alice`
- Or chat with Claude: `python -m src.main --prompt "Hello, Claude!"`
- Run the Task Management App: `python src/app.py --help`
- Run tests: `pytest -q`

## Task Management App Usage

The app provides a simple CLI for managing users, projects, and tasks based on the data model.

Examples:
- Create a user: `python src/app.py create-user --name "John Doe" --email "john@example.com"`
- Create a project: `python src/app.py create-project --name "My Project" --description "A sample project" --user-id 1`
- Create a task: `python src/app.py create-task --title "Finish report" --project-id 1 --assigned-to 1 --due-date "2026-01-15"`
- List tasks: `python src/app.py list-tasks`
- Update task: `python src/app.py update-task --task-id 1 --status completed`
