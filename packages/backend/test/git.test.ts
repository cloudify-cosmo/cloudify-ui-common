import fs from 'fs';
import simpleGit from 'simple-git';
import os from 'os';
import uniqueDirectoryName from 'short-uuid';
import { cloneGitRepo } from '../src';

jest.mock('fs');
jest.mock('simple-git');
jest.mock('short-uuid');
jest.mock('os');

describe('git', () => {
    it('clones git repo', async () => {
        const clone = jest.fn();
        (<jest.Mock>simpleGit).mockReturnValue({ clone });
        (<jest.Mock>os.tmpdir).mockReturnValue('tmp');
        (<jest.Mock>uniqueDirectoryName.generate).mockReturnValue('dir');

        const url = '//url';
        const callback = jest.fn();

        await cloneGitRepo(url, callback, 'dXNlcjpwYXNz');

        const repositoryPath = 'tmp/dir';
        expect(clone).toHaveBeenCalledWith('//user:pass@url', repositoryPath, [
            '-c core.askPass=echo',
            '--filter=blob:none'
        ]);
        expect(callback).toHaveBeenCalledWith(repositoryPath);
        expect(fs.rmdirSync).toHaveBeenCalledWith(repositoryPath, { recursive: true });
    });
});
