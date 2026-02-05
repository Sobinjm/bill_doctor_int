import cors from 'cors';
import express from 'express';
import { WorkflowEngine } from './engines/workflow_engine';
import { getClient, query } from './db';
import { v4 as uuidv4 } from 'uuid';
import { WorkflowContext } from './types';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/v1/workflows/:id/ui', async (req, res) => {
    const { id } = req.params;
    try {
        // Check if it's a new workflow request (e.g. "new")
        if (id === 'new') {
            const newId = uuidv4();
            const client = await getClient();
            try {
                await client.query('BEGIN');
                await client.query('INSERT INTO workflows (id, state, version) VALUES ($1, $2, $3)', [newId, 'DRAFT', 1]);
                await client.query('INSERT INTO workflow_ctx (workflow_id, context, version) VALUES ($1, $2, $3)', [newId, {}, 1]);
                await client.query('COMMIT');
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }

            return res.json(WorkflowEngine.getUI({
                id: newId,
                state: 'DRAFT',
                version: 1,
                context: {}
            }));
        }

        const result = await query(
            'SELECT w.id, w.state, w.version, c.context FROM workflows w JOIN workflow_ctx c ON w.id = c.workflow_id AND w.version = c.version WHERE w.id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        const { state, version, context } = result.rows[0];
        const ui = WorkflowEngine.getUI({ id, state, version, context });
        res.json(ui);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// POST /v1/workflows/:id/actions
app.post('/v1/workflows/:id/actions', async (req, res) => {
    const { id } = req.params;
    const { action, expectedVersion, idempotencyKey, payload } = req.body;
   

    if (!action || expectedVersion === undefined || !idempotencyKey) {
        console.error('Missing fields:', { action, expectedVersion, idempotencyKey });
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await getClient();
    try {
        await client.query('BEGIN');

        //Check Idempotency (First, before locking or version check)
        const eventRes = await client.query('SELECT id FROM workflow_events WHERE idempotency_key = $1', [idempotencyKey]);
        if (eventRes.rows.length > 0) {
            // Already processed so we are ignoring this request and rolling back.
            await client.query('ROLLBACK');
            return res.json({ status: 'ignored', message: 'Event already processed' });
        }

        // Fetch current state and version (Locking for update?)
        const wfRes = await client.query('SELECT state, version FROM workflows WHERE id = $1 FOR UPDATE', [id]);
        if (wfRes.rows.length === 0) throw new Error('Workflow not found');

        const { state, version } = wfRes.rows[0];

        if (version !== expectedVersion) {
            throw new Error('Version mismatch'); // SDUI contract violation or concurrent edit
        }

        // Determine next state
        const nextState = WorkflowEngine.getNextState(state, action);

        // Preparing new context
        let newContext: WorkflowContext = {};
        const ctxRes = await client.query('SELECT context FROM workflow_ctx WHERE workflow_id = $1 AND version = $2', [id, version]);
        const currentContext = ctxRes.rows[0]?.context || {};

        newContext = { ...currentContext };

    
        if (state === 'DRAFT' && action === 'SUBMIT_BILL') {
            // value extraction
            const text = payload.billText;
            const extractedContent = WorkflowEngine.billExtraction(text);
            newContext.billData = {
                rawText: text,
                extractedFields: extractedContent 
            };
            console.log('new context', newContext)
        } else if (state === 'REVIEW' && action === 'SAVE_CORRECTIONS') {
           
            const { units, rate } = payload;
            if (!newContext.billData) {
                newContext.billData = { extractedFields: { units, rate }, rawText: '' };
            }
            newContext.billData.extractedFields = { units, rate }; // Apply corrections
            newContext.savings = WorkflowEngine.calculateSavings(units, rate);
        } else if (state === 'ESTIMATE' && action === 'CONFIRM_ESTIMATE') {
            newContext.reportUrl = 'http://example.com/report.pdf';
        } else if (action === 'BACK') {
            // No context changes for back navigation
        }

        const newVersion = version + 1;

    
        await client.query('INSERT INTO workflow_events (workflow_id, action_key, idempotency_key, payload) VALUES ($1, $2, $3, $4)',
            [id, action, idempotencyKey, payload]);

        await client.query('INSERT INTO workflow_ctx (workflow_id, version, context) VALUES ($1, $2, $3)',
            [id, newVersion, newContext]);

        await client.query('UPDATE workflows SET state = $1, version = $2, updated_at = NOW() WHERE id = $3',
            [nextState, newVersion, id]);

        await client.query('COMMIT');

        // Return new UI
        const ui = WorkflowEngine.getUI({ id, state: nextState, version: newVersion, context: newContext });
        
        res.json(ui);

    } catch (err: any) {
        await client.query('ROLLBACK');
        console.error(err);
        if (err.message === 'Version mismatch') {
            return res.status(409).json({ error: 'Version mismatch' });
        }
        if (err.message === 'Workflow not found') {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});


export default app;