let users = [];
let projects = [];
let tasks = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadProjects();
    loadTasks();
});

// User functions
async function createUser() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;

    if (!name || !email) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email })
        });
        const user = await response.json();
        users.push(user);

        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';

        loadUsers();
        updateUserSelects();
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        users = await response.json();
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsers() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = users.map(user => `
        <div class="item">
            <div class="item-content">
                <div class="item-title">${user.name}</div>
                <div class="item-subtitle">${user.email}</div>
            </div>
        </div>
    `).join('');
}

// Project functions
async function createProject() {
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDesc').value;
    const user_id = parseInt(document.getElementById('projectUser').value);

    if (!name || !user_id) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, user_id })
        });
        const project = await response.json();
        projects.push(project);

        document.getElementById('projectName').value = '';
        document.getElementById('projectDesc').value = '';
        document.getElementById('projectUser').value = '';

        loadProjects();
        updateProjectSelects();
    } catch (error) {
        console.error('Error creating project:', error);
    }
}

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        projects = await response.json();
        displayProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function displayProjects() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = projects.map(project => {
        const owner = users.find(u => u.id === project.user_id);
        return `
            <div class="item">
                <div class="item-content">
                    <div class="item-title">${project.name}</div>
                    <div class="item-subtitle">${project.description || 'No description'}</div>
                    <div class="item-subtitle">Owner: ${owner ? owner.name : 'Unknown'}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Task functions
async function createTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDesc').value;
    const project_id = parseInt(document.getElementById('taskProject').value);
    const assigned_to = document.getElementById('taskAssignee').value ? parseInt(document.getElementById('taskAssignee').value) : null;
    const due_date = document.getElementById('taskDueDate').value;

    if (!title || !project_id) {
        alert('Please fill in all required fields');
        return;
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, project_id, assigned_to, due_date })
        });
        const task = await response.json();
        tasks.push(task);

        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDesc').value = '';
        document.getElementById('taskProject').value = '';
        document.getElementById('taskAssignee').value = '';
        document.getElementById('taskDueDate').value = '';

        loadTasks();
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        tasks = await response.json();
        displayTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function displayTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = tasks.map(task => {
        const project = projects.find(p => p.id === task.project_id);
        const assignee = users.find(u => u.id === task.assigned_to);
        return `
            <div class="item">
                <div class="item-content">
                    <div class="item-title">${task.title}</div>
                    <div class="item-subtitle">${task.description || 'No description'}</div>
                    <div class="item-subtitle">Project: ${project ? project.name : 'Unknown'}</div>
                    ${assignee ? `<div class="item-subtitle">Assigned to: ${assignee.name}</div>` : ''}
                    ${task.due_date ? `<div class="item-subtitle">Due: ${new Date(task.due_date).toLocaleDateString()}</div>` : ''}
                </div>
                <div class="item-actions">
                    <span class="item-status status-${task.status}">${task.status.replace('_', ' ').toUpperCase()}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Helper functions to update selects
function updateUserSelects() {
    const projectUserSelect = document.getElementById('projectUser');
    const taskAssigneeSelect = document.getElementById('taskAssignee');

    projectUserSelect.innerHTML = '<option value="">Select User</option>' + users.map(u => 
        `<option value="${u.id}">${u.name}</option>`
    ).join('');

    taskAssigneeSelect.innerHTML = '<option value="">Assign to User</option>' + users.map(u => 
        `<option value="${u.id}">${u.name}</option>`
    ).join('');
}

function updateProjectSelects() {
    const taskProjectSelect = document.getElementById('taskProject');

    taskProjectSelect.innerHTML = '<option value="">Select Project</option>' + projects.map(p => 
        `<option value="${p.id}">${p.name}</option>`
    ).join('');
}