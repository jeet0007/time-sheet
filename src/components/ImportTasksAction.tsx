import { Action, Icon } from "@raycast/api";

export const ImportTasksAction = (props: { onImport: () => void }) => {
    return (
        <Action
            icon={Icon.Calendar}
            title="Import From Google Calendar"
            onAction={props.onImport}
        />
    );
}
