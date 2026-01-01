/* ============================================
   TaskFlow - Smart Task Management
   Enhanced Application Logic
   ============================================ */

// ============================================
// Toast Manager - Shows notifications
// ============================================
const ToastManager = {
    container: null,

    init() {
        this.container = document.getElementById('toast-container');
    },

    show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20,6 9,17 4,12"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.success}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};

// ============================================
// Theme Manager - Handles theme and accent colors
// ============================================
const ThemeManager = {
    STORAGE_KEY: 'taskflow_theme',
    ACCENT_KEY: 'taskflow_accent',

    init() {
        this.loadTheme();
        this.loadAccent();
    },

    getTheme() {
        return localStorage.getItem(this.STORAGE_KEY) || 'dark';
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
    },

    toggleTheme() {
        const current = this.getTheme();
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
        ToastManager.show(`${next.charAt(0).toUpperCase() + next.slice(1)} mode enabled`);
    },

    loadTheme() {
        const theme = this.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
    },

    getAccent() {
        return localStorage.getItem(this.ACCENT_KEY) || 'purple';
    },

    setAccent(accent) {
        document.documentElement.setAttribute('data-accent', accent);
        localStorage.setItem(this.ACCENT_KEY, accent);

        // Update active state in menu
        document.querySelectorAll('.accent-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.accent === accent);
        });
    },

    loadAccent() {
        const accent = this.getAccent();
        document.documentElement.setAttribute('data-accent', accent);
    }
};

// ============================================
// Storage Manager - Handles all local storage operations
// ============================================
const StorageManager = {
    KEYS: {
        ACCOUNTS: 'taskflow_accounts',
        CURRENT_USER: 'taskflow_current_user',
        TASKS: 'taskflow_tasks',
        CATEGORIES: 'taskflow_categories'
    },

    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    },

    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
};

// ============================================
// Auth Manager - Handles account creation and login
// ============================================
const AuthManager = {
    getAccounts() {
        return StorageManager.get(StorageManager.KEYS.ACCOUNTS) || {};
    },

    getCurrentUser() {
        return StorageManager.get(StorageManager.KEYS.CURRENT_USER);
    },

    createAccount(username, password) {
        if (!username || !password) {
            return { success: false, error: 'Username and password are required' };
        }

        if (username.length < 3) {
            return { success: false, error: 'Username must be at least 3 characters' };
        }

        if (password.length < 4) {
            return { success: false, error: 'Password must be at least 4 characters' };
        }

        const accounts = this.getAccounts();
        const normalizedUsername = username.toLowerCase().trim();

        if (accounts[normalizedUsername]) {
            return { success: false, error: 'Username already exists' };
        }

        accounts[normalizedUsername] = {
            username: username.trim(),
            passwordHash: StorageManager.hashPassword(password),
            createdAt: new Date().toISOString()
        };

        StorageManager.set(StorageManager.KEYS.ACCOUNTS, accounts);
        this.setCurrentUser(username.trim());

        return { success: true };
    },

    login(username, password) {
        if (!username || !password) {
            return { success: false, error: 'Username and password are required' };
        }

        const accounts = this.getAccounts();
        const normalizedUsername = username.toLowerCase().trim();
        const account = accounts[normalizedUsername];

        if (!account) {
            return { success: false, error: 'Account not found' };
        }

        if (account.passwordHash !== StorageManager.hashPassword(password)) {
            return { success: false, error: 'Incorrect password' };
        }

        this.setCurrentUser(account.username);
        return { success: true };
    },

    logout() {
        StorageManager.remove(StorageManager.KEYS.CURRENT_USER);
    },

    setCurrentUser(username) {
        StorageManager.set(StorageManager.KEYS.CURRENT_USER, username);
    },

    isLoggedIn() {
        return !!this.getCurrentUser();
    }
};

