'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

export default function ActivatePage() {
    const params = useParams();
    const token = params?.token as string;
    const router = useRouter();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const activateAccount = async () => {
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/activate/${token}`
                );
                
                setStatus('success');
                setMessage(response.data.message || 'Account activated successfully!');
                
                setTimeout(() => {
                    router.push('/profile');
                }, 3000);
                
            } catch (error: any) {
                setStatus('error');
                setMessage(
                    error.response?.data?.message || 
                    'Activation failed. Invalid or expired link.'
                );
            }
        };

        if (token) {
            activateAccount();
        }
    }, [token, router]);

    const handleResendToken = async () => {
        setIsResending(true);
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/resend-activationtoken/${token}`,
                
            );
            console.log(response)
            
            setMessage(response.data.message || 'Activation email resent successfully! Please check your email.');
            setStatus('success');
            
        } catch (error: any) {
            setMessage(
                error.response?.data?.message || 
                'Failed to resend activation email. Please try again.'
            );
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
            {status === 'loading' && (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Activating your account...</h2>
                    <p className="text-gray-400">Please wait...</p>
                </div>
            )}
            
            {status === 'success' && (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-green-500">✓ Success!</h2>
                    <p className="text-gray-300 mb-2">{message}</p>
                    <p className="text-gray-400">Redirecting to profile page...</p>
                </div>
            )}
            
            {status === 'error' && (
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4 text-red-500">✗ Activation Failed</h2>
                    <p className="text-gray-300 mb-4">{message}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={handleResendToken}
                            disabled={isResending}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700  disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isResending ? 'Resending...' : 'Resend Activation Email'}
                        </button>
                        <button 
                            onClick={() => router.push('/auth/login')}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}