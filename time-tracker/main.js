// Initialize timers with empty array
let timers = [];

// DOM Elements
const container = document.getElementById("timers");
const addTimerBtn = document.getElementById("addTimerBtn");
const importJsonBtn = document.getElementById("importJsonBtn");
const exportJsonBtn = document.getElementById("exportJsonBtn");
const timerForm = document.getElementById("timerForm");
const isHolidayCheckbox = document.getElementById("isHoliday");
const endDateGroup = document.getElementById("endDateGroup");

// Modals
const addTimerModal = document.getElementById("addTimerModal");
const jsonModal = document.getElementById("jsonModal");
const jsonModalTitle = document.getElementById("jsonModalTitle");
const jsonData = document.getElementById("jsonData");
const confirmJsonBtn = document.getElementById("confirmJsonBtn");

// UI Notification elements
const notifBox = document.getElementById("uiNotification");
const notifIcon = document.getElementById("notifIcon");
const notifMessage = document.getElementById("notifMessage");
const notifActions = document.getElementById("notifActions");
let notifTimeout = null;

// ===== UI NOTIFICATION SYSTEM =====
function showNotification({ message, type = "info", duration = 3000, actions = [] }) {
  // Clear any pending timeout
  if (notifTimeout) {
    clearTimeout(notifTimeout);
    notifTimeout = null;
  }

  // Set icon based on type
  const icons = {
    info: "🔔",
    warning: "⚠️",
    error: "❌",
    success: "✅",
    confirm: "❓"
  };
  notifIcon.textContent = icons[type] || "🔔";

  // Set message and styling
  notifMessage.textContent = message;
  notifBox.className = `ui-notification ${type}`;
  
  // Clear and rebuild action buttons
  notifActions.innerHTML = "";
  if (actions.length > 0) {
    actions.forEach(action => {
      const btn = document.createElement("button");
      btn.textContent = action.label;
      btn.onclick = (e) => {
        e.stopPropagation();
        action.handler();
        hideNotification();
      };
      notifActions.appendChild(btn);
    });
    notifBox.classList.add("confirm");
  } else {
    notifBox.classList.remove("confirm");
  }

  // Show notification
  notifBox.style.display = "flex";
  // Force reflow to trigger animation
  void notifBox.offsetWidth;
  notifBox.classList.add("show");

  // Auto-hide if no actions
  if (actions.length === 0 && duration > 0) {
    notifTimeout = setTimeout(hideNotification, duration);
  }
}

function hideNotification() {
  notifBox.classList.remove("show");
  if (notifTimeout) {
    clearTimeout(notifTimeout);
    notifTimeout = null;
  }
  // Wait for transition to complete before hiding
  setTimeout(() => {
    if (!notifBox.classList.contains("show")) {
      notifBox.style.display = "none";
    }
  }, 300);
}

// Promise-based confirm (replaces built-in confirm)
function uiConfirm(message) {
  return new Promise((resolve) => {
    showNotification({
      message: message,
      type: "confirm",
      duration: 0,
      actions: [
        { label: "✓ Yes", handler: () => resolve(true) },
        { label: "✗ No", handler: () => resolve(false) }
      ]
    });
  });
}

// Close buttons for modals
document.querySelectorAll(".close").forEach(btn => {
  btn.addEventListener("click", () => {
    addTimerModal.style.display = "none";
    jsonModal.style.display = "none";
  });
});

// Modal controls
addTimerBtn.addEventListener("click", () => {
  // Reset form for new timer
  timerForm.reset();
  isHolidayCheckbox.checked = false;
  endDateGroup.style.display = "none";
  document.getElementById("endDate").value = "";
  document.getElementById("endTime").value = "23:59";
  document.getElementById("modalTitle").textContent = "Add New Timer";
  document.getElementById("formSubmitBtn").textContent = "Add Timer";
  delete timerForm.dataset.editIndex;
  addTimerModal.style.display = "block";
});

// Toggle end date fields when holiday checkbox changes
isHolidayCheckbox.addEventListener("change", () => {
  endDateGroup.style.display = isHolidayCheckbox.checked ? "block" : "none";
});

