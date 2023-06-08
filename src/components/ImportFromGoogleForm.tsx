import { Action, ActionPanel, Form } from '@raycast/api'
export interface ImportFromGoogleFormProps {
  onImport: (date: Date) => void
}

export const ImportFromGoogleForm = ({ onImport }: ImportFromGoogleFormProps) => {
  const handleSubmit = (values: { date: Date }) => {
    onImport(values.date)
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
      <Form.DatePicker title="Date" id="date" defaultValue={new Date()} />
    </Form>
  )
}
