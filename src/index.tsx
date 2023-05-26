import {
    ActionPanel,
    Icon,
    List,
    LocalStorage,
    Toast,
    getPreferenceValues,
    showToast,
    useNavigation,
} from '@raycast/api';
import { writeFileSync } from 'fs';
import moment from 'moment';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { useCallback, useEffect, useState } from 'react';
import {
    CreateTaskAction,
    DeleteTaskAction,
    DuplicateTaskAction,
    EditTaskAction,
    EmptyView,
    ToggleShowDetailsAction,
} from './components';
import { ExportFileAction } from './components/ExportFileAction';
import { Task } from './type/Task';
import { ImportTasksAction } from './components/ImportTasksAction';
import * as google from './service/google';
import * as jira from './service/jira';
import { randomUUID } from 'node:crypto';
import YAML from 'js-yaml';
import { PreferencesType } from './type/config';
import { trimStringInObject } from './utils/object';
import { ImportFromJiraAction } from './components/ImportFromJiraAction';
import { pluralize } from './utils/string';
import { TaskDetail } from './components/TaskDetail';

export type State = {
    tasks: Task[];
    isLoading: boolean;
    isShowingDetail: boolean;
};

export function getSaveDirectory(): string {
    let { saveDirectory } = getPreferenceValues();
    saveDirectory = saveDirectory.replace('~', homedir());
    return resolve(saveDirectory);
}

