import { Action, Icon } from '@raycast/api';

export const ToggleShowDetailsAction = (props: { onAction: () => void; isShowingDetail: boolean }) => {
    return (
        <Action
            icon={props.isShowingDetail ? Icon.LightBulbOff : Icon.LightBulb}
            title={props.isShowingDetail ? 'Hide Task Details' : 'Show Task Details'}
            shortcut={{ modifiers: ['cmd'], key: 'b' }}
            onAction={props.onAction}
        />
    );
};
