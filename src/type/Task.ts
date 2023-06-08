export type Task = {
  id: string
  manhours: number
  module?: string
  project?: string
  task: string
  subTask?: string
  remark?: string
  crNo?: string
  date: string
  isEnhancement?: boolean
  repeat?: boolean
}
