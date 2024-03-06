import { Action, ActionPanel, Form, useNavigation } from '@raycast/api'
import moment from 'moment'
import { Task } from '../type/Task'
import { projectOptions } from '../configs/masterdata'
import { useState } from 'react'

export interface TaskFormProps {
  task?: Task
  onCreate?: (task: Task) => void
  onEdit?: (values: Task) => void
}
const removeActionFromKeys = (values: Record<string, any>, action: string): void => {
  Object.keys(values).forEach((key) => {
    if (key.includes(`-${action}`)) {
      const newKey = key.replace(`-${action}`, '')
      values[newKey] = values[key]
      delete values[key]
    }
  })
}

export const TaskForm = (props: TaskFormProps) => {
  const { task } = props
  const { pop } = useNavigation()

  const [isEnhancement, setIsEnhancement] = useState(task?.isEnhancement ?? false)

  // This is to make sure the action is unique and so that the form can be reused
  const action = task?.id ? task.id : ''
  const handleSubmit = (values: Task) => {
    console.log(values)
    removeActionFromKeys(values, action)
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
      <Form.TextField
        id={`task-${action}`}
        title="Task"
        placeholder="Task"
        defaultValue={task?.task}
        autoFocus
        storeValue
      />
      <Form.TextField
        id={`date-${action}`}
        placeholder="DD/MM/YYYY"
        title="Date"
        defaultValue={task?.date || moment().format('DD-MM-YYYY')}
      />
      <Form.TextField
        id={`manhours-${action}`}
        title="Man hours"
        placeholder="1"
        defaultValue={`${task?.manhours || 1}`}
      />
      <Form.Checkbox
        id={`isEnhancement-${action}`}
        label="Is Enhancement"
        value={isEnhancement}
        onChange={setIsEnhancement}
      />
      {isEnhancement ? (
        <Form.TextField
          id={`chargeCode-${action}`}
          title="Charge Code"
          placeholder="Charge Code"
          storeValue
          defaultValue={`${task?.chargeCode || ''}`}
        />
      ) : (
        <Form.Dropdown id={`project-${action}`} title="Project" defaultValue={task?.project} storeValue>
          {projectOptions.map((item) => (
            <Form.Dropdown.Item key={item.value} value={item.value} title={item.title} />
          ))}
        </Form.Dropdown>
      )}
      <Form.TextField
        id={`module-${action}`}
        title="Module"
        placeholder="Module"
        storeValue
        defaultValue={`${task?.module || ''}`}
      />
      <Form.TextField
        id={`subTaskInput-${action}`}
        placeholder="subtask"
        title="Sub task"
        defaultValue={task?.subTask || ''}
      />
      <Form.TextField id={`remark-${action}`} title="Remark" placeholder="Remark" defaultValue={task?.remark || ''} />
      <Form.TextField id={`crNo-${action}`} title="Cr No" placeholder="Cr No" defaultValue={task?.crNo || ''} />
      <Form.Checkbox id={`repeat-${action}`} label="Repeat" defaultValue={task?.repeat || false} />
    </Form>
  )
}
