import { Action, ActionPanel, Form, useNavigation } from '@raycast/api'
import moment from 'moment'
import { Task } from '../type/Task'
import { projectOptions } from '../configs/masterdata'

export interface TaskFormProps {
  task?: Task
  onCreate?: (task: Task) => void
  onEdit?: (values: Task) => void
}

export const TaskForm = (props: TaskFormProps) => {
  const { pop } = useNavigation()
  const task: Task | undefined = props.task
  const handleSubmit = (values: Task) => {
    console.log(values)
    if (props.onCreate) {
      props.onCreate(values)
    }
    if (props.onEdit) {
      props.onEdit({ ...values, id: task?.id || '' })
    }
    pop()
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Submit" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="task" title="Task" placeholder="Task" defaultValue={task?.task} autoFocus storeValue />
      <Form.TextField
        id="date"
        placeholder="DD/MM/YYYY"
        title="Date"
        defaultValue={task?.date || moment().format('DD/MM/YYYY')}
      />
      <Form.TextField id="manhours" title="Man hours" placeholder="1" defaultValue={`${task?.manhours || 1}`} />
      <Form.TextField
        id="module"
        title="Module"
        placeholder="Module"
        storeValue
        defaultValue={`${task?.module || ''}`}
      />
      <Form.Dropdown id="project" title="Project" defaultValue={task?.project} storeValue>
        {projectOptions.map((item) => (
          <Form.Dropdown.Item key={item.value} value={item.value} title={item.title} />
        ))}
      </Form.Dropdown>
      <Form.Checkbox id="isEnhancement" label="Is Enhancement" defaultValue={task?.isEnhancement} />
      <Form.TextField id="subTaskInput" placeholder="subtask" title="Sub task" defaultValue={task?.subTask || ''} />
      <Form.TextField id="remark" title="Remark" placeholder="Remark" defaultValue={task?.remark || ''} />
      <Form.TextField id="crNo" title="Cr No" placeholder="Cr No" defaultValue={task?.crNo || ''} />
      <Form.Checkbox id="repeat" label="Repeat" defaultValue={task?.repeat || false} />
    </Form>
  )
}