// ============================================
// Category Manager - Handles task categories
// ============================================
const CategoryManager = {
    getUserCategoriesKey() {
        const user = AuthManager.getCurrentUser();
        return user ? `${StorageManager.KEYS.CATEGORIES}_${user.toLowerCase()}` : null;
    },

    getCategories() {
        const key = this.getUserCategoriesKey();
        if (!key) return [];
        return StorageManager.get(key) || [];
    },

    saveCategories(categories) {
        const key = this.getUserCategoriesKey();
        if (!key) return false;
        return StorageManager.set(key, categories);
    },

    createCategory(name, color) {
        const categories = this.getCategories();

        if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            return { success: false, error: 'Category already exists' };
        }

        const newCategory = {
            id: this.generateId(),
            name: name.trim(),
            color: color,
            createdAt: new Date().toISOString()
        };

        categories.push(newCategory);
        this.saveCategories(categories);
        return { success: true, category: newCategory };
    },

    deleteCategory(categoryId) {
        const categories = this.getCategories();
        const filtered = categories.filter(c => c.id !== categoryId);
        this.saveCategories(filtered);

        // Remove category from tasks
        const tasks = TaskManager.getTasks();
        tasks.forEach(task => {
            if (task.categoryId === categoryId) {
                task.categoryId = null;
            }
        });
        TaskManager.saveTasks(tasks);

        return true;
    },

    getCategoryById(id) {
        return this.getCategories().find(c => c.id === id);
    },

    generateId() {
        return 'cat_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// ============================================
// Task Manager - Handles CRUD operations for tasks
// ============================================
const TaskManager = {
    currentSort: 'custom',

    getUserTasksKey() {
        const user = AuthManager.getCurrentUser();
        return user ? `${StorageManager.KEYS.TASKS}_${user.toLowerCase()}` : null;
    },

    getTasks() {
        const key = this.getUserTasksKey();
        if (!key) return [];
        return StorageManager.get(key) || [];
    },

    saveTasks(tasks) {
        const key = this.getUserTasksKey();
        if (!key) return false;
        return StorageManager.set(key, tasks);
    },

    createTask(taskData) {
        const tasks = this.getTasks();
        const newTask = {
            id: this.generateId(),
            title: taskData.title.trim(),
            description: taskData.description?.trim() || '',
            priority: taskData.priority || 'medium',
            categoryId: taskData.categoryId || null,
            dueDate: taskData.dueDate || null,
            subtasks: taskData.subtasks || [],
            completed: false,
            createdAt: new Date().toISOString(),
            order: 0 // New tasks go to top
        };

        // Shift existing orders
        tasks.forEach(t => t.order++);
        tasks.unshift(newTask);
        this.saveTasks(tasks);
        return newTask;
    },

    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);

        if (index === -1) return null;

        tasks[index] = { ...tasks[index], ...updates };
        this.saveTasks(tasks);
        return tasks[index];
    },

    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        this.saveTasks(filtered);
        return true;
    },

    toggleComplete(taskId) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (!task) return null;

        task.completed = !task.completed;

        // Also complete/uncomplete all subtasks
        if (task.subtasks) {
            task.subtasks.forEach(st => st.completed = task.completed);
        }

        this.saveTasks(tasks);
        return task;
    },

    toggleSubtask(taskId, subtaskIndex) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);

        if (!task || !task.subtasks || !task.subtasks[subtaskIndex]) return null;

        task.subtasks[subtaskIndex].completed = !task.subtasks[subtaskIndex].completed;

        // Check if all subtasks are completed
        const allCompleted = task.subtasks.every(st => st.completed);
        task.completed = allCompleted;

        this.saveTasks(tasks);
        return task;
    },

    duplicateTask(taskId) {
        const tasks = this.getTasks();
        const original = tasks.find(t => t.id === taskId);

        if (!original) return null;

        const duplicate = {
            ...original,
            id: this.generateId(),
            title: `${original.title} (copy)`,
            completed: false,
            subtasks: original.subtasks ? original.subtasks.map(st => ({ ...st, completed: false })) : [],
            createdAt: new Date().toISOString(),
            order: 0
        };

        tasks.forEach(t => t.order++);
        tasks.unshift(duplicate);
        this.saveTasks(tasks);
        return duplicate;
    },

    reorderTasks(taskIds) {
        const tasks = this.getTasks();
        const taskMap = new Map(tasks.map(t => [t.id, t]));

        const reordered = taskIds.map((id, index) => {
            const task = taskMap.get(id);
            if (task) {
                task.order = index;
            }
            return task;
        }).filter(Boolean);

        tasks.forEach(task => {
            if (!taskIds.includes(task.id)) {
                reordered.push(task);
            }
        });

        this.saveTasks(reordered);
        return reordered;
    },

    clearCompleted() {
        const tasks = this.getTasks();
        const active = tasks.filter(t => !t.completed);
        this.saveTasks(active);
        return tasks.length - active.length;
    },

    getFilteredTasks(filter = 'all', searchQuery = '', categoryFilter = null) {
        let tasks = this.getTasks();

        // Apply search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            tasks = tasks.filter(t =>
                t.title.toLowerCase().includes(query) ||
                (t.description && t.description.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (categoryFilter) {
            tasks = tasks.filter(t => t.categoryId === categoryFilter);
        }

        // Apply status filter
        switch (filter) {
            case 'active':
                tasks = tasks.filter(t => !t.completed);
                break;
            case 'completed':
                tasks = tasks.filter(t => t.completed);
                break;
            case 'high':
                tasks = tasks.filter(t => t.priority === 'high');
                break;
            case 'medium':
                tasks = tasks.filter(t => t.priority === 'medium');
                break;
            case 'low':
                tasks = tasks.filter(t => t.priority === 'low');
                break;
            case 'today':
                const today = new Date().toISOString().split('T')[0];
                tasks = tasks.filter(t => t.dueDate === today);
                break;
            case 'overdue':
                const now = new Date().toISOString().split('T')[0];
                tasks = tasks.filter(t => t.dueDate && t.dueDate < now && !t.completed);
                break;
        }

        // Apply sorting
        return this.sortTasks(tasks);
    },

    sortTasks(tasks) {
        const sorted = [...tasks];

        switch (this.currentSort) {
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'dueDate':
                sorted.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                break;
            case 'created':
                sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'alphabetical':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            default: // custom
                sorted.sort((a, b) => (a.order || 0) - (b.order || 0));
        }

        return sorted;
    },

    getStats() {
        const tasks = this.getTasks();
        return {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            high: tasks.filter(t => t.priority === 'high' && !t.completed).length,
            medium: tasks.filter(t => t.priority === 'medium' && !t.completed).length,
            low: tasks.filter(t => t.priority === 'low' && !t.completed).length
        };
    },

    exportTasks() {
        const data = {
            tasks: this.getTasks(),
            categories: CategoryManager.getCategories(),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    importTasks(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    if (data.tasks && Array.isArray(data.tasks)) {
                        const existingTasks = this.getTasks();
                        const newTasks = data.tasks.map(t => ({
                            ...t,
                            id: this.generateId(),
                            order: existingTasks.length + (t.order || 0)
                        }));
                        this.saveTasks([...existingTasks, ...newTasks]);
                    }

                    if (data.categories && Array.isArray(data.categories)) {
                        const existingCategories = CategoryManager.getCategories();
                        const newCategories = data.categories.filter(c =>
                            !existingCategories.some(ec => ec.name.toLowerCase() === c.name.toLowerCase())
                        ).map(c => ({
                            ...c,
                            id: CategoryManager.generateId()
                        }));
                        CategoryManager.saveCategories([...existingCategories, ...newCategories]);
                    }

                    resolve({ tasks: data.tasks?.length || 0, categories: data.categories?.length || 0 });
                } catch (err) {
                    reject(new Error('Invalid file format'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// ============================================
// Calendar Controller - Handles calendar view
// ============================================
const CalendarController = {
    currentDate: new Date(),
    selectedDate: null,
    elements: {},

    init() {
        this.cacheElements();
        this.bindEvents();
        this.render();
    },

    cacheElements() {
        this.elements.calendarView = document.getElementById('calendar-view');
        this.elements.listView = document.getElementById('list-view');
        this.elements.listViewBtn = document.getElementById('list-view-btn');
        this.elements.calendarViewBtn = document.getElementById('calendar-view-btn');
        this.elements.monthYear = document.getElementById('calendar-month-year');
        this.elements.calendarDays = document.getElementById('calendar-days');
        this.elements.prevMonth = document.getElementById('prev-month');
        this.elements.nextMonth = document.getElementById('next-month');
        this.elements.todayBtn = document.getElementById('today-btn');
        this.elements.selectedDayTitle = document.getElementById('selected-day-title');
        this.elements.selectedDayTasks = document.getElementById('selected-day-tasks');
        this.elements.addTaskToDate = document.getElementById('add-task-to-date');
    },

    bindEvents() {
        // View toggle
        this.elements.listViewBtn?.addEventListener('click', () => this.showListView());
        this.elements.calendarViewBtn?.addEventListener('click', () => this.showCalendarView());

        // Month navigation
        this.elements.prevMonth?.addEventListener('click', () => this.prevMonth());
        this.elements.nextMonth?.addEventListener('click', () => this.nextMonth());
        this.elements.todayBtn?.addEventListener('click', () => this.goToToday());

        // Add task to selected date
        this.elements.addTaskToDate?.addEventListener('click', () => {
            if (this.selectedDate) {
                UIController.openTaskModal();
                // Pre-fill the date
                const dateStr = this.formatDateForInput(this.selectedDate);
                document.getElementById('task-due').value = dateStr;
            }
        });
    },

    showListView() {
        this.elements.listView?.classList.add('active');
        this.elements.calendarView?.classList.remove('active');
        this.elements.listViewBtn?.classList.add('active');
        this.elements.calendarViewBtn?.classList.remove('active');
    },

    showCalendarView() {
        this.elements.listView?.classList.remove('active');
        this.elements.calendarView?.classList.add('active');
        this.elements.listViewBtn?.classList.remove('active');
        this.elements.calendarViewBtn?.classList.add('active');
        this.render();
    },

    toggleView() {
        const isCalendarActive = this.elements.calendarView?.classList.contains('active');
        if (isCalendarActive) {
            this.showListView();
        } else {
            this.showCalendarView();
        }
    },

    prevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
    },

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
    },

    goToToday() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.render();
        this.renderSelectedDayTasks();
    },

    render() {
        this.renderMonthYear();
        this.renderDays();
    },

    renderMonthYear() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const month = months[this.currentDate.getMonth()];
        const year = this.currentDate.getFullYear();
        if (this.elements.monthYear) {
            this.elements.monthYear.textContent = `${month} ${year}`;
        }
    },

    renderDays() {
        if (!this.elements.calendarDays) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Get tasks for this month
        const tasks = TaskManager.getTasks();
        const tasksByDate = {};
        tasks.forEach(task => {
            if (task.dueDate) {
                if (!tasksByDate[task.dueDate]) {
                    tasksByDate[task.dueDate] = [];
                }
                tasksByDate[task.dueDate].push(task);
            }
        });

        const today = new Date();
        let html = '';

        // Previous month days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            const prevMonth = month === 0 ? 11 : month - 1;
            const prevYear = month === 0 ? year - 1 : year;
            const dateStr = this.formatDateStr(prevYear, prevMonth, day);
            const dayTasks = tasksByDate[dateStr] || [];

            html += this.createDayCell(day, dateStr, dayTasks, true, false, false);
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = this.formatDateStr(year, month, day);
            const dayTasks = tasksByDate[dateStr] || [];
            const isToday = today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;
            const isSelected = this.selectedDate &&
                this.selectedDate.getDate() === day &&
                this.selectedDate.getMonth() === month &&
                this.selectedDate.getFullYear() === year;

            html += this.createDayCell(day, dateStr, dayTasks, false, isToday, isSelected);
        }

        // Next month days to fill the grid
        const totalCells = startingDay + daysInMonth;
        const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let day = 1; day <= remainingCells; day++) {
            const nextMonth = month === 11 ? 0 : month + 1;
            const nextYear = month === 11 ? year + 1 : year;
            const dateStr = this.formatDateStr(nextYear, nextMonth, day);
            const dayTasks = tasksByDate[dateStr] || [];

            html += this.createDayCell(day, dateStr, dayTasks, true, false, false);
        }

        this.elements.calendarDays.innerHTML = html;

        // Bind click events to days
        this.elements.calendarDays.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const dateStr = dayEl.dataset.date;
                this.selectDate(new Date(dateStr + 'T00:00:00'));
            });
        });
    },

    createDayCell(day, dateStr, tasks, isOtherMonth, isToday, isSelected) {
        const classes = ['calendar-day'];
        if (isOtherMonth) classes.push('other-month');
        if (isToday) classes.push('today');
        if (isSelected) classes.push('selected');
        if (tasks.length > 0) classes.push('has-tasks');

        const maxTasks = 3;
        const visibleTasks = tasks.slice(0, maxTasks);
        const remainingTasks = tasks.length - maxTasks;

        let tasksHtml = '<div class="day-tasks">';
        visibleTasks.forEach(task => {
            const completedClass = task.completed ? 'completed' : '';
            tasksHtml += `
                <div class="day-task-item ${task.priority} ${completedClass}">
                    ${this.escapeHtml(task.title)}
                </div>
            `;
        });
        if (remainingTasks > 0) {
            tasksHtml += `<div class="day-more-tasks">+${remainingTasks} more</div>`;
        }
        tasksHtml += '</div>';

        return `
            <div class="${classes.join(' ')}" data-date="${dateStr}">
                <span class="day-number">${day}</span>
                ${tasksHtml}
            </div>
        `;
    },

    selectDate(date) {
        this.selectedDate = date;

        // Update selected state
        this.elements.calendarDays.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.classList.remove('selected');
            if (dayEl.dataset.date === this.formatDateForInput(date)) {
                dayEl.classList.add('selected');
            }
        });

        this.renderSelectedDayTasks();
    },

    renderSelectedDayTasks() {
        if (!this.selectedDate || !this.elements.selectedDayTasks) return;

        const dateStr = this.formatDateForInput(this.selectedDate);
        const tasks = TaskManager.getTasks().filter(t => t.dueDate === dateStr);

        // Update title
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const formattedDate = this.selectedDate.toLocaleDateString('en-US', options);
        if (this.elements.selectedDayTitle) {
            this.elements.selectedDayTitle.textContent = formattedDate;
        }

        if (tasks.length === 0) {
            this.elements.selectedDayTasks.innerHTML = '<p class="no-tasks-message">No tasks for this date</p>';
            return;
        }

        const html = tasks.map(task => `
            <div class="selected-task-card ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="selected-task-checkbox">
                    <input type="checkbox" id="cal-check-${task.id}" ${task.completed ? 'checked' : ''}>
                    <label for="cal-check-${task.id}"></label>
                </div>
                <div class="selected-task-content">
                    <div class="selected-task-title">${this.escapeHtml(task.title)}</div>
                    <div class="selected-task-meta">
                        <span class="selected-task-priority ${task.priority}">${task.priority}</span>
                    </div>
                </div>
                <div class="selected-task-actions">
                    <button class="btn-icon-sm edit-cal-task" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon-sm delete-cal-task" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');

        this.elements.selectedDayTasks.innerHTML = html;

        // Bind events
        this.elements.selectedDayTasks.querySelectorAll('.selected-task-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.closest('.selected-task-card').dataset.taskId;
                TaskManager.toggleComplete(taskId);
                this.render();
                this.renderSelectedDayTasks();
                UIController.renderTasks();
                UIController.updateStats();
            });
        });

        this.elements.selectedDayTasks.querySelectorAll('.edit-cal-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.selected-task-card').dataset.taskId;
                const task = TaskManager.getTasks().find(t => t.id === taskId);
                if (task) {
                    UIController.openTaskModal(task);
                }
            });
        });

        this.elements.selectedDayTasks.querySelectorAll('.delete-cal-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.selected-task-card').dataset.taskId;
                UIController.openDeleteModal(taskId);
            });
        });
    },

    formatDateStr(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    },

    formatDateForInput(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    refresh() {
        this.render();
        if (this.selectedDate) {
            this.renderSelectedDayTasks();
        }
    }
};

// ============================================
// UI Controller - Handles all DOM interactions
// ============================================
const UIController = {
    elements: {},
    currentFilter: 'all',
    currentCategory: null,
    searchQuery: '',
    draggedTask: null,
    editingSubtasks: [],
    currentView: 'list',

    init() {
        ToastManager.init();
        ThemeManager.init();
        this.cacheElements();
        this.bindEvents();
        this.checkAuthState();
    },

    cacheElements() {
        // Views
        this.elements.authView = document.getElementById('auth-view');
        this.elements.dashboardView = document.getElementById('dashboard-view');

        // Auth Forms
        this.elements.loginForm = document.getElementById('login-form');
        this.elements.signupForm = document.getElementById('signup-form');
        this.elements.loginUsername = document.getElementById('login-username');
        this.elements.loginPassword = document.getElementById('login-password');
        this.elements.loginError = document.getElementById('login-error');
        this.elements.signupUsername = document.getElementById('signup-username');
        this.elements.signupPassword = document.getElementById('signup-password');
        this.elements.signupConfirm = document.getElementById('signup-confirm');
        this.elements.signupError = document.getElementById('signup-error');
        this.elements.showSignup = document.getElementById('show-signup');
        this.elements.showLogin = document.getElementById('show-login');

        // Dashboard
        this.elements.userGreeting = document.getElementById('user-greeting');
        this.elements.searchInput = document.getElementById('search-input');
        this.elements.addTaskBtn = document.getElementById('add-task-btn');
        this.elements.tasksContainer = document.getElementById('tasks-container');
        this.elements.emptyState = document.getElementById('empty-state');
        this.elements.taskCount = document.getElementById('task-count');

        // Theme & Settings
        this.elements.themeToggle = document.getElementById('theme-toggle');
        this.elements.accentToggle = document.getElementById('accent-toggle');
        this.elements.accentMenu = document.getElementById('accent-menu');
        this.elements.settingsBtn = document.getElementById('settings-btn');
        this.elements.settingsMenu = document.getElementById('settings-menu');
        this.elements.logoutBtn = document.getElementById('logout-btn');
        this.elements.exportBtn = document.getElementById('export-btn');
        this.elements.importBtn = document.getElementById('import-btn');
        this.elements.importFile = document.getElementById('import-file');
        this.elements.clearCompletedBtn = document.getElementById('clear-completed-btn');

        // Sort
        this.elements.sortBtn = document.getElementById('sort-btn');
        this.elements.sortMenu = document.getElementById('sort-menu');

        // Stats & Progress
        this.elements.todayProgressPercent = document.getElementById('today-progress-percent');
        this.elements.todayProgressFill = document.getElementById('today-progress-fill');
        this.elements.todayProgressText = document.getElementById('today-progress-text');
        this.elements.monthProgressPercent = document.getElementById('month-progress-percent');
        this.elements.monthProgressFill = document.getElementById('month-progress-fill');
        this.elements.monthProgressText = document.getElementById('month-progress-text');
        this.elements.statTotal = document.getElementById('stat-total');
        this.elements.statCompleted = document.getElementById('stat-completed');
        this.elements.statHigh = document.getElementById('stat-high');
        this.elements.statMedium = document.getElementById('stat-medium');

        // Filters
        this.elements.filterBtns = document.querySelectorAll('.filter-btn');

        // Categories
        this.elements.categoriesList = document.getElementById('categories-list');
        this.elements.addCategoryBtn = document.getElementById('add-category-btn');
        this.elements.taskCategory = document.getElementById('task-category');

        // Task Modal
        this.elements.taskModal = document.getElementById('task-modal');
        this.elements.modalTitle = document.getElementById('modal-title');
        this.elements.taskForm = document.getElementById('task-form');
        this.elements.taskId = document.getElementById('task-id');
        this.elements.taskTitle = document.getElementById('task-title');
        this.elements.taskDescription = document.getElementById('task-description');
        this.elements.taskPriority = document.getElementById('task-priority');
        this.elements.taskDue = document.getElementById('task-due');
        this.elements.closeModal = document.getElementById('close-modal');
        this.elements.cancelModal = document.getElementById('cancel-modal');
        this.elements.subtasksContainer = document.getElementById('subtasks-container');
        this.elements.addSubtaskBtn = document.getElementById('add-subtask-btn');

        // Delete Modal
        this.elements.deleteModal = document.getElementById('delete-modal');
        this.elements.confirmDelete = document.getElementById('confirm-delete');
        this.elements.closeDeleteBtns = document.querySelectorAll('.close-delete-modal');

        // Category Modal
        this.elements.categoryModal = document.getElementById('category-modal');
        this.elements.categoryForm = document.getElementById('category-form');
        this.elements.categoryName = document.getElementById('category-name');
        this.elements.categoryColor = document.getElementById('category-color');
        this.elements.closeCategoryBtns = document.querySelectorAll('.close-category-modal');
    },

    bindEvents() {
        // Auth Form Submissions
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.signupForm.addEventListener('submit', (e) => this.handleSignup(e));

        // Auth Form Switching
        this.elements.showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });

        this.elements.showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Theme Toggle
        this.elements.themeToggle.addEventListener('click', () => ThemeManager.toggleTheme());

        // Accent Color
        this.elements.accentToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.accentMenu.classList.toggle('active');
            this.elements.settingsMenu.classList.remove('active');
        });

        document.querySelectorAll('.accent-option').forEach(btn => {
            btn.addEventListener('click', () => {
                ThemeManager.setAccent(btn.dataset.accent);
                this.elements.accentMenu.classList.remove('active');
            });
        });

        // Settings Menu
        this.elements.settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.settingsMenu.classList.toggle('active');
            this.elements.accentMenu.classList.remove('active');
        });

        // Close menus on outside click
        document.addEventListener('click', () => {
            this.elements.accentMenu.classList.remove('active');
            this.elements.settingsMenu.classList.remove('active');
            this.elements.sortMenu.classList.remove('active');
        });

        // Logout
        this.elements.logoutBtn.addEventListener('click', () => this.handleLogout());

        // Export/Import
        this.elements.exportBtn.addEventListener('click', () => {
            TaskManager.exportTasks();
            ToastManager.show('Tasks exported successfully!');
            this.elements.settingsMenu.classList.remove('active');
        });

        this.elements.importBtn.addEventListener('click', () => {
            this.elements.importFile.click();
            this.elements.settingsMenu.classList.remove('active');
        });

        this.elements.importFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const result = await TaskManager.importTasks(file);
                    ToastManager.show(`Imported ${result.tasks} tasks!`);
                    this.renderTasks();
                    this.updateStats();
                    this.renderCategories();
                } catch (err) {
                    ToastManager.show(err.message, 'error');
                }
                e.target.value = '';
            }
        });

        // Clear Completed
        this.elements.clearCompletedBtn.addEventListener('click', () => {
            const count = TaskManager.clearCompleted();
            ToastManager.show(`Cleared ${count} completed tasks`);
            this.renderTasks();
            this.updateStats();
            this.elements.settingsMenu.classList.remove('active');
        });

        // Search
        this.elements.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.renderTasks();
        });

        // Sort
        this.elements.sortBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.elements.sortMenu.classList.toggle('active');
        });

        document.querySelectorAll('.sort-option').forEach(btn => {
            btn.addEventListener('click', () => {
                TaskManager.currentSort = btn.dataset.sort;
                document.querySelectorAll('.sort-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.elements.sortMenu.classList.remove('active');
                this.renderTasks();
            });
        });

        // Add Task
        this.elements.addTaskBtn.addEventListener('click', () => this.openTaskModal());

        // Task Form
        this.elements.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        this.elements.closeModal.addEventListener('click', () => this.closeTaskModal());
        this.elements.cancelModal.addEventListener('click', () => this.closeTaskModal());
        this.elements.taskModal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeTaskModal());

        // Subtasks
        this.elements.addSubtaskBtn.addEventListener('click', () => this.addSubtaskInput());

        // Delete Modal
        this.elements.confirmDelete.addEventListener('click', () => this.handleDeleteConfirm());
        this.elements.closeDeleteBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeDeleteModal());
        });
        this.elements.deleteModal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeDeleteModal());

        // Category Modal
        this.elements.addCategoryBtn.addEventListener('click', () => this.openCategoryModal());
        this.elements.categoryForm.addEventListener('submit', (e) => this.handleCategorySubmit(e));
        this.elements.closeCategoryBtns.forEach(btn => {
            btn.addEventListener('click', () => this.closeCategoryModal());
        });
        this.elements.categoryModal.querySelector('.modal-backdrop').addEventListener('click', () => this.closeCategoryModal());

        // Color Picker
        document.querySelectorAll('.color-option').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.elements.categoryColor.value = btn.dataset.color;
            });
        });

        // Filter Buttons
        this.elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.matches('input, textarea, select')) {
                if (e.key === 'Escape') {
                    this.closeTaskModal();
                    this.closeDeleteModal();
                    this.closeCategoryModal();
                }
                return;
            }

            switch (e.key.toLowerCase()) {
                case 'n':
                    if (AuthManager.isLoggedIn()) {
                        e.preventDefault();
                        this.openTaskModal();
                    }
                    break;
                case '/':
                    if (AuthManager.isLoggedIn()) {
                        e.preventDefault();
                        this.elements.searchInput?.focus();
                    }
                    break;
                case 't':
                    e.preventDefault();
                    ThemeManager.toggleTheme();
                    break;
                case 'escape':
                    this.closeTaskModal();
                    this.closeDeleteModal();
                    this.closeCategoryModal();
                    break;
                case 'c':
                    if (AuthManager.isLoggedIn()) {
                        e.preventDefault();
                        CalendarController.toggleView();
                    }
                    break;
            }
        });
    },

    checkAuthState() {
        if (AuthManager.isLoggedIn()) {
            this.showDashboard();
        } else {
            this.showAuthView();
        }
    },

    showAuthView() {
        this.elements.authView.classList.add('active');
        this.elements.dashboardView.classList.remove('active');
        this.showLoginForm();
    },

    showDashboard() {
        this.elements.authView.classList.remove('active');
        this.elements.dashboardView.classList.add('active');

        const user = AuthManager.getCurrentUser();
        this.elements.userGreeting.textContent = `Hello, ${user}`;

        this.renderCategories();
        this.renderTasks();
        this.updateStats();
        CalendarController.init();
    },

    showLoginForm() {
        this.elements.loginForm.classList.add('active');
        this.elements.signupForm.classList.remove('active');
        this.clearAuthForms();
    },

    showSignupForm() {
        this.elements.loginForm.classList.remove('active');
        this.elements.signupForm.classList.add('active');
        this.clearAuthForms();
    },

    clearAuthForms() {
        this.elements.loginForm.reset();
        this.elements.signupForm.reset();
        this.elements.loginError.textContent = '';
        this.elements.signupError.textContent = '';
    },

    handleLogin(e) {
        e.preventDefault();

        const username = this.elements.loginUsername.value;
        const password = this.elements.loginPassword.value;

        const result = AuthManager.login(username, password);

        if (result.success) {
            ToastManager.show(`Welcome back, ${username}!`);
            this.showDashboard();
        } else {
            this.elements.loginError.textContent = result.error;
            this.shakeElement(this.elements.loginForm);
        }
    },

    handleSignup(e) {
        e.preventDefault();

        const username = this.elements.signupUsername.value;
        const password = this.elements.signupPassword.value;
        const confirm = this.elements.signupConfirm.value;

        if (password !== confirm) {
            this.elements.signupError.textContent = 'Passwords do not match';
            this.shakeElement(this.elements.signupForm);
            return;
        }

        const result = AuthManager.createAccount(username, password);

        if (result.success) {
            ToastManager.show(`Welcome to TaskFlow, ${username}!`);
            this.showDashboard();
        } else {
            this.elements.signupError.textContent = result.error;
            this.shakeElement(this.elements.signupForm);
        }
    },

    handleLogout() {
        AuthManager.logout();
        ToastManager.show('Logged out successfully');
        this.elements.settingsMenu.classList.remove('active');
        this.showAuthView();
    },

    shakeElement(element) {
        element.style.animation = 'none';
        element.offsetHeight;
        element.style.animation = 'shake 0.4s ease';

        setTimeout(() => {
            element.style.animation = '';
        }, 400);
    },

    // Categories
    renderCategories() {
        const categories = CategoryManager.getCategories();
        const tasks = TaskManager.getTasks();

        // Update category select in task form
        this.elements.taskCategory.innerHTML = '<option value="">No category</option>';
        categories.forEach(cat => {
            this.elements.taskCategory.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });

        // Render categories list
        if (categories.length === 0) {
            this.elements.categoriesList.innerHTML = '<p class="no-categories">No categories yet</p>';
            return;
        }

        this.elements.categoriesList.innerHTML = categories.map(cat => {
            const count = tasks.filter(t => t.categoryId === cat.id).length;
            return `
                <button class="category-item ${this.currentCategory === cat.id ? 'active' : ''}" 
                        data-category="${cat.id}">
                    <span class="category-dot" style="background: ${cat.color}"></span>
                    ${this.escapeHtml(cat.name)}
                    <span class="category-count">${count}</span>
                </button>
            `;
        }).join('');

        // Bind category click events
        this.elements.categoriesList.querySelectorAll('.category-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const categoryId = btn.dataset.category;

                if (this.currentCategory === categoryId) {
                    this.currentCategory = null;
                    btn.classList.remove('active');
                } else {
                    this.currentCategory = categoryId;
                    this.elements.categoriesList.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                }

                // Clear filter buttons
                this.elements.filterBtns.forEach(fb => fb.classList.remove('active'));
                this.currentFilter = 'all';

                this.renderTasks();
            });
        });
    },

    openCategoryModal() {
        this.elements.categoryModal.classList.add('active');
        this.elements.categoryForm.reset();
        this.elements.categoryColor.value = '#6366f1';
        document.querySelectorAll('.color-option').forEach(b => b.classList.remove('active'));
        document.querySelector('.color-option[data-color="#6366f1"]').classList.add('active');
        setTimeout(() => this.elements.categoryName.focus(), 100);
    },

    closeCategoryModal() {
        this.elements.categoryModal.classList.remove('active');
    },

    handleCategorySubmit(e) {
        e.preventDefault();

        const name = this.elements.categoryName.value;
        const color = this.elements.categoryColor.value;

        const result = CategoryManager.createCategory(name, color);

        if (result.success) {
            ToastManager.show(`Category "${name}" created!`);
            this.closeCategoryModal();
            this.renderCategories();
        } else {
            ToastManager.show(result.error, 'error');
        }
    },

    // Task Methods
    openTaskModal(task = null) {
        this.elements.taskModal.classList.add('active');
        this.editingSubtasks = [];

        if (task) {
            this.elements.modalTitle.textContent = 'Edit Task';
            this.elements.taskId.value = task.id;
            this.elements.taskTitle.value = task.title;
            this.elements.taskDescription.value = task.description || '';
            this.elements.taskPriority.value = task.priority;
            this.elements.taskCategory.value = task.categoryId || '';
            this.elements.taskDue.value = task.dueDate || '';
            this.editingSubtasks = task.subtasks ? [...task.subtasks] : [];
        } else {
            this.elements.modalTitle.textContent = 'Add New Task';
            this.elements.taskForm.reset();
            this.elements.taskId.value = '';
            this.elements.taskPriority.value = 'medium';
        }

        this.renderSubtasksInputs();

        setTimeout(() => {
            this.elements.taskTitle.focus();
        }, 100);
    },

    closeTaskModal() {
        this.elements.taskModal.classList.remove('active');
        this.elements.taskForm.reset();
        this.editingSubtasks = [];
    },

    addSubtaskInput() {
        this.editingSubtasks.push({ text: '', completed: false });
        this.renderSubtasksInputs();

        // Focus the new input
        const inputs = this.elements.subtasksContainer.querySelectorAll('input[type="text"]');
        if (inputs.length > 0) {
            inputs[inputs.length - 1].focus();
        }
    },

    renderSubtasksInputs() {
        this.elements.subtasksContainer.innerHTML = this.editingSubtasks.map((st, i) => `
            <div class="subtask-item" data-index="${i}">
                <input type="text" 
                       value="${this.escapeHtml(st.text)}" 
                       placeholder="Subtask ${i + 1}"
                       onchange="UIController.updateSubtask(${i}, this.value)">
                <button type="button" class="btn-icon-sm" onclick="UIController.removeSubtask(${i})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `).join('');
    },

    updateSubtask(index, text) {
        if (this.editingSubtasks[index]) {
            this.editingSubtasks[index].text = text;
        }
    },

    removeSubtask(index) {
        this.editingSubtasks.splice(index, 1);
        this.renderSubtasksInputs();
    },

    handleTaskSubmit(e) {
        e.preventDefault();

        // Filter out empty subtasks
        const subtasks = this.editingSubtasks.filter(st => st.text.trim());

        const taskData = {
            title: this.elements.taskTitle.value,
            description: this.elements.taskDescription.value,
            priority: this.elements.taskPriority.value,
            categoryId: this.elements.taskCategory.value || null,
            dueDate: this.elements.taskDue.value || null,
            subtasks: subtasks
        };

        const taskId = this.elements.taskId.value;

        if (taskId) {
            TaskManager.updateTask(taskId, taskData);
            ToastManager.show('Task updated!');
        } else {
            TaskManager.createTask(taskData);
            ToastManager.show('Task created!');
        }

        this.closeTaskModal();
        this.renderTasks();
        this.updateStats();
        this.renderCategories();
        CalendarController.refresh();
    },

    openDeleteModal(taskId) {
        this.elements.deleteModal.classList.add('active');
        this.elements.deleteModal.dataset.taskId = taskId;
    },

    closeDeleteModal() {
        this.elements.deleteModal.classList.remove('active');
        delete this.elements.deleteModal.dataset.taskId;
    },

    handleDeleteConfirm() {
        const taskId = this.elements.deleteModal.dataset.taskId;
        if (taskId) {
            TaskManager.deleteTask(taskId);
            ToastManager.show('Task deleted');
            this.closeDeleteModal();
            this.renderTasks();
            this.updateStats();
            this.renderCategories();
            CalendarController.refresh();
        }
    },

    setFilter(filter) {
        this.currentFilter = filter;
        this.currentCategory = null;

        this.elements.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Clear category selection
        this.elements.categoriesList.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));

        this.renderTasks();
    },

    renderTasks() {
        const tasks = TaskManager.getFilteredTasks(this.currentFilter, this.searchQuery, this.currentCategory);

        // Update task count
        this.elements.taskCount.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

        if (tasks.length === 0) {
            this.elements.tasksContainer.innerHTML = '';
            this.elements.emptyState.classList.add('visible');
            return;
        }

        this.elements.emptyState.classList.remove('visible');

        const html = tasks.map(task => this.createTaskCard(task)).join('');
        this.elements.tasksContainer.innerHTML = html;

        this.bindTaskEvents();
    },

    createTaskCard(task) {
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
        const isToday = task.dueDate === new Date().toISOString().split('T')[0];
        const formattedDate = task.dueDate ? this.formatDate(task.dueDate) : '';
        const category = task.categoryId ? CategoryManager.getCategoryById(task.categoryId) : null;

        // Subtasks progress
        const subtasksTotal = task.subtasks?.length || 0;
        const subtasksCompleted = task.subtasks?.filter(st => st.completed).length || 0;
        const subtasksPercent = subtasksTotal > 0 ? Math.round((subtasksCompleted / subtasksTotal) * 100) : 0;

        return `
            <div class="task-card ${task.completed ? 'completed' : ''}" 
                 data-task-id="${task.id}" 
                 draggable="true">
                <div class="drag-handle">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
                        <circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
                    </svg>
                </div>
                <div class="task-checkbox">
                    <input type="checkbox" id="check-${task.id}" ${task.completed ? 'checked' : ''}>
                    <label for="check-${task.id}"></label>
                </div>
                <div class="task-content">
                    <div class="task-header">
                        <span class="task-title">${this.escapeHtml(task.title)}</span>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                        ${category ? `
                            <span class="task-category">
                                <span class="task-category-dot" style="background: ${category.color}"></span>
                                ${this.escapeHtml(category.name)}
                            </span>
                        ` : ''}
                    </div>
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    <div class="task-meta">
                        ${formattedDate ? `
                            <span class="task-due ${isOverdue ? 'overdue' : ''} ${isToday ? 'today' : ''}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                                </svg>
                                ${formattedDate}
                            </span>
                        ` : ''}
                        ${subtasksTotal > 0 ? `
                            <span class="subtasks-progress">
                                <div class="subtasks-bar">
                                    <div class="subtasks-bar-fill" style="width: ${subtasksPercent}%"></div>
                                </div>
                                ${subtasksCompleted}/${subtasksTotal}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-icon duplicate-task" title="Duplicate task">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                    </button>
                    <button class="btn-icon edit-task" title="Edit task">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete-task" title="Delete task">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    },

    bindTaskEvents() {
        // Checkbox toggle
        this.elements.tasksContainer.querySelectorAll('.task-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                const task = TaskManager.toggleComplete(taskId);

                if (task?.completed) {
                    ToastManager.show('Task completed! 🎉');
                }

                this.renderTasks();
                this.updateStats();
            });
        });

        // Edit button
        this.elements.tasksContainer.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                const tasks = TaskManager.getTasks();
                const task = tasks.find(t => t.id === taskId);
                if (task) {
                    this.openTaskModal(task);
                }
            });
        });

        // Duplicate button
        this.elements.tasksContainer.querySelectorAll('.duplicate-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                TaskManager.duplicateTask(taskId);
                ToastManager.show('Task duplicated!');
                this.renderTasks();
                this.updateStats();
            });
        });

        // Delete button
        this.elements.tasksContainer.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.openDeleteModal(taskId);
            });
        });

        // Drag and drop
        this.bindDragEvents();
    },

    bindDragEvents() {
        const taskCards = this.elements.tasksContainer.querySelectorAll('.task-card');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedTask = card;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                this.draggedTask = null;

                document.querySelectorAll('.task-card.drag-over').forEach(c => {
                    c.classList.remove('drag-over');
                });

                const taskIds = Array.from(this.elements.tasksContainer.querySelectorAll('.task-card'))
                    .map(c => c.dataset.taskId);
                TaskManager.reorderTasks(taskIds);
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';

                if (card !== this.draggedTask) {
                    card.classList.add('drag-over');
                }
            });

            card.addEventListener('dragleave', () => {
                card.classList.remove('drag-over');
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                card.classList.remove('drag-over');

                if (card !== this.draggedTask && this.draggedTask) {
                    const allCards = Array.from(this.elements.tasksContainer.querySelectorAll('.task-card'));
                    const draggedIndex = allCards.indexOf(this.draggedTask);
                    const dropIndex = allCards.indexOf(card);

                    if (draggedIndex < dropIndex) {
                        card.parentNode.insertBefore(this.draggedTask, card.nextSibling);
                    } else {
                        card.parentNode.insertBefore(this.draggedTask, card);
                    }
                }
            });
        });
    },

    updateStats() {
        const tasks = TaskManager.getTasks();
        const stats = TaskManager.getStats();
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Today's Progress (tasks due today)
        const todayTasks = tasks.filter(t => t.dueDate === today);
        const todayCompleted = todayTasks.filter(t => t.completed).length;
        const todayTotal = todayTasks.length;
        const todayPercent = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

        if (this.elements.todayProgressPercent) {
            this.elements.todayProgressPercent.textContent = `${todayPercent}%`;
            this.elements.todayProgressFill.style.width = `${todayPercent}%`;
            this.elements.todayProgressText.textContent = todayTotal > 0
                ? `${todayCompleted} of ${todayTotal} completed`
                : 'No tasks due today';
        }

        // Month's Progress (tasks due this month)
        const monthTasks = tasks.filter(t => {
            if (!t.dueDate) return false;
            const taskDate = new Date(t.dueDate);
            return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear;
        });
        const monthCompleted = monthTasks.filter(t => t.completed).length;
        const monthTotal = monthTasks.length;
        const monthPercent = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;

        if (this.elements.monthProgressPercent) {
            this.elements.monthProgressPercent.textContent = `${monthPercent}%`;
            this.elements.monthProgressFill.style.width = `${monthPercent}%`;
            this.elements.monthProgressText.textContent = monthTotal > 0
                ? `${monthCompleted} of ${monthTotal} completed`
                : 'No tasks this month';
        }

        // Stats
        this.animateValue(this.elements.statTotal, stats.total);
        this.animateValue(this.elements.statCompleted, stats.completed);
        this.animateValue(this.elements.statHigh, stats.high);
        this.animateValue(this.elements.statMedium, stats.medium);
    },

    animateValue(element, target) {
        const current = parseInt(element.textContent) || 0;
        if (current === target) return;

        const duration = 300;
        const start = performance.now();

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            const value = Math.round(current + (target - current) * this.easeOutQuad(progress));
            element.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    easeOutQuad(t) {
        return t * (2 - t);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    UIController.init();
});
