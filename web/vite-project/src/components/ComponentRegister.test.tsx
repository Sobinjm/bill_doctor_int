import { render, screen } from '@testing-library/react';
import { ComponentRenderer } from './ComponentRegister';
import { describe, it, expect, vi } from 'vitest';

describe('ComponentRegistry', () => {
    it('renders Banner component', () => {
        render(<ComponentRenderer component={{ type: 'Banner', props: { message: 'Hello World' } }} onChange={() => { }} formState={{}} />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });
    it('renders Banner component', () => {
        render(<ComponentRenderer component={{ type: 'Banner', props: { message: 'Hello World' } }} onChange={() => { }} formState={{}} />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('renders SummaryCard component', () => {
        render(<ComponentRenderer component={{ type: 'SummaryCard', props: { title: 'Savings', value: '$100', description: 'Monthly' } }} onChange={() => { }} formState={{}} />);
        expect(screen.getByText('Savings')).toBeInTheDocument();
        expect(screen.getByText('$100')).toBeInTheDocument();
    });

    it('renders Form component and handles input', () => {
        const handleChange = vi.fn();
        render(
            <ComponentRenderer
                component={{ type: 'Form', props: { fields: [{ name: 'testField', label: 'Test Label', type: 'text' }] } }}
                onChange={handleChange}
                formState={{}}
            />
        );
        expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      
    });

});
