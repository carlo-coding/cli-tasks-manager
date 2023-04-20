const inquirer = require("inquirer");
const { tasksMenu } = require("./menus/tasks");
const { groupsMenu } = require("./menus/groups");
const { daysMenu } = require("./menus/days");

async function mainMenu() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: ["TASKS", "GROUPS", "DAYS", "Exit"],
    },
  ]);

  switch (action) {
    case "TASKS":
      tasksMenu(mainMenu);
      break;
    case "GROUPS":
      groupsMenu(mainMenu);
      break;
    case "DAYS":
      daysMenu(mainMenu);
      break;
    case "Exit":
      console.log("Goodbye!");
      process.exit();
    default:
      console.log("Invalid option, please try again.");
      mainMenu();
  }
}

mainMenu();
