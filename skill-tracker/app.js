// SkillTracker Application
class SkillTracker {
    constructor() {
        // Initialize state
        this.state = {
            skills: [],
            sessions: [],
            reflections: [],
            streak: {
                daily: 0,
                weekly: 0,
                lastSessionDate: null
            },
            settings: {
                darkMode: localStorage.getItem('darkMode') === 'true',
                notifications: true
            }
        };
        
        // Initialize DOM elements cache
        this.elements = {};
        
        // For confirmation callbacks
        this.pendingAction = null;
    }
    
    // Initialize the application
    init() {
        this.cacheDOM();
        this.setupEventListeners();
        this.loadData();
        this.setupTheme();
        this.updateAllViews();
        
        // Set initial view
        this.switchView('dashboard');
    }
    
    // Cache DOM elements
    cacheDOM() {
        console.log('Caching DOM elements...');
        
        // Navigation
        this.elements.views = document.querySelectorAll('.view');
        this.elements.navLinks = document.querySelectorAll('.nav-link');
        
        // Dashboard
        this.elements.skillSelector = document.getElementById('skillSelector');
        this.elements.skillInfo = document.getElementById('skillInfo');
        this.elements.skillStartDate = document.getElementById('skillStartDate');
        this.elements.skillWhy = document.getElementById('skillWhy');
        this.elements.hoursInput = document.getElementById('hoursInput');
        this.elements.decreaseHours = document.getElementById('decreaseHours');
        this.elements.increaseHours = document.getElementById('increaseHours');
        this.elements.hoursPresets = document.querySelectorAll('.hours-preset');
        this.elements.outputValue = document.getElementById('outputValue');
        this.elements.decreaseOutput = document.getElementById('decreaseOutput');
        this.elements.increaseOutput = document.getElementById('increaseOutput');
        this.elements.difficultySlider = document.getElementById('difficultySlider');
        this.elements.weeklyProgressValue = document.getElementById('weeklyProgressValue');
        this.elements.weeklyProgressBar = document.getElementById('weeklyProgressBar');
        this.elements.completeSession = document.getElementById('completeSession');
        this.elements.currentStreak = document.getElementById('currentStreak');
        this.elements.totalSkills = document.getElementById('totalSkills');
        this.elements.weeklyProgress = document.getElementById('weeklyProgress');
        this.elements.totalHours = document.getElementById('totalHours');
        this.elements.recentSessionsList = document.getElementById('recentSessionsList');
        
        // Skills
        this.elements.skillsGrid = document.getElementById('skillsGrid');
        this.elements.openAddSkillModal = document.getElementById('openAddSkillModal');
        this.elements.floatingAddSkillBtn = document.getElementById('floatingAddSkillBtn');
        
        // Check if addFirstSkill exists
        const addFirstSkill = document.getElementById('addFirstSkill');
        if (addFirstSkill) {
            this.elements.addFirstSkill = addFirstSkill;
        }
        
        // Reflection
        this.elements.reflectionImproved = document.getElementById('reflectionImproved');
        this.elements.reflectionHard = document.getElementById('reflectionHard');
        this.elements.reflectionAdjust = document.getElementById('reflectionAdjust');
        this.elements.saveReflection = document.getElementById('saveReflection');
        this.elements.clearReflection = document.getElementById('clearReflection');
        this.elements.reflectionsList = document.getElementById('reflectionsList');
        
        // Settings
        this.elements.modeToggle = document.getElementById('modeToggle');
        this.elements.lightThemeBtn = document.getElementById('lightThemeBtn');
        this.elements.darkThemeBtn = document.getElementById('darkThemeBtn');
        this.elements.exportDataBtn = document.getElementById('exportDataBtn');
        this.elements.importDataBtn = document.getElementById('importDataBtn');
        this.elements.importFileInput = document.getElementById('importFileInput');
        this.elements.resetDataBtn = document.getElementById('resetDataBtn');
        
        // Modals
        this.elements.addSkillModal = document.getElementById('addSkillModal');
        this.elements.closeAddSkillModal = document.getElementById('closeAddSkillModal');
        this.elements.saveNewSkill = document.getElementById('saveNewSkill');
        this.elements.newSkillName = document.getElementById('newSkillName');
        this.elements.newSkillWhy = document.getElementById('newSkillWhy');
        this.elements.newSkillGoal = document.getElementById('newSkillGoal');
        this.elements.newSkillHours = document.getElementById('newSkillHours');
        
        this.elements.sessionDetailsModal = document.getElementById('sessionDetailsModal');
        this.elements.closeSessionModal = document.getElementById('closeSessionModal');
        this.elements.sessionDetailsContent = document.getElementById('sessionDetailsContent');
        
        // New notification modals
        this.elements.confirmationModal = document.getElementById('confirmationModal');
        this.elements.confirmationTitle = document.getElementById('confirmationTitle');
        this.elements.confirmationMessage = document.getElementById('confirmationMessage');
        this.elements.confirmationIcon = document.getElementById('confirmationIcon');
        this.elements.closeConfirmationModal = document.getElementById('closeConfirmationModal');
        this.elements.cancelConfirmation = document.getElementById('cancelConfirmation');
        this.elements.confirmAction = document.getElementById('confirmAction');
        
        this.elements.infoModal = document.getElementById('infoModal');
        this.elements.infoTitle = document.getElementById('infoTitle');
        this.elements.infoMessage = document.getElementById('infoMessage');
        this.elements.infoIcon = document.getElementById('infoIcon');
        this.elements.closeInfoModal = document.getElementById('closeInfoModal');
        this.elements.closeInfoBtn = document.getElementById('closeInfoBtn');
        
        console.log('DOM elements cached successfully');
    }
    
