const inquirer = require("inquirer");
const { uuidv4 } = require("../functions");
const dbFunctions = require("../database");
const { getGroups } = require("../operations/dbOperations");

async function groupsMenu(goBack) {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "What do you want to do?",
      choices: [
        "Add Group",
        "Edit Group",
        "Delete Group",
        "See all groups",
        "Back",
      ],
    },
  ]);

  const returnToMenu = () => groupsMenu(goBack);
  switch (action) {
    case "Add Group":
      handleAddGroup(returnToMenu);
      break;
    case "Edit Group":
      handleEditGroup(returnToMenu);
      break;
    case "Delete Group":
      handleDeleteGroup(returnToMenu);
      break;
    case "See all groups":
      handleSeeAllGroups(returnToMenu);
      break;
    case "Back":
      goBack();
      break;
  }
}

async function handleDeleteGroup(goBack) {
  const groups = await getGroups();
  if (groups.length === 0) {
    console.log("No groups available to delete.");
    goBack();
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
    goBack();
  });
}

async function handleSeeAllGroups(goBack) {
  const groups = await getGroups();
  displayGroups(groups);
  goBack();
}

async function handleEditGroup(goBack) {
  const groups = await getGroups();
  if (groups.length === 0) {
    console.log("No groups available to edit.");
    goBack();
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
      goBack();
    }
  );
}

async function handleAddGroup(goBack) {
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
    goBack();
  });
}

module.exports = {
  groupsMenu,
};
