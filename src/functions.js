/*
Cambios al algoritmo:
Agregar un menu de completar tareas del día actual
Agregar funcionalidad de prioridad por grupos
Hacer que las ediciones y eliminaciones afecten a relaciones de entidades
Cambiar el mecanismo para agregar fechas eliguiendo primero año, mes y dia o que se agreguen de forma automatica
Hacer que los días tengan una fecha más concreta y que las tareas guarden relación con su id
Opción para agregar tareas que se repiten periodicamente y eliminarlas todas
Mostrar estádisticas sobre el porcentaje de tiempo que le dedico a cada grupo
Opción para eliminar tareas que hagan match con un patron

Administración de gastos:
Se deberá hacer un menu de más alto nivel para separar categorías.
Será un menu interactivo que preguntará por gatos, ingresos entre otras cosas.
Al obtener estos datos debe almacenarlo en una base de datos y actualizar la hoja de calculo.
Debe haber la opción para revisar estadisticas lo que mostrará un chart con los datos.
Debe haber la opción de editar los datos.

Gestion de productividad.
Obtener información sobre que actividades es más probable que termine basado en datos anteriores.
Obtener una lista de sistios web visitados en cada hora del día y obtener un sinsight sobre que es lo que intentaba hacer.
Generar un insight sobre si las tareas que estoy realizando estan relacionadas con mis metas.
Obtener recomendaciones diarias.
Almacenar un resumen de los objetivos alcanzados y no alcanzados semana con semana.

Generación de agenda.
En base a los objetivos que tenga y mediante la introducción de información extra 
se debe poder generar un horario flexible que cubra mis necesidades y se debe agendar en
mi google calendar y en mis todos de google.


BUGS:
No esta distrubuyendo todas las tareas pero tampoco las añade a tareas incompletas.
*/
const uuidv4 = () => Math.random().toString(16).slice(2);

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

function removeRepetition(tasks, taskId) {
  return tasks.map((group) => ({
    ...group,
    tasks: group.tasks.map((task) => {
      if (task.id === taskId)
        return {
          ...task,
          repetitions: task.repetitions - 1,
        };
      return task;
    }),
  }));
}
function canAddMoreTasks(tasks, remainingTime) {
  if (remainingTime <= 0) return false;
  const list = tasks.flatMap((group) => {
    const task = group.tasks.find((task) => task.repetitions > 0);
    if (task)
      return [
        {
          ...task,
          groupName: group.groupName,
        },
      ];
    return [];
  });
  if (list.length <= 0) return false;
  const indivisibleTasks = list.filter((task) => !task.divisible);
  if (indivisibleTasks.find((task) => task.duration <= remainingTime))
    return true;
  const divisibleTasks = list.filter((task) => task.divisible);
  if (divisibleTasks.find((task) => task.duration <= remainingTime))
    return true;
}

function assignTasks(days, tasks) {
  let groupTasks = deepCopy(tasks);

  /* --- Arreglo temporal --- */
  const workGroup = deepCopy(
    groupTasks.find((group) => group.groupName === "Work")
  );
  groupTasks = groupTasks.filter((group) => group.groupName !== "Work");
  groupTasks = [workGroup, ...groupTasks];
  /* ------ */

  const assignedTasks = {};
  const requiredTasks = {};
  for (let day of days) {
    requiredTasks[day.name] = [];
  }
  function separateRequiredTasks(tasks) {
    for (const group of tasks) {
      for (const task of group.tasks) {
        if (task.requiredDay) {
          requiredTasks[task.requiredDay].push({
            ...task,
            groupName: group.groupName,
          });
          group.tasks = group.tasks.filter((t) => t.id !== task.id);
        }
      }
    }
  }
  separateRequiredTasks(groupTasks);
  for (let day of days) {
    let remainingTime = day.minutes;
    assignedTasks[day.name] = [];
    for (const requiredTask of requiredTasks[day.name]) {
      if (requiredTask.duration <= remainingTime) {
        assignedTasks[day.name].push(requiredTask);
        remainingTime -= requiredTask.duration;
        requiredTask.repetitions -= 1;
      }
    }
    while (canAddMoreTasks(groupTasks, remainingTime)) {
      // 1. Ordenar las tareas de cada grupo por prioridad
      const orderedTasks = groupTasks.map((group) => {
        return {
          ...group,
          tasks: group.tasks.sort((a, b) => b.priority - a.priority),
        };
      });

      // 2. Crear una nueva lista temporal de tareas tomando la primera de cada grupo siempre y cuando el número de repeticiones sea mayor a 0
      const temporalList = orderedTasks.flatMap((group) => {
        const task = group.tasks.find((task) => task.repetitions > 0);
        if (task)
          return [
            {
              ...task,
              groupName: group.groupName,
            },
          ];
        return [];
      });
      // 3. Dividir la lista temporal entre tareas divisibles y no divisibles.
      const indivisibleTasks = temporalList.filter((task) => !task.divisible);
      const divisibleTasks = temporalList.filter((task) => task.divisible);
      /* 
      4. Si las tareas que no se pueden dividir, se pueden repetir más de una vez y duran 
      menos de 30 minutos, entonces repetirlas varias veces hasta que la suma de la duración 
      sea menor o igual a 120 minutos o bien si ya no queda tiempo disponible en el dia, 
      */
      for (let task of indivisibleTasks) {
        if (task.duration > remainingTime) continue;
        if (task.duration <= 30) {
          let taskTime = 0;
          while (
            task.repetitions > 0 &&
            taskTime <= 120 &&
            task.duration <= remainingTime
          ) {
            task.repetitions -= 1;
            taskTime += task.duration;
            remainingTime -= task.duration;
            assignedTasks[day.name].push({ ...task });
            groupTasks = removeRepetition(groupTasks, task.id);
          }
        } else {
          assignedTasks[day.name].push({ ...task });
          remainingTime -= task.duration;
          groupTasks = removeRepetition(groupTasks, task.id);
        }
      }
      /* 
      5. Si después de asignar las tareas no divisibles de la lista temporal queda 
      tiempo disponible, entonces usar las tareas no divisibles para rellenar el tiempo 
      disponible en caso de haber.
      */
      for (let task of divisibleTasks) {
        if (task.duration <= remainingTime) {
          assignedTasks[day.name].push({ ...task });
          remainingTime -= task.duration;
          groupTasks = removeRepetition(groupTasks, task.id);
        } else if (task.duration > remainingTime && remainingTime > 0) {
          assignedTasks[day.name].push({
            ...task,
            duration: remainingTime,
          });
          groupTasks = removeRepetition(groupTasks, task.id);
          const groupIndex = groupTasks.findIndex(
            (group) => group.groupName === task.groupName
          );
          groupTasks[groupIndex] = {
            ...groupTasks[groupIndex],
            tasks: [
              ...groupTasks[groupIndex].tasks,
              {
                ...task,
                id: uuidv4(),
                duration: task.duration - remainingTime,
                repetitions: 1,
              },
            ],
          };
          remainingTime -= remainingTime;
        }
      }
    }
  }
  const unassignedTasks = groupTasks.flatMap((group) => {
    const task = group.tasks.find((task) => task.repetitions > 0);
    if (task)
      return [
        {
          ...task,
          groupName: group.groupName,
        },
      ];
    return [];
  });
  for (const dayTasks of Object.values(requiredTasks)) {
    for (const task of dayTasks) {
      if (task.repetitions > 0) {
        unassignedTasks.push(task);
      }
    }
  }
  return { assignedTasks, unassignedTasks };
}

module.exports = {
  assignTasks,
  uuidv4,
};
