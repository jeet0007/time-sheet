import { ActionPanel, List, LocalStorage, Toast, getPreferenceValues, showToast, useNavigation } from "@raycast/api";
import { writeFileSync } from "fs";
import moment from "moment";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { useCallback, useEffect, useState } from "react";
import {
    CreateTaskAction,
    DeleteTaskAction,
    DuplicateTaskAction,
    EditTaskAction,
    EmptyView,
    ImportFromGithubAction,
} from './components';
import { ExportFileAction } from './components/ExportFileAction';
import { Task } from './type/Task';
import { ImportTasksAction } from './components/ImportTasksAction';
import * as google from './service/google';
import * as github from './service/github';
import { randomUUID } from 'node:crypto';
import YAML from 'js-yaml';
import { PreferencesType } from './type/config';
export type State = {
    tasks: Task[];
    isLoading: boolean;
};

export function getSaveDirectory(): string {
    let { saveDirectory } = getPreferenceValues();
    saveDirectory = saveDirectory.replace('~', homedir());
    return resolve(saveDirectory);
}

export default function Command() {
    const { exportType = 'json', googleClientId, githubToken }: PreferencesType = getPreferenceValues();
    const { pop } = useNavigation();

    const [state, setState] = useState<State>({
        tasks: [],
        isLoading: true,
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
                const events = await google.fetchEvents(date);
                const newTasks = events.map((task) => {
                    const taskWithId = { ...task, id: randomUUID() };
                    return taskWithId;
                });
                setState({ tasks: [...state.tasks, ...newTasks], isLoading: false });
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
                const newTasks = [...state.tasks];
                const index = newTasks.findIndex((task) => task.id === values.id);
                console.log(values);
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

    const handleImportFromGithub = useCallback(async () => {
        try {
            console.log(await github.getRepositories());
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: 'Opps!',
                message: `Error importing tasks`,
            });
        }
    }, [state.tasks, setState]);

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

    return (
        <List isLoading={state.isLoading}>
            <EmptyView
                onCreate={handleCreate}
                tasks={state.tasks}
                onImport={googleClientId ? handleImportFromGoogle : undefined}
            />
            {groupedTasks.map((group, groupIndex) => (
                <List.Section
                    key={groupIndex}
                    title={group.date}
                    subtitle={`${group.tasks.length} task${group.tasks.length === 1 ? '' : 's'}  total hours: ${
                        group.totalManhours
                    }`}
                >
                    {group.tasks.map((task, taskIndex) => (
                        <List.Item
                            key={taskIndex}
                            title={task.task}
                            actions={
                                <ActionPanel>
                                    <ActionPanel.Section>
                                        <EditTaskAction onEdit={handleEdit} task={task} />
                                        <CreateTaskAction onCreate={handleCreate} />
                                        <DeleteTaskAction onDelete={() => handleDelete(task.id)} />
                                        <ExportFileAction onExport={handleExport} />
                                        <DuplicateTaskAction onDupe={() => handleDuplicate(task.id)} />
                                        {googleClientId && <ImportTasksAction onImport={handleImportFromGoogle} />}
                                        {githubToken && <ImportFromGithubAction onImport={handleImportFromGithub} />}
                                    </ActionPanel.Section>
                                </ActionPanel>
                            }
                            subtitle={`Hours: ${task.manhours}`}
                        />
                    ))}
                </List.Section>
            ))}
        </List>
    );
}
