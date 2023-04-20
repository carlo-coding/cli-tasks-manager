const inquirer = require("inquirer");
const { displayTasks, displayResults, formatTask } = require("../utils");
const { assignTasks, uuidv4 } = require("../functions");
const dbFunctions = require("../database");
const { getGroups, getTasks, getDays } = require("../operations/dbOperations");

async function tasksMenu(goBack) {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "Add a task",
        "Edit a task",
        "Delete a task",
        "View all tasks",
        "Remove repetition",
        "Run assignTasks",
        "Complete day's tasks",
        "Back",
      ],
    },
  ]);
  const returnToMenu = () => tasksMenu(goBack);
  switch (action) {
    case "Add a task":
      handleAddTask(returnToMenu);
      break;
    case "Edit a task":
      handleEditTask(returnToMenu);
      break;
    case "Delete a task":
      handleDeleteTask(returnToMenu);
      break;
    case "View all tasks":
      handleSeeAllTasks(returnToMenu);
      break;
    case "Remove repetition":
      handleRemoveRepetition(returnToMenu);
      break;
    case "Run assignTasks":
      handleAssignTasks(returnToMenu);
      break;
    case "Complete day's tasks":
      handleCompleteDay(returnToMenu);
      break;
    case "Back":
      goBack();
      break;
    default:
      break;
  }
}

async function handleAddTask(goBack) {
  const days = await getDays();
  const groups = await getGroups();
  if (groups.length <= 0) {
    console.log("No groups found, please add a group first.");
    goBack();
    return;
  }
  const task = await inquirer.prompt([
    {
      type: "list",
      name: "groupName",
      message: "Select a group:",
      choices: groups.map((group) => group.groupName),
    },
    {
      type: "input",
      name: "taskName",
      message: "Enter task name:",
    },
    {
      type: "number",
      name: "duration",
      message: "Enter task duration (in minutes):",
    },
    {
      type: "number",
      name: "priority",
      message: "Enter task priority:",
    },
    {
      type: "number",
      name: "repetitions",
      message: "Enter task repetitions:",
    },
    {
      type: "confirm",
      name: "divisible",
      message: "Is the task divisible?",
      default: false,
    },
    {
      type: "list",
      name: "requiredDay",
      message:
        "Enter the required day for the task (chose null to leave empry):",
      choices: [
        ...days.map((day) => ({ name: day.name, value: day.name })),
        {
          name: "null",
          value: "",
        },
      ],
    },
  ]);

  dbFunctions.addTask(
    {
      id: uuidv4(),
      groupName: task.groupName,
      taskName: task.taskName,
      duration: task.duration,
      priority: task.priority,
      repetitions: task.repetitions,
      divisible: task.divisible,
      requiredDay: task.requiredDay,
    },
    (err) => {
      if (err) throw err;
      console.log("\nTask added successfully!");
      goBack();
      return;
    }
  );
}

async function handleEditTask(goBack) {
  const groups = await getGroups();
  const tasks = await getTasks();
  const days = await getDays();
  if (tasks.length === 0) {
    console.log("No tasks available to edit.");
    goBack();
    return;
  }

  const { groupName } = await inquirer.prompt([
    {
      type: "list",
      name: "groupName",
      message: "Select a group:",
      choices: groups.map((group) => group.groupName),
    },
  ]);

  const { taskId } = await inquirer.prompt([
    {
      type: "list",
      name: "taskId",
      message: "Select a task to edit:",
      choices: tasks
        .filter((task) => task.groupName === groupName)
        .map((task) => ({
          name:
            `${task.taskName}` +
            (task.requiredDay ? ` (Date: ${task.requiredDay})` : ""),
          value: task.id,
        })),
    },
  ]);

  const selectedTask = tasks.find((task) => task.id === taskId);

  const updatedTask = await inquirer.prompt([
    {
      type: "list",
      name: "groupName",
      message: "Select new group name:",
      choices: groups.map((group) => group.groupName),
      default: selectedTask.groupName,
    },
    {
      type: "input",
      name: "taskName",
      message: "Enter new task name:",
      default: selectedTask.taskName,
    },
    {
      type: "number",
      name: "duration",
      message: "Enter new task duration (in minutes):",
      default: selectedTask.duration,
    },
    {
      type: "number",
      name: "priority",
      message: "Enter new task priority:",
      default: selectedTask.priority,
    },
    {
      type: "number",
      name: "repetitions",
      message: "Enter new task repetitions:",
      default: selectedTask.repetitions,
    },
    {
      type: "confirm",
      name: "divisible",
      message: "Is the task divisible?",
      default: selectedTask.divisible,
    },
    {
      type: "list",
      name: "requiredDay",
      message:
        "Enter the required day for the task (chose null to leave empry):",
      default: selectedTask.requiredDay || "",
      choices: [
        ...days.map((day) => ({ name: day.name, value: day.name })),
        {
          name: "null",
          value: "",
        },
      ],
    },
  ]);

  dbFunctions.editTask(taskId, updatedTask, (err) => {
    if (err) throw err;
    console.log("\nTask edited successfully!");
    goBack();
  });
}

