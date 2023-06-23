import { Action, ActionPanel, Form } from '@raycast/api'
import { useState } from 'react'
export interface ImportFromGoogleFormProps {
  onImport: (date: Date, endDate?: Date) => void
}

export const ImportFromGoogleForm = ({ onImport }: ImportFromGoogleFormProps) => {
  const [isRange, setIsRange] = useState(true)
  const handleSubmit = (values: { date: Date; isRange: boolean; endDate?: Date }) => {
    onImport(values.date, values?.endDate)
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
      <Form.DatePicker title={isRange ? 'Start Date' : 'Date'} id="date" defaultValue={new Date()} />
      {isRange && <Form.DatePicker title="End Date" id="endDate" defaultValue={new Date()} />}
      <Form.Checkbox
        title="Pick a Range"
        id="isRange"
        defaultValue={false}
        label=""
        onChange={() => setIsRange(!isRange)}
      />
    </Form>
  )
}
