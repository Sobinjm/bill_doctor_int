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
                response.view.screen = { title: 'Upload Bill Details', subtitle: 'Get started with solar savings' };
                response.view.components = [
                    { type: 'Banner', props: { message: 'Copy/Paste your bill details to see how much you can save.' } },
                    { type: 'Form', props: { fields: [{ name: 'billText', label: 'Paste Bill Text', type: 'textarea' }] } },
                ];
                response.view.actions = [{ key: 'SUBMIT_BILL', label: 'Analyze Bill', variant: 'primary' }];
                response.allowedActions = ['SUBMIT_BILL'];
                break;
            case 'REVIEW':
                const extracted = context.billData?.extractedFields || { units: 0, rate: 0 };
                response.view.screen = { title: 'Review Details', subtitle: 'We extracted this from your bill.' };
                response.view.components = [
                    {
                        type: 'Form',
                        props: {
                            fields: [
                                { name: 'units', label: 'Monthly Units (kWh)', type: 'number', value: extracted.units }, 
                                { name: 'rate', label: 'Rate ($/kWh)', type: 'number', value: extracted.rate }
                            ]
                        }
                    },
                ];
                response.view.actions = [
                    { key: 'BACK', label: 'Back', variant: 'secondary' },
                    { key: 'SAVE_CORRECTIONS', label: 'Calculate Savings', variant: 'primary' }
                ];
                response.allowedActions = ['BACK', 'SAVE_CORRECTIONS'];
                break;

                case 'ESTIMATE':
                    response.view.screen = { title: 'Your Savings', subtitle: 'Here is what you could save.' };
                    response.view.components = [
                        {
                            type: 'SummaryCard',
                            props: {
                                title: 'Estimated Monthly Savings',
                                value: `$${context.savings?.toFixed(2)}`,
                                description: 'Based on your usage and local solar rates.'
                            }
                        },
                    ];
                    response.view.actions = [
                        { key: 'BACK', label: 'Back', variant: 'secondary' },
                        { key: 'CONFIRM_ESTIMATE', label: 'Get Full Report', variant: 'primary' }
                    ];
                    response.allowedActions = ['BACK', 'CONFIRM_ESTIMATE'];
                    break;
    
                case 'DONE':
                    console.log('DONE', context);
                    response.view.screen = { title: 'All Done!', subtitle: 'Your report is ready.' };
                    response.view.components = [
                       
                        {
                            type: 'SummaryCard',
                            props: {
                                value: `$${context.savings?.toFixed(2)}`,
                                description: 'Total Units Used (kWh): ' + context.units?.toFixed(2) + '. Monthly Charge Rate ($/kWh): ' + context.rate?.toFixed(2)
                            }
                        },
                        { type: 'Banner', props: { message: 'We have emailed you the detailed report.', variant: 'success' } },
                    ];
                    response.allowedActions = [];
                    break;
            }

        return response;
    }

    static billExtraction(billText: string): { units: number, rate: number, amount: number } {

        const jsonString = billText;

        const parsed = JSON.parse(jsonString);

        const totalUnitsUsed = parsed.total_units_used;
        const chargePerUnit = parsed.charge_per_unit;

        return {
            units: parseFloat(totalUnitsUsed || '0'),
            rate: parseFloat(chargePerUnit || '0'),
            amount: totalUnitsUsed * chargePerUnit,
        };

    }

    static calculateSavings(units: number, rate: number): number {
        return Math.min(units * 0.6, 300) * rate;
    }
}