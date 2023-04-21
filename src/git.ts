import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import { WATCHER_REPO_DIR } from './constants';

const options: Partial<SimpleGitOptions> = {
  baseDir: WATCHER_REPO_DIR,
};

export const git: SimpleGit = simpleGit(options);