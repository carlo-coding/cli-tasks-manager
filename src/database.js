const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("db.sqlite");

db.serialize(function () {
  db.run("CREATE TABLE IF NOT EXISTS groups (id TEXT, groupName TEXT)");
  db.run(
    "CREATE TABLE IF NOT EXISTS tasks (id TEXT, groupName TEXT, taskName TEXT, duration INTEGER, priority INTEGER, repetitions INTEGER, divisible BOOLEAN, requiredDay TEXT)"
  );
  db.run(
    "CREATE TABLE IF NOT EXISTS days (id TEXT, name TEXT, minutes INTEGER)"
  );
  const getAllGroups = (callback) => {
    db.all("SELECT * FROM groups", callback);
  };

  const getGroupById = (groupId, callback) => {
    db.get("SELECT * FROM groups WHERE id = ?", groupId, callback);
  };

  const getAllTasks = (callback) => {
    db.all("SELECT * FROM tasks", callback);
  };

  const getTaskById = (taskId, callback) => {
    db.get("SELECT * FROM tasks WHERE id = ?", taskId, callback);
  };

  const getAllDays = (callback) => {
    db.all("SELECT * FROM days", callback);
  };

  const getDayById = (dayId, callback) => {
    db.get("SELECT * FROM days WHERE id = ?", dayId, callback);
  };
  const addTask = (task, callback) => {
    const stmt = db.prepare(
      "INSERT INTO tasks VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    stmt.run(
      task.id,
      task.groupName,
      task.taskName,
      task.duration,
      task.priority,
      task.repetitions,
      task.divisible,
      task.requiredDay,
      callback
    );
  };

  const editTask = (taskId, updatedTask, callback) => {
    const stmt = db.prepare(
      "UPDATE tasks SET groupName = ?, taskName = ?, duration = ?, priority = ?, repetitions = ?, divisible = ?, requiredDay = ? WHERE id = ?"
    );
    stmt.run(
      updatedTask.groupName,
      updatedTask.taskName,
      updatedTask.duration,
      updatedTask.priority,
      updatedTask.repetitions,
      updatedTask.divisible,
      updatedTask.requiredDay,
      taskId,
      callback
    );
  };
  // Remove one repetition from a task and delete it if there are no repetitions left
  const removeRepetition = (taskId, callback) => {
    db.get("SELECT * FROM tasks WHERE id = ?", taskId, (err, task) => {
      if (err) return callback(err);
      if (task.repetitions > 1) {
        const stmt = db.prepare(
          "UPDATE tasks SET repetitions = ? WHERE id = ?"
        );
        stmt.run(task.repetitions - 1, taskId, callback);
      } else {
        db.run("DELETE FROM tasks WHERE id = ?", taskId, callback);
      }
    });
  };

  const deleteTask = (taskId, callback) => {
    db.run("DELETE FROM tasks WHERE id = ?", taskId, callback);
  };

  const addGroup = (group, callback) => {
    const stmt = db.prepare("INSERT INTO groups VALUES (?, ?)");
    stmt.run(group.id, group.groupName, callback);
  };

  const editGroup = (groupId, updatedGroup, callback) => {
    const stmt = db.prepare("UPDATE groups SET groupName = ? WHERE id = ?");
    stmt.run(updatedGroup.groupName, groupId, callback);
  };

  const deleteGroup = (groupId, callback) => {
    db.run("DELETE FROM groups WHERE id = ?", groupId, callback);
  };

  const addDay = (day, callback) => {
    const stmt = db.prepare("INSERT INTO days VALUES (?, ?, ?)");
    stmt.run(day.id, day.name, day.minutes, callback);
  };

  const editDay = (dayId, updatedDay, callback) => {
    const stmt = db.prepare(
      "UPDATE days SET name = ?, minutes = ? WHERE id = ?"
    );
    stmt.run(updatedDay.name, updatedDay.minutes, dayId, callback);
  };

  const deleteDay = (dayId, callback) => {
    db.run("DELETE FROM days WHERE id = ?", dayId, callback);
  };

  // Export the functions as needed
  module.exports = {
    addTask,
    editTask,
    deleteTask,
    addGroup,
    editGroup,
    deleteGroup,
    addDay,
    editDay,
    deleteDay,
    getAllGroups,
    getGroupById,
    getAllTasks,
    getTaskById,
    getAllDays,
    getDayById,
    removeRepetition,
  };
});
