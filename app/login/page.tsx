'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignup, setIsSignup] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isSignup) {
                // Sign up
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to create account');
                }

                // After successful signup, sign in
                const result = await signIn('credentials', {
                    username,
                    password,
                    redirect: false
                });

                if (result?.error) {
                    throw new Error('Failed to sign in after signup');
                }

                router.push('/');
                router.refresh();
            } else {
                // Sign in
                const result = await signIn('credentials', {
                    username,
                    password,
                    redirect: false
                });

                if (result?.error) {
                    throw new Error('Invalid username or password');
                }

                router.push('/');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '450px', paddingTop: '5rem' }}>
            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 className="heading-1" style={{ marginBottom: '0.5rem' }}>
                        {isSignup ? 'Create Account' : 'Admin Login'}
                    </h1>
                    <p style={{ color: '#94a3b8' }}>
                        {isSignup ? 'Sign up to manage competitions' : 'Sign in to manage competitions'}
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            autoComplete={isSignup ? 'new-password' : 'current-password'}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            marginBottom: '1.5rem',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            color: '#ef4444',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                        style={{ width: '100%', marginBottom: '1rem' }}
                    >
                        {isLoading ? 'Please wait...' : (
                            <>
                                {isSignup ? <UserPlus size={18} /> : <LogIn size={18} />}
                                {isSignup ? 'Sign Up' : 'Sign In'}
                            </>
                        )}
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setError('');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#3b82f6',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                textDecoration: 'underline'
                            }}
                        >
                            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                    <Link href="/" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
