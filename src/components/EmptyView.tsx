import { ActionPanel, List } from '@raycast/api';
import React from 'react';
import { Task } from '../type/Task';
import { CreateTaskAction } from './CreateTaskAction';
import { ImportTasksAction } from './ImportTasksAction';

export interface EmptyViewProps {
    tasks: Task[];
    onCreate: (task: Task) => void;
    onImport: (date: Date) => void;
}

export const EmptyView = ({ onCreate, onImport }: EmptyViewProps) => {
    return (
        <List.EmptyView
            icon={'💀'}
            title={'No Task Added'}
            description={'Remember your bonus next year'}
            actions={
                <ActionPanel>
                    <CreateTaskAction onCreate={onCreate} />
                    <ImportTasksAction onImport={onImport} />
                </ActionPanel>
            }
        />
    );
};
