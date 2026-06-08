// ======================
// CORE VARIABLES
// ======================
let totalScore = 0;
let dailyScore = 0;
let buttons = [];
let history = [];
let scoreChart = null;

// Progress System
let currentXP = 0;
let currentLevel = 1;
const BASE_XP_PER_LEVEL = 100;

// Daily/Weekly System
let todaysDate = new Date().toDateString();
let lastActivityDate = localStorage.getItem('lastActivityDate') || null;
let dailyResetDone = false;

// Balance Multiplier System - Updated to 5x max
let goodTotal = 0;
let badTotal = 0;

// Weekly Tracking
let currentWeek = getWeekNumber(new Date());
let weeklyHistory = [];

// Achievements - Updated for 5x multiplier
let achievements = [
    { id: 'first_100', name: 'Centurion', desc: 'Score 100 total points', unlocked: false, icon: 'fas fa-trophy' },
    { id: 'level_5', name: 'Rising Star', desc: 'Reach level 5', unlocked: false, icon: 'fas fa-star' },
    { id: 'daily_50', name: 'Daily Champion', desc: 'Score 50+ points in a day', unlocked: false, icon: 'fas fa-medal' },
    { id: 'balance_master', name: 'Balance Master', desc: 'Maintain balanced score for 3 days', unlocked: false, icon: 'fas fa-balance-scale' },
    { id: 'multiplier_3x', name: 'Multiplier Pro', desc: 'Reach 3x multiplier', unlocked: false, icon: 'fas fa-bolt' },
    { id: 'multiplier_5x', name: 'Multiplier God', desc: 'Reach 5x multiplier', unlocked: false, icon: 'fas fa-fire' },
    { id: 'streak_7', name: 'Week Warrior', desc: '7 active days in a row', unlocked: false, icon: 'fas fa-calendar-week' },
    { id: 'total_500', name: 'Legend', desc: 'Score 500 total points', unlocked: false, icon: 'fas fa-crown' }
];

// Sound System
let soundEnabled = true;
const sounds = {
    positive: document.getElementById('positiveSound'),
    negative: document.getElementById('negativeSound'),
    click: document.getElementById('clickSound'),
    levelUp: document.getElementById('levelUpSound'),
    reset: document.getElementById('resetSound')
};

// Motivational Messages
const dailyMessages = [
    "Every day is a new opportunity to improve. Make today count!",
    "Small daily improvements lead to massive long-term results.",
    "Your future self will thank you for today's efforts.",
    "Discipline is choosing between what you want now and what you want most.",
    "Progress, not perfection. Every point counts!",
    "The only bad workout is the one that didn't happen.",
    "Your habits determine your future. Build good ones today.",
    "Success is the sum of small efforts repeated day in and day out."
];

// ======================
// CUSTOM UI MODAL SYSTEM
// ======================
let modalResolve = null;

function showCustomModal(options) {
    return new Promise((resolve) => {
        modalResolve = resolve;
        
        const modal = document.getElementById('customModal');
        const title = document.getElementById('modalTitle');
        const message = document.getElementById('modalMessage');
        const inputContainer = document.getElementById('modalInputContainer');
        const input = document.getElementById('modalInput');
        const actions = document.getElementById('modalActions');
        
        title.textContent = options.title || 'Dialog';
        message.textContent = options.message || '';
        
        // Handle input
        if (options.type === 'prompt') {
            inputContainer.style.display = 'block';
            input.value = options.defaultValue || '';
        } else {
            inputContainer.style.display = 'none';
        }
        
        // Create buttons
        actions.innerHTML = '';
        
        if (options.type === 'confirm') {
            // Yes button
            const yesBtn = document.createElement('button');
            yesBtn.className = 'modal-btn primary';
            yesBtn.textContent = 'Yes';
            yesBtn.onclick = () => {
                closeCustomModal();
                resolve(true);
            };
            actions.appendChild(yesBtn);
            
            // No button
            const noBtn = document.createElement('button');
            noBtn.className = 'modal-btn secondary';
            noBtn.textContent = 'No';
            noBtn.onclick = () => {
                closeCustomModal();
                resolve(false);
            };
            actions.appendChild(noBtn);
        } 
        else if (options.type === 'prompt') {
            // Cancel button
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'modal-btn secondary';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.onclick = () => {
                closeCustomModal();
                resolve(null);
            };
            actions.appendChild(cancelBtn);
            
            // Submit button
            const submitBtn = document.createElement('button');
            submitBtn.className = 'modal-btn primary';
            submitBtn.textContent = 'Submit';
            submitBtn.onclick = () => {
                const val = input.value;
                closeCustomModal();
                resolve(val);
            };
            actions.appendChild(submitBtn);
        } 
        else { // alert
            const okBtn = document.createElement('button');
            okBtn.className = 'modal-btn primary';
            okBtn.textContent = 'OK';
            okBtn.onclick = () => {
                closeCustomModal();
                resolve(true);
            };
            actions.appendChild(okBtn);
        }
        
        modal.classList.add('active');
    });
}

function closeCustomModal() {
    const modal = document.getElementById('customModal');
    modal.classList.remove('active');
}

// ======================
// CUSTOM TOAST SYSTEM
// ======================
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ======================
// OVERRIDE NATIVE DIALOGS
// ======================
window.alert = function(message) {
    return showCustomModal({ type: 'alert', title: 'Alert', message: message });
};

window.confirm = function(message) {
    return showCustomModal({ type: 'confirm', title: 'Confirm', message: message });
};

