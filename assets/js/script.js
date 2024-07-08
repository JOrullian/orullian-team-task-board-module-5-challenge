const formSubmit = $('#task-form-submit');
const taskTitleInput = $('#task-title-input');
const taskDueDateInput = $('#task-due-date-input');
const taskDescriptionInput = $('#task-description-input');

// Retrieve tasks and nextId from localStorage
function readTaskListFromStorage() {
let tasks = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

if (!tasks) {
    tasks = [];
  }

  return tasks;
};

// Accepts an array of projects, stringifys them, and saves them in localStorage.
function saveTasksToStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to create a task card
function createTaskCard(task) {
    const taskCard = $('<div>')
        .addClass('card text-center mb-3 my-3 draggable task-card')
        .attr('data-task-id', task.id);
    const cardTitle = $('<h5>')
        .addClass('card-title h4')
        .text(task.title);
    const cardBody = $('<div>')
        .addClass('card-body');
    const cardDueDate = $('<h6>')
        .addClass('card-subtitle mb-2 text-body-secondary')
        .text(task.dueDate);
    const cardDescription = $('<p>')
        .addClass('card-text')
        .text(task.description);
    const cardDeleteButton = $('<btn>')
        .addClass('btn btn-danger delete')
        .text('Delete')
        .attr('data-task-id', task.id);
    cardDeleteButton.on('click', handleDeleteTask);

    // Set background color based on due date
    if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text white');
        }
    }


    // Append elements to taskCard div element
    cardBody.append(cardDueDate, cardDescription);
    taskCard.append(cardTitle, cardBody, cardDeleteButton);

    // Return taskCard so it can be appended to swim lanes
    return taskCard;
};

// Function to render the task list and make cards draggable
function renderTaskList() {
    const tasks = readTaskListFromStorage();

    const toDoList = $('#todo-cards');
    toDoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();

    // Allow tasks to be added to each of the three lanes
    for (let task of tasks) {
        if (task.status === 'to-do') {
            toDoList.append(createTaskCard(task));
        } else if (task.status === 'in-progress') {
            inProgressList.append(createTaskCard(task));
        } else if (task.status === 'done') {
            doneList.append(createTaskCard(task));
        }
    }

    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        revert: 'invalid',
    });
}

// Function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();

    const taskTitle = taskTitleInput.val().trim();
    const taskDueDate = taskDueDateInput.val();
    const taskDescription = taskDescriptionInput.val();

    const newTask = {
    id: crypto.randomUUID(),
    title: taskTitle,
    dueDate: taskDueDate,
    description: taskDescription,
    status: 'to-do',
    };

    // Pull the projects from localStorage and push the new project to the array
    const tasks = readTaskListFromStorage();
    tasks.push(newTask);

    saveTasksToStorage(tasks);

    renderTaskList();

    // Hide modal after submission
    $('#formModal').modal('hide');

    // Reset modal inputs after submission
    taskTitleInput.val('');
    taskDueDateInput.val('');
    taskDescriptionInput.val('');
}

formSubmit.on('click', handleAddTask);

// Function to handle deleting a task
function handleDeleteTask(event){
    const taskId = $(this).attr('data-task-id');
    const tasks = readTaskListFromStorage();

    tasks.forEach((task) => {
        if (task.id === taskId) {
            tasks.splice(tasks.indexOf(tasks), 1);
        }
    });

    saveTasksToStorage(tasks);

    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const tasks = readTaskListFromStorage();

    const taskId = ui.draggable[0].dataset.taskId;

    const newStatus = event.target.id;

    for (let task of tasks) {
        if (task.id === taskId) {
            task.status = newStatus;
        }
    }
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    renderTaskList();

    $('#task-due-date-input').datepicker({
        changeMonth: true,
        changeYear: true,
    });

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });
});