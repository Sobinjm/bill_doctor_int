import cors from 'cors';
import express from 'express';
import { WorkflowEngine } from './engines/workflow_engine';
import { getClient, query } from './db';
import { v4 as uuidv4 } from 'uuid';

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



export default app;