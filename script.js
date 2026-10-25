const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modal = document.querySelector(".modal");
const taskForm = document.getElementById("taskForm");
const tasksContainer = document.getElementById("tasksContainer");
const modalTitle = document.getElementById("modalTitle");
const addTaskBtn = document.getElementById("addTaskBtn");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const sortTasks = document.getElementById("sortTasks");


let tasks = [];
let editingTaskId = null;
const totalTasks = document.getElementById("totalTasks");
const highPriority = document.getElementById("highPriority");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const emptyState = document.getElementById("emptyState");

let currentFilter = "all";

function applyFilters() {

    const searchTerm = searchInput.value.toLowerCase();

    let anyVisible = 0;

    const taskCards = document.querySelectorAll(".task-card");

    taskCards.forEach(card => {

        const title = card.querySelector("h3").textContent.toLowerCase();

        const description =
            card.querySelector(".task-description").textContent.toLowerCase();

        const purpose =
            card.querySelector(".task-detail:nth-child(1) p").textContent.toLowerCase();

        const motivation =
            card.querySelector(".task-detail:nth-child(2) p").textContent.toLowerCase();

        const growthCheck =
            card.querySelector(".task-detail:nth-child(3) p").textContent.toLowerCase();

        const searchMatches =
            title.includes(searchTerm) ||
            description.includes(searchTerm) ||
            purpose.includes(searchTerm) ||
            motivation.includes(searchTerm) ||
            growthCheck.includes(searchTerm);

        const filterMatches =
            currentFilter === "all" ||
            card.querySelector(".status").classList.contains(currentFilter) ||
            card.querySelector(".priority").classList.contains(currentFilter);

        if (searchMatches && filterMatches) {
            card.style.display = "";
            anyVisible++;

        } else {
            card.style.display = "none";
        }
    });

    if (anyVisible === 0) {
        emptyState.classList.remove("hidden");

    } else {
        emptyState.classList.add("hidden");
    }
}


function sortTasksList() {
    const sortBy = sortTasks.value;

    const priorityOrder = {
        high: 3,
        medium: 2,
        low: 1
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (sortBy === "newest") {
            return (b.createdAt || b.id) - (a.createdAt || a.id);
        }

        if (sortBy === "oldest") {
            return (a.createdAt || a.id) - (b.createdAt || b.id);
        }

        if (sortBy === "dueDate") {
            // Tasks without due dates should appear last.
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            return new Date(a.dueDate) - new Date(b.dueDate);
        }

        if (sortBy === "priority") {
            return priorityOrder[b.priority] -
                   priorityOrder[a.priority];
        }

        return 0;
    });

    sortedTasks.forEach(task => {
        const taskCard = tasksContainer.querySelector(
            `.task-card[data-id="${task.id}"]`
        );

        if (taskCard) {
            tasksContainer.appendChild(taskCard);
        }

    });

    applyFilters();
}


sortTasks.addEventListener("change", () => {
  sortTasksList();
});

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        applyFilters();
    });

});


searchInput.addEventListener("input", () => {

    applyFilters();
});

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateDashboard() {

    totalTasks.textContent = tasks.length;

    highPriority.textContent = tasks.filter(task => task.priority === "high").length;

    pendingTasks.textContent = tasks.filter(task => task.status === "pending").length;

    completedTasks.textContent = tasks.filter(task => task.status === "completed").length;
}

function showToast(message) {

    toastMessage.textContent = message;

    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 2000);
}


openModalBtn.addEventListener("click", () => {

    editingTaskId = null;

    modalTitle.textContent = "Add a New Task";
    addTaskBtn.textContent = "Add Task";

    taskForm.reset();

    modal.classList.remove("hidden");
});

closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");

    taskForm.reset();

    editingTaskId = null;
});

modal.addEventListener("click", (event) => {

    if (event.target === modal) {
        modal.classList.add("hidden");
    }

});

