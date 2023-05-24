import { Action, Icon } from '@raycast/api';

export const ExportFileAction = (props: { onExport: () => void }) => {
    return (
        <Action
            icon={Icon.SaveDocument}
            style={Action.Style.Destructive}
            title="Export File And Clear Tasks"
            shortcut={{ modifiers: ['cmd'], key: 'e' }}
            onAction={props.onExport}
        />
    );
};
