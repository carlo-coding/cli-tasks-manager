const chalk = require("chalk");

function formatTask(task) {
  return chalk.bold(
    `\n${task.taskName} | Duration: ${task.duration} minutes | Priority: ${task.priority} | Repetitions Left: ${task.repetitions}` +
      (task.requiredDay ? ` | Date: ${task.requiredDay}` : "")
  );
}

function displayResults(result) {
  console.log("\nAssigned tasks:");
  for (const [day, tasks] of Object.entries(result.assignedTasks)) {
    console.log(chalk.bold(`\n${day}:`));

    const taskCounts = tasks.reduce((acc, task) => {
      acc[task.id] = (acc[task.id] || 0) + 1;
      return acc;
    }, {});

    tasks.forEach((task) => {
      if (taskCounts[task.id] > 0) {
        console.log(
          `  ${task.groupName} - ${task.taskName} (${
            taskCounts[task.id]
          } times) | Duration: ${task.duration} minutes | Priority: ${
            task.priority
          }`
        );
        taskCounts[task.id] = 0;
      }
    });
  }

  console.log("\nUnassigned tasks:");
  result.unassignedTasks.forEach((task) => {
    console.log(
      `${task.groupName} - ${task.taskName} | Duration: ${task.duration} minutes | Priority: ${task.priority} | Repetitions Left: ${task.repetitions}`
    );
  });
}

function displayTasks(tasks, groups) {
  console.log("\nTasks:");
  const formatedTasks = groups.map((group) => {
    return {
      groupName: group.groupName,
      tasks: tasks.filter((task) => task.groupName === group.groupName),
    };
  });
  formatedTasks.forEach((group) => {
    console.log(chalk.bold(`\n${group.groupName}:`));
    group.tasks.forEach((task) => {
      console.log(
        chalk.underline(
          `  ${task.taskName} | Duration: ${task.duration} minutes | Priority: ${task.priority} | Repetitions: ${task.repetitions}` +
            (task.requiredDay ? ` | Date: ${task.requiredDay}` : "")
        )
      );
    });
  });
}

function displayDays(days) {
  console.log("\nDays:");
  days.forEach((day) => {
    console.log(chalk.underline(`  ${day.name} | ${day.minutes} minutes`));
  });
}

function displayGroups(groups) {
  console.log("\nGroups:");
  groups.forEach((group) => {
    console.log(chalk.underline(`  ${group.groupName}`));
  });
}

module.exports = {
  displayResults,
  displayTasks,
  displayDays,
  displayGroups,
  formatTask,
};
