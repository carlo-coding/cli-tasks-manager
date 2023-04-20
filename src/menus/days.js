const inquirer = require("inquirer");
const { displayDays } = require("../utils");
const { uuidv4 } = require("../functions");
const dbFunctions = require("../database");
const { getDays } = require("../operations/dbOperations");

async function daysMenu(goBack) {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: ["Add Day", "Edit Day", "Delete Day", "See all days", "Back"],
    },
  ]);

  const returnToMenu = () => daysMenu(goBack);

  switch (action) {
    case "Add Day":
      handleAddDay(returnToMenu);
      break;
    case "Edit Day":
      handleEditDay(returnToMenu);
      break;
    case "Delete Day":
      handleDeleteDay(returnToMenu);
      break;
    case "See all days":
      handleSeeAllDays(returnToMenu);
      break;
    case "Back":
      goBack();
      break;
    default:
      console.log("Invalid option, please try again.");
      daysMenu(goBack);
  }
}

async function handleAddDay(goBack) {
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
      goBack();
    }
  );
}

async function handleEditDay(goBack) {
  const days = await getDays();
  if (days.length === 0) {
    console.log("No days available to edit.");
    goBack();
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
    goBack();
  });
}

async function handleDeleteDay(goBack) {
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
    goBack();
  });
}

async function handleSeeAllDays(goBack) {
  const days = await getDays();
  displayDays(days);
  goBack();
}

module.exports = {
  daysMenu,
};
