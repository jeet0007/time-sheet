import { Action, Icon } from '@raycast/api'
import { ImportFromGoogleForm } from './ImportFromGoogleForm'

export const ImportTasksAction = (props: { onImport: (date: Date) => void }) => {
  return (
    <Action.Push
      icon={Icon.Calendar}
      title="Import From Google Calendar"
      target={<ImportFromGoogleForm onImport={props.onImport} />}
    />
  )
}