    // Set up event listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Navigation
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const viewId = link.getAttribute('data-view');
                console.log('Nav link clicked:', viewId);
                this.switchView(viewId);
            });
        });
        
        // Dashboard events
        this.elements.skillSelector.addEventListener('change', (e) => {
            const skillId = parseInt(e.target.value);
            if (skillId > 0) {
                this.updateSkillInfo(skillId);
            } else {
                this.elements.skillInfo.style.display = 'none';
            }
        });
        
        // Hours controls
        this.elements.decreaseHours.addEventListener('click', () => {
            const currentValue = parseFloat(this.elements.hoursInput.value);
            const newValue = Math.max(0.1, currentValue - 0.1);
            this.elements.hoursInput.value = newValue.toFixed(1);
        });
        
        this.elements.increaseHours.addEventListener('click', () => {
            const currentValue = parseFloat(this.elements.hoursInput.value);
            const newValue = Math.min(24, currentValue + 0.1);
            this.elements.hoursInput.value = newValue.toFixed(1);
        });
        
        this.elements.hoursInput.addEventListener('change', (e) => {
            let value = parseFloat(e.target.value);
            if (isNaN(value) || value < 0.1) value = 0.1;
            if (value > 24) value = 24;
            e.target.value = value.toFixed(1);
        });
        
        // Hours presets
        this.elements.hoursPresets.forEach(preset => {
            preset.addEventListener('click', (e) => {
                const hours = parseFloat(e.target.getAttribute('data-hours'));
                this.elements.hoursInput.value = hours.toFixed(1);
            });
        });
        
        // Output controls
        this.elements.decreaseOutput.addEventListener('click', () => {
            const currentValue = parseInt(this.elements.outputValue.textContent);
            this.elements.outputValue.textContent = Math.max(0, currentValue - 1);
        });
        
        this.elements.increaseOutput.addEventListener('click', () => {
            const currentValue = parseInt(this.elements.outputValue.textContent);
            this.elements.outputValue.textContent = currentValue + 1;
        });
        
        // Complete session
        this.elements.completeSession.addEventListener('click', () => this.completeSession());
        
        // Skills events
        this.elements.openAddSkillModal.addEventListener('click', () => this.openAddSkillModal());
        this.elements.floatingAddSkillBtn.addEventListener('click', () => this.openAddSkillModal());
        
        // Check if addFirstSkill exists before adding event listener
        if (this.elements.addFirstSkill) {
            this.elements.addFirstSkill.addEventListener('click', () => this.openAddSkillModal());
        }
        
        this.elements.closeAddSkillModal.addEventListener('click', () => this.closeAddSkillModal());
        this.elements.saveNewSkill.addEventListener('click', () => this.addNewSkill());
        
        // Reflection events
        this.elements.saveReflection.addEventListener('click', () => this.saveReflection());
        if (this.elements.clearReflection) {
            this.elements.clearReflection.addEventListener('click', () => this.clearReflectionForm());
        }
        
        // Settings events
        this.elements.modeToggle.addEventListener('click', () => this.toggleDarkMode());
        this.elements.lightThemeBtn.addEventListener('click', () => {
            if (this.state.settings.darkMode) this.toggleDarkMode();
        });
        this.elements.darkThemeBtn.addEventListener('click', () => {
            if (!this.state.settings.darkMode) this.toggleDarkMode();
        });
        this.elements.exportDataBtn.addEventListener('click', () => this.exportData());
        this.elements.importDataBtn.addEventListener('click', () => this.elements.importFileInput.click());
        this.elements.importFileInput.addEventListener('change', (e) => this.importData(e));
        this.elements.resetDataBtn.addEventListener('click', () => this.confirmResetData());
        
        // Modal close events
        this.elements.addSkillModal.addEventListener('click', (e) => {
            if (e.target === this.elements.addSkillModal) {
                this.closeAddSkillModal();
            }
        });
        
        this.elements.sessionDetailsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.sessionDetailsModal) {
                this.closeSessionModal();
            }
        });
        
        if (this.elements.closeSessionModal) {
            this.elements.closeSessionModal.addEventListener('click', () => this.closeSessionModal());
        }
        
        // New notification modal close events
        this.elements.confirmationModal.addEventListener('click', (e) => {
            if (e.target === this.elements.confirmationModal) {
                this.closeConfirmationModal();
            }
        });
        
        this.elements.closeConfirmationModal.addEventListener('click', () => this.closeConfirmationModal());
        this.elements.cancelConfirmation.addEventListener('click', () => this.closeConfirmationModal());
        this.elements.confirmAction.addEventListener('click', () => {
            if (this.pendingAction) {
                this.pendingAction();
                this.pendingAction = null;
            }
            this.closeConfirmationModal();
        });
        
        this.elements.infoModal.addEventListener('click', (e) => {
            if (e.target === this.elements.infoModal) {
                this.closeInfoModal();
            }
        });
        
        this.elements.closeInfoModal.addEventListener('click', () => this.closeInfoModal());
        this.elements.closeInfoBtn.addEventListener('click', () => this.closeInfoModal());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAddSkillModal();
                this.closeSessionModal();
                this.closeConfirmationModal();
                this.closeInfoModal();
            }
        });
        
        console.log('Event listeners set up successfully');
    }
    
    // ===== NEW NOTIFICATION METHODS =====
    showInfo(title, message, icon = 'success') {
        this.elements.infoTitle.textContent = title;
        this.elements.infoMessage.textContent = message;
        
        const iconElement = this.elements.infoIcon.querySelector('i');
        if (icon === 'success') {
            iconElement.className = 'fas fa-check-circle';
            iconElement.style.color = 'var(--success)';
        } else if (icon === 'error') {
            iconElement.className = 'fas fa-exclamation-circle';
            iconElement.style.color = 'var(--danger)';
        } else if (icon === 'warning') {
            iconElement.className = 'fas fa-exclamation-triangle';
            iconElement.style.color = 'var(--warning)';
        } else if (icon === 'info') {
            iconElement.className = 'fas fa-info-circle';
            iconElement.style.color = 'var(--primary)';
        }
        
        this.elements.infoModal.classList.add('active');
    }
    
    showConfirmation(title, message, onConfirm, icon = 'warning') {
        this.elements.confirmationTitle.textContent = title;
        this.elements.confirmationMessage.textContent = message;
        
        const iconElement = this.elements.confirmationIcon.querySelector('i');
        if (icon === 'warning') {
            iconElement.className = 'fas fa-exclamation-triangle';
            iconElement.style.color = 'var(--warning)';
        } else if (icon === 'danger') {
            iconElement.className = 'fas fa-exclamation-circle';
            iconElement.style.color = 'var(--danger)';
        } else if (icon === 'info') {
            iconElement.className = 'fas fa-info-circle';
            iconElement.style.color = 'var(--primary)';
        }
        
        this.pendingAction = onConfirm;
        this.elements.confirmationModal.classList.add('active');
    }
    
    closeConfirmationModal() {
        this.elements.confirmationModal.classList.remove('active');
        this.pendingAction = null;
    }
    
    closeInfoModal() {
        this.elements.infoModal.classList.remove('active');
    }
    
    // Data persistence methods
    loadData() {
        const savedData = localStorage.getItem('skilltracker-data');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.state = { ...this.state, ...parsed };
                
                // Ensure arrays exist
                this.state.skills = this.state.skills || [];
                this.state.sessions = this.state.sessions || [];
                this.state.reflections = this.state.reflections || [];
                
                // Update streak based on last session
                this.updateStreak();
            } catch (e) {
                console.error('Error loading saved data:', e);
                this.saveData(); // Create fresh data structure
            }
        } else {
            this.saveData(); // Initialize with default structure
        }
    }
    
    saveData() {
        try {
            localStorage.setItem('skilltracker-data', JSON.stringify(this.state));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }
    
    // Update streak based on last session date
    updateStreak() {
        if (!this.state.sessions || this.state.sessions.length === 0) {
            this.state.streak.daily = 0;
            this.state.streak.weekly = 0;
            return;
        }
        
        // Sort sessions by date
        const sortedSessions = [...this.state.sessions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        const lastSession = sortedSessions[0];
        const lastSessionDate = new Date(lastSession.date);
        const today = new Date();
        
        // Reset time parts for accurate day comparison
        lastSessionDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        const timeDiff = today.getTime() - lastSessionDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);
        
        if (daysDiff === 0) {
            // Session today, maintain streak
            if (this.state.streak.lastSessionDate) {
                const lastStreakDate = new Date(this.state.streak.lastSessionDate);
                lastStreakDate.setHours(0, 0, 0, 0);
                
                if (lastStreakDate.getTime() === lastSessionDate.getTime()) {
                    // Same day, don't increment
                    return;
                } else if (lastStreakDate.getTime() === lastSessionDate.getTime() - 86400000) {
                    // Consecutive day
                    this.state.streak.daily++;
                } else {
                    // Break in streak
                    this.state.streak.daily = 1;
                }
            } else {
                this.state.streak.daily = 1;
            }
        } else if (daysDiff === 1) {
            // Session yesterday, continue streak
            this.state.streak.daily++;
        } else {
            // Break in streak
            this.state.streak.daily = 1;
        }
        
        this.state.streak.lastSessionDate = lastSession.date;
        
        // Update weekly streak (7 consecutive days)
        if (this.state.streak.daily >= 7) {
            this.state.streak.weekly = Math.floor(this.state.streak.daily / 7);
        }
        
        this.saveData();
    }
    
    // Theme methods
    setupTheme() {
        document.body.classList.toggle('dark-mode', this.state.settings.darkMode);
        this.elements.modeToggle.innerHTML = this.state.settings.darkMode 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
    }
    
    toggleDarkMode() {
        this.state.settings.darkMode = !this.state.settings.darkMode;
        localStorage.setItem('darkMode', this.state.settings.darkMode);
        this.setupTheme();
        this.saveData();
    }
    
    // View switching
    switchView(viewId) {
        console.log('Switching to view:', viewId);
        
        // Hide all views
        this.elements.views.forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        } else {
            console.error('View not found:', viewId);
            return;
        }
        
        // Update active nav link
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-view') === viewId) {
                link.classList.add('active');
            }
        });
        
        // Update view-specific content
        if (viewId === 'dashboard') {
            this.updateDashboard();
        } else if (viewId === 'skills') {
            this.updateSkillsView();
        } else if (viewId === 'timeline') {
            this.updateTimeline();
        } else if (viewId === 'reflection') {
            this.updateReflectionView();
        }
        
        console.log('View switched successfully');
    }
    
    // Update all views
    updateAllViews() {
        this.updateDashboard();
        this.updateSkillsView();
        this.updateTimeline();
        this.updateReflectionView();
    }
    
    // Dashboard methods
    updateDashboard() {
        // Update stats
        this.elements.currentStreak.textContent = `${this.state.streak.daily} days`;
        this.elements.totalSkills.textContent = this.state.skills.length;
        
        // Calculate total hours
        const totalHours = this.state.skills.reduce((sum, skill) => sum + (skill.totalHours || 0), 0);
        this.elements.totalHours.textContent = totalHours.toFixed(1);
        
        // Calculate average weekly progress
        let avgProgress = 0;
        if (this.state.skills.length > 0) {
            const totalProgress = this.state.skills.reduce((sum, skill) => sum + (skill.weeklyProgress || 0), 0);
            avgProgress = Math.round(totalProgress / this.state.skills.length);
        }
        this.elements.weeklyProgress.textContent = `${avgProgress}%`;
        this.elements.weeklyProgressValue.textContent = `${avgProgress}%`;
        this.elements.weeklyProgressBar.style.width = `${avgProgress}%`;
        
        // Update skill selector
        this.elements.skillSelector.innerHTML = '<option value="0">Select a skill to focus on today</option>';
        this.state.skills.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill.id;
            option.textContent = skill.name;
            this.elements.skillSelector.appendChild(option);
        });
        
        // Update recent sessions
        this.updateRecentSessions();
    }
    
    updateSkillInfo(skillId) {
        const skill = this.state.skills.find(s => s.id === skillId);
        if (skill) {
            this.elements.skillInfo.style.display = 'block';
            this.elements.skillStartDate.textContent = new Date(skill.startDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            this.elements.skillWhy.textContent = skill.why;
        }
    }
    
    updateRecentSessions() {
        if (!this.state.sessions || this.state.sessions.length === 0) {
            this.elements.recentSessionsList.innerHTML = '<p class="empty-state">No sessions recorded yet. Complete your first session!</p>';
            return;
        }
        
        // Sort sessions by date (newest first)
        const sortedSessions = [...this.state.sessions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        ).slice(0, 5); // Show only 5 most recent
        
        this.elements.recentSessionsList.innerHTML = '';
        
        sortedSessions.forEach(session => {
            const skill = this.state.skills.find(s => s.id === session.skillId);
            if (!skill) return;
            
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            sessionItem.innerHTML = `
                <div class="session-info">
                    <strong>${skill.name}</strong>
                    <div class="session-meta">
                        <span><i class="fas fa-clock"></i> ${session.hours} hours</span>
                        <span><i class="fas fa-check-circle"></i> ${session.outputs} outputs</span>
                        <span><i class="fas fa-sliders-h"></i> Difficulty: ${session.difficulty}/5</span>
                    </div>
                </div>
                <div class="session-date">
                    ${new Date(session.date).toLocaleDateString()}
                </div>
            `;
            
            sessionItem.addEventListener('click', () => this.showSessionDetails(session.id));
            this.elements.recentSessionsList.appendChild(sessionItem);
        });
    }
    
    // Complete session
    completeSession() {
        const skillId = parseInt(this.elements.skillSelector.value);
        if (skillId === 0) {
            this.showInfo('No Skill Selected', 'Please select a skill to focus on today!', 'warning');
            return;
        }
        
        const hours = parseFloat(this.elements.hoursInput.value);
        if (hours < 0.1) {
            this.showInfo('Invalid Hours', 'Please enter a valid practice time (minimum 0.1 hours = 6 minutes).', 'warning');
            return;
        }
        
        const outputs = parseInt(this.elements.outputValue.textContent);
        const difficulty = parseInt(this.elements.difficultySlider.value);
        
        // Find the skill
        const skillIndex = this.state.skills.findIndex(skill => skill.id === skillId);
        if (skillIndex === -1) {
            this.showInfo('Skill Not Found', 'Selected skill not found!', 'error');
            return;
        }
        
        // Create session
        const session = {
            id: Date.now(),
            skillId: skillId,
            date: new Date().toISOString(),
            hours: hours,
            outputs: outputs,
            difficulty: difficulty,
            note: ''
        };
        
        // Add session to state
        this.state.sessions.push(session);
        
        // Update skill data
        const skill = this.state.skills[skillIndex];
        skill.totalHours = (skill.totalHours || 0) + hours;
        skill.totalOutputs = (skill.totalOutputs || 0) + outputs;
        skill.sessions = (skill.sessions || 0) + 1;
        
        // Recalculate average difficulty
        const totalDifficulty = (skill.avgDifficulty || 0) * (skill.sessions - 1) + difficulty;
        skill.avgDifficulty = totalDifficulty / skill.sessions;
        
        // Recalculate skill score: (Hours × Outputs × Avg Difficulty) ÷ 10
        skill.skillScore = Math.round((skill.totalHours * skill.totalOutputs * skill.avgDifficulty) / 10 * 10) / 10;
        
        // Update weekly progress (increase by 5-15% per session)
        skill.weeklyProgress = Math.min(100, (skill.weeklyProgress || 0) + Math.floor(Math.random() * 10) + 5);
        
        // Update streak
        this.updateStreak();
        
        // Reset form
        this.elements.hoursInput.value = '0.5';
        this.elements.outputValue.textContent = '0';
        this.elements.difficultySlider.value = '3';
        
        // Save data and update UI
        this.saveData();
        this.updateAllViews();
        
        // Show success message with UI modal
        this.showInfo(
            'Session Saved!', 
            `Skill: ${skill.name}\nTime: ${hours} hours\nOutputs: ${outputs}\nDifficulty: ${difficulty}/5\n\nYour skill score increased to ${skill.skillScore}!`,
            'success'
        );
    }
    
    // Skills view methods
    updateSkillsView() {
        this.elements.skillsGrid.innerHTML = '';
        
        if (this.state.skills.length === 0) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'empty-state-card';
            emptyCard.innerHTML = `
                <i class="fas fa-plus-circle" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                <h3>No Skills Yet</h3>
                <p>Add your first skill to start tracking progress!</p>
                <button class="btn btn-primary" id="addFirstSkill">
                    <i class="fas fa-plus"></i> Add Your First Skill
                </button>
            `;
            this.elements.skillsGrid.appendChild(emptyCard);
            
            // Re-add event listener
            setTimeout(() => {
                const addFirstSkillBtn = document.getElementById('addFirstSkill');
                if (addFirstSkillBtn) {
                    addFirstSkillBtn.addEventListener('click', () => this.openAddSkillModal());
                }
            }, 100);
            return;
        }
        
        this.state.skills.forEach(skill => {
            const skillCard = document.createElement('div');
            skillCard.className = 'skill-card';
            
            // Calculate days since start
            const startDate = new Date(skill.startDate);
            const today = new Date();
            const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            
            skillCard.innerHTML = `
                <div class="skill-card-header">
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-score">${skill.skillScore || 0}</div>
                </div>
                <div class="skill-meta">
                    <div>Started: ${new Date(skill.startDate).toLocaleDateString()}</div>
                    <div>Days: ${daysDiff}</div>
                </div>
                <p style="margin-bottom: 15px; color: var(--gray); font-size: 0.9rem;">${skill.why}</p>
                <div class="skill-progress">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Weekly Progress</span>
                        <span>${skill.weeklyProgress || 0}%</span>
                    </div>
                    <div class="skill-progress-bar">
                        <div class="skill-progress-fill" style="width: ${skill.weeklyProgress || 0}%;"></div>
                    </div>
                </div>
                ${skill.goal ? `<p style="margin-top: 15px; font-size: 0.9rem;"><strong>Goal:</strong> ${skill.goal}</p>` : ''}
            `;
            
            skillCard.addEventListener('click', () => {
                this.elements.skillSelector.value = skill.id;
                this.switchView('dashboard');
                this.updateSkillInfo(skill.id);
            });
            
            this.elements.skillsGrid.appendChild(skillCard);
        });
    }
    
    // Timeline methods
    updateTimeline() {
        const timelineContent = document.getElementById('timelineContent');
        
        if (this.state.sessions.length === 0) {
            timelineContent.innerHTML = `
                <div class="empty-state-card">
                    <i class="fas fa-chart-line" style="font-size: 3rem; color: var(--gray); margin-bottom: 20px;"></i>
                    <h3>Your Timeline is Empty</h3>
                    <p>Start tracking skills to see your progress timeline here.</p>
                </div>
            `;
            return;
        }
        
        // Group sessions by date
        const sessionsByDate = {};
        this.state.sessions.forEach(session => {
            const date = new Date(session.date).toDateString();
            if (!sessionsByDate[date]) {
                sessionsByDate[date] = [];
            }
            sessionsByDate[date].push(session);
        });
        
        // Sort dates in descending order
        const sortedDates = Object.keys(sessionsByDate).sort((a, b) => 
            new Date(b) - new Date(a)
        );
        
        timelineContent.innerHTML = '';
        
        sortedDates.forEach(date => {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
            
            const sessions = sessionsByDate[date];
            const totalHours = sessions.reduce((sum, session) => sum + session.hours, 0);
            const totalOutputs = sessions.reduce((sum, session) => sum + session.outputs, 0);
            
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${formattedDate}</div>
                    <h3 style="margin-bottom: 10px;">${sessions.length} Session${sessions.length > 1 ? 's' : ''}</h3>
                    <div style="display: flex; gap: 15px; font-size: 0.9rem; margin-bottom: 10px;">
                        <div><strong>Total Hours:</strong> ${totalHours.toFixed(1)}</div>
                        <div><strong>Total Outputs:</strong> ${totalOutputs}</div>
                    </div>
                    <div class="session-list">
                        ${sessions.map(session => {
                            const skill = this.state.skills.find(s => s.id === session.skillId);
                            return skill ? 
                                `<div style="margin-bottom: 5px;">
                                    <strong>${skill.name}:</strong> ${session.hours}h, ${session.outputs} outputs, difficulty ${session.difficulty}/5
                                </div>` : '';
                        }).join('')}
                    </div>
                </div>
            `;
            
            timelineContent.appendChild(timelineItem);
        });
    }
    
    // Reflection methods
    updateReflectionView() {
        this.updateReflectionsList();
    }
    
    saveReflection() {
        const improved = this.elements.reflectionImproved.value.trim();
        const hard = this.elements.reflectionHard.value.trim();
        const adjust = this.elements.reflectionAdjust.value.trim();
        
        if (!improved && !hard && !adjust) {
            this.showInfo('Empty Reflection', 'Please fill in at least one reflection field.', 'warning');
            return;
        }
        
        const reflection = {
            id: Date.now(),
            date: new Date().toISOString(),
            improved: improved,
            hard: hard,
            adjust: adjust
        };
        
        this.state.reflections.push(reflection);
        this.saveData();
        
        // Clear form
        this.clearReflectionForm();
        
        // Update list
        this.updateReflectionsList();
        
        this.showInfo('Reflection Saved', 'Your weekly reflection has been saved successfully!', 'success');
    }
    
    clearReflectionForm() {
        this.elements.reflectionImproved.value = '';
        this.elements.reflectionHard.value = '';
        this.elements.reflectionAdjust.value = '';
    }
    
    updateReflectionsList() {
        const reflectionsList = document.getElementById('reflectionsList');
        
        if (!this.state.reflections || this.state.reflections.length === 0) {
            reflectionsList.innerHTML = '<p class="empty-state">No reflections yet. Write your first weekly reflection!</p>';
            return;
        }
        
        // Sort reflections by date (newest first)
        const sortedReflections = [...this.state.reflections].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        reflectionsList.innerHTML = '';
        
        sortedReflections.forEach(reflection => {
            const reflectionItem = document.createElement('div');
            reflectionItem.className = 'reflection-item';
            
            const formattedDate = new Date(reflection.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                weekday: 'short'
            });
            
            reflectionItem.innerHTML = `
                <div class="reflection-date">${formattedDate}</div>
                <div class="reflection-content">
                    ${reflection.improved ? `<p><strong>What improved:</strong> ${reflection.improved}</p>` : ''}
                    ${reflection.hard ? `<p><strong>What was hard:</strong> ${reflection.hard}</p>` : ''}
                    ${reflection.adjust ? `<p><strong>What to adjust:</strong> ${reflection.adjust}</p>` : ''}
                </div>
            `;
            
            reflectionsList.appendChild(reflectionItem);
        });
    }
    
    // Modal methods
    openAddSkillModal() {
        this.elements.addSkillModal.classList.add('active');
    }
    
    closeAddSkillModal() {
        this.elements.addSkillModal.classList.remove('active');
        // Clear form
        this.elements.newSkillName.value = '';
        this.elements.newSkillWhy.value = '';
        this.elements.newSkillGoal.value = '';
        this.elements.newSkillHours.value = '';
    }
    
    addNewSkill() {
        const name = this.elements.newSkillName.value.trim();
        const why = this.elements.newSkillWhy.value.trim();
        const goal = this.elements.newSkillGoal.value.trim();
        const estimatedHours = parseInt(this.elements.newSkillHours.value) || 0;
        
        if (!name || !why) {
            this.showInfo('Missing Information', 'Please fill in the skill name and reason for learning it.', 'warning');
            return;
        }
        
        // Check if skill already exists
        if (this.state.skills.some(skill => skill.name.toLowerCase() === name.toLowerCase())) {
            this.showInfo('Skill Exists', 'A skill with this name already exists!', 'error');
            return;
        }
        
        const newSkill = {
            id: this.state.skills.length > 0 ? Math.max(...this.state.skills.map(s => s.id)) + 1 : 1,
            name: name,
            startDate: new Date().toISOString(),
            why: why,
            goal: goal,
            estimatedHours: estimatedHours,
            totalHours: 0,
            totalOutputs: 0,
            avgDifficulty: 0,
            skillScore: 0,
            sessions: 0,
            weeklyProgress: 0
        };
        
        this.state.skills.push(newSkill);
        this.saveData();
        
        // Close modal and update UI
        this.closeAddSkillModal();
        this.updateAllViews();
        
        // Switch to skills view
        this.switchView('skills');
        
        this.showInfo('Skill Added', `${name} has been added to your skills!`, 'success');
    }
    
    // Session details modal
    showSessionDetails(sessionId) {
        const session = this.state.sessions.find(s => s.id === sessionId);
        if (!session) return;
        
        const skill = this.state.skills.find(s => s.id === session.skillId);
        if (!skill) return;
        
        const formattedDate = new Date(session.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        this.elements.sessionDetailsContent.innerHTML = `
            <div class="session-details">
                <h3 style="color: var(--primary); margin-bottom: 10px;">${skill.name}</h3>
                <p style="color: var(--gray); margin-bottom: 20px;"><i class="fas fa-calendar"></i> ${formattedDate}</p>
                
                <div class="session-stats" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
                    <div style="background: var(--light-gray); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.9rem; color: var(--gray);">Hours</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary);">${session.hours}</div>
                    </div>
                    <div style="background: var(--light-gray); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.9rem; color: var(--gray);">Outputs</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary);">${session.outputs}</div>
                    </div>
                    <div style="background: var(--light-gray); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.9rem; color: var(--gray);">Difficulty</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary);">${session.difficulty}/5</div>
                    </div>
                    <div style="background: var(--light-gray); padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.9rem; color: var(--gray);">Session Score</div>
                        <div style="font-size: 1.8rem; font-weight: bold; color: var(--primary);">${Math.round((session.hours * session.outputs * session.difficulty) / 10 * 10) / 10}</div>
                    </div>
                </div>
                
                ${session.note ? `
                    <div style="margin-top: 20px;">
                        <h4 style="margin-bottom: 10px;">Note</h4>
                        <p style="background: var(--light-gray); padding: 15px; border-radius: 8px;">${session.note}</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        this.elements.sessionDetailsModal.classList.add('active');
    }
    
    closeSessionModal() {
        this.elements.sessionDetailsModal.classList.remove('active');
    }
    
    // Data export/import methods
    exportData() {
        const dataStr = JSON.stringify(this.state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `skilltracker-data-${new Date().toISOString().slice(0, 10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showInfo('Data Exported', 'Your data has been exported successfully!', 'success');
    }
    
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.endsWith('.json')) {
            this.showInfo('Invalid File', 'Please select a JSON file.', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Basic validation
                if (!importedData.skills || !Array.isArray(importedData.skills)) {
                    throw new Error('Invalid data format: skills array missing');
                }
                
                this.showConfirmation(
                    'Import Data',
                    'Importing data will replace your current data. Continue?',
                    () => {
                        this.state = importedData;
                        
                        // Ensure all required properties exist
                        this.state.skills = this.state.skills || [];
                        this.state.sessions = this.state.sessions || [];
                        this.state.reflections = this.state.reflections || [];
                        this.state.streak = this.state.streak || { daily: 0, weekly: 0, lastSessionDate: null };
                        this.state.settings = this.state.settings || { darkMode: false, notifications: true };
                        
                        // Update streak based on imported sessions
                        this.updateStreak();
                        
                        // Save and update UI
                        this.saveData();
                        this.updateAllViews();
                        this.setupTheme();
                        
                        this.showInfo('Import Successful', 'Your data has been imported successfully!', 'success');
                    },
                    'warning'
                );
            } catch (error) {
                console.error('Error importing data:', error);
                this.showInfo('Import Failed', 'Error importing data. Please make sure the file is a valid SkillTracker export.', 'error');
            }
        };
        
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
    
    confirmResetData() {
        this.showConfirmation(
            'Reset All Data',
            'Are you sure you want to reset all data? This cannot be undone.',
            () => {
                // Reset state
                this.state = {
                    skills: [],
                    sessions: [],
                    reflections: [],
                    streak: {
                        daily: 0,
                        weekly: 0,
                        lastSessionDate: null
                    },
                    settings: {
                        darkMode: localStorage.getItem('darkMode') === 'true',
                        notifications: true
                    }
                };
                
                // Save and update UI
                this.saveData();
                this.updateAllViews();
                
                this.showInfo('Data Reset', 'All data has been reset successfully.', 'success');
            },
            'danger'
        );
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SkillTracker...');
    const app = new SkillTracker();
    app.init();
    console.log('SkillTracker initialized successfully');
});