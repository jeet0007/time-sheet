import { Action, ActionPanel, Form } from '@raycast/api';
import moment from 'moment';
import { Task } from '../type/Task';

export interface CreateTaskProps {
    onCreate: (task: Task) => void;
}
export const CreateTaskForm = (props: CreateTaskProps) => {
    const handleSubmit = (values: Task) => {
        props.onCreate(values);
    };
    return (
        <Form
            actions={
                <ActionPanel>
                    <Action.SubmitForm title="Create New Task" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.TextField id="task" title="Task" />
            <Form.TextField id="manhours" title="Man hours" defaultValue="1" />
            <Form.TextField id="module" title="Module" />
            <Form.Dropdown id="project" title="Project">
                <Form.Dropdown.Item value="108" title="[APPMAN] MAC" />
                <Form.Dropdown.Item value="132" title="MAC-KTAXA" />
                <Form.Dropdown.Item value="51" title="[KTAXA] Advisor Zone" />
                <Form.Dropdown.Item value="127" title="[Squad] iPaaS" />
                <Form.Dropdown.Item value="47" title="Leave" />
            </Form.Dropdown>
            <Form.Checkbox id="isEnhancement" label="Is Enhancement" defaultValue={false} />
            <Form.TextField id="subTaskInput" title="Sub task" />
            <Form.TextField id="remark" title="Remark" />
            <Form.TextField id="crNo" title="Cr No" />
            <Form.TextField id="date" title="Date" defaultValue={moment().format('DD-MM-YYYY')} />
        </Form>
    );
};
