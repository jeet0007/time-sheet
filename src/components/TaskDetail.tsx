import { Icon, List } from '@raycast/api'
import { Task } from '../type/Task'
import { projectOptions } from '../configs/masterdata'

export const TaskDetail = ({ task }: { task: Task }) => {
  return (
    <List.Item.Detail
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Date" text={task.date} />
          <List.Item.Detail.Metadata.Label title="Task" text={task.task} />
          <List.Item.Detail.Metadata.Label title="Man hours" text={`${task.manhours}`} icon={Icon.Stopwatch} />
          <List.Item.Detail.Metadata.Label title="Module" text={task.module} />
          <List.Item.Detail.Metadata.Label
            title="Project"
            text={projectOptions.find((item) => item.value === task.project)?.title || task.project}
          />
          <List.Item.Detail.Metadata.Label title="Is Enhancement" text={task.isEnhancement ? 'Yes' : 'No'} />
          <List.Item.Detail.Metadata.Label title="Sub task" text={task.subTask} />
          <List.Item.Detail.Metadata.Label title="Remark" text={task.remark} />
          <List.Item.Detail.Metadata.Label title="Cr No" text={task.crNo} />
          <List.Item.Detail.Metadata.Separator />
        </List.Item.Detail.Metadata>
      }
    />
  )
}
