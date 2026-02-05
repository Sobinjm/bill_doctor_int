/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { UIResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { ComponentRenderer } from './ComponentRegister';

const API_BASE = import.meta.env.VITE_API_URL;

export const WorkflowOrchestrator = () => {
    const { id, state: urlState } = useParams<{ id: string, state: string }>();
    const navigate = useNavigate();

    const [ui, setUi] = useState<UIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formState, setFormState] = useState<Record<string, any>>({});

    // Initialize or fetch workflow
    useEffect(() => {
        const workflowId = id || 'new';

        fetch(`${API_BASE}/workflows/${workflowId}/ui`)
            .then(res => res.json())
            .then((data: UIResponse) => {
                setUi(data);
                const currentState = data.workflow.state.toLowerCase();

                // If it's a new workflow or URL state mismatch, sync URL
                if (workflowId === 'new' || (urlState && urlState !== currentState)) {
                    navigate(`/workflow/${data.workflow.id}/${currentState}`, { replace: true });
                }
                setLoading(false);
            })
            .catch(_err => {
                setError('Failed to load workflow');
                setLoading(false);
                console.error(_err);
            });
    }, [id, urlState, navigate]); // Re-run if ID changes

    const handleAction = async (actionKey: string) => {
        if (!ui) return;

        setLoading(true);
        const idempotencyKey = uuidv4();

        try {
            const res = await fetch(`${API_BASE}/workflows/${ui.workflow.id}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: actionKey,
                    expectedVersion: ui.workflow.version,
                    idempotencyKey,
                    payload: formState
                })
            });

            if (!res.ok) throw new Error('Action failed');

            const newUi: UIResponse = await res.json();
            setUi(newUi);

            // Navigate to new state URL
            const newState = newUi.workflow.state.toLowerCase();
            navigate(`/workflow/${newUi.workflow.id}/${newState}`);

        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (name: string, value: any) => {
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
    if (!ui) return <div>No UI loaded</div>;

    if (!ui) return <div>No UI loaded</div>;

    return (
        <div className="container">
            <header className="header">
                <h1>{ui.view.screen.title}</h1>
                <p>{ui.view.screen.subtitle}</p>
                <div className="meta-info">
                    State: {ui.workflow.state} | Version: {ui.workflow.version}
                </div>
            </header>

            <main>
                {ui.view.components.map((comp, idx) => (
                    <ComponentRenderer
                        key={idx}
                        component={comp}
                        formState={formState}
                        onChange={handleFormChange}
                    />
                ))}
            </main>

            <footer className="actions-footer">
                {ui.view.actions.map(action => (
                    <button
                        key={action.key}
                        onClick={() => handleAction(action.key)}
                        className={`btn btn-${action.variant}`}
                    >
                        {action.label}
                    </button>
                ))}
            </footer>
        </div>
    );
};
