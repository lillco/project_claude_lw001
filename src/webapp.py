from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from data_model import User, Project, Task
from datetime import datetime
from typing import List

app = Flask(__name__, template_folder='templates', static_folder='static')
CORS(app)

# In-memory storage
users: List[User] = []
projects: List[Project] = []
tasks: List[Task] = []


@app.route('/')
def index():
    return render_template('index.html')


# User endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify([u.model_dump() for u in users])


@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    user_id = len(users) + 1
    user = User(id=user_id, name=data['name'], email=data['email'])
    users.append(user)
    return jsonify(user.model_dump()), 201


# Project endpoints
@app.route('/api/projects', methods=['GET'])
def get_projects():
    return jsonify([p.model_dump() for p in projects])


@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.json
    project_id = len(projects) + 1
    project = Project(id=project_id, name=data['name'], description=data.get('description'), user_id=data['user_id'])
    projects.append(project)
    return jsonify(project.model_dump()), 201


@app.route('/api/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = next((p for p in projects if p.id == project_id), None)
    if project:
        return jsonify(project.model_dump())
    return jsonify({'error': 'Project not found'}), 404


# Task endpoints
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    project_id = request.args.get('project_id', type=int)
    if project_id:
        task_list = [t.model_dump() for t in tasks if t.project_id == project_id]
    else:
        task_list = [t.model_dump() for t in tasks]
    return jsonify(task_list)


@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.json
    task_id = len(tasks) + 1
    due_date = datetime.fromisoformat(data['due_date']) if data.get('due_date') else None
    task = Task(
        id=task_id,
        title=data['title'],
        description=data.get('description'),
        project_id=data['project_id'],
        assigned_to=data.get('assigned_to'),
        due_date=due_date
    )
    tasks.append(task)
    return jsonify(task.model_dump()), 201


@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = next((t for t in tasks if t.id == task_id), None)
    if task:
        return jsonify(task.model_dump())
    return jsonify({'error': 'Task not found'}), 404


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    task = next((t for t in tasks if t.id == task_id), None)
    if task:
        if 'status' in data:
            task.status = data['status']
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        return jsonify(task.model_dump())
    return jsonify({'error': 'Task not found'}), 404


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    global tasks
    tasks = [t for t in tasks if t.id != task_id]
    return jsonify({'success': True}), 204


if __name__ == '__main__':
    app.run(debug=True, port=5000)