import { Action, Icon, openExtensionPreferences } from '@raycast/api'

export const SettingAction = () => {
  return <Action icon={Icon.Shield} title="Settings" onAction={openExtensionPreferences} />
}
