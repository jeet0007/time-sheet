import { Octokit } from 'octokit';
import { PreferencesType } from '../type/config';
import { getPreferenceValues } from '@raycast/api';
const { githubToken }: PreferencesType = getPreferenceValues();
const getOctokit = () => {
    if (githubToken) {
        return new Octokit({ auth: githubToken });
    }
    return new Octokit({});
};
export const getRepositories = async () => {
    const octokit = getOctokit();
    const {
        data: { login },
    } = await octokit.rest.users.getAuthenticated();

    const { data } = await octokit.rest.repos.listForUser({
        username: login,
    });

    return data.map((repo) => ({
        name: repo.name,
        id: repo.id,
    }));
};
