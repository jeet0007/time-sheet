import {
    ActionPanel,
    Color,
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
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { parseJSON, pluralize } from './utils/string';
import { TaskDetail } from './components/TaskDetail';
import { SettingAction } from './components/SettingAction';

export type State = {
    tasks: Task[];
};

type TaskGroup = { date: string; tasks: Task[]; totalManhours: number };

export function getSaveDirectory(): string {
    let { saveDirectory } = getPreferenceValues();
    saveDirectory = saveDirectory.replace('~', homedir());
    return resolve(saveDirectory);
}

export default function Command() {
    const { exportType = 'json', googleClientId, jiraToken, defaultProject } = getPreferenceValues<PreferencesType>();
    const { pop } = useNavigation();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isShowingDetail, setIsShowingDetail] = useState(false);

    const groupedTasks = useMemo(
        () =>
            tasks
                .reduce<TaskGroup[]>((acc, task) => {
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
                        acc[index].totalManhours +=
                            typeof task.manhours === 'string' ? parseInt(task.manhours) : task.manhours;
                    }
                    return acc;
                }, [])
                .sort((a, b) => (moment(a.date, 'DD-MM-YYYY').isSameOrBefore(moment(b.date, 'DD-MM-YYYY')) ? 1 : -1)),
        [tasks]
    );

    const handleDelete = useCallback((id: string) => {
        try {
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
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
    }, []);

    const handleImportFromGoogle = useCallback(async (date: Date) => {
        try {
            setIsLoading(true);
            await google.authorize();
            const events = await google.fetchEvents(date, defaultProject);
            const newTasks = events.map((task) => {
                const taskWithId = { ...task, id: randomUUID() };
                return taskWithId;
            });
            setIsLoading(false);
            setTasks((prev) => [...prev, ...newTasks]);
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
    }, []);

    const handleCreate = useCallback((task: Task) => {
        try {
            trimStringInObject(task);
            setTasks((previous) => [...previous, { ...task, id: randomUUID() }]);
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
    }, []);

    const handleEdit = useCallback((values: Task) => {
        try {
            trimStringInObject(values);
            setTasks((previous) => {
                const newTasks = [...previous];
                const index = previous.findIndex((task) => task.id === values.id);
                newTasks[index] = { ...values };
                return newTasks;
            });
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
    }, []);

    const handleDuplicate = useCallback((task: Task) => {
        try {
            setTasks((previous) => [...previous, { ...task, id: randomUUID() }]);
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
    }, []);

    const handleImportFromJira = useCallback(async (date: Date, project: string, status: string) => {
        try {
            setIsLoading(true);
            const newTasks = await jira.getTodaysTasks(date, project, status, defaultProject);
            setIsLoading(false);
            if (newTasks.length === 0) {
                showToast({
                    style: Toast.Style.Failure,
                    title: 'Opps!',
                    message: `No tasks found`,
                });
                return;
            }
            setTasks((prev) => [...prev, ...newTasks]);
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
    }, []);

    const handleExport = useCallback(() => {
        try {
            let data;
            let extension;
            if (exportType === 'json') {
                data = JSON.stringify(tasks);
                extension = 'json';
            } else {
                data = YAML.dump(tasks);
                extension = 'yaml';
            }
            const filename = `${getSaveDirectory()}/${moment().format('DD-MM-YYYY')}_tasks.${extension}`;
            writeFileSync(filename, data, 'utf-8');
            setTasks([]);

            showToast({
                style: Toast.Style.Success,
                title: 'Yay!',
                message: `Task created: ${filename}`,
            });
        } catch (error) {
            showToast({
                style: Toast.Style.Failure,
                title: 'Opps!',
                message: `Error exporting tasks`,
            });
        }
    }, [tasks]);

    const handleToggleShowDetails = useCallback(() => {
        setIsShowingDetail((prev) => !prev);
    }, []);

    const loadTasks = useCallback(async () => {
        const storedTasks = await LocalStorage.getItem<string>('tasks');
        setIsLoading(false);
        setTasks(parseJSON(storedTasks) || []);
    }, []);

    useEffect(() => {
        loadTasks();
    }, [loadTasks]);

    useEffect(() => {
        LocalStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    return (
        <List isLoading={isLoading} isShowingDetail={isShowingDetail}>
            <EmptyView
                onCreate={handleCreate}
                onImport={googleClientId ? handleImportFromGoogle : undefined}
                onImportFromJira={jiraToken ? handleImportFromJira : undefined}
            />
            {groupedTasks.map((group) => {
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
                                                <DuplicateTaskAction onDupe={() => handleDuplicate(task)} />
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
                                                    isShowingDetail={isShowingDetail}
                                                />
                                                <SettingAction />
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
