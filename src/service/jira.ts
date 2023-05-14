import { getPreferenceValues } from '@raycast/api';
import { PreferencesType } from '../type/config';
import fetch, { Headers } from 'node-fetch';
import moment from 'moment';
import { JiraIssue } from '../type/Jira';
import { randomUUID } from 'node:crypto';
import { Task } from '../type/Task';

const { jiraToken, jiraEmail }: PreferencesType = getPreferenceValues();
const JIRA_URL = 'https://agentmate.atlassian.net';

export async function getTodaysTasks(date: Date, project: string, status: string, defaultProject = '108') {
    console.log('getTodaysTasks');

    if (!jiraToken || !jiraEmail) return [];
    // create an api request to get all tasks for today use basic auth
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + Buffer.from(jiraEmail + ':' + jiraToken).toString('base64'));
    headers.append('Accept', 'application/json');
    const endpoint = new URL(`${JIRA_URL}/rest/api/3/search`);
    endpoint.searchParams.append('fields', 'status,summary,statuscategorychangedate');
    endpoint.searchParams.append(
        'jql',
        `project = '${project}' AND assignee = '${jiraEmail}' AND status = '${status}'`
    );

    const response = await fetch(endpoint.toString(), {
        headers,
        method: 'GET',
        redirect: 'follow',
    });
    if (response.status === 401) {
        throw new Error('Invalid Jira credentials');
    }
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const data = (await response.json()) as { issues: JiraIssue[] };
    // TODO: parse data to get the tasks
    if (data && typeof data == 'object') {
        const { issues } = data;
        const tasks: Task[] = issues.map((issue: JiraIssue) => {
            const { summary, status } = issue?.fields;

            const { name } = status;
            return {
                id: randomUUID(),
                task: `[${name}] ${summary}`,
                module: project.toLocaleUpperCase(),
                manhours: 1,
                project: defaultProject,
                crNo: issue.key,
                date: moment(date).format('DD-MM-YYYY'),
            };
        });
        return tasks;
    }
    return [];
}
