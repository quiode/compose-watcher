import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import { REPO_DIR } from './constants';

const options: Partial<SimpleGitOptions> = {
  baseDir: REPO_DIR,
};

export const git: SimpleGit = simpleGit(options);