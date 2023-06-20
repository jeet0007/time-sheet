import { Action, ActionPanel, Form } from '@raycast/api'
import moment from 'moment'
import { Task } from '../type/Task'
import { projectOptions } from '../masterdata'

export interface CreateTaskProps {
  onCreate: (task: Task) => void
}
export const CreateTaskForm = (props: CreateTaskProps) => {
  const handleSubmit = (values: Task) => {
    props.onCreate(values)
  }
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Create New Task" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="task" title="Task" placeholder="Task" autoFocus storeValue />
      <Form.TextField id="manhours" title="Man hours" placeholder="1" defaultValue="1" />
      <Form.TextField id="module" title="Module" placeholder="Module" storeValue />
      <Form.Dropdown id="project" title="Project" storeValue>
        {projectOptions.map((item) => (
          <Form.Dropdown.Item key={item.value} value={item.value} title={item.title} />
        ))}
      </Form.Dropdown>
      <Form.Checkbox id="isEnhancement" label="Is Enhancement" defaultValue={false} />
      <Form.TextField id="subTaskInput" placeholder="subtask" title="Sub task" />
      <Form.TextField id="remark" title="Remark" placeholder="Remark" />
      <Form.TextField id="crNo" title="Cr No" placeholder="Cr No" />
      <Form.TextField id="date" title="Date" defaultValue={moment().format('DD-MM-YYYY')} />
      <Form.Checkbox id="repeat" label="Repeat" defaultValue={false} />
    </Form>
  )
}
