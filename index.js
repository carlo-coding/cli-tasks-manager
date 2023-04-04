const inquirer = require("inquirer");
const {
  displayResults,
  displayTasks,
  displayDays,
  displayGroups,
} = require("./utils");
const { assignTasks, uuidv4 } = require("./functions");
const dbFunctions = require("./database");

const getGroups = async () => {
  const groups = await new Promise((resolve, reject) => {
    dbFunctions.getAllGroups((err, groups) => {
      if (err) reject(err);
      resolve(groups);
    });
  });
  return groups;
};
const getTasks = async () => {
  const tasks = await new Promise((resolve, reject) => {
    dbFunctions.getAllTasks((err, tasks) => {
      if (err) reject(err);
      resolve(tasks);
    });
  });
  return tasks;
};
const getDays = async () => {
  const days = await new Promise((resolve, reject) => {
    dbFunctions.getAllDays((err, days) => {
      if (err) reject(err);
      resolve(days);
    });
  });
  return days;
};

async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        "Add a task",
        "Edit a task",
        "Delete a task",
        "Remove repetition",
        "Add a group",
        "Edit a group",
        "Delete a group",
        "Add a day",
        "Edit a day",
        "Delete a day",
        "See all tasks",
        "See all groups",
        "See all days",
        "Run assignTasks",
        "Exit",
        "Clear",
      ],
    },
  ]);

  switch (action) {
    case "Add a task":
      handleAddTask();
      break;
    case "Edit a task":
      handleEditTask();
      break;
    case "Delete a task":
      handleDeleteTask();
      break;
    case "Remove repetition":
      handleRemoveRepetition();
      break;
    case "Add a group":
      handleAddGroup();
      break;
    case "Edit a group":
      handleEditGroup();
      break;
    case "Delete a group":
      handleDeleteGroup();
      break;
    case "Add a day":
      handleAddDay();
      break;
    case "Edit a day":
      handleEditDay();
      break;
    case "Delete a day":
      handleDeleteDay();
      break;
    case "See all tasks":
      handleSeeAllTasks();
      break;
    case "See all groups":
      handleSeeAllGroups();
      break;
    case "See all days":
      handleSeeAllDays();
      break;
    case "Run assignTasks":
      handleAssignTasks();
      break;
    case "Exit":
      console.log("Goodbye!");
      process.exit();
    case "Clear":
      console.clear();
      mainMenu();
      break;
    default:
      console.log("Invalid option, please try again.");
      mainMenu();
  }
}

async function handleAddTask() {
  const days = await getDays();
  const groups = await getGroups();
  if (groups.length <= 0) {
    console.log("No groups found, please add a group first.");
    mainMenu();
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
      mainMenu();
      return;
    }
  );
}

async function handleDeleteTask() {
  const tasks = await getTasks();
  const { taskId } = await inquirer.prompt([
    {
      type: "list",
      name: "taskId",
      message: "Select a task to delete:",
      choices: tasks.map((task) => ({
        name: `${task.taskName} (Group: ${task.groupName})`,
        value: task.id,
      })),
    },
  ]);

  dbFunctions.deleteTask(taskId, (err) => {
    if (err) throw err;
    console.log("\nTask deleted successfully!");
    mainMenu();
  });
}

async function handleRemoveRepetition() {
  const tasks = await getTasks();
  const { taskId } = await inquirer.prompt([
    {
      type: "list",
      name: "taskId",
      message: "Select a task to remove repetitions:",
      choices: tasks.map((task) => ({
        name: `${task.taskName} (Group: ${task.groupName}) - Repetitions: ${task.repetitions}`,
        value: task.id,
      })),
    },
  ]);

  dbFunctions.removeRepetition(taskId, (err) => {
    if (err) throw err;
    console.log("\nRepetitions removed successfully!");
    mainMenu();
  });
}

async function handleAddGroup() {
  const { groupName } = await inquirer.prompt([
    {
      type: "input",
      name: "groupName",
      message: "Enter group name:",
    },
  ]);

  const group = {
    id: uuidv4(),
    groupName,
  };
  await dbFunctions.addGroup(group, (err) => {
    if (err) throw err;
    console.log("\nGroup added successfully!");
    mainMenu();
  });
}