// Handle form submission (add or edit)
timerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  const eventName = document.getElementById("eventName").value.trim();
  const eventDate = document.getElementById("eventDate").value;
  const eventTime = document.getElementById("eventTime").value;
  const isHoliday = isHolidayCheckbox.checked;
  
  if (!eventName || !eventDate || !eventTime) {
    showNotification({ message: "Please fill in all fields", type: "warning", duration: 2500 });
    return;
  }
  
  const dateTimeString = `${eventDate}T${eventTime}:00`;
  
  if (isNaN(new Date(dateTimeString).getTime())) {
    showNotification({ message: "Invalid date/time combination", type: "error", duration: 2500 });
    return;
  }
  
  // Get end date if it's a multi-day holiday
  let endDate = null;
  if (isHoliday && endDateGroup.style.display === "block") {
    const endDateInput = document.getElementById("endDate").value;
    const endTimeInput = document.getElementById("endTime").value;
    
    if (endDateInput) {
      endDate = `${endDateInput}T${endTimeInput || "23:59"}:00`;
      if (isNaN(new Date(endDate).getTime())) {
        showNotification({ message: "Invalid end date/time", type: "error", duration: 2500 });
        return;
      }
    }
  }
  
  const newTimer = { 
    event: eventName, 
    date: dateTimeString,
    endDate: endDate,
    isHoliday: isHoliday
  };

  const editIndex = timerForm.dataset.editIndex;
  
  if (editIndex !== undefined) {
    // Update existing timer
    timers[editIndex] = newTimer;
    showNotification({ message: "Timer updated successfully", type: "success", duration: 2000 });
    delete timerForm.dataset.editIndex;
  } else {
    // Add new timer
    timers.push(newTimer);
    showNotification({ message: "Timer added successfully", type: "success", duration: 2000 });
  }
  
  saveTimers();
  renderTimers();
  
  timerForm.reset();
  isHolidayCheckbox.checked = false;
  endDateGroup.style.display = "none";
  addTimerModal.style.display = "none";
});

// JSON Import Function
function importJsonData(jsonString) {
  try {
    const importedTimers = JSON.parse(jsonString);
    
    if (!Array.isArray(importedTimers)) {
      throw new Error("Data must be an array of timer objects");
    }
    
    importedTimers.forEach(timer => {
      if (typeof timer !== 'object' || timer === null) {
        throw new Error("Each timer must be an object");
      }
      if (!timer.event || typeof timer.event !== 'string') {
        throw new Error("Each timer must have a string 'event' property");
      }
      if (!timer.date || typeof timer.date !== 'string') {
        throw new Error("Each timer must have a string 'date' property");
      }
      if (isNaN(new Date(timer.date).getTime())) {
        throw new Error(`Invalid date format for event: ${timer.event}`);
      }
      if (timer.endDate && isNaN(new Date(timer.endDate).getTime())) {
        throw new Error(`Invalid endDate format for event: ${timer.event}`);
      }
    });
    
    timers = importedTimers;
    saveTimers();
    renderTimers();
    return true;
  } catch (error) {
    console.error("JSON Import Error:", error);
    showNotification({ message: `Failed to import JSON: ${error.message}`, type: "error", duration: 3500 });
    return false;
  }
}

// JSON Import Button
importJsonBtn.addEventListener("click", () => {
  jsonModalTitle.textContent = "Import JSON";
  jsonData.placeholder = 'Paste your JSON data here...\nExample:\n[\n  {\n    "event": "Event Name",\n    "date": "2025-01-01T00:00:00",\n    "isHoliday": false\n  }\n]';
  jsonData.value = "";
  jsonData.readOnly = false;
  jsonModal.style.display = "block";
});

// JSON Export Button
exportJsonBtn.addEventListener("click", () => {
  jsonModalTitle.textContent = "Export JSON";
  jsonData.value = JSON.stringify(timers, null, 2);
  jsonData.readOnly = true;
  jsonModal.style.display = "block";
});

