/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import type { SDUIComponent } from '../types';

//title card component
const Banner = ({ message, variant = 'info' }: { message: string, variant?: string }) => (
    <div className={`banner banner-${variant}`}>
        {message}
    </div>
);

const SummaryCard = ({ title, value, description }: { title: string, value: string, description: string }) => (
    <div className="summary-card">
        <div className="summary-title">{title}</div>
        <div className="summary-value">{value}</div>
        <p className="summary-desc">{description}</p>
    </div>
);

interface FormProps {
    fields: Array<{ name: string, label: string, type: string, value?: any }>;
    onChange: (name: string, value: any) => void;
    formState: Record<string, any>;
}

const Form = ({ fields, onChange, formState }: FormProps) => (
    <form onSubmit={(e) => e.preventDefault()}>
        {fields.map((field) => (
            <div key={field.name} className="form-group">
                <label htmlFor={field.name} className="form-label">{field.label}</label>
                {field.type === 'textarea' ? (
                    <textarea
                        id={field.name}
                        name={field.name}
                        value={formState[field.name] || field.value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        className="form-textarea"
                        rows={5}
                    />
                ) : (
                    <input
                        id={field.name}
                        type={field.type}
                        name={field.name}
                        value={formState[field.name] || field.value || ''}
                        onChange={(e) => onChange(field.name, e.target.value)}
                        className="form-input"
                    />
                )}
            </div>
        ))}
    </form>
);

const UnknownComponent = ({ type }: { type: string }) => (
    <div style={{ padding: '1rem', border: '1px dashed red' }}>Unknown Component: {type}</div>
);

const REGISTRY: Record<string, React.FC<any>> = {
    Banner,
    SummaryCard,
    Form,
};

export const ComponentRenderer = ({ component, onChange, formState }: { component: SDUIComponent, onChange: any, formState: any }) => {
    const Comp = REGISTRY[component.type] || UnknownComponent;
    return <Comp {...component.props} type={component.type} onChange={onChange} formState={formState} />;
};
