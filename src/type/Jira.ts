export type Fields = {
  summary: string
  status: JiraStatus
  updated: string
}

export type JiraStatus = {
  id: string
  name: Status
  description: string
  statusCategory: {
    name: string
  }
}

export type JiraIssue = {
  key: string
  fields: Fields
}

export enum Status {
  'ToDo' = 'To Do',
  'InProgress' = 'In Progress',
  'Done' = 'Done',
  'Doing' = 'Doing',
}
