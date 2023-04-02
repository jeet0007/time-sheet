import { Action, ActionPanel, Form, showToast, Toast } from "@raycast/api"
import moment from "moment";
import { Task } from "../type/Task"
import { useForm, FormValidation } from "@raycast/utils";

export interface CreateTaskProps {
    onCreate: (task: Task) => void;
}


export const CreateTaskForm = (props: CreateTaskProps) => {
    const { handleSubmit, itemProps } = useForm<Task>({
        onSubmit(values: Task) {
            props.onCreate(values)
            showToast({
                style: Toast.Style.Success,
                title: "Yay!",
                message: `Task created`,
            });
        },
        validation: {
            task: FormValidation.Required,
            manhours: (value: number) => {
                if (value && value < 1) {
                    return "Hours cannot be less then 0";
                } else if (!value) {
                    return "The item is required";
                }
            },
            date: (value: Date) => {
                if (!moment(value, "DD-MM-YYYY").isValid()) {
                    return "Invalid date"
                } else if (!value) {
                    return "The item is required";
                }
            }
        }
    })
    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Create New Task" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.TextField title="Task" {...itemProps.task} />
            <Form.TextField title="Man hours" id="manhours" defaultValue={"1"} />
            <Form.TextField title="Module" {...itemProps.module} />
            <Form.Dropdown title="Project" {...itemProps.project}>
                <Form.Dropdown.Item value="108" title="[APPMAN] MAC" />
                <Form.Dropdown.Item value="132" title="MAC-KTAXA" />
                <Form.Dropdown.Item value="51" title="[KTAXA] Advisor Zone" />
                <Form.Dropdown.Item value="47" title="Leave" />
            </Form.Dropdown>
            <Form.TextField title="Sub task" {...itemProps.subTask} />
            <Form.TextField title="Remark" {...itemProps.subTask} />
            <Form.TextField title="Cr No" {...itemProps.crNo} />
            <Form.TextField title="Date" defaultValue={moment().format("DD-MM-YYYY")} {...itemProps.date} />
        </Form>
    )
}