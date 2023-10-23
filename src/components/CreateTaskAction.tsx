import { Action, Icon } from '@raycast/api'
import { Task } from '../type/Task'
import { TaskForm } from './TaskForm'

interface CreateTaskProps {
  onCreate: (task: Task) => void
}

export const CreateTaskAction = (props: CreateTaskProps) => {
  return (
    <Action.Push
      icon={Icon.Plus}
      title="Create New Task"
      shortcut={{ modifiers: ['cmd'], key: 'n' }}
      target={<TaskForm onCreate={props.onCreate} />}
    />
  )
}