window.prompt = function(message, defaultValue) {
    return showCustomModal({ type: 'prompt', title: 'Input', message: message, defaultValue: defaultValue });
};

// ======================
// UI WRAPPER FUNCTIONS
// ======================
async function uiAddButton(type) {
    playSound('click');
    
    const name = await prompt(`Enter ${type} action name:`);
    if (!name) return;
    
    const valueInput = await prompt(`Enter base score value (positive number):`);
    let value = parseInt(valueInput);
    
    if (isNaN(value) || value <= 0) {
        showToast('Please enter a valid positive number!', 'error');
        return;
    }
    
    if (type === 'bad') {
        value = -value;
    }
    
    createButton(type, name, value);
    showToast(`"${name}" added successfully!`, 'success');
}

async function uiClearAllData() {
    playSound('click');
    
    const confirmed = await confirm('Reset ALL data? This will delete everything and cannot be undone!');
    if (!confirmed) return;
    
    localStorage.removeItem('dailyGrindData');
    
    // Reset all variables
    totalScore = 0;
    dailyScore = 0;
    buttons = [];
    history = [];
    goodTotal = 0;
    badTotal = 0;
    currentWeek = getWeekNumber(new Date());
    weeklyHistory = [];
    currentXP = 0;
    currentLevel = 1;
    achievements.forEach(a => a.unlocked = false);
    soundEnabled = true;
    
    // Update UI
    initUI();
    updateSoundToggle();
    addDemoButtons();
    
    showToast('All data reset! Fresh start!', 'success');
}

async function uiClearHistory() {
    playSound('click');
    
    const confirmed = await confirm('Clear all history? This cannot be undone!');
    if (!confirmed) return;
    
    history = [];
    saveToLocalStorage();
    renderHistory();
    updateStats();
    
    if (scoreChart) {
        updateGraph();
    }
    
    showToast('History cleared! Fresh start!', 'success');
}

async function deleteButton(id) {
    const button = buttons.find(b => b.id === id);
    if (!button) return;
    
    const confirmed = await confirm(`Delete "${button.name}"?`);
    if (!confirmed) return;
    
    addHistoryEntry(`Deleted: ${button.name}`, 0, totalScore);
    
    buttons = buttons.filter(b => b.id !== id);
    saveToLocalStorage();
    renderButtons();
    showToast(`"${button.name}" deleted`, 'warning');
}

async function editButton(id) {
    playSound('click');
    
    const button = buttons.find(b => b.id === id);
    if (!button) return;
    
    const name = await prompt("Edit button name:", button.name);
    if (!name) return;
    
    const value = parseInt(await prompt("Edit base score value:", Math.abs(button.value)));
    if (isNaN(value)) {
        showToast('Invalid number!', 'error');
        return;
    }
    
    const finalValue = button.type === 'good' ? Math.abs(value) : -Math.abs(value);
    button.name = name;
    button.value = finalValue;
    
    addHistoryEntry(`Edited: ${name}`, 0, totalScore);
    saveToLocalStorage();
    renderButtons();
    showToast('Button updated', 'success');
}

async function resetScore() {
    const confirmed = await confirm('Reset daily score to 0?');
    if (!confirmed) return;
    
    playSound('click');
    dailyScore = 0;
    updateDailyScoreDisplay();
    addHistoryEntry('Daily Score Reset', 0, totalScore);
    saveToLocalStorage();
    showToast('Daily score reset', 'info');
}

// ======================
// SOUND SYSTEM
// ======================
function playSound(type) {
    if (!soundEnabled) return;
    
    const sound = sounds[type];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Audio play failed:", e));
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundToggle();
    playSound('click');
    showToast(soundEnabled ? 'Sound enabled' : 'Sound muted', 'info');
}

function updateSoundToggle() {
    const toggle = document.getElementById('soundToggle');
    if (toggle) {
        toggle.classList.toggle('muted', !soundEnabled);
        toggle.innerHTML = soundEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
    }
}

// ======================
// INITIALIZATION
// ======================
window.addEventListener('DOMContentLoaded', () => {
    // Load all data
    loadFromLocalStorage();
    
    // Set up daily reset check
    checkDailyReset();
    
    // Initialize UI
    initUI();
    
    // Start timers
    updateTimeDisplay();
    updateResetTimer();
    setInterval(updateTimeDisplay, 1000);
    setInterval(updateResetTimer, 1000);
    setInterval(checkForDailyReset, 60000); // Check every minute
    
    // Setup particles
    initParticles();
    
    // Add demo buttons if none exist
    if (buttons.length === 0) {
        setTimeout(() => {
            addDemoButtons();
        }, 1000);
    }
    
    // Set sound toggle state
    updateSoundToggle();
});

// ======================
// DAILY RESET SYSTEM
// ======================
function checkDailyReset() {
    const today = new Date().toDateString();
    
    if (today !== todaysDate) {
        // It's a new day!
        const yesterdayScore = dailyScore;
        
        // Save yesterday's score to history
        if (dailyScore !== 0) {
            addHistoryEntry(`📅 Daily Reset: ${dailyScore > 0 ? '+' : ''}${dailyScore} points`, 0, totalScore);
        }
        
        // Record yesterday in weekly history
        weeklyHistory.push({
            date: new Date(Date.now() - 86400000).toDateString(),
            score: dailyScore
        });
        
        // Keep only last 7 days
        if (weeklyHistory.length > 7) {
            weeklyHistory = weeklyHistory.slice(-7);
        }
        
        // Reset daily score
        dailyScore = 0;
        todaysDate = today;
        
        // Check for new week
        updateWeekTracking();
        
        // Update UI
        updateDailyScoreDisplay();
        updateBalanceDisplay();
        updateWeekDisplay();
        
        // Show reset notification
        showResetNotification(yesterdayScore);
        
        // Play reset sound
        playSound('reset');
        
        // Reset daily reset flag
        dailyResetDone = false;
        
        // Save to localStorage
        saveToLocalStorage();
    }
}

