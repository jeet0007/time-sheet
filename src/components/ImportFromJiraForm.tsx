import { Action, ActionPanel, Form } from '@raycast/api'
export interface ImportFromJiraFormProps {
  onImport: (date: Date, project: string, status: string) => void
}

export const ImportFromJiraForm = ({ onImport }: ImportFromJiraFormProps) => {
  const handleSubmit = (values: { date: Date; project: string; status: string }) => {
    onImport(values.date, values.project, values.status)
  }
  return (
    <Form
      navigationTitle="Date to Import"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Import Tasks" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="project" title="Project Tag" defaultValue="EKYC" />
      <Form.Dropdown id="status" title="Status">
        <Form.Dropdown.Item title="To Do" value="To Do" />
        <Form.Dropdown.Item title="DC" value="DC" />
        <Form.Dropdown.Item title="Doing" value="Doing" />
      </Form.Dropdown>
      <Form.DatePicker title="Date" id="date" defaultValue={new Date()} />
    </Form>
  )
}
