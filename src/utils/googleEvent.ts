import { Event } from '../type/Event'
import { randomUUID } from 'node:crypto'
import moment from 'moment'
import { Task } from '../type/Task'

export const mergeDuplicateTasks = (tasks: Task[]) => {
  const mergedTasks: Task[] = []
  tasks.forEach((task) => {
    const index = mergedTasks.findIndex((item) => item.task === task.task && item.date === task.date)
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
  const crNo: RegExpMatchArray | null = summary.match(/([a-zA-Z1-9]{3,10})-(\d+)/gm)
  const module = crNo && crNo[0] ? crNo[0].split('-')[0].toUpperCase() : 'Meeting'
  const startTime = new Date(item.start.dateTime)
  const endTime = new Date(item.end.dateTime)
  const manhours = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60)
  return {
    id: randomUUID(),
    task: item.summary,
    module,
    manhours,
    crNo: crNo && crNo[0] ? crNo[0] : '',
    date: moment(startTime).format('DD-MM-YYYY'),
  }
}