function checkForDailyReset() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Check if it's midnight (or close to it for testing)
    if (hours === 0 && minutes === 0 && !dailyResetDone) {
        checkDailyReset();
        dailyResetDone = true;
    }
}

function showResetNotification(yesterdayScore) {
    const notification = document.getElementById('resetNotification');
    const scoreElement = document.getElementById('yesterdayScore');
    
    scoreElement.textContent = yesterdayScore;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
    
    showToast(`Daily reset! Yesterday: ${yesterdayScore} points`, 'info');
}

// ======================
// WEEKLY TRACKING
// ======================
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function updateWeekTracking() {
    const today = new Date();
    const currentWeekNum = getWeekNumber(today);
    
    // Check if it's a new week
    if (currentWeekNum !== currentWeek) {
        // Reset weekly history
        weeklyHistory = [];
        currentWeek = currentWeekNum;
        
        // Update week badge
        updateWeekDisplay();
    }
}

function updateWeekDisplay() {
    const weekTotalElement = document.getElementById('weekTotal');
    const weekAverageElement = document.getElementById('weekAverage');
    const weekBadge = document.getElementById('weekBadge');
    const weekTimeLeft = document.getElementById('weekTimeLeft');
    
    if (weekTotalElement && weekAverageElement) {
        // Calculate weekly total
        const weekTotal = weeklyHistory.reduce((sum, day) => sum + day.score, 0);
        weekTotalElement.textContent = weekTotal;
        
        // Calculate average
        const daysWithData = weeklyHistory.filter(day => day.score !== 0).length;
        const weekAverage = daysWithData > 0 ? Math.round(weekTotal / daysWithData) : 0;
        weekAverageElement.textContent = weekAverage;
    }
    
    if (weekBadge) {
        weekBadge.textContent = `WEEK ${currentWeek}`;
    }
    
    if (weekTimeLeft) {
        // Calculate days until Sunday (end of week)
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysLeft = 7 - dayOfWeek;
        const hoursLeft = 23 - now.getHours();
        weekTimeLeft.textContent = `${daysLeft}d ${hoursLeft}h`;
    }
}

// ======================
// BALANCE MULTIPLIER SYSTEM - UPDATED TO 5x
// ======================
function calculateBalanceMultiplier() {
    // Calculate balance based on good vs bad totals
    const total = Math.abs(goodTotal) + Math.abs(badTotal);
    
    if (total === 0) {
        return { good: 1.0, bad: 1.0 };
    }
    
    // Calculate percentages
    const goodPercent = Math.abs(goodTotal) / total;
    const badPercent = Math.abs(badTotal) / total;
    
    // Determine which side is dominant
    let goodMultiplier = 1.0;
    let badMultiplier = 1.0;
    
    if (badPercent > goodPercent) {
        // Bad is dominant - boost good actions
        const imbalance = badPercent - goodPercent;
        // Up to 5x bonus for extreme imbalance
        goodMultiplier = 1.0 + (imbalance * 4); 
        goodMultiplier = Math.min(goodMultiplier, 5.0);
    } else if (goodPercent > badPercent) {
        // Good is dominant - boost bad actions
        const imbalance = goodPercent - badPercent;
        // Up to 5x penalty for extreme imbalance
        badMultiplier = 1.0 + (imbalance * 4);
        badMultiplier = Math.min(badMultiplier, 5.0);
    }
    
    return {
        good: parseFloat(goodMultiplier.toFixed(2)),
        bad: parseFloat(badMultiplier.toFixed(2))
    };
}

