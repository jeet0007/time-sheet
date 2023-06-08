import { Action, Icon } from '@raycast/api'

export const DuplicateTaskAction = (props: { onDupe: () => void }) => {
  return (
    <Action
      icon={Icon.CopyClipboard}
      title="Duplicate Task"
      shortcut={{ modifiers: ['cmd'], key: 'd' }}
      onAction={props.onDupe}
    />
  )
}
