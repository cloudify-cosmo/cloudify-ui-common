import fs from 'fs';
import path from 'path';
import os from 'os';
import uniqueDirectoryName from 'short-uuid';
import simpleGit from 'simple-git';

// NOTE: The idea behind the code below has been described in more details here: https://serverfault.com/questions/544156/git-clone-fail-instead-of-prompting-for-credentials
const disableGitAuthenticationPromptOption = '-c core.askPass=echo';
const filterOutBlobsOption = '--filter=blob:none';

const getUniqNotExistingTemporaryDirectory = (): string => {
    const repositoryPath = path.join(os.tmpdir(), uniqueDirectoryName.generate());
    if (fs.existsSync(repositoryPath)) {
        return getUniqNotExistingTemporaryDirectory();
    }
    return repositoryPath;
};

const getGitUrl = (url: string, authHeader?: string) => {
    if (authHeader) {
        const encodedCredentials = authHeader.replace(new RegExp('Basic ', 'ig'), '');
        const gitCredentials = Buffer.from(encodedCredentials, 'base64').toString('binary');
        const [username, personalToken] = gitCredentials.split(':');
        const credentialsString = `${username}:${personalToken}@`;
        return url.replace('//', `//${credentialsString}`);
    }

    return url;
};

export const cloneGitRepo = async <Result>(
    url: string,
    callback: (path: string) => Result,
    authHeader?: string
): Promise<Result> => {
    const repositoryPath = getUniqNotExistingTemporaryDirectory();
    try {
        const gitUrl = getGitUrl(url, authHeader);
        await simpleGit().clone(gitUrl, repositoryPath, [disableGitAuthenticationPromptOption, filterOutBlobsOption]);
        return await callback(repositoryPath);
    } catch (error: any) {
        const isAuthenticationIssue = error.message.includes('Authentication failed');
        const errorMessage = isAuthenticationIssue
            ? 'Git Authentication failed - Please note that some git providers require a token to be passed instead of a password'
            : 'The URL is not accessible';

        throw new Error(errorMessage);
    } finally {
        removeGitRepo(repositoryPath);
    }
};

const removeGitRepo = (repositoryPath: string) => {
    if (fs.existsSync(repositoryPath)) fs.rmdirSync(repositoryPath, { recursive: true });
};
