import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import { GIT_DIR } from './constants';

const options: Partial<SimpleGitOptions> = {
  baseDir: GIT_DIR,
};

export const git: SimpleGit = simpleGit(options);