import { ActionPanel, List } from '@raycast/api';
import React from 'react';
import { Task } from '../type/Task';
import { CreateTaskAction } from './CreateTaskAction';
import { ImportTasksAction } from './ImportTasksAction';
import { ImportFromJiraAction } from './ImportFromJiraAction';

export interface EmptyViewProps {
    onCreate: (task: Task) => void;
    onImport?: (date: Date) => void;
    onImportFromJira?: (date: Date, project: string, status: string) => void;
}

export const EmptyView = ({ onCreate, onImport, onImportFromJira }: EmptyViewProps) => {
    return (
        <List.EmptyView
            icon={'💀'}
            title={'No Task Added'}
            description={'Remember your bonus next year'}
            actions={
                <ActionPanel>
                    <CreateTaskAction onCreate={onCreate} />
                    {onImport && <ImportTasksAction onImport={onImport} />}
                    {onImportFromJira && <ImportFromJiraAction onImport={onImportFromJira} />}
                </ActionPanel>
            }
        />
    );
};
