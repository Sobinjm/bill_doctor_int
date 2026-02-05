import { UIResponse, Workflow, WorkflowState } from "../types";

export class WorkflowEngine {
    static getNextState(currentState: WorkflowState, action: string): WorkflowState {
        switch (currentState) {
            case 'DRAFT':
                if (action === 'SUBMIT_BILL') return 'REVIEW';
                break;
            case 'REVIEW':
                if (action === 'SAVE_CORRECTIONS') return 'ESTIMATE';
                if (action === 'BACK') return 'DRAFT';
                break;
            case 'ESTIMATE':
                if (action === 'CONFIRM_ESTIMATE') return 'DONE';
                if (action === 'BACK') return 'REVIEW';
                break;
            case 'DONE':
                break;
        }
        throw new Error(`Invalid transition from ${currentState} with action ${action}`);
    }



static getUI(workflow: Workflow): UIResponse {
    const { state, context } = workflow;

    // Default response structure
    const response: UIResponse = {
        workflow: {
            id: workflow.id,
            state: workflow.state,
            version: workflow.version,
            context: workflow.context,
        },
        view: {
            screen: { title: '', subtitle: '' },
            components: [],
            actions: [],
        },
        allowedActions: [],
    };

    switch (state) {
        case 'DRAFT':
            response.view.screen = { title: 'Upload Bill', subtitle: 'Get started with solar savings' };
            response.view.components = [
                { type: 'Banner', props: { message: 'Upload your bill to see how much you can save.' } },
                { type: 'Form', props: { fields: [{ name: 'billText', label: 'Paste Bill Text', type: 'textarea' }] } },
            ];
            response.view.actions = [{ key: 'SUBMIT_BILL', label: 'Analyze Bill', variant: 'primary' }];
            response.allowedActions = ['SUBMIT_BILL'];
            break;
    }

    return response;
}

}