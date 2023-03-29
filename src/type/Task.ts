export type Task = {
  id: number;
  manhours: number;
  module?: string;
  project: string;
  task: string;
  subTask?: string;
  remark?: string;
  crNo?: string;
  date: string;
};
