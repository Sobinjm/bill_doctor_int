import { WorkflowEngine } from "./workflow_engine";

describe('WorkflowEngine State Transitions', () => {
    test('DRAFT -> REVIEW on SUBMIT_BILL', () => {
        expect(WorkflowEngine.getNextState('DRAFT', 'SUBMIT_BILL')).toBe('REVIEW');
    });

    test('REVIEW -> ESTIMATE on SAVE_CORRECTIONS', () => {
        expect(WorkflowEngine.getNextState('REVIEW', 'SAVE_CORRECTIONS')).toBe('ESTIMATE');
    });

    test('ESTIMATE -> DONE on CONFIRM_ESTIMATE', () => {
        expect(WorkflowEngine.getNextState('ESTIMATE', 'CONFIRM_ESTIMATE')).toBe('DONE');
    });

    test('REVIEW -> DRAFT on BACK', () => {
        expect(WorkflowEngine.getNextState('REVIEW', 'BACK')).toBe('DRAFT');
    });

    test('ESTIMATE -> REVIEW on BACK', () => {
        expect(WorkflowEngine.getNextState('ESTIMATE', 'BACK')).toBe('REVIEW');
    });

    test('Invalid transition throws error', () => {
        expect(() => WorkflowEngine.getNextState('DRAFT', 'INVALID_ACTION')).toThrow();
    });
});

describe('Savings Calculation', () => {
    test('Calculates savings correctly (capped)', () => {

        expect(WorkflowEngine.calculateSavings(600, 0.1)).toBe(30);
    });

    test('Calculates savings correctly (uncapped)', () => {

        expect(WorkflowEngine.calculateSavings(100, 0.2)).toBe(12);
    });
});
