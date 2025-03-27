document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const categoryInput = document.getElementById("categoryInput");
    const dueDateInput = document.getElementById("dueDateInput");
    const priorityInput = document.getElementById("priorityInput");
    const taskList = document.getElementById("taskList");
    const clearButton = document.getElementById("clearButton");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const totalTasks = document.getElementById("totalTasks");
    const completedTasks = document.getElementById("completedTasks");
    const syncCalendar = document.getElementById("syncCalendar");
    const voiceCommandButton = document.getElementById("voiceCommandButton");

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function updateTaskCount() {
        totalTasks.textContent = tasks.length;
        completedTasks.textContent = tasks.filter(task => task.completed).length;
    }

    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task, index) => {
            let li = document.createElement("li");
            // li.draggable = true;
            li.dataset.index = index;

            li.innerHTML = `
                <span class="${task.completed ? "completed" : ""} ${task.priority}">
                    ${task.text} (${task.category}, Due: ${task.dueDate || "No date"})
                </span>
                <div>
                    <button class="complete-btn" data-index="${index}">✔</button>
                    <button class="delete-btn" data-index="${index}">❌</button>
                </div>
            `;
            taskList.appendChild(li);
        });
        updateTaskCount();
        enableTaskReminders();
    }

    taskForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        const category = categoryInput.value;
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;

        if (taskText === "") return;

        tasks.push({ text: taskText, category, dueDate, priority, completed: false });
        taskInput.value = "";
        saveTasks();
        renderTasks();
    });

    taskList.addEventListener("click", function (e) {
        const index = e.target.getAttribute("data-index");
        if (e.target.classList.contains("complete-btn")) {
            tasks[index].completed = !tasks[index].completed;
        } else if (e.target.classList.contains("delete-btn")) {
            tasks.splice(index, 1);
        }
        saveTasks();
        renderTasks();
    });

    clearButton.addEventListener("click", function () {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    });

    // Dark Mode Toggle
    darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
    });

    // Task Reminders
    function enableTaskReminders() {
        tasks.forEach(task => {
            if (task.dueDate) {
                let dueDate = new Date(task.dueDate).getTime();
                let now = new Date().getTime();
                let timeLeft = dueDate - now;

                if (timeLeft > 0) {
                    setTimeout(() => {
                        playReminderSound();
                        alert(`Reminder: Task "${task.text}" is due today!`);
                    }, timeLeft, 1000);
                }
            }
        });
    }

    function playReminderSound() {
        let audio = new Audio();
        audio.play("iphone_alarm.mp3");
    }

    // Google Calendar Sync
    syncCalendar.addEventListener("click", function () {
        tasks.forEach(task => {
            if (task.dueDate) {
                let googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.text)}&dates=${task.dueDate.replace(/-/g, '')}/${task.dueDate.replace(/-/g, '')}`;
                window.open(googleCalendarLink, "_blank");
            }
        });
    });

    // Voice Commands
    voiceCommandButton.addEventListener("click", function () {
        let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.start();

        recognition.onresult = function (event) {
            let speechResult = event.results[0][0].transcript.toLowerCase();
            alert(`You said: "${speechResult}"`);

            if (speechResult.includes("add task")) {
                let taskName = speechResult.replace("add task", "").trim();
                if (taskName) {
                    tasks.push({ text: taskName, category: "personal", dueDate: "", priority: "medium", completed: false });
                    saveTasks();
                    renderTasks();
                }
            }
        };
    });

    renderTasks();
});
