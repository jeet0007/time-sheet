import { Event } from '../type/Event'
import { randomUUID } from 'node:crypto'
import moment from 'moment'
import { Task } from '../type/Task'

export const mergeDuplicateTasks = (tasks: Task[]) => {
  const mergedTasks: Task[] = []
  tasks.forEach((task) => {
    const name = task.task.trim()
    const date = new Date(task.date).toDateString()
    const index = mergedTasks.findIndex(
      (item) => item.task.trim() === name && new Date(item.date).toDateString() === date
    )
    if (index > -1) {
      mergedTasks[index].manhours += task.manhours
    } else {
      mergedTasks.push(task)
    }
  })
  return mergedTasks
}

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






