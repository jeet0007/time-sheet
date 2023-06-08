import { Action, Icon } from '@raycast/api'
import { Task } from '../type/Task'
import { EditTaskForm } from './EditTaskForm'

export const EditTaskAction = (props: { onEdit: (task: Task) => void; task: Task }) => {
  return (
    <Action.Push
      icon={Icon.Pencil}
      title="Edit Task"
      target={<EditTaskForm onEdit={props.onEdit} task={props.task} />}
    />
  )
}