function updateBalanceDisplay() {
    const goodTotalElement = document.getElementById('goodTotal');
    const badTotalElement = document.getElementById('badTotal');
    const balanceMeter = document.getElementById('balanceMeter');
    const balanceIndicator = document.getElementById('balanceIndicator');
    const balanceDescription = document.getElementById('balanceDescription');
    const goodMultiplierValue = document.getElementById('goodMultiplierValue');
    const badMultiplierValue = document.getElementById('badMultiplierValue');
    
    if (goodTotalElement) goodTotalElement.textContent = goodTotal;
    if (badTotalElement) badTotalElement.textContent = Math.abs(badTotal);
    
    // Update balance meter (0-100% scale)
    const total = Math.abs(goodTotal) + Math.abs(badTotal);
    let meterPosition = 50; // Center position
    
    if (total > 0) {
        const goodPercent = Math.abs(goodTotal) / total;
        meterPosition = goodPercent * 100;
    }
    
    if (balanceMeter) {
        balanceMeter.style.width = `${meterPosition}%`;
    }
    
    // Get multipliers
    const multipliers = calculateBalanceMultiplier();
    
    // Update multiplier displays
    if (goodMultiplierValue) {
        goodMultiplierValue.textContent = `${multipliers.good.toFixed(1)}x`;
        if (multipliers.good > 3.0) {
            goodMultiplierValue.style.color = '#FFD700'; // Gold for high multiplier
        } else if (multipliers.good > 1.0) {
            goodMultiplierValue.style.color = '#43e97b'; // Green for bonus
        } else {
            goodMultiplierValue.style.color = 'var(--good-color)';
        }
    }
    
    if (badMultiplierValue) {
        badMultiplierValue.textContent = `${multipliers.bad.toFixed(1)}x`;
        if (multipliers.bad > 3.0) {
            badMultiplierValue.style.color = '#FF6B6B'; // Bright red for high multiplier
        } else if (multipliers.bad > 1.0) {
            badMultiplierValue.style.color = '#fa709a'; // Pink for penalty
        } else {
            badMultiplierValue.style.color = 'var(--bad-color)';
        }
    }
    
    // Update balance indicator
    if (balanceIndicator && balanceDescription) {
        if (multipliers.good >= 3.0 || multipliers.bad >= 3.0) {
            balanceIndicator.textContent = 'EXTREME';
            balanceIndicator.style.background = 'linear-gradient(135deg, #FF6B6B, #FFA500)';
            balanceDescription.textContent = multipliers.good > multipliers.bad 
                ? `Good actions get ×${multipliers.good.toFixed(1)} bonus!` 
                : `Bad actions get ×${multipliers.bad.toFixed(1)} penalty!`;
        } else if (multipliers.good > 1.0) {
            balanceIndicator.textContent = 'GOOD BOOST';
            balanceIndicator.style.background = 'rgba(67, 233, 123, 0.3)';
            balanceDescription.textContent = `Good actions get ×${multipliers.good.toFixed(1)} bonus!`;
        } else if (multipliers.bad > 1.0) {
            balanceIndicator.textContent = 'BAD BOOST';
            balanceIndicator.style.background = 'rgba(250, 112, 154, 0.3)';
            balanceDescription.textContent = `Bad actions get ×${multipliers.bad.toFixed(1)} penalty!`;
        } else {
            balanceIndicator.textContent = 'BALANCED';
            balanceIndicator.style.background = 'rgba(79, 172, 254, 0.3)';
            balanceDescription.textContent = 'Actions are balanced';
        }
    }
}

// ======================
// SCORE SYSTEM
// ======================
function updateScore(value, actionName = "Manual") {
    // Check for daily reset
    checkDailyReset();
    
    // Play sound
    if (value > 0) {
        playSound('positive');
    } else {
        playSound('negative');
    }
    
    // Calculate multipliers
    const multipliers = calculateBalanceMultiplier();
    let finalValue = value;
    let multiplierUsed = 1.0;
    
    if (value > 0) {
        // Good action
        multiplierUsed = multipliers.good;
        finalValue = Math.round(value * multiplierUsed);
        
        // Update good total
        goodTotal += finalValue;
    } else if (value < 0) {
        // Bad action
        multiplierUsed = multipliers.bad;
        finalValue = Math.round(value * multiplierUsed);
        
        // Update bad total
        badTotal += finalValue;
    }
    
    // Update scores
    dailyScore += finalValue;
    totalScore += finalValue;
    
    // Add to history
    addHistoryEntry(actionName, finalValue, totalScore, multiplierUsed);
    
    // Update UI
    updateDailyScoreDisplay();
    updateTotalScoreDisplay();
    updateBalanceDisplay();
    updateWeekDisplay();
    
    // Handle XP and leveling
    if (finalValue > 0) {
        const xpGained = Math.floor(finalValue);
        addXP(xpGained);
    }
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Check for achievements
    checkAchievements();
    
    // Visual feedback
    if (value > 0) {
        playSuccessAnimation();
    } else {
        playNegativeAnimation();
    }
}

function updateDailyScoreDisplay() {
    const scoreElement = document.getElementById('dailyScore');
    const scoreBadge = document.getElementById('scoreBadge');
    
    if (scoreElement) {
        scoreElement.textContent = dailyScore > 0 ? `+${dailyScore}` : dailyScore;
        
        // Color coding
        if (dailyScore > 50) {
            scoreElement.style.color = '#FFD700';
        } else if (dailyScore > 25) {
            scoreElement.style.color = '#43e97b';
        } else if (dailyScore > 0) {
            scoreElement.style.color = '#667eea';
        } else if (dailyScore < 0) {
            scoreElement.style.color = '#fa709a';
        } else {
            scoreElement.style.color = 'var(--text-primary)';
        }
        
        // Add animation class
        scoreElement.classList.add('pulse');
        setTimeout(() => scoreElement.classList.remove('pulse'), 500);
    }
    
    if (scoreBadge) {
        if (dailyScore >= 50) {
            scoreBadge.textContent = 'EXCELLENT';
            scoreBadge.style.background = 'rgba(255, 215, 0, 0.2)';
            scoreBadge.style.color = '#FFD700';
        } else if (dailyScore >= 25) {
            scoreBadge.textContent = 'GREAT';
            scoreBadge.style.background = 'rgba(67, 233, 123, 0.2)';
            scoreBadge.style.color = 'var(--good-color)';
        } else if (dailyScore >= 10) {
            scoreBadge.textContent = 'GOOD';
            scoreBadge.style.background = 'rgba(102, 126, 234, 0.2)';
            scoreBadge.style.color = 'var(--primary-color)';
        } else if (dailyScore > 0) {
            scoreBadge.textContent = 'OKAY';
            scoreBadge.style.background = 'rgba(102, 126, 234, 0.1)';
            scoreBadge.style.color = 'var(--primary-color)';
        } else if (dailyScore < 0) {
            scoreBadge.textContent = 'NEEDS WORK';
            scoreBadge.style.background = 'rgba(239, 68, 68, 0.2)';
            scoreBadge.style.color = 'var(--bad-color)';
        } else {
            scoreBadge.textContent = 'NEW DAY';
            scoreBadge.style.background = 'rgba(102, 126, 234, 0.2)';
            scoreBadge.style.color = 'var(--primary-color)';
        }
    }
}