// Confirm JSON Button
confirmJsonBtn.addEventListener("click", () => {
  if (jsonModalTitle.textContent === "Export JSON") {
    jsonModal.style.display = "none";
    return;
  }
  
  const jsonString = jsonData.value.trim();
  if (!jsonString) {
    showNotification({ message: "Please paste JSON data first", type: "warning", duration: 2500 });
    return;
  }
  
  if (importJsonData(jsonString)) {
    jsonModal.style.display = "none";
    jsonData.value = "";
    showNotification({ message: "JSON imported successfully", type: "success", duration: 2500 });
  }
});

// Save timers to local storage
function saveTimers() {
  localStorage.setItem("timers", JSON.stringify(timers));
}

// Load timers from local storage
function loadTimers() {
  const savedTimers = localStorage.getItem("timers");
  if (savedTimers) {
    timers = JSON.parse(savedTimers);
  } else {
    loadDefaultHolidays();
  }
}

// Load default holidays
function loadDefaultHolidays() {
  timers = [
    { event: "School Start", date: "2025-09-05T08:00:00", isHoliday: false },
    { event: "Final Exam", date: "2026-06-08T08:00:00", isHoliday: false },
    { event: "Mock Exam", date: "2026-05-01T08:00:00", isHoliday: false },
    { event: "الفترة البينية الأولى", date: "2025-10-19T00:00:00", endDate: "2025-10-26T23:59:59", isHoliday: true },
    { event: "عيد المولد النبوي", date: "2025-09-04T00:00:00", isHoliday: true },
    { event: "المسيرة الخضراء", date: "2025-11-06T00:00:00", isHoliday: true },
    { event: "عيد الاستقلال", date: "2025-11-18T00:00:00", isHoliday: true },
    { event: "الفترة البينية الثانية", date: "2025-12-07T00:00:00", endDate: "2025-12-14T23:59:59", isHoliday: true },
    { event: "New Year", date: "2026-01-01T00:00:00", isHoliday: true },
    { event: "وثيقة الاستقلال", date: "2026-01-11T00:00:00", isHoliday: true },
    { event: "أمازيغي", date: "2026-01-14T00:00:00", isHoliday: true },
    { event: "منتصف السنة", date: "2026-01-25T00:00:00", endDate: "2026-02-08T23:59:59", isHoliday: true },
    { event: "الفترة البينية الثالثة", date: "2026-03-15T00:00:00", endDate: "2026-03-22T23:59:59", isHoliday: true },
    { event: "عيد الفطر", date: "2026-03-18T00:00:00", isHoliday: true },
    { event: "Labor Day", date: "2026-05-01T00:00:00", isHoliday: true },
    { event: "الفترة البينية الرابعة", date: "2026-05-03T00:00:00", endDate: "2026-05-10T23:59:59", isHoliday: true },
    { event: "عيد الأضحى", date: "2026-06-06T00:00:00", endDate: "2026-06-08T23:59:59", isHoliday: true },
    { event: "محرم", date: "2026-06-16T00:00:00", isHoliday: true }
  ];
  saveTimers();
}

// Render all timers
function renderTimers() {
  container.innerHTML = "";
  if (timers.length === 0) {
    container.innerHTML = '<div class="empty-state">No timers yet. Add one to get started!</div>';
    return;
  }
  
  // Sort timers by date (earliest first)
  timers.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  timers.forEach((timer, index) => {
    const el = document.createElement("div");
    el.className = "timer";
    if (timer.isHoliday) {
      el.classList.add("holiday");
    }
    
    const dateText = timer.endDate 
      ? `${formatDate(new Date(timer.date))} - ${formatDate(new Date(timer.endDate))}`
      : formatDateTime(new Date(timer.date));
    
    el.innerHTML = `
      <div class="event-name">${escapeHtml(timer.event)}</div>
      <div class="date">${escapeHtml(dateText)}</div>
      <div class="time" id="time-${index}">
        <div class="unit"><span>--</span>Days</div>
        <div class="unit"><span>--</span>Hrs</div>
        <div class="unit"><span>--</span>Min</div>
        <div class="unit"><span>--</span>Sec</div>
      </div>
      <div class="btns">
        <button class="edit-btn" data-index="${index}">Edit</button>
        <button class="delete-btn" data-index="${index}">Remove</button>
      </div>
    `;
    container.appendChild(el);
  });

  // Attach event listeners
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;
      editTimer(Number(index));
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const index = Number(e.target.dataset.index);
      const confirmed = await uiConfirm(`Remove "${timers[index].event}"?`);
      if (confirmed) {
        timers.splice(index, 1);
        saveTimers();
        renderTimers();
        showNotification({ message: "Timer removed", type: "success", duration: 1500 });
      }
    });
  });
}

