import { Action, Icon } from "@raycast/api"
import { Task } from "../type/Task"
import { CreateTaskForm } from "./CreateTaskForm"

interface CreateTaskProps {
    onCreate: (task: Task) => void
}

export const CreateTaskAction = (props: CreateTaskProps) => {
    return (
        <Action.Push
            icon={Icon.Pencil}
            title="Create New Task"
            shortcut={{ modifiers: ["ctrl"], key: "n" }}
            target={<CreateTaskForm onCreate={props.onCreate} />}
        />

    )
}