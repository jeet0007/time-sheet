import { Action, Icon } from '@raycast/api';

export const DuplicateTaskAction = (props: { onDupe: () => void }) => {
    return <Action icon={Icon.CopyClipboard} title="Clone Task" onAction={props.onDupe} />;
};
