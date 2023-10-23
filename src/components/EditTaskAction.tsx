import { Action, Icon } from '@raycast/api'
import { Task } from '../type/Task'
import { TaskForm } from './TaskForm'

export const EditTaskAction = (props: { onEdit: (task: Task) => void; task: Task }) => {
  return (
    <Action.Push icon={Icon.Pencil} title="Edit Task" target={<TaskForm onEdit={props.onEdit} task={props.task} />} />
  )
}
