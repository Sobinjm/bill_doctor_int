/* eslint-disable @typescript-eslint/no-explicit-any */
export type WorkflowState = 'DRAFT' | 'REVIEW' | 'ESTIMATE' | 'DONE';
// DRAFT : User uploads/pastes bill data (New billing cycle)
// REVIEW : Backend returns extracted fields (mocked); user corrects data (mocked)
// ESTIMATE : Backend calculates solar savings and returns a "Trust/Flags" screen. User confirms the estimate (mocked)
// DONE: Final summary and report saved. Send PDF report through email(mocked)

export interface WorkflowContext {
    billData?: {
        rawText?: string;
        extractedFields?: {
            units: number;
            rate: number;
            accountNumber?: string;
        };
        corrections?: {
            units: number;
            rate: number;
        };
    };
    savings?: number;
    reportUrl?: string;
}

export interface UIResponse {
    workflow: {
        id: string;
        state: WorkflowState;
        version: number;
    };
    view: {
        screen: {
            title: string;
            subtitle: string;
        };
        components: SDUIComponent[];
        actions: Action[];
    };
    allowedActions: string[];
}

export interface SDUIComponent {
    type: string;
    props: Record<string, any>;
}

export interface Action {
    key: string;
    label: string;
    variant: 'primary' | 'secondary' | 'danger';
}