export default function Command() {
    const { exportType = 'json', googleClientId, jiraToken, defaultProject }: PreferencesType = getPreferenceValues();
    const { pop } = useNavigation();

    const [state, setState] = useState<State>({
        tasks: [],
        isLoading: true,
        isShowingDetail: false,
    });
    const [groupedTasks, setGroupedTask] = useState<{ date: string; tasks: Task[]; totalManhours: number }[]>([]);

    useEffect(() => {
        (async () => {
            const storedTasks = await LocalStorage.getItem<string>('tasks');
            if (!storedTasks) {
                setState((previous) => ({ ...previous, isLoading: false }));
                return;
            }

            try {
                const tasks: Task[] = JSON.parse(storedTasks);
                setState((previous) => ({ ...previous, tasks, isLoading: false }));
            } catch (e) {
                setState((previous) => ({ ...previous, tasks: [], isLoading: false }));
            }
        })();
    }, [setState]);

    useEffect(() => {
        LocalStorage.setItem('tasks', JSON.stringify(state.tasks));
    }, [state.tasks]);

    useEffect(() => {
        const { tasks } = state;
        const groupedTasks = tasks.reduce((acc: { date: string; tasks: Task[]; totalManhours: number }[], task) => {
            const date = task.date;
            const index = acc.findIndex((group) => group.date === date);
            if (index === -1) {
                acc.push({
                    date,
                    tasks: [task],
                    totalManhours: typeof task.manhours === 'string' ? parseInt(task.manhours) : task.manhours,
                });
            } else {
                acc[index].tasks.push(task);
                acc[index].totalManhours += typeof task.manhours === 'string' ? parseInt(task.manhours) : task.manhours;
            }
            return acc;
        }, []);
        setGroupedTask(groupedTasks);
    }, [state, state.tasks]);

    const handleDelete = useCallback(
        (id: string) => {
            try {
                setState((previous) => {
                    const newTasks = previous.tasks.filter((task) => task.id !== id);
                    return { ...previous, tasks: newTasks };
                });
                showToast({
                    style: Toast.Style.Success,
                    title: 'Yay!',
                    message: `Task deleted`,
                });
            } catch (error) {
                showToast({
                    style: Toast.Style.Failure,
                    title: 'Opps!',
                    message: `Error deleting tasks`,
                });
            }
        },
        [setState, state.tasks]
    );

    const handleImportFromGoogle = useCallback(
        async (date: Date) => {
            try {
                setState({ ...state, isLoading: true });
                await google.authorize();
                const events = await google.fetchEvents(date, defaultProject);
                const newTasks = events.map((task) => {
                    const taskWithId = { ...task, id: randomUUID() };
                    return taskWithId;
                });
                setState((prev) => ({ ...prev, tasks: [...state.tasks, ...newTasks], isLoading: false }));
                pop();
                showToast({
                    style: Toast.Style.Success,
                    title: 'Yay!',
                    message: `Task Imported`,
                });
            } catch (error) {
                showToast({
                    style: Toast.Style.Failure,
                    title: 'Opps!',
                    message: `Error importing tasks`,
                });
            }
        },
        [state.tasks, setState]
    );

    const handleCreate = useCallback(
        (task: Task) => {
            try {
                trimStringInObject(task);
                const newTask = [...state.tasks, { ...task, id: randomUUID() }];
                setState((previous) => ({ ...previous, tasks: newTask }));
                pop();
                showToast({
                    style: Toast.Style.Success,
                    title: 'Yay!',
                    message: `Task created`,
                });
            } catch (error) {
                showToast({
                    style: Toast.Style.Failure,
                    title: 'Opps!',
                    message: `Error creating tasks`,
                });
            }
        },
        [state.tasks, setState]
    );

    const handleEdit = useCallback(
        (values: Task) => {
            try {
                trimStringInObject(values);
                const newTasks = [...state.tasks];
                const index = newTasks.findIndex((task) => task.id === values.id);
                newTasks[index] = { ...values };
                setState((previous) => ({ ...previous, tasks: newTasks }));
                pop();
                showToast({
                    style: Toast.Style.Success,
                    title: 'Yay!',
                    message: `Task edited`,
                });
            } catch (error) {
                showToast({
                    style: Toast.Style.Failure,
                    title: 'Opps!',
                    message: `Error editing tasks`,
                });
            }
        },
        [state.tasks, setState]
    );

    const handleDuplicate = useCallback(
        (id: string) => {
            try {
                const newTasks = [...state.tasks];
                const index = newTasks.findIndex((task) => task.id === id);
                const newTask = { ...newTasks[index], id: randomUUID() };
                newTasks.splice(index, 0, newTask);
                setState((previous) => ({ ...previous, tasks: newTasks }));
                showToast({
                    style: Toast.Style.Success,
                    title: 'Yay!',
                    message: `Task duplicated`,
                });
            } catch (error) {
                showToast({
                    style: Toast.Style.Failure,
                    title: 'Opps!',
                    message: `Error duplicating tasks`,
                });
            }
        },
        [state.tasks, setState]
    );

    const handleImportFromJira = useCallback(
        async (date: Date, project: string, status: string) => {
            try {
                setState({ ...state, isLoading: true });
                const newTasks = await jira.getTodaysTasks(date, project, status, defaultProject);
                if (newTasks.length === 0) {
                    setState({ ...state, isLoading: false });
                    showToast({
                        style: Toast.Style.Failure,
                        title: 'Opps!',
                        message: `No tasks found`,
                    });
                    return;
                }
                setState((prev) => ({ ...prev, tasks: [...prev.tasks, ...newTasks], isLoading: false }));
                pop();
                showToast({
                    style: Toast.Style.Success,
                    title: 'Yay!',
                    message: `Task Imported`,
                });
            } catch (error) {
                showToast({
                    style: Toast.Style.Failure,
                    title: 'Opps!',
                    message: `Error importing tasks ${error}`,
                });
            }
        },
        [state.tasks, setState]
    );

    const handleExport = useCallback(() => {
        try {
            let data;
            let extension;
            if (exportType === 'json') {
                data = JSON.stringify(state.tasks);
                extension = 'json';
            } else {
                data = YAML.dump(state.tasks);
                extension = 'yaml';
            }
            const filename = `${getSaveDirectory()}/${moment().format('DD-MM-YYYY')}_tasks.${extension}`;
            writeFileSync(filename, data, 'utf-8');
            setState({ ...state, tasks: [] });

            showToast({
                style: Toast.Style.Success,
                title: 'Yay!',
                message: `Task created`,
            });
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: 'Opps!',
                message: `Error exporting tasks`,
            });
        }
    }, [state.tasks, setState]);

    const handleToggleShowDetails = useCallback(() => {
        setState((prev) => ({ ...prev, isShowingDetail: !prev.isShowingDetail }));
    }, []);

    return (
        <List isLoading={state.isLoading} isShowingDetail={state.isShowingDetail}>
            <EmptyView
                onCreate={handleCreate}
                onImport={googleClientId ? handleImportFromGoogle : undefined}
                onImportFromJira={jiraToken ? handleImportFromJira : undefined}
            />
            {groupedTasks.map((group, groupIndex) => {
                const dateMoment = moment(group.date, 'DD-MM-YYYY');
                const dateSuffix = dateMoment.calendar({
                    sameDay: '[Today]',
                    nextDay: '[Tomorrow]',
                    nextWeek: '[Next] dddd',
                    lastDay: '[Yesterday]',
                    lastWeek: '[Last] dddd',
                    sameElse: () => `[${[dateMoment.format('dddd'), dateMoment.fromNow()].join(' ')}]`,
                });
                return (
                    <List.Section
                        key={group.date}
                        title={`${group.date} (${dateSuffix})`}
                        subtitle={`${pluralize(group.tasks.length, 'task')}, total ${pluralize(
                            group.totalManhours,
                            'hour'
                        )}`}
                    >
                        {group.tasks.map((task) => {
                            return (
                                <List.Item
                                    key={task.id}
                                    icon={{
                                        source: Icon.Dot,
                                        tintColor: group.totalManhours >= 8 ? Color.Green : Color.Orange,
                                    }}
                                    title={task.task}
                                    detail={<TaskDetail task={task} />}
                                    accessories={[
                                        task.crNo ? { text: task.crNo, icon: Icon.Document } : {},
                                        { text: { value: `${task.manhours}` }, icon: Icon.Stopwatch },
                                    ]}
                                    actions={
                                        <ActionPanel>
                                            <ActionPanel.Section>
                                                <EditTaskAction onEdit={handleEdit} task={task} />
                                                <CreateTaskAction onCreate={handleCreate} />
                                                <DuplicateTaskAction onDupe={() => handleDuplicate(task.id)} />
                                                <DeleteTaskAction onDelete={() => handleDelete(task.id)} />
                                            </ActionPanel.Section>
                                            <ActionPanel.Section>
                                                <ExportFileAction onExport={handleExport} />
                                            </ActionPanel.Section>
                                            <ActionPanel.Section>
                                                {googleClientId && (
                                                    <ImportTasksAction onImport={handleImportFromGoogle} />
                                                )}
                                                {jiraToken && <ImportFromJiraAction onImport={handleImportFromJira} />}
                                            </ActionPanel.Section>
                                            <ActionPanel.Section>
                                                <ToggleShowDetailsAction
                                                    onAction={handleToggleShowDetails}
                                                    isShowingDetail={state.isShowingDetail}
                                                />
                                            </ActionPanel.Section>
                                        </ActionPanel>
                                    }
                                />
                            );
                        })}
                    </List.Section>
                );
            })}
        </List>
    );
}