function updateTotalScoreDisplay() {
    const totalElement = document.getElementById('totalScore');
    const totalBadge = document.getElementById('totalBadge');
    
    if (totalElement) {
        totalElement.textContent = totalScore;
        
        // Update color based on total
        if (totalScore >= 1000) {
            totalElement.style.color = '#FFD700';
        } else if (totalScore >= 500) {
            totalElement.style.color = '#FF6B6B';
        } else if (totalScore >= 250) {
            totalElement.style.color = '#f093fb';
        } else if (totalScore >= 100) {
            totalElement.style.color = '#667eea';
        }
    }
    
    if (totalBadge) {
        if (totalScore >= 1000) {
            totalBadge.textContent = 'LEGEND';
            totalBadge.style.background = 'rgba(255, 215, 0, 0.2)';
            totalBadge.style.color = '#FFD700';
        } else if (totalScore >= 500) {
            totalBadge.textContent = 'MASTER';
            totalBadge.style.background = 'rgba(255, 107, 107, 0.2)';
            totalBadge.style.color = '#FF6B6B';
        } else if (totalScore >= 250) {
            totalBadge.textContent = 'ADVANCED';
            totalBadge.style.background = 'rgba(240, 147, 251, 0.2)';
            totalBadge.style.color = '#f093fb';
        } else if (totalScore >= 100) {
            totalBadge.textContent = 'INTERMEDIATE';
            totalBadge.style.background = 'rgba(102, 126, 234, 0.2)';
            totalBadge.style.color = 'var(--primary-color)';
        } else if (totalScore >= 50) {
            totalBadge.textContent = 'BEGINNER';
            totalBadge.style.background = 'rgba(102, 126, 234, 0.2)';
            totalBadge.style.color = 'var(--primary-color)';
        } else {
            totalBadge.textContent = 'NEWBIE';
            totalBadge.style.background = 'rgba(102, 126, 234, 0.2)';
            totalBadge.style.color = 'var(--primary-color)';
        }
    }
}

// ======================
// PROGRESS & XP SYSTEM
// ======================
function addXP(amount) {
    if (amount <= 0) return false;
    
    const oldLevel = currentLevel;
    currentXP += amount;
    
    const xpNeededForNextLevel = (currentLevel + 1) * BASE_XP_PER_LEVEL;
    
    while (currentXP >= xpNeededForNextLevel) {
        currentLevel++;
        currentXP -= xpNeededForNextLevel;
        showLevelUpAnimation();
    }
    
    updateProgressDisplay();
    
    return oldLevel !== currentLevel;
}

function updateProgressDisplay() {
    const levelDisplay = document.getElementById('levelDisplay');
    const xpDisplay = document.getElementById('xpDisplay');
    const xpBarFill = document.getElementById('xpBarFill');
    
    if (levelDisplay) levelDisplay.textContent = currentLevel;
    if (xpDisplay) {
        const xpForNextLevel = (currentLevel + 1) * BASE_XP_PER_LEVEL;
        xpDisplay.textContent = `${currentXP}/${xpForNextLevel}`;
    }
    
    if (xpBarFill) {
        const xpForNextLevel = (currentLevel + 1) * BASE_XP_PER_LEVEL;
        const progressPercent = (currentXP / xpForNextLevel) * 100;
        xpBarFill.style.width = `${progressPercent}%`;
    }
}

function showLevelUpAnimation() {
    const levelDisplay = document.getElementById('levelDisplay');
    levelDisplay.classList.add('bounce');
    
    playSound('levelUp');
    showAchievementPopup(`🎉 Level Up! You reached Level ${currentLevel}!`);
    showToast(`Level Up! Reached Level ${currentLevel}!`, 'success');
    
    setTimeout(() => {
        levelDisplay.classList.remove('bounce');
    }, 1000);
}

// ======================
// BUTTON SYSTEM
// ======================
function addDemoButtons() {
    createButton('good', 'Morning Exercise', 5);
    createButton('good', 'Healthy Breakfast', 3);
    createButton('good', 'Work/Study Session', 4);
    createButton('good', 'Meditation', 2);
    createButton('good', 'Read a Book', 3);
    
    createButton('bad', 'Skipped Workout', -3);
    createButton('bad', 'Junk Food', -2);
    createButton('bad', 'Procrastination', -4);
    createButton('bad', 'Late Night', -3);
    createButton('bad', 'Missed Goal', -2);
    
    addHistoryEntry('System Initialized', 0, 0);
}