// Helper: escape HTML to prevent XSS
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Format date for display (without time)
function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

// Format date with time for display
function formatDateTime(date) {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Update timer displays
function updateTimers() {
  const now = new Date();
  
  timers.forEach((timer, index) => {
    const timerEl = document.querySelectorAll(".timer")[index];
    if (!timerEl) return;
    
    const timeEl = document.getElementById(`time-${index}`);
    if (!timeEl) return;

    const start = new Date(timer.date);
    const end = timer.endDate ? new Date(timer.endDate) : null;

    // Check if currently in a multi-day holiday
    if (end && now >= start && now <= end) {
      timerEl.classList.add("holiday");
      timerEl.classList.remove("ended");
      timeEl.innerHTML = `<div class="unit"><span>⏳</span>Happening</div>`;
      return;
    }

    // Check if event has ended
    if (end && now > end) {
      timerEl.classList.add("ended", "holiday");
      timeEl.innerHTML = `<div class="unit"><span>0</span>Passed</div>`;
      return;
    }

    if (!end && now > start) {
      timerEl.classList.add("ended");
      timeEl.innerHTML = `<div class="unit"><span>0</span>Done</div>`;
      return;
    }

    // Upcoming event: show countdown
    const diff = start - now;
    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
    const minutes = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
    const seconds = Math.max(0, Math.floor((diff / 1000) % 60));

    timerEl.classList.remove("ended");
    if (timer.isHoliday) timerEl.classList.add("holiday");

    timeEl.innerHTML = `
      <div class="unit"><span>${days}</span>Days</div>
      <div class="unit"><span>${hours}</span>Hrs</div>
      <div class="unit"><span>${minutes}</span>Min</div>
      <div class="unit"><span>${seconds}</span>Sec</div>
    `;
  });
}

// Edit a timer
function editTimer(index) {
  const timer = timers[index];
  const dateObj = new Date(timer.date);
  
  const dateStr = dateObj.toISOString().split("T")[0];
  const timeStr = `${String(dateObj.getHours()).padStart(2, "0")}:${String(dateObj.getMinutes()).padStart(2, "0")}`;
  
  document.getElementById("eventName").value = timer.event;
  document.getElementById("eventDate").value = dateStr;
  document.getElementById("eventTime").value = timeStr;
  isHolidayCheckbox.checked = timer.isHoliday;
  
  if (timer.endDate) {
    const endDateObj = new Date(timer.endDate);
    const endDateStr = endDateObj.toISOString().split("T")[0];
    const endTimeStr = `${String(endDateObj.getHours()).padStart(2, "0")}:${String(endDateObj.getMinutes()).padStart(2, "0")}`;
    
    document.getElementById("endDate").value = endDateStr;
    document.getElementById("endTime").value = endTimeStr;
    endDateGroup.style.display = "block";
  } else {
    document.getElementById("endDate").value = "";
    document.getElementById("endTime").value = "23:59";
    endDateGroup.style.display = "none";
  }
  
  document.getElementById("modalTitle").textContent = "Edit Timer";
  document.getElementById("formSubmitBtn").textContent = "Update Timer";
  timerForm.dataset.editIndex = index;
  addTimerModal.style.display = "block";
}

// Initialize the app
function init() {
  loadTimers();
  renderTimers();
  setInterval(updateTimers, 1000);
  
  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === addTimerModal) addTimerModal.style.display = "none";
    if (e.target === jsonModal) jsonModal.style.display = "none";
  });
}

// Start the application
init();