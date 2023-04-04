import { Action, Icon } from '@raycast/api';

export const ImportFromGithubAction = (props: { onImport: () => void }) => {
    return <Action icon={Icon.Trash} title="Import Events From Github" onAction={props.onImport} />;
};
