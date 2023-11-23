import { Event } from '../type/Event'
import { randomUUID } from 'node:crypto'
import moment from 'moment'
import { Task } from '../type/Task'
import { holidays } from '../configs'

const areDatesEqual = (dateStr1: string, dateStr2: string): boolean => {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  // Compare dates without considering time
  return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
};


export const mergeDuplicateTasks = (tasks: Task[]): Task[] => {
  const mergedTasks: Task[] = [];

  tasks.forEach((task) => {
    const existingTask = mergedTasks.find(
      (t) =>
        t.task.trim() === task.task.trim() &&
        areDatesEqual(t.date, task.date)
    );
    if (existingTask) {
      existingTask.manhours += task.manhours || 0;
    } else {
      mergedTasks.push({ ...task });
    }
  });

  return mergedTasks;
};

export const parseEvent = (item: Event) => {
  const summary = item.summary
  const crNoRegExp = /\[([a-zA-Z1-9]{3,10})\]/g
  const crNoMatch = summary.match(crNoRegExp)
  const crNo = crNoMatch ? crNoMatch[0].slice(1, -1) : ''
  const module = crNo ? crNo.toUpperCase() : 'Meeting'
  const startTime = new Date(item.start.dateTime)
  const endTime = new Date(item.end.dateTime)
  const manhours = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60)

  let name = summary // Initialize name with the full summary
  if (crNoMatch) {
    name = summary.replace(crNoMatch[0], '').trim() // Remove spaces around the extracted name
  }

  return {
    id: randomUUID(),
    task: name,
    module,
    manhours,
    crNo,
    date: moment(startTime).format('DD-MM-YYYY'),
  }
}

const isSameDate = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const googleEventFilter = (item: Event) => {
  // filter out weekends and holidays
  const date = moment(item.start.dateTime)
  const day = date.day()
  const isWeekend = day === 0 || day === 6
  const isHoliday = holidays.find((holiday) => isSameDate(date.toDate(), new Date(holiday.date)))
  return !isWeekend && !isHoliday
}