function createTaskCard(task) {
    const taskCard = document.createElement("div");

    taskCard.className = "task-card";
    taskCard.dataset.id = task.id;

    taskCard.innerHTML = ` 
    <div class="task-header">
        <h3>${task.title}</h3>

        <span class="priority ${task.priority}">
          ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
    </div>

    <p class="task-description">
       ${task.description}
    </p>

    <div class="task-info">
        <div class="task-detail">
            <i class="fa-solid fa-bullseye"></i>

            <div> 
                <small>Purpose</small>
                <p>
                   ${task.purpose}
                </p>
            </div>
        </div>

        <div class="task-detail">
            <i class="fa-solid fa-lightbulb"></i>

            <div>
                <small>Motivation</small>
                <p>
                    ${task.motivation}
                </p>
            </div>
        </div>

        <div class="task-detail">
            <i class="fa-solid fa-chart-line"></i>

            <div>
                <small>Growth Check</small>
                <p>
                    ${task.growthCheck || "Add after completing the task."}
                </p>
            </div>
        </div>
    </div>

    <div class="task-footer">
        <span class="due-date">
            <i class="fa-regular fa-calendar"></i>
            ${task.dueDate || "No due date"}
        </span>

        <button class="status ${task.status}" type="button">
            ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </button>

        <div class="task-actions">
            <button class="edit-task" type="button">
                <i class="fa-solid fa-pen"></i>
            </button>

            <button class="delete-task" type="button">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>  
    </div>`;

    tasksContainer.appendChild(taskCard);

    const statusButton = taskCard.querySelector(".status");

    statusButton.addEventListener("click", () => {

        task.status = task.status === "pending"
            ? "completed"
            : "pending";

        saveTasks();

        statusButton.className = `status ${task.status}`;

        statusButton.textContent =
            task.status.charAt(0).toUpperCase() + task.status.slice(1);

        updateDashboard();

        showToast(
            task.status === "completed"
                ? "Task marked as completed!"
                : "Task moved back to pending!"
        )
    });

    const deleteButton = taskCard.querySelector(".delete-task");

    deleteButton.addEventListener("click", () => {

        const confirmDelete = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) {
            return;
        }

        tasks = tasks.filter(taskItem => taskItem.id !== task.id);

        saveTasks();
        taskCard.remove();

        updateDashboard();

        showToast("Task deleted successfully!");
    });

    const editButton = taskCard.querySelector(".edit-task");

    editButton.addEventListener("click", () => {

        editingTaskId = task.id;
    
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDescription").value = task.description;
        document.getElementById("taskPurpose").value = task.purpose;
        document.getElementById("taskMotivation").value = task.motivation;
        document.getElementById("growthCheck").value = task.growthCheck;
        document.getElementById("taskPriority").value = task.priority;
        document.getElementById("taskDueDate").value = task.dueDate;

        modalTitle.textContent = "Edit Task";
        addTaskBtn.textContent = "Update Task";

        modal.classList.remove("hidden");
    });
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
    const purpose = document.getElementById("taskPurpose").value;
    const motivation = document.getElementById("taskMotivation").value;
    const growthCheck = document.getElementById("growthCheck").value;
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;

    if (editingTaskId !== null) { 

        const task = tasks.find(task => task.id === editingTaskId);

        task.title = title;
        task.description = description;
        task.purpose = purpose;
        task.motivation = motivation;
        task.growthCheck = growthCheck;
        task.priority = priority;
        task.dueDate = dueDate;

        saveTasks();

        const taskCard = document.querySelector(`.task-card[data-id="${editingTaskId}"]`
        );

    taskCard.remove();
    createTaskCard(task);

    updateDashboard();
    showToast("Task updated successfully!");

    editingTaskId = null;

    } else { 

        const task = {
            id: Date.now(),
            createdAt: Date.now(),
            title,
            description,
            purpose,
            motivation,
            growthCheck,
            priority,
            dueDate,
            status: "pending"
        };

        tasks.push(task);
        saveTasks();

        createTaskCard(task);

        updateDashboard();

        showToast("Task added successfully!");
    }

    modal.classList.add("hidden");
    taskForm.reset();
});


function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");

    if (!savedTasks) {
       return;
    }

    tasks = JSON.parse(savedTasks);

    tasks.forEach(task => {

        if (!task.id) {
            task.id = Date.now();
        }

        if (!task.status) {
            task.status = "pending";
        }

        createTaskCard(task);
    });

    saveTasks();
}

loadTasks();
updateDashboard();