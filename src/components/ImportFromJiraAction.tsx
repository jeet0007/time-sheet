import { Action, Icon } from '@raycast/api'
import { ImportFromJiraForm } from './ImportFromJiraForm'

export const ImportFromJiraAction = (props: { onImport: (date: Date, project: string, status: string) => void }) => {
  return (
    <Action.Push
      icon={Icon.Airplane}
      title="Import From Jira"
      target={<ImportFromJiraForm onImport={props.onImport} />}
    />
  )
}
