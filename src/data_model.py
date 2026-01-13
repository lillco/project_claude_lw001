from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class User(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime = datetime.now()


class Project(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    user_id: int  # Foreign key to User
    created_at: datetime = datetime.now()


class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str = "pending"  # e.g., pending, in_progress, completed
    project_id: int  # Foreign key to Project
    assigned_to: Optional[int] = None  # Foreign key to User
    due_date: Optional[datetime] = None
    created_at: datetime = datetime.now()


# Example relationships (for reference, not enforced in Pydantic)
# User.projects: List[Project]
# Project.tasks: List[Task]
# Task.project: Project
# Task.assignee: Optional[User]