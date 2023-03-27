import fs from 'fs';
import { getGitUrl, removeGitRepo } from '../src';

jest.mock('fs');

describe('git', () => {
    it('creates credentials URL', () => {
        const result = getGitUrl('//url', 'dXNlcjpwYXNz');
        expect(result).toBe('//user:pass@url');
    });

    it('removes git repo', () => {
        const path = 'xyz';
        removeGitRepo(path);
        expect(fs.rmdirSync).toHaveBeenCalledWith(path, { recursive: true });
    });
});
