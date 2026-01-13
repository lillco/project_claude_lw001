import argparse
from typing import List
from data_model import User, Project, Task
from datetime import datetime


# In-memory storage (for demo; replace with database in production)
users: List[User] = []
projects: List[Project] = []
tasks: List[Task] = []


def create_user(name: str, email: str) -> User:
    user_id = len(users) + 1
    user = User(id=user_id, name=name, email=email)
    users.append(user)
    return user


def create_project(name: str, description: str, user_id: int) -> Project:
    project_id = len(projects) + 1
    project = Project(id=project_id, name=name, description=description, user_id=user_id)
    projects.append(project)
    return project


def create_task(title: str, description: str, project_id: int, assigned_to: int = None, due_date: str = None) -> Task:
    task_id = len(tasks) + 1
    due = datetime.fromisoformat(due_date) if due_date else None
    task = Task(id=task_id, title=title, description=description, project_id=project_id, assigned_to=assigned_to, due_date=due)
    tasks.append(task)
    return task


def list_tasks(project_id: int = None) -> List[Task]:
    if project_id:
        return [t for t in tasks if t.project_id == project_id]
    return tasks


def update_task_status(task_id: int, status: str) -> bool:
    for task in tasks:
        if task.id == task_id:
            task.status = status
            return True
    return False


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="Task Management App")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Create user
    create_user_parser = subparsers.add_parser("create-user", help="Create a new user")
    create_user_parser.add_argument("--name", required=True, help="User name")
    create_user_parser.add_argument("--email", required=True, help="User email")

    # Create project
    create_project_parser = subparsers.add_parser("create-project", help="Create a new project")
    create_project_parser.add_argument("--name", required=True, help="Project name")
    create_project_parser.add_argument("--description", help="Project description")
    create_project_parser.add_argument("--user-id", type=int, required=True, help="User ID")

    # Create task
    create_task_parser = subparsers.add_parser("create-task", help="Create a new task")
    create_task_parser.add_argument("--title", required=True, help="Task title")
    create_task_parser.add_argument("--description", help="Task description")
    create_task_parser.add_argument("--project-id", type=int, required=True, help="Project ID")
    create_task_parser.add_argument("--assigned-to", type=int, help="Assigned user ID")
    create_task_parser.add_argument("--due-date", help="Due date (ISO format, e.g., 2026-01-10)")

    # List tasks
    list_tasks_parser = subparsers.add_parser("list-tasks", help="List tasks")
    list_tasks_parser.add_argument("--project-id", type=int, help="Filter by project ID")

    # Update task status
    update_task_parser = subparsers.add_parser("update-task", help="Update task status")
    update_task_parser.add_argument("--task-id", type=int, required=True, help="Task ID")
    update_task_parser.add_argument("--status", required=True, choices=["pending", "in_progress", "completed"], help="New status")

    args = parser.parse_args(argv)

    if args.command == "create-user":
        user = create_user(args.name, args.email)
        print(f"Created user: {user}")
    elif args.command == "create-project":
        project = create_project(args.name, args.description, args.user_id)
        print(f"Created project: {project}")
    elif args.command == "create-task":
        task = create_task(args.title, args.description, args.project_id, args.assigned_to, args.due_date)
        print(f"Created task: {task}")
    elif args.command == "list-tasks":
        task_list = list_tasks(args.project_id)
        for task in task_list:
            print(f"Task {task.id}: {task.title} - {task.status}")
    elif args.command == "update-task":
        success = update_task_status(args.task_id, args.status)
        if success:
            print(f"Updated task {args.task_id} to {args.status}")
        else:
            print(f"Task {args.task_id} not found")
    else:
        parser.print_help()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())