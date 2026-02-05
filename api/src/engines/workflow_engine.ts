import { WorkflowState } from "../types";

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

}

