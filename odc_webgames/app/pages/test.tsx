import React, { useEffect, useState } from 'react';
import Link from 'next/link';

'use client';


type Todo = { id: number; title: string; completed: boolean };

/**
 * A small interactive test page for development and manual QA.
 * Save as: /app/pages/test.tsx
 */
export default function TestPage(): JSX.Element {
    const [count, setCount] = useState(0);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // simple sanity check on mount
        console.log('Test page mounted');
    }, []);

    async function loadTodos() {
        setLoading(true);
        try {
            const res = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');
            if (!res.ok) throw new Error('Failed to fetch');
            const data: Todo[] = await res.json();
            setTodos(data);
        } catch (err) {
            console.error(err);
            setTodos([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={{ padding: 20, fontFamily: 'system-ui, sans-serif', maxWidth: 800 }}>
            <h1>Test Page</h1>

            <section>
                <h2>Counter</h2>
                <p>Value: {count}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setCount(c => c + 1)}>Increment</button>
                    <button onClick={() => setCount(0)}>Reset</button>
                    <button onClick={() => setCount(c => c - 1)}>Decrement</button>
                </div>
            </section>

            <hr />

            <section>
                <h2>Fetch demo</h2>
                <button onClick={loadTodos} disabled={loading}>
                    {loading ? 'Loading...' : 'Load todos'}
                </button>
                <ul>
                    {todos.map(t => (
                        <li key={t.id}>
                            <input type="checkbox" checked={t.completed} readOnly /> {t.title}
                        </li>
                    ))}
                </ul>
            </section>

            <hr />

            <section>
                <h2>Simple form</h2>
                <SimpleForm />
            </section>

            <hr />

            <Link href="/">← Go home</Link>
        </main>
    );
}

function SimpleForm(): JSX.Element {
    const [name, setName] = useState('');
    const [submitted, setSubmitted] = useState<string | null>(null);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitted(name.trim());
        setName('');
    }

    return (
        <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                aria-label="name"
            />
            <button type="submit">Submit</button>
            {submitted && <span>Submitted: {submitted}</span>}
        </form>
    );
}