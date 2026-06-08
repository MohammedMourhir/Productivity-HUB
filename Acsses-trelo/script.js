// ========== CONFIGURATION ==========
const CONFIG = {
    STORAGE_KEY: 'taskManagerPro_v3',
    COLORS: {
        blue: '#3b82f6',
        green: '#10b981',
        yellow: '#f59e0b',
        red: '#ef4444',
        purple: '#8b5cf6',
        pink: '#ec4899',
        cyan: '#06b6d4',
        gray: '#6b7280'
    }
};

// ========== CUSTOM UI NOTIFICATION SYSTEM ==========
const UINotification = {
    show(message, type = 'info', duration = 3500) {
        const center = document.getElementById('notificationCenter');
        if (!center) return;
        
        const toast = document.createElement('div');
        toast.className = `notif-toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        
        toast.innerHTML = `
            <div class="notif-icon"><i class="fas ${icon}"></i></div>
            <div class="notif-content">${message}</div>
            <button class="notif-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>
        `;
        
        center.appendChild(toast);
        
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.style.animation = 'slideOut 0.25s forwards';
                setTimeout(() => toast.remove(), 250);
            }
        }, duration);
    }
};

// ========== CUSTOM CONFIRM DIALOG ==========
let confirmResolver = null;
const ConfirmDialog = {
    show(message, type = 'danger') {
        return new Promise(resolve => {
            const overlay = document.getElementById('confirmOverlay');
            const msgEl = document.getElementById('confirmMessage');
            const iconEl = document.getElementById('confirmIcon');
            const okBtn = document.getElementById('confirmOk');
            
            msgEl.innerText = message;
            okBtn.className = `dialog-btn confirm ${type === 'danger' ? '' : 'primary'}`;
            
            if (type === 'warning') iconEl.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            else if (type === 'info') iconEl.innerHTML = '<i class="fas fa-info-circle"></i>';
            else iconEl.innerHTML = '<i class="fas fa-question-circle"></i>';
            
            overlay.style.display = 'flex';
            confirmResolver = resolve;
        });
    },
    
    hide() {
        document.getElementById('confirmOverlay').style.display = 'none';
        confirmResolver = null;
    }
};

document.getElementById('confirmOk').addEventListener('click', () => {
    if (confirmResolver) confirmResolver(true);
    ConfirmDialog.hide();
});

document.getElementById('confirmCancel').addEventListener('click', () => {
    if (confirmResolver) confirmResolver(false);
    ConfirmDialog.hide();
});

// ========== CUSTOM PROMPT DIALOG ==========
let promptResolver = null;
const PromptDialog = {
    show(title, defaultValue = '') {
        return new Promise(resolve => {
            const overlay = document.getElementById('promptOverlay');
            const titleEl = document.getElementById('promptTitle');
            const inputEl = document.getElementById('promptInput');
            const errorEl = document.getElementById('promptError');
            
            titleEl.innerText = title;
            inputEl.value = defaultValue;
            errorEl.style.display = 'none';
            overlay.style.display = 'flex';
            inputEl.focus();
            
            promptResolver = resolve;
        });
    },
    
    hide() {
        document.getElementById('promptOverlay').style.display = 'none';
        promptResolver = null;
    }
};

document.getElementById('promptSubmit').addEventListener('click', () => {
    const input = document.getElementById('promptInput');
    const error = document.getElementById('promptError');
    
    if (!input.value.trim()) {
        error.style.display = 'block';
        return;
    }
    
    if (promptResolver) promptResolver(input.value.trim());
    PromptDialog.hide();
});

document.getElementById('promptCancel').addEventListener('click', () => {
    if (promptResolver) promptResolver(null);
    PromptDialog.hide();
});

// Close dialogs with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('confirmOverlay').style.display === 'flex') {
            ConfirmDialog.hide();
            if (confirmResolver) confirmResolver(false);
        }
        if (document.getElementById('promptOverlay').style.display === 'flex') {
            PromptDialog.hide();
            if (promptResolver) promptResolver(null);
        }
    }
});

// ========== DATA STORE ==========
const DataStore = {
    data: {
        boards: [],
        currentBoardId: null,
        templates: []
    },

    init() {
        this.load();
        if (this.data.boards.length === 0) {
            this.createSampleData();
        }
        if (!this.data.currentBoardId && this.data.boards.length > 0) {
            this.data.currentBoardId = this.data.boards[0].id;
        }
        this.save();
        return this;
    },

    load() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this.data = { ...this.data, ...parsed };
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    },

    save() {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.data));
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    },

    createSampleData() {
        const boardId = this.generateId();
        this.data.boards = [{
            id: boardId,
            name: 'Daily Tasks',
            lists: [
                { 
                    id: this.generateId(), 
                    name: 'Todo', 
                    type: 'todo', 
                    tasks: [
                        { id: this.generateId(), title: 'Plan your day', description: 'Review and prioritize tasks', color: 'blue', important: true, createdAt: new Date().toISOString(), completedAt: null },
                        { id: this.generateId(), title: 'Check emails', description: 'Respond to urgent messages', color: 'green', important: false, createdAt: new Date().toISOString(), completedAt: null }
                    ] 
                },
                { 
                    id: this.generateId(), 
                    name: 'Doing', 
                    type: 'doing', 
                    tasks: [
                        { id: this.generateId(), title: 'Work on project', description: 'Complete the main feature', color: 'purple', important: true, createdAt: new Date().toISOString(), completedAt: null }
                    ] 
                },
                { 
                    id: this.generateId(), 
                    name: 'Done', 
                    type: 'done', 
                    tasks: [
                        { id: this.generateId(), title: 'Morning routine', description: 'Exercise and breakfast', color: 'green', important: false, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() }
                    ] 
                }
            ]
        }];
        
        this.data.templates = [
            {
                id: this.generateId(),
                name: 'Morning Routine',
                tasks: [
                    { title: 'Wake up at 6:00 AM', description: 'Start the day early', color: 'blue', important: true },
                    { title: 'Exercise for 30 mins', description: 'Morning workout', color: 'green', important: true }
                ]
            }
        ];
        
        this.data.currentBoardId = boardId;
    },

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    getCurrentBoard() {
        return this.data.boards.find(b => b.id === this.data.currentBoardId);
    },

    getList(boardId, listId) {
        const board = this.data.boards.find(b => b.id === boardId);
        return board?.lists.find(l => l.id === listId);
    },

    addBoard(name) {
        const newBoard = {
            id: this.generateId(),
            name: name,
            lists: [
                { id: this.generateId(), name: 'Todo', type: 'todo', tasks: [] },
                { id: this.generateId(), name: 'Doing', type: 'doing', tasks: [] },
                { id: this.generateId(), name: 'Done', type: 'done', tasks: [] }
            ]
        };
        
        this.data.boards.push(newBoard);
        this.data.currentBoardId = newBoard.id;
        this.save();
        return newBoard;
    },

    addList(boardId, name, tasks = []) {
        const board = this.data.boards.find(b => b.id === boardId);
        if (board) {
            const newList = {
                id: this.generateId(),
                name: name,
                type: 'custom',
                tasks: tasks.map(task => ({
                    id: this.generateId(),
                    title: task.title,
                    description: task.description || '',
                    color: task.color || 'blue',
                    important: task.important || false,
                    createdAt: new Date().toISOString(),
                    completedAt: null
                }))
            };
            board.lists.push(newList);
            this.save();
            return newList;
        }
    },

    addTask(boardId, listId, taskData) {
        const list = this.getList(boardId, listId);
        if (list) {
            const newTask = {
                id: this.generateId(),
                title: taskData.title,
                description: taskData.description || '',
                color: taskData.color || 'blue',
                important: taskData.important || false,
                createdAt: new Date().toISOString(),
                completedAt: taskData.completedAt || null
            };
            list.tasks.push(newTask);
            this.save();
            return newTask;
        }
    },

    moveTask(taskId, fromListId, toListId) {
        const board = this.getCurrentBoard();
        if (!board) return false;

        const fromList = board.lists.find(l => l.id === fromListId);
        const toList = board.lists.find(l => l.id === toListId);
        
        if (!fromList || !toList) return false;

        const taskIndex = fromList.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return false;

        const [task] = fromList.tasks.splice(taskIndex, 1);
        
        if (toList.type === 'done') {
            task.completedAt = new Date().toISOString();
        } else if (fromList.type === 'done' && toList.type !== 'done') {
            task.completedAt = null;
        }
        
        toList.tasks.push(task);
        this.save();
        return true;
    },

    copyAllTasks(fromListId, toListId) {
        const board = this.getCurrentBoard();
        if (!board) return false;

        const fromList = board.lists.find(l => l.id === fromListId);
        const toList = board.lists.find(l => l.id === toListId);
        
        if (!fromList || !toList || fromList.id === toList.id) return false;

        fromList.tasks.forEach(task => {
            const newTask = {
                ...JSON.parse(JSON.stringify(task)),
                id: this.generateId(),
                createdAt: new Date().toISOString()
            };
            
            if (toList.type !== 'done') {
                newTask.completedAt = null;
            } else if (toList.type === 'done' && !newTask.completedAt) {
                newTask.completedAt = new Date().toISOString();
            }
            
            toList.tasks.push(newTask);
        });

        this.save();
        return true;
    },

    copyListToTodo(listId) {
        const board = this.getCurrentBoard();
        if (!board) return false;

        const list = board.lists.find(l => l.id === listId);
        const todoList = board.lists.find(l => l.type === 'todo');
        
        if (!list || !todoList) return false;

        list.tasks.forEach(task => {
            const newTask = {
                ...JSON.parse(JSON.stringify(task)),
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                completedAt: null
            };
            todoList.tasks.push(newTask);
        });

        this.save();
        return true;
    },

    addTemplate(name, tasks) {
        const newTemplate = {
            id: this.generateId(),
            name: name,
            tasks: tasks.map(task => ({
                title: task.title,
                description: task.description || '',
                color: task.color || 'blue',
                important: task.important || false
            }))
        };
        this.data.templates.push(newTemplate);
        this.save();
        return newTemplate;
    },

    deleteTemplate(templateId) {
        const index = this.data.templates.findIndex(t => t.id === templateId);
        if (index !== -1) {
            this.data.templates.splice(index, 1);
            this.save();
        }
    }
};

// ========== RENDER ENGINE ==========
const RenderEngine = {
    renderAll() {
        this.renderBoards();
        this.renderBoardContent();
        this.renderTemplates();
    },

    renderBoards() {
        const container = document.getElementById('boardsContainer');
        if (!container) return;

        container.innerHTML = DataStore.data.boards.map(board => `
            <div class="board-item ${board.id === DataStore.data.currentBoardId ? 'active' : ''}"
                 onclick="App.selectBoard('${board.id}')"
                 oncontextmenu="event.preventDefault(); ContextMenu.showForBoard(event, '${board.id}')">
                <i class="fas fa-clipboard-list"></i>
                <span>${this.escapeHtml(board.name)}</span>
            </div>
        `).join('');
    },

    renderBoardContent() {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        this.renderStatusTabs(board);
        this.renderCustomLists(board);
    },

    renderStatusTabs(board) {
        const todoList = board.lists.find(l => l.type === 'todo');
        const doingList = board.lists.find(l => l.type === 'doing');
        const doneList = board.lists.find(l => l.type === 'done');

        document.getElementById('todoCount').textContent = `${todoList?.tasks.length || 0} tasks`;
        document.getElementById('doingCount').textContent = `${doingList?.tasks.length || 0} tasks`;
        document.getElementById('doneCount').textContent = `${doneList?.tasks.length || 0} tasks`;

        this.renderTasks('todoContainer', todoList);
        this.renderTasks('doingContainer', doingList);
        this.renderTasks('doneContainer', doneList);
    },

    renderTasks(containerId, list) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!list || list.tasks.length === 0) {
            container.innerHTML = '<div class="empty-list">No tasks yet</div>';
            return;
        }

        container.innerHTML = list.tasks.map(task => this.createTaskHTML(task, list.id)).join('');
    },

    renderCustomLists(board) {
        const container = document.getElementById('listsContainer');
        if (!container) return;

        const customLists = board.lists.filter(l => l.type === 'custom');
        
        if (customLists.length === 0) {
            container.innerHTML = '<div class="empty-list">No custom lists yet. Create one to organize specific tasks.</div>';
            return;
        }

        container.innerHTML = customLists.map(list => `
            <div class="list-item" 
                 data-list-id="${list.id}"
                 draggable="true"
                 ondragstart="DragManager.dragList(event, '${list.id}')"
                 ondragover="DragManager.allowDrop(event)">
                <div class="list-header">
                    <div class="list-title">
                        <i class="fas fa-list"></i>
                        ${this.escapeHtml(list.name)}
                        ${list.tasks.length > 0 ? `
                            <span class="list-task-count-badge">${list.tasks.length}</span>
                        ` : ''}
                    </div>
                    <div class="list-actions">
                        <button class="task-action-btn" onclick="TemplateManager.copyListToTodo('${list.id}'); event.stopPropagation()" title="Copy all tasks to Todo">
                            <i class="fas fa-clone"></i>
                        </button>
                        <button class="task-action-btn" onclick="TaskManager.showCreateModal('${list.id}'); event.stopPropagation()" title="Add Task">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="task-action-btn" onclick="ListManager.showEditModal('${list.id}'); event.stopPropagation()" title="Edit List">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="task-action-btn" onclick="ListManager.deleteList('${list.id}'); event.stopPropagation()" title="Delete List">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cards-container" 
                     data-list-id="${list.id}"
                     ondrop="DragManager.dropToCustomList(event, '${list.id}')"
                     ondragover="DragManager.allowDrop(event)">
                    ${this.renderTasksInCustomList(list)}
                </div>
                <div class="list-footer">
                    <small>${list.tasks.length} tasks • Drag to copy to status columns</small>
                    <button class="btn btn-sm btn-secondary" onclick="TemplateManager.saveListAsTemplate('${list.id}'); event.stopPropagation()">
                        <i class="fas fa-save"></i> Save as Template
                    </button>
                </div>
            </div>
        `).join('');
    },

    renderTasksInCustomList(list) {
        if (list.tasks.length === 0) {
            return '<div class="empty-list">No tasks in this list</div>';
        }

        return list.tasks.map(task => this.createTaskHTML(task, list.id)).join('');
    },

    renderTemplates() {
        const container = document.getElementById('templatesContainer');
        if (!container) return;

        if (DataStore.data.templates.length === 0) {
            container.innerHTML = '<div class="empty-list">No templates saved yet</div>';
            return;
        }

        container.innerHTML = DataStore.data.templates.map(template => `
            <div class="template-card" onclick="TemplateManager.useTemplate('${template.id}')">
                <div class="template-header">
                    <div class="template-name">
                        <i class="fas fa-clone"></i>
                        ${this.escapeHtml(template.name)}
                    </div>
                    <button class="task-action-btn" onclick="TemplateManager.deleteTemplate('${template.id}'); event.stopPropagation()">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="template-tasks">
                    ${template.tasks.slice(0, 3).map(task => `
                        <div style="margin-bottom: 5px; padding: 5px; background: white; border-radius: 6px; border-left: 4px solid ${CONFIG.COLORS[task.color] || '#3b82f6'}; font-size: 12px;">
                            ${task.important ? '🔥 ' : ''}${this.escapeHtml(task.title)}
                        </div>
                    `).join('')}
                    ${template.tasks.length > 3 ? `<div style="font-size: 11px; color: var(--text-muted); margin-top: 5px;">+${template.tasks.length - 3} more</div>` : ''}
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn btn-sm btn-primary" onclick="TemplateManager.useTemplate('${template.id}'); event.stopPropagation()">
                        Use as List
                    </button>
                    <button class="btn btn-sm btn-success" onclick="TemplateManager.copyTemplateToTodo('${template.id}'); event.stopPropagation()">
                        Copy to Todo
                    </button>
                </div>
            </div>
        `).join('');
    },

    createTaskHTML(task, listId) {
        return `
            <div class="task-card task-color-${task.color}"
                 data-task-id="${task.id}"
                 data-list-id="${listId}"
                 draggable="true"
                 ondragstart="DragManager.dragTask(event, '${task.id}', '${listId}')"
                 onclick="TaskManager.showEditModal('${listId}', '${task.id}')">
                <div class="task-header">
                    <div class="task-title">
                        ${this.escapeHtml(task.title)}
                        ${task.important ? '<i class="fas fa-fire task-important"></i>' : ''}
                    </div>
                </div>
                ${task.description ? `<div style="font-size: 13px; color: #64748b; margin: 5px 0;">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-footer">
                    <div>${this.formatDate(task.createdAt)}</div>
                    <div class="task-actions">
                        <button class="task-action-btn" onclick="TaskManager.toggleComplete('${listId}', '${task.id}'); event.stopPropagation()">
                            <i class="fas ${task.completedAt ? 'fa-undo' : 'fa-check'}"></i>
                        </button>
                        <button class="task-action-btn" onclick="TaskManager.deleteTask('${listId}', '${task.id}'); event.stopPropagation()">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) {
            return 'Recently';
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ========== APP CONTROLLER ==========
const App = {
    init() {
        DataStore.init();
        this.setupEventListeners();
        RenderEngine.renderAll();
        JSONManager.loadFromHash();
    },

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ModalManager.close();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                TaskManager.showCreateModal(null);
            }
        });

        window.addEventListener('beforeunload', () => {
            DataStore.save();
        });
    },

    selectBoard(boardId) {
        DataStore.data.currentBoardId = boardId;
        DataStore.save();
        RenderEngine.renderAll();
    },

    refresh() {
        RenderEngine.renderAll();
    }
};

// ========== MODAL MANAGER ==========
const ModalManager = {
    currentModal: null,

    open(modalId) {
        this.close();
        this.currentModal = document.getElementById(modalId);
        if (this.currentModal) {
            this.currentModal.style.display = 'flex';
            const input = this.currentModal.querySelector('input, textarea, select');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    },

    close() {
        if (this.currentModal) {
            this.currentModal.style.display = 'none';
            this.currentModal = null;
        }
    }
};

// ========== BOARD MANAGER ==========
const BoardManager = {
    showCreateModal() {
        document.getElementById('boardNameInput').value = '';
        ModalManager.open('boardModal');
    },

    async create() {
        const name = document.getElementById('boardNameInput').value.trim();
        if (!name) {
            UINotification.show('Please enter a board name.', 'warning');
            return;
        }

        DataStore.addBoard(name);
        ModalManager.close();
        UINotification.show('Board created successfully!', 'success');
        App.refresh();
    }
};

// ========== LIST MANAGER ==========
const ListManager = {
    editingListId: null,

    showCreateModal() {
        this.editingListId = null;
        document.getElementById('listModalTitle').textContent = 'Create List';
        document.getElementById('listNameInput').value = '';
        document.getElementById('listAsTemplateCheckbox').checked = false;
        document.getElementById('listModalSubmit').textContent = 'Create';
        document.getElementById('listModalSubmit').onclick = () => this.create();
        ModalManager.open('listModal');
    },

    showEditModal(listId) {
        const board = DataStore.getCurrentBoard();
        const list = board?.lists.find(l => l.id === listId);
        if (!list) return;

        this.editingListId = listId;
        document.getElementById('listModalTitle').textContent = 'Edit List';
        document.getElementById('listNameInput').value = list.name;
        document.getElementById('listAsTemplateCheckbox').checked = false;
        document.getElementById('listModalSubmit').textContent = 'Save';
        document.getElementById('listModalSubmit').onclick = () => this.update();
        ModalManager.open('listModal');
    },

    async create() {
        const name = document.getElementById('listNameInput').value.trim();
        const saveAsTemplate = document.getElementById('listAsTemplateCheckbox').checked;
        
        if (!name) {
            UINotification.show('Please enter a list name.', 'warning');
            return;
        }

        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const newList = DataStore.addList(board.id, name);
        
        if (saveAsTemplate) {
            DataStore.addTemplate(name, []);
            UINotification.show('List created and saved as template!', 'success');
        }
        
        ModalManager.close();
        UINotification.show('List created successfully!', 'success');
        App.refresh();
    },

    async update() {
        if (!this.editingListId) return;
        
        const name = document.getElementById('listNameInput').value.trim();
        if (!name) {
            UINotification.show('Please enter a list name.', 'warning');
            return;
        }

        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const list = board.lists.find(l => l.id === this.editingListId);
        if (list) {
            list.name = name;
            DataStore.save();
        }
        
        ModalManager.close();
        UINotification.show('List updated successfully!', 'success');
        App.refresh();
    },

    async deleteList(listId) {
        const confirmed = await ConfirmDialog.show('Delete this list and all its tasks?');
        if (!confirmed) return;
        
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const listIndex = board.lists.findIndex(l => l.id === listId);
        if (listIndex !== -1) {
            board.lists.splice(listIndex, 1);
            DataStore.save();
            UINotification.show('List deleted', 'success');
            App.refresh();
        }
    }
};

// ========== TASK MANAGER ==========
const TaskManager = {
    currentTaskId: null,
    currentListId: null,

    showCreateModal(listId) {
        this.currentTaskId = null;
        this.currentListId = listId;
        
        document.getElementById('taskModalTitle').textContent = 'Create Task';
        document.getElementById('taskTitleInput').value = '';
        document.getElementById('taskDescriptionInput').value = '';
        document.getElementById('taskColorSelect').value = 'blue';
        document.getElementById('taskImportantCheckbox').checked = false;
        
        ModalManager.open('taskModal');
    },

    showEditModal(listId, taskId) {
        const board = DataStore.getCurrentBoard();
        const list = board?.lists.find(l => l.id === listId);
        const task = list?.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.currentTaskId = taskId;
        this.currentListId = listId;
        
        document.getElementById('taskModalTitle').textContent = 'Edit Task';
        document.getElementById('taskTitleInput').value = task.title;
        document.getElementById('taskDescriptionInput').value = task.description || '';
        document.getElementById('taskColorSelect').value = task.color || 'blue';
        document.getElementById('taskImportantCheckbox').checked = task.important || false;
        
        ModalManager.open('taskModal');
    },

    async save() {
        const title = document.getElementById('taskTitleInput').value.trim();
        if (!title) {
            UINotification.show('Please enter a task title.', 'warning');
            return;
        }

        const taskData = {
            title: title,
            description: document.getElementById('taskDescriptionInput').value.trim(),
            color: document.getElementById('taskColorSelect').value,
            important: document.getElementById('taskImportantCheckbox').checked
        };

        const board = DataStore.getCurrentBoard();
        if (!board) return;

        if (this.currentTaskId && this.currentListId) {
            const list = board.lists.find(l => l.id === this.currentListId);
            if (list) {
                const task = list.tasks.find(t => t.id === this.currentTaskId);
                if (task) {
                    Object.assign(task, taskData);
                    DataStore.save();
                    UINotification.show('Task updated successfully!', 'success');
                }
            }
        } else if (this.currentListId) {
            let targetListId = this.currentListId;
            if (['todo', 'doing', 'done'].includes(this.currentListId)) {
                const statusList = board.lists.find(l => l.type === this.currentListId);
                if (statusList) {
                    targetListId = statusList.id;
                }
            }
            
            DataStore.addTask(board.id, targetListId, taskData);
            UINotification.show('Task created successfully!', 'success');
        } else {
            const todoList = board.lists.find(l => l.type === 'todo');
            if (todoList) {
                DataStore.addTask(board.id, todoList.id, taskData);
                UINotification.show('Task created successfully!', 'success');
            }
        }

        ModalManager.close();
        App.refresh();
    },

    async toggleComplete(listId, taskId) {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const list = board.lists.find(l => l.id === listId);
        const task = list?.tasks.find(t => t.id === taskId);
        if (!task) return;

        let targetList;
        if (task.completedAt) {
            targetList = board.lists.find(l => l.type === 'todo');
        } else {
            targetList = board.lists.find(l => l.type === 'done');
        }

        if (targetList && targetList.id !== listId) {
            DataStore.moveTask(taskId, listId, targetList.id);
            UINotification.show(task.completedAt ? 'Task moved back to Todo' : 'Task completed!', 'success');
            App.refresh();
        }
    },

    async deleteTask(listId, taskId) {
        const confirmed = await ConfirmDialog.show('Delete this task?');
        if (!confirmed) return;
        
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const list = board.lists.find(l => l.id === listId);
        if (list) {
            const index = list.tasks.findIndex(t => t.id === taskId);
            if (index !== -1) {
                list.tasks.splice(index, 1);
                DataStore.save();
                UINotification.show('Task deleted', 'success');
                App.refresh();
            }
        }
    },

    async clearDoneTasks() {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        let totalDone = 0;
        board.lists.forEach(list => {
            const doneTasks = list.tasks.filter(task => task.completedAt);
            totalDone += doneTasks.length;
        });

        if (totalDone === 0) {
            UINotification.show('No completed tasks to clear.', 'info');
            return;
        }

        const confirmed = await ConfirmDialog.show(`Clear ${totalDone} completed task${totalDone > 1 ? 's' : ''} from all lists?`);
        if (confirmed) {
            board.lists.forEach(list => {
                list.tasks = list.tasks.filter(task => !task.completedAt);
            });
            
            DataStore.save();
            UINotification.show(`Cleared ${totalDone} completed tasks`, 'success');
            App.refresh();
        }
    },

    async clearAllDoneTasks() {
        let totalDone = 0;
        
        DataStore.data.boards.forEach(board => {
            board.lists.forEach(list => {
                const doneTasks = list.tasks.filter(task => task.completedAt);
                totalDone += doneTasks.length;
            });
        });

        if (totalDone === 0) {
            UINotification.show('No completed tasks to clear in any board.', 'info');
            return;
        }

        const confirmed = await ConfirmDialog.show(`Clear ${totalDone} completed task${totalDone > 1 ? 's' : ''} from ALL boards?`, 'warning');
        if (confirmed) {
            DataStore.data.boards.forEach(board => {
                board.lists.forEach(list => {
                    list.tasks = list.tasks.filter(task => !task.completedAt);
                });
            });
            
            DataStore.save();
            UINotification.show(`Cleared ${totalDone} tasks from all boards`, 'success');
            App.refresh();
        }
    },

    showStatistics() {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        let totalTasks = 0;
        let completedTasks = 0;
        let importantTasks = 0;
        
        board.lists.forEach(list => {
            totalTasks += list.tasks.length;
            list.tasks.forEach(task => {
                if (task.completedAt) completedTasks++;
                if (task.important) importantTasks++;
            });
        });

        const statsBody = document.getElementById('statsModalBody');
        statsBody.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #3b82f6;">
                    <i class="fas fa-chart-bar"></i> Board Statistics
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">${totalTasks}</div>
                        <div style="font-size: 14px; color: #64748b;">Total Tasks</div>
                    </div>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #10b981;">${completedTasks}</div>
                        <div style="font-size: 14px; color: #64748b;">Completed</div>
                    </div>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #ef4444;">${importantTasks}</div>
                        <div style="font-size: 14px; color: #64748b;">Important</div>
                    </div>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 28px; font-weight: bold; color: #f59e0b;">${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%</div>
                        <div style="font-size: 14px; color: #64748b;">Completion Rate</div>
                    </div>
                </div>
                <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin-top: 20px;">
                    <div style="font-weight: bold; margin-bottom: 10px; color: #334155;">Board: ${board.name}</div>
                    <div style="font-size: 13px; color: #64748b;">
                        ${board.lists.map(list => `${list.name}: ${list.tasks.length} tasks`).join(' • ')}
                    </div>
                </div>
            </div>
        `;
        
        ModalManager.open('statsModal');
    },

    showAdvancedClearOptions() {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        let stats = {
            todo: board.lists.find(l => l.type === 'todo')?.tasks.length || 0,
            doing: board.lists.find(l => l.type === 'doing')?.tasks.length || 0,
            done: board.lists.find(l => l.type === 'done')?.tasks.length || 0,
            custom: board.lists.filter(l => l.type === 'custom').reduce((sum, list) => sum + list.tasks.length, 0)
        };

        const clearBody = document.getElementById('advancedClearModalBody');
        clearBody.innerHTML = `
            <div style="padding: 15px;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #334155;">
                    <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i> Clear Options
                </div>
                <div style="margin-bottom: 15px; color: #64748b; font-size: 14px;">
                    Select what you want to clear from the current board.
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${stats.todo > 0 ? `
                    <button class="btn btn-secondary" onclick="TaskManager.clearSection('todo'); ModalManager.close()" style="justify-content: flex-start; text-align: left;">
                        <i class="fas fa-circle" style="color: #ef4444;"></i>
                        Clear To Do (${stats.todo} tasks)
                    </button>
                    ` : ''}
                    ${stats.doing > 0 ? `
                    <button class="btn btn-secondary" onclick="TaskManager.clearSection('doing'); ModalManager.close()" style="justify-content: flex-start; text-align: left;">
                        <i class="fas fa-spinner" style="color: #f59e0b;"></i>
                        Clear Doing (${stats.doing} tasks)
                    </button>
                    ` : ''}
                    ${stats.done > 0 ? `
                    <button class="btn btn-secondary" onclick="TaskManager.clearSection('done'); ModalManager.close()" style="justify-content: flex-start; text-align: left;">
                        <i class="fas fa-check-circle" style="color: #10b981;"></i>
                        Clear Done (${stats.done} tasks)
                    </button>
                    ` : ''}
                    ${stats.custom > 0 ? `
                    <button class="btn btn-secondary" onclick="TaskManager.clearCustomLists(); ModalManager.close()" style="justify-content: flex-start; text-align: left;">
                        <i class="fas fa-list" style="color: #8b5cf6;"></i>
                        Clear Custom Lists (${stats.custom} tasks)
                    </button>
                    ` : ''}
                    <button class="btn btn-danger-dark" onclick="TaskManager.clearAllInCurrentBoard(); ModalManager.close()" style="margin-top: 15px;">
                        <i class="fas fa-bomb"></i>
                        Clear ALL Tasks in This Board
                    </button>
                </div>
            </div>
        `;
        
        ModalManager.open('advancedClearModal');
    },

    async clearSection(section) {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const list = board.lists.find(l => l.type === section);
        if (list && list.tasks.length > 0) {
            const confirmed = await ConfirmDialog.show(`Clear all ${list.tasks.length} tasks from ${list.name}?`);
            if (confirmed) {
                list.tasks = [];
                DataStore.save();
                UINotification.show(`${list.name} cleared`, 'success');
                App.refresh();
            }
        } else {
            UINotification.show(`No tasks in ${section} to clear.`, 'info');
        }
    },

    async clearCustomLists() {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const customLists = board.lists.filter(l => l.type === 'custom');
        const totalTasks = customLists.reduce((sum, list) => sum + list.tasks.length, 0);
        
        if (totalTasks === 0) {
            UINotification.show('No tasks in custom lists to clear.', 'info');
            return;
        }

        const confirmed = await ConfirmDialog.show(`Clear all ${totalTasks} tasks from ${customLists.length} custom list${customLists.length > 1 ? 's' : ''}?`);
        if (confirmed) {
            customLists.forEach(list => {
                list.tasks = [];
            });
            DataStore.save();
            UINotification.show('Custom lists cleared', 'success');
            App.refresh();
        }
    },

    clearAllInCurrentBoard() {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const totalTasks = board.lists.reduce((sum, list) => sum + list.tasks.length, 0);
        
        if (totalTasks === 0) {
            UINotification.show('No tasks in this board to clear.', 'info');
            return;
        }

        const clearAllBody = document.getElementById('clearAllModalBody');
        clearAllBody.innerHTML = `
            <div style="padding: 15px;">
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #dc2626;">
                    <i class="fas fa-exclamation-triangle"></i> WARNING: Irreversible Action!
                </div>
                <div style="margin-bottom: 15px; color: #64748b; font-size: 14px;">
                    You are about to delete ALL ${totalTasks} tasks from the board "${board.name}".
                    <br><br>
                    This action cannot be undone!
                </div>
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="ModalManager.close()" style="flex: 1;">
                        Cancel
                    </button>
                    <button class="btn btn-danger-dark" onclick="TaskManager.executeClearAll(); ModalManager.close()" style="flex: 1;">
                        DELETE ALL
                    </button>
                </div>
            </div>
        `;
        
        ModalManager.open('clearAllModal');
    },

    async executeClearAll() {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        board.lists.forEach(list => {
            list.tasks = [];
        });
        
        DataStore.save();
        UINotification.show('All tasks cleared', 'success');
        App.refresh();
    }
};

// ========== DRAG MANAGER ==========
const DragManager = {
    draggedTaskId: null,
    draggedFromListId: null,
    draggedListId: null,

    allowDrop(e) {
        e.preventDefault();
    },

    dragTask(e, taskId, listId) {
        this.draggedTaskId = taskId;
        this.draggedFromListId = listId;
        e.dataTransfer.setData('text/plain', 'task:' + taskId + ':' + listId);
        e.target.classList.add('dragging');
    },

    dragList(e, listId) {
        this.draggedListId = listId;
        e.dataTransfer.setData('text/plain', 'list:' + listId);
        e.target.classList.add('dragging');
    },

    dropToStatus(e, status) {
        e.preventDefault();
        e.stopPropagation();
        
        const data = e.dataTransfer.getData('text/plain');
        const parts = data.split(':');
        const type = parts[0];
        
        if (type === 'task' && parts.length === 3) {
            const taskId = parts[1];
            const fromListId = parts[2];
            this.handleTaskDropToStatus(taskId, fromListId, status);
        } else if (type === 'list') {
            const listId = parts[1];
            this.handleListDropToStatus(listId, status);
        }
        
        this.clearDragging();
    },

    dropToCustomList(e, targetListId) {
        e.preventDefault();
        e.stopPropagation();
        
        const data = e.dataTransfer.getData('text/plain');
        const parts = data.split(':');
        const type = parts[0];
        
        if (type === 'task' && parts.length === 3) {
            const taskId = parts[1];
            const fromListId = parts[2];
            this.handleTaskDropToCustomList(taskId, fromListId, targetListId);
        }
        
        this.clearDragging();
    },

    async handleTaskDropToStatus(taskId, fromListId, status) {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const targetList = board.lists.find(l => l.type === status);
        if (!targetList) return;

        const fromList = board.lists.find(l => l.id === fromListId);
        if (fromList && fromList.id === targetList.id) {
            UINotification.show('Cannot drop task in same list', 'warning');
            return;
        }

        const moved = DataStore.moveTask(taskId, fromListId, targetList.id);
        if (moved) {
            App.refresh();
            UINotification.show(`Task moved to ${status}`, 'success');
        } else {
            UINotification.show('Failed to move task', 'error');
        }
    },

    async handleTaskDropToCustomList(taskId, fromListId, targetListId) {
        if (fromListId === targetListId) {
            UINotification.show('Cannot drop task in same list', 'warning');
            return;
        }

        const moved = DataStore.moveTask(taskId, fromListId, targetListId);
        if (moved) {
            App.refresh();
            UINotification.show('Task moved to list', 'success');
        } else {
            UINotification.show('Failed to move task', 'error');
        }
    },

    async handleListDropToStatus(listId, status) {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const targetList = board.lists.find(l => l.type === status);
        if (!targetList) return;

        const draggedList = board.lists.find(l => l.id === listId);
        if (!draggedList || draggedList.tasks.length === 0) {
            UINotification.show('List has no tasks to copy', 'warning');
            return;
        }

        const confirmed = await ConfirmDialog.show(`Copy all ${draggedList.tasks.length} tasks from "${draggedList.name}" to ${status}?`, 'info');
        if (confirmed) {
            const copied = DataStore.copyAllTasks(listId, targetList.id);
            if (copied) {
                App.refresh();
                UINotification.show(`All tasks copied to ${status}`, 'success');
            } else {
                UINotification.show('Failed to copy tasks', 'error');
            }
        }
    },

    clearDragging() {
        this.draggedTaskId = null;
        this.draggedFromListId = null;
        this.draggedListId = null;
        
        document.querySelectorAll('.dragging').forEach(el => {
            el.classList.remove('dragging');
        });
    }
};

// ========== TEMPLATE MANAGER ==========
const TemplateManager = {
    showTemplatesModal() {
        const container = document.getElementById('templatesList');
        if (!container) return;

        if (DataStore.data.templates.length === 0) {
            container.innerHTML = '<div class="empty-list">No templates saved yet</div>';
        } else {
            container.innerHTML = DataStore.data.templates.map(template => `
                <div style="padding: 15px; background: #f1f5f9; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0;">${RenderEngine.escapeHtml(template.name)}</h4>
                        <button class="btn btn-sm btn-danger" onclick="TemplateManager.deleteTemplate('${template.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div>
                        ${template.tasks.slice(0, 5).map(task => `
                            <div style="padding: 5px 0; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 8px;">
                                <div style="width: 10px; height: 10px; border-radius: 50%; background: ${CONFIG.COLORS[task.color] || '#3b82f6'};"></div>
                                <span style="font-size: 13px;">${RenderEngine.escapeHtml(task.title)}</span>
                                ${task.important ? '<i class="fas fa-fire" style="color: #ef4444; font-size: 10px;"></i>' : ''}
                            </div>
                        `).join('')}
                        ${template.tasks.length > 5 ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">+${template.tasks.length - 5} more</div>` : ''}
                    </div>
                    <div style="margin-top: 10px; display: flex; gap: 10px;">
                        <button class="btn btn-sm btn-primary" onclick="TemplateManager.useTemplate('${template.id}')">
                            Use as List
                        </button>
                        <button class="btn btn-sm btn-success" onclick="TemplateManager.copyTemplateToTodo('${template.id}')">
                            Copy to Todo
                        </button>
                    </div>
                </div>
            `).join('');
        }

        ModalManager.open('templatesModal');
    },

    async saveCurrentListAsTemplate() {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const customList = board.lists.find(l => l.type === 'custom');
        if (!customList || customList.tasks.length === 0) {
            UINotification.show('No custom list with tasks found to save as template.', 'warning');
            return;
        }

        const name = await PromptDialog.show('Enter template name:', customList.name);
        if (!name) return;

        DataStore.addTemplate(name, customList.tasks);
        UINotification.show('Template saved successfully!', 'success');
        App.refresh();
    },

    async saveListAsTemplate(listId) {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const list = board.lists.find(l => l.id === listId);
        if (!list || list.tasks.length === 0) {
            UINotification.show('This list has no tasks to save as template.', 'warning');
            return;
        }

        const name = await PromptDialog.show('Enter template name:', list.name);
        if (!name) return;

        DataStore.addTemplate(name, list.tasks);
        UINotification.show('Template saved successfully!', 'success');
        App.refresh();
    },

    async useTemplate(templateId) {
        const template = DataStore.data.templates.find(t => t.id === templateId);
        if (!template) return;

        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const name = await PromptDialog.show('Enter list name:', template.name);
        if (!name) return;

        DataStore.addList(board.id, name, template.tasks);
        ModalManager.close();
        UINotification.show('Template applied as new list', 'success');
        App.refresh();
    },

    async copyListToTodo(listId) {
        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const list = board.lists.find(l => l.id === listId);
        if (!list) return;

        if (list.tasks.length === 0) {
            UINotification.show('This list has no tasks to copy.', 'warning');
            return;
        }

        const confirmed = await ConfirmDialog.show(`Copy all ${list.tasks.length} tasks from "${list.name}" to Todo?`, 'info');
        if (confirmed) {
            const copied = DataStore.copyListToTodo(listId);
            if (copied) {
                App.refresh();
                UINotification.show(`${list.tasks.length} tasks copied to Todo`, 'success');
            }
        }
    },

    async copyTemplateToTodo(templateId) {
        const template = DataStore.data.templates.find(t => t.id === templateId);
        if (!template) return;

        const board = DataStore.getCurrentBoard();
        if (!board) return;

        const todoList = board.lists.find(l => l.type === 'todo');
        if (!todoList) return;

        const confirmed = await ConfirmDialog.show(`Copy all ${template.tasks.length} tasks from "${template.name}" template to Todo?`, 'info');
        if (confirmed) {
            template.tasks.forEach(taskData => {
                DataStore.addTask(board.id, todoList.id, taskData);
            });

            ModalManager.close();
            App.refresh();
            UINotification.show(`${template.tasks.length} tasks copied to Todo`, 'success');
        }
    },

    async deleteTemplate(templateId) {
        const confirmed = await ConfirmDialog.show('Delete this template?');
        if (!confirmed) return;
        
        DataStore.deleteTemplate(templateId);
        UINotification.show('Template deleted', 'success');
        App.refresh();
        if (ModalManager.currentModal?.id === 'templatesModal') {
            this.showTemplatesModal();
        }
    }
};

// ========== JSON MANAGER ==========
const JSONManager = {
    openModal() {
        this.showTab('export');
        ModalManager.open('jsonModal');
    },

    showTab(tabName) {
        document.querySelectorAll('.json-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.json-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.getElementById(`json${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`).classList.add('active');
        
        const buttons = document.querySelectorAll('.json-tab-btn');
        buttons.forEach(btn => {
            if (btn.textContent.toLowerCase().includes(tabName)) {
                btn.classList.add('active');
            }
        });
        
        if (tabName === 'export') {
            this.refreshExport();
        } else if (tabName === 'import') {
            document.getElementById('jsonInput').value = '';
            document.getElementById('jsonStatus').style.display = 'none';
        }
    },

    refreshExport() {
        const data = this.exportData();
        document.getElementById('jsonOutput').value = JSON.stringify(data, null, 2);
        this.updatePreview(data);
    },

    exportData() {
        return {
            version: '1.0',
            exportDate: new Date().toISOString(),
            boards: DataStore.data.boards,
            templates: DataStore.data.templates,
            currentBoardId: DataStore.data.currentBoardId
        };
    },

    updatePreview(data) {
        const previewDiv = document.getElementById('jsonPreview');
        if (!previewDiv) return;
        
        previewDiv.innerHTML = `
            <div style="padding: 15px;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin: 0; font-size: 16px;">Data Preview</h3>
                            <div style="font-size: 12px; opacity: 0.9;">Exported: ${new Date(data.exportDate).toLocaleString()}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 20px; font-size: 12px;">
                            v${data.version}
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
                    <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #3b82f6;">${data.boards?.length || 0}</div>
                        <div style="font-size: 12px; color: #64748b;">Boards</div>
                    </div>
                    <div style="background: #f1f5f9; padding: 10px; border-radius: 6px; text-align: center;">
                        <div style="font-size: 20px; font-weight: bold; color: #10b981;">${data.templates?.length || 0}</div>
                        <div style="font-size: 12px; color: #64748b;">Templates</div>
                    </div>
                </div>
            </div>
        `;
    },

    async copyData() {
        const output = document.getElementById('jsonOutput');
        output.select();
        
        try {
            await navigator.clipboard.writeText(output.value);
            UINotification.show('Data copied to clipboard!', 'success');
        } catch (error) {
            UINotification.show('Failed to copy data', 'error');
        }
    },

    downloadJSON() {
        const data = this.exportData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        const timestamp = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `taskmanager-backup-${timestamp}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        UINotification.show(`Backup saved as "${a.download}"`, 'success');
    },

    async importData() {
        const input = document.getElementById('jsonInput').value.trim();
        if (!input) {
            UINotification.show('Please paste JSON data to import.', 'warning');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            
            const confirmed = await ConfirmDialog.show('Import will replace all current data. Continue?', 'warning');
            if (!confirmed) return;
            
            DataStore.data = parsed;
            DataStore.save();
            App.refresh();
            ModalManager.close();
            UINotification.show('Data imported successfully!', 'success');
        } catch (error) {
            UINotification.show('Invalid JSON data: ' + error.message, 'error');
        }
    },

    loadFromHash() {
        const hash = window.location.hash.substring(1);
        if (hash && hash.startsWith('data=')) {
            try {
                const jsonString = decodeURIComponent(hash.substring(5));
                const data = JSON.parse(jsonString);
                
                ConfirmDialog.show('Load shared data? This will replace your current data.', 'info').then(confirmed => {
                    if (confirmed) {
                        DataStore.data = data;
                        DataStore.save();
                        App.refresh();
                        window.location.hash = '';
                        UINotification.show('Shared data loaded successfully!', 'success');
                    }
                });
            } catch (e) {
                console.error('Failed to load from hash:', e);
            }
        }
    },

    validateJSON() {
        const input = document.getElementById('jsonInput').value.trim();
        const status = document.getElementById('jsonStatus');
        
        if (!input) {
            status.innerHTML = 'Please enter JSON data';
            status.className = 'json-status json-error';
            status.style.display = 'block';
            return;
        }
        
        try {
            JSON.parse(input);
            status.innerHTML = '✅ Valid JSON format';
            status.className = 'json-status json-success';
            status.style.display = 'block';
        } catch (error) {
            status.innerHTML = '❌ Invalid JSON: ' + error.message;
            status.className = 'json-status json-error';
            status.style.display = 'block';
        }
    },

    clearJSON() {
        document.getElementById('jsonInput').value = '';
        document.getElementById('jsonStatus').style.display = 'none';
    },

    generateShareLink() {
        const data = this.exportData();
        const jsonString = JSON.stringify(data);
        const encoded = encodeURIComponent(jsonString);
        const shareUrl = window.location.href.split('#')[0] + '#data=' + encoded;
        
        document.getElementById('shareLink').value = shareUrl;
        UINotification.show('Share link generated!', 'success');
    }
};

// ========== CONTEXT MENU ==========
const ContextMenu = {
    async showForBoard(e, boardId) {
        e.preventDefault();
        
        const confirmed = await ConfirmDialog.show('Delete this board?');
        if (confirmed) {
            const index = DataStore.data.boards.findIndex(b => b.id === boardId);
            if (index !== -1) {
                DataStore.data.boards.splice(index, 1);
                if (DataStore.data.currentBoardId === boardId) {
                    DataStore.data.currentBoardId = DataStore.data.boards[0]?.id || null;
                }
                DataStore.save();
                UINotification.show('Board deleted', 'success');
                App.refresh();
            }
        }
    }
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});