function createButton(type, name, value, id = null) {
    if (!id) {
        id = `btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    buttons.push({
        id: id,
        type: type,
        name: name,
        value: value
    });
    
    saveToLocalStorage();
    renderButtons();
    return id;
}

function renderButtons() {
    const goodContainer = document.getElementById('goodButtons');
    const badContainer = document.getElementById('badButtons');
    const goodCount = document.getElementById('goodCount');
    const badCount = document.getElementById('badCount');
    
    // Clear containers
    if (goodContainer) goodContainer.innerHTML = '';
    if (badContainer) badContainer.innerHTML = '';
    
    // Filter and sort buttons
    const goodButtons = buttons.filter(b => b.value > 0);
    const badButtons = buttons.filter(b => b.value < 0);
    
    goodButtons.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    badButtons.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    
    // Update counts
    if (goodCount) goodCount.textContent = goodButtons.length;
    if (badCount) badCount.textContent = badButtons.length;
    
    // Render good buttons
    goodButtons.forEach(button => {
        const btn = createButtonElement(button);
        if (goodContainer) goodContainer.appendChild(btn);
    });
    
    // Render bad buttons
    badButtons.forEach(button => {
        const btn = createButtonElement(button);
        if (badContainer) badContainer.appendChild(btn);
    });
}

function createButtonElement(buttonData) {
    const btn = document.createElement("button");
    btn.className = `action-button ${buttonData.type === 'good' ? 'good' : 'bad'}`;
    btn.id = buttonData.id;
    
    const multipliers = calculateBalanceMultiplier();
    const multiplier = buttonData.type === 'good' ? multipliers.good : multipliers.bad;
    const finalValue = Math.round(buttonData.value * multiplier);
    const displayValue = finalValue > 0 ? `+${finalValue}` : `${finalValue}`;
    
    btn.innerHTML = `
        <div class="action-button-content">
            <span class="button-name">${buttonData.name}</span>
            <span class="button-value">${displayValue}</span>
        </div>
    `;
    
    // Single click to use
    btn.onclick = function(e) {
        if (e.detail > 1) return; // Prevent double-click issues
        
        updateScore(buttonData.value, buttonData.name);
        
        // Visual feedback
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    };
    
    // Right-click for context menu
    btn.oncontextmenu = function(e) {
        e.preventDefault();
        playSound('click');
        showButtonContextMenu(e, buttonData);
        return false;
    };
    
    // Double-click to delete (using our UI confirm now)
    btn.ondblclick = function(e) {
        e.preventDefault();
        deleteButton(buttonData.id);
    };
    
    return btn;
}

function showButtonContextMenu(e, buttonData) {
    // Remove any existing context menu
    const existingMenu = document.querySelector('.context-menu');
    if (existingMenu) existingMenu.remove();
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.position = 'absolute';
    menu.style.left = `${e.pageX}px`;
    menu.style.top = `${e.pageY}px`;
    menu.style.background = 'var(--card-bg)';
    menu.style.border = '1px solid var(--card-border)';
    menu.style.borderRadius = '8px';
    menu.style.padding = '8px';
    menu.style.zIndex = '10000';
    menu.style.minWidth = '140px';
    menu.style.backdropFilter = 'blur(10px)';
    menu.style.fontSize = '0.9rem';
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.style.width = '100%';
    editBtn.style.padding = '8px';
    editBtn.style.background = 'none';
    editBtn.style.border = 'none';
    editBtn.style.color = 'var(--text-primary)';
    editBtn.style.textAlign = 'left';
    editBtn.style.cursor = 'pointer';
    editBtn.style.display = 'flex';
    editBtn.style.alignItems = 'center';
    editBtn.style.gap = '8px';
    editBtn.style.borderRadius = '4px';
    editBtn.onclick = () => {
        editButton(buttonData.id);
        menu.remove();
    };
    editBtn.onmouseenter = () => editBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    editBtn.onmouseleave = () => editBtn.style.background = 'none';
    
    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.style.width = '100%';
    deleteBtn.style.padding = '8px';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.color = 'var(--bad-color)';
    deleteBtn.style.textAlign = 'left';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.display = 'flex';
    deleteBtn.style.alignItems = 'center';
    deleteBtn.style.gap = '8px';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.onclick = () => {
        deleteButton(buttonData.id);
        menu.remove();
    };
    deleteBtn.onmouseenter = () => deleteBtn.style.background = 'rgba(239, 68, 68, 0.2)';
    deleteBtn.onmouseleave = () => deleteBtn.style.background = 'none';
    
    menu.appendChild(editBtn);
    menu.appendChild(deleteBtn);
    document.body.appendChild(menu);
    
    // Close menu when clicking elsewhere
    setTimeout(() => {
        const closeMenu = (clickEvent) => {
            if (!menu.contains(clickEvent.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 10);
}

// ======================
// HISTORY SYSTEM
// ======================
function addHistoryEntry(action, change, total, multiplier = 1) {
    const entry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: action,
        change: change,
        total: total,
        multiplier: multiplier,
        type: change > 0 ? 'good' : 'bad'
    };
    
    history.unshift(entry);
    
    // Keep only last 1000 entries
    if (history.length > 1000) {
        history = history.slice(0, 1000);
    }
    
    // Update stats
    updateStats();
}

function renderHistory() {
    const container = document.getElementById('historyList');
    if (!container) return;
    
    const searchTerm = document.getElementById('searchHistory')?.value.toLowerCase() || '';
    
    const filtered = history.filter(entry => 
        entry.action.toLowerCase().includes(searchTerm)
    );
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                <i class="fas fa-history fa-3x" style="margin-bottom: 20px;"></i>
                <p>No history yet. Start tracking your actions!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(entry => {
        const date = new Date(entry.timestamp);
        const timeStr = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const dateStr = date.toLocaleDateString();
        
        return `
            <div class="history-entry ${entry.type}">
                <div class="history-time">${dateStr}<br>${timeStr}</div>
                <div class="history-action">${entry.action}</div>
                <div class="history-change ${entry.change > 0 ? 'positive' : 'negative'}">
                    ${entry.change > 0 ? '+' : ''}${entry.change}
                </div>
                <div class="history-total">Total: ${entry.total}</div>
            </div>
        `;
    }).join('');
}

function filterHistory() {
    renderHistory();
}

// ======================
// GRAPH SYSTEM
// ======================
function updateGraph() {
    const canvas = document.getElementById('scoreChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const timeRange = document.getElementById('timeRange')?.value || '7';
    
    // Destroy existing chart
    if (scoreChart) {
        scoreChart.destroy();
    }
    
    // Prepare data
    let filteredHistory = [...history].reverse();
    
    if (timeRange !== 'all') {
        const daysAgo = parseInt(timeRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        
        filteredHistory = filteredHistory.filter(entry => 
            new Date(entry.timestamp) >= cutoffDate
        );
    }
    
    // Group by date
    const dailyData = {};
    let runningTotal = 0;
    
    if (filteredHistory.length > 0) {
        const firstDate = filteredHistory[0].timestamp.split('T')[0];
        dailyData[firstDate] = 0;
    }
    
    filteredHistory.forEach(entry => {
        const date = entry.timestamp.split('T')[0];
        if (!dailyData.hasOwnProperty(date)) {
            dailyData[date] = runningTotal;
        }
        runningTotal += entry.change;
        dailyData[date] = runningTotal;
    });
    
    const labels = Object.keys(dailyData);
    const data = Object.values(dailyData);
    
    // Create chart
    scoreChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Score',
                data: data,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        font: {
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#667eea',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
}

// ======================
// ACHIEVEMENTS SYSTEM
// ======================
function checkAchievements() {
    let newAchievements = [];
    
    // Check each achievement
    achievements.forEach(achievement => {
        if (!achievement.unlocked) {
            let unlocked = false;
            
            switch (achievement.id) {
                case 'first_100':
                    unlocked = totalScore >= 100;
                    break;
                case 'level_5':
                    unlocked = currentLevel >= 5;
                    break;
                case 'daily_50':
                    unlocked = dailyScore >= 50;
                    break;
                case 'balance_master':
                    // Check for 3 consecutive balanced days (within 20%)
                    const recentDays = weeklyHistory.slice(-3);
                    unlocked = recentDays.length >= 3 && 
                              recentDays.every(day => {
                                  const absScore = Math.abs(day.score);
                                  return absScore <= 10; // Less than 10 points difference
                              });
                    break;
                case 'multiplier_3x':
                    const multipliers = calculateBalanceMultiplier();
                    unlocked = multipliers.good >= 3.0 || multipliers.bad >= 3.0;
                    break;
                case 'multiplier_5x':
                    const multipliers2 = calculateBalanceMultiplier();
                    unlocked = multipliers2.good >= 5.0 || multipliers2.bad >= 5.0;
                    break;
                case 'streak_7':
                    // Check for 7 consecutive active days
                    unlocked = weeklyHistory.length >= 7;
                    break;
                case 'total_500':
                    unlocked = totalScore >= 500;
                    break;
            }
            
            if (unlocked) {
                achievement.unlocked = true;
                newAchievements.push(achievement);
            }
        }
    });
    
    // Show popup for new achievements
    if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
            showAchievementPopup(`🏆 ${achievement.name} Unlocked!`);
            showToast(`Achievement Unlocked: ${achievement.name}!`, 'success');
        });
        saveToLocalStorage();
    }
}

function showAchievementPopup(message) {
    const popup = document.getElementById('achievementPopup');
    const messageElement = document.getElementById('achievementMessage');
    
    if (popup && messageElement) {
        messageElement.textContent = message;
        popup.classList.add('show');
        
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    }
}

// ======================
// STATS SYSTEM
// ======================
function updateStats() {
    // Best day
    const dailyTotals = {};
    history.forEach(entry => {
        const date = entry.timestamp.split('T')[0];
        if (!dailyTotals[date]) dailyTotals[date] = 0;
        dailyTotals[date] += entry.change;
    });
    
    let bestDayValue = 0;
    Object.values(dailyTotals).forEach(total => {
        if (total > bestDayValue) bestDayValue = total;
    });
    
    // Active days
    const activeDays = Object.keys(dailyTotals).length;
    
    // Total actions
    const totalActions = history.length;
    
    // Win rate (positive actions / total actions)
    const positiveActions = history.filter(h => h.type === 'good').length;
    const winRate = totalActions > 0 ? Math.round((positiveActions / totalActions) * 100) : 0;
    
    // Update UI
    const bestDayElement = document.getElementById('bestDay');
    const activeDaysElement = document.getElementById('activeDays');
    const totalActionsElement = document.getElementById('totalActions');
    const winRateElement = document.getElementById('winRate');
    
    if (bestDayElement) bestDayElement.textContent = bestDayValue;
    if (activeDaysElement) activeDaysElement.textContent = activeDays;
    if (totalActionsElement) totalActionsElement.textContent = totalActions;
    if (winRateElement) winRateElement.textContent = `${winRate}%`;
}

// ======================
// UI FUNCTIONS
// ======================
function initUI() {
    // Update all displays
    updateDailyScoreDisplay();
    updateTotalScoreDisplay();
    updateBalanceDisplay();
    updateWeekDisplay();
    updateProgressDisplay();
    updateStats();
    
    // Render buttons
    renderButtons();
    
    // Set random daily message
    const messageElement = document.getElementById('dailyMessage');
    if (messageElement) {
        const randomMessage = dailyMessages[Math.floor(Math.random() * dailyMessages.length)];
        messageElement.querySelector('span').textContent = randomMessage;
    }
}

function updateTimeDisplay() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const timeElement = document.getElementById('currentTime');
    
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

function updateResetTimer() {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setDate(nextReset.getDate() + 1);
    nextReset.setHours(0, 0, 0, 0);
    
    const timeLeft = nextReset - now;
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const timerElement = document.getElementById('nextResetTime');
    if (timerElement) {
        timerElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

function openHistoryModal() {
    playSound('click');
    const modal = document.getElementById('historyModal');
    modal.classList.add('active');
    renderHistory();
    updateStats();
    
    setTimeout(() => {
        updateGraph();
    }, 100);
}

function closeHistoryModal() {
    playSound('click');
    const modal = document.getElementById('historyModal');
    modal.classList.remove('active');
}

function switchHistoryTab(tabName) {
    playSound('click');
    // Update tabs
    document.querySelectorAll('.modal-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.modal-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Update graph if needed
    if (tabName === 'graph') {
        setTimeout(() => {
            updateGraph();
        }, 50);
    }
}

// ======================
// DATA MANAGEMENT
// ======================
function saveToLocalStorage() {
    const data = {
        totalScore: totalScore,
        dailyScore: dailyScore,
        todaysDate: todaysDate,
        buttons: buttons,
        history: history,
        goodTotal: goodTotal,
        badTotal: badTotal,
        currentWeek: currentWeek,
        weeklyHistory: weeklyHistory,
        progress: {
            currentXP: currentXP,
            currentLevel: currentLevel
        },
        achievements: achievements,
        soundEnabled: soundEnabled,
        lastActivityDate: new Date().toDateString()
    };
    
    try {
        localStorage.setItem('dailyGrindData', JSON.stringify(data));
    } catch (e) {
        console.error('Error saving data:', e);
    }
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('dailyGrindData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            totalScore = data.totalScore || 0;
            dailyScore = data.dailyScore || 0;
            todaysDate = data.todaysDate || new Date().toDateString();
            buttons = data.buttons || [];
            history = data.history || [];
            goodTotal = data.goodTotal || 0;
            badTotal = data.badTotal || 0;
            currentWeek = data.currentWeek || getWeekNumber(new Date());
            weeklyHistory = data.weeklyHistory || [];
            achievements = data.achievements || achievements;
            soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
            
            if (data.progress) {
                currentXP = data.progress.currentXP || 0;
                currentLevel = data.progress.currentLevel || 1;
            }
            
            lastActivityDate = data.lastActivityDate || null;
            
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

function exportCompleteData() {
    playSound('click');
    const data = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        totalScore: totalScore,
        dailyScore: dailyScore,
        todaysDate: todaysDate,
        buttons: buttons,
        history: history,
        goodTotal: goodTotal,
        badTotal: badTotal,
        currentWeek: currentWeek,
        weeklyHistory: weeklyHistory,
        progress: {
            currentXP: currentXP,
            currentLevel: currentLevel
        },
        achievements: achievements,
        soundEnabled: soundEnabled
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-grind-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

function importCompleteData() {
    playSound('click');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                const confirmed = await confirm('Import will REPLACE all current data. Continue?');
                if (!confirmed) return;
                
                totalScore = data.totalScore || 0;
                dailyScore = data.dailyScore || 0;
                todaysDate = data.todaysDate || new Date().toDateString();
                buttons = data.buttons || [];
                history = data.history || [];
                goodTotal = data.goodTotal || 0;
                badTotal = data.badTotal || 0;
                currentWeek = data.currentWeek || getWeekNumber(new Date());
                weeklyHistory = data.weeklyHistory || [];
                
                if (data.progress) {
                    currentXP = data.progress.currentXP || 0;
                    currentLevel = data.progress.currentLevel || 1;
                }
                
                achievements = data.achievements || achievements;
                soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
                
                saveToLocalStorage();
                initUI();
                
                showToast('All data imported successfully!', 'success');
                
            } catch (error) {
                showToast('Error importing: ' + error.message, 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ======================
// VISUAL EFFECTS
// ======================
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    // Create particles - simplified
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 2 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(102, 126, 234, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animation = `float ${Math.random() * 10 + 10}s linear infinite`;
        container.appendChild(particle);
    }
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(10px, -10px) rotate(90deg); }
            50% { transform: translate(0, -20px) rotate(180deg); }
            75% { transform: translate(-10px, -10px) rotate(270deg); }
        }
    `;
    document.head.appendChild(style);
}

function playSuccessAnimation() {
    const dailyScoreElement = document.getElementById('dailyScore');
    if (dailyScoreElement) {
        dailyScoreElement.classList.add('pulse');
    }
}

function playNegativeAnimation() {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.style.animation = 'none';
        setTimeout(() => {
            appContainer.style.animation = 'shake 0.3s ease';
        }, 10);
        
        setTimeout(() => {
            appContainer.style.animation = '';
        }, 300);
    }
}

// Make UI functions globally available
window.uiAddButton = uiAddButton;
window.uiClearAllData = uiClearAllData;
window.uiClearHistory = uiClearHistory;
window.closeCustomModal = closeCustomModal;