async function handleEditGroup() {
  const groups = await getGroups();
  if (groups.length === 0) {
    console.log("No groups available to edit.");
    mainMenu();
    return;
  }

  const { groupId } = await inquirer.prompt([
    {
      type: "list",
      name: "groupId",
      message: "Select a group to edit:",
      choices: groups.map((group) => ({
        name: group.groupName,
        value: group.id,
      })),
    },
  ]);
  console.log("Received group ID to edit:", groupId);

  const group = groups.find((group) => group.id === groupId);

  const { updatedGroupName } = await inquirer.prompt([
    {
      type: "input",
      name: "updatedGroupName",
      message: "Enter the new group name:",
      default: group.name,
    },
  ]);

  dbFunctions.editGroup(
    groupId,
    {
      id: groupId,
      groupName: updatedGroupName,
    },
    (err) => {
      if (err) throw err;
      console.log("\nGroup edited successfully!");
      mainMenu();
    }
  );
}

async function handleEditTask() {
  const groups = await getGroups();
  const tasks = await getTasks();
  const days = await getDays();
  if (tasks.length === 0) {
    console.log("No tasks available to edit.");
    mainMenu();
    return;
  }
  const { taskId } = await inquirer.prompt([
    {
      type: "list",
      name: "taskId",
      message: "Select a task to edit:",
      choices: tasks.map((task) => ({ name: task.taskName, value: task.id })),
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
    mainMenu();
  });
}

async function handleDeleteGroup() {
  const groups = await getGroups();
  if (groups.length === 0) {
    console.log("No groups available to delete.");
    mainMenu();
    return;
  }

  const { groupId } = await inquirer.prompt([
    {
      type: "list",
      name: "groupId",
      message: "Select a group to delete:",
      choices: groups.map((group) => ({
        name: group.groupName,
        value: group.id,
      })),
    },
  ]);
  dbFunctions.deleteGroup(groupId, (err) => {
    if (err) throw err;
    console.log("\nGroup deleted successfully!");
    mainMenu();
  });
}

async function handleAddDay() {
  const day = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter day name:",
    },
    {
      type: "number",
      name: "minutes",
      message: "Enter minutes available for the day:",
    },
  ]);
  dbFunctions.addDay(
    {
      id: uuidv4(),
      name: day.name,
      minutes: day.minutes,
    },
    (err) => {
      if (err) throw err;
      console.log("\nDay added successfully!");
      mainMenu();
    }
  );
}

async function handleEditDay() {
  const days = await getDays();
  if (days.length === 0) {
    console.log("No days available to edit.");
    mainMenu();
    return;
  }
  const { dayId } = await inquirer.prompt([
    {
      type: "list",
      name: "dayId",
      message: "Select a day to edit:",
      choices: days.map((day) => ({ name: day.name, value: day.id })),
    },
  ]);

  const selectedDay = days.find((day) => day.id === dayId);

  const { dayName, dayMinutes } = await inquirer.prompt([
    {
      type: "input",
      name: "dayName",
      message: "Enter the new day name:",
      default: selectedDay.name,
    },
    {
      type: "number",
      name: "dayMinutes",
      message: "Enter the new day minutes:",
      default: selectedDay.minutes,
    },
  ]);

  dbFunctions.editDay(dayId, { name: dayName, minutes: dayMinutes }, (err) => {
    if (err) throw err;
    console.log("\nDay edited successfully!");
    mainMenu();
  });
}

async function handleDeleteDay() {
  const days = await getDays();
  const { dayId } = await inquirer.prompt([
    {
      type: "list",
      name: "dayId",
      message: "Select a day to delete:",
      choices: days.map((day) => ({ name: day.name, value: day.id })),
    },
  ]);
  dbFunctions.deleteDay(dayId, (err) => {
    if (err) throw err;
    console.log("\nDay deleted successfully!");
    mainMenu();
  });
}

async function handleAssignTasks() {
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
  mainMenu();
}

async function handleSeeAllTasks() {
  const tasks = await getTasks();
  const groups = await getGroups();
  displayTasks(tasks, groups);
  mainMenu();
}

async function handleSeeAllDays() {
  const days = await getDays();
  displayDays(days);
  mainMenu();
}

async function handleSeeAllGroups() {
  const groups = await getGroups();
  displayGroups(groups);
  mainMenu();
}

mainMenu();