async function handleDeleteTask(goBack) {
  const tasks = await getTasks();
  const groups = await getGroups();

  const { groupName } = await inquirer.prompt([
    {
      type: "list",
      name: "groupName",
      message: "Select a group:",
      choices: groups.map((group) => group.groupName),
    },
  ]);

  const { taskId } = await inquirer.prompt([
    {
      type: "list",
      name: "taskId",
      message: "Select a task to delete:",
      choices: tasks
        .filter((task) => task.groupName === groupName)
        .map((task) => ({
          name:
            `${task.taskName}` +
            (task.requiredDay ? `(Date: ${task.requiredDay})` : ``),
          value: task.id,
        })),
    },
  ]);

  dbFunctions.deleteTask(taskId, (err) => {
    if (err) throw err;
    console.log("\nTask deleted successfully!");
    goBack();
  });
}

async function handleSeeAllTasks(goBack) {
  const tasks = await getTasks();
  const groups = await getGroups();
  displayTasks(tasks, groups);
  goBack();
}

async function handleRemoveRepetition(goBack) {
  const tasks = await getTasks();
  const groups = await getGroups();
  const { groupName } = await inquirer.prompt([
    {
      type: "list",
      name: "groupName",
      message: "Select a group:",
      choices: groups.map((group) => group.groupName),
    },
  ]);
  const { taskId } = await inquirer.prompt([
    {
      type: "list",
      name: "taskId",
      message: "Select a task to remove repetitions:",
      choices: tasks
        .filter((task) => task.groupName === groupName)
        .map((task) => ({
          name: `${task.taskName} (Group: ${task.groupName}) - Repetitions: ${task.repetitions}`,
          value: task.id,
        })),
    },
  ]);

  dbFunctions.removeRepetition(taskId, (err) => {
    if (err) throw err;
    console.log("\nRepetitions removed successfully!");
    goBack();
  });
}

async function handleAssignTasks(goBack) {
  const days = await getDays();
  const tasks = await getTasks();
  const groups = await getGroups();
  const formatedTasks = groups.map((group) => {
    return {
      groupName: group.groupName,
      tasks: tasks.filter((task) => task.groupName === group.groupName),
    };
  });
  const result = assignTasks(days, formatedTasks);
  displayResults(result);
  goBack();
}

async function handleCompleteDay(goBack) {
  const days = await getDays();
  const tasks = await getTasks();
  const groups = await getGroups();
  const formatedTasks = groups.map((group) => {
    return {
      groupName: group.groupName,
      tasks: tasks.filter((task) => task.groupName === group.groupName),
    };
  });
  const { assignedTasks } = assignTasks(days, formatedTasks);
  const { dayName } = await inquirer.prompt([
    {
      type: "list",
      name: "dayName",
      message: "Select a day to complete:",
      choices: days.map((day) => day.name),
    },
  ]);
  for (let task of assignedTasks[dayName]) {
    const { completed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "completed",
        message: `Did you complete this task?:\n ${formatTask(task)}?`,
        default: false,
      },
    ]);
    if (completed) {
      // Agregar los siguientes campos en la ejeción de assignTasks
      // divisible, repetitions, isDivided, originalId, timesRepeated
      // Ajustar la función handleAssignTasks para que maneje estos campos
      // y crear las siguientes funciones: subtractDuration, removeRepetitions y removeDay
      /*
      if (task.divisible) {
        if (task.isDivided) {
          subtractDuration(task.originalId, task.duration)
        } else {
          subtractDuration(task.id, task.duration)
        }
      } else {
        removeRepetitions(task.id, timesRepeated)
      }
      */
    }
  }
  // removeDay(dayName);
  goBack();
}

module.exports = {
  tasksMenu,
};
