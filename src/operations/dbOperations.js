const dbFunctions = require("../database");
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

module.exports = {
  getGroups,
  getTasks,
  getDays,
};
