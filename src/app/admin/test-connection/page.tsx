'use client';

import { useState } from 'react';

export default function TestConnectionPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runTest = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/test-connection');
            const data = await response.json();
            setResult(data);
        } catch (error: any) {
            setResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        🔍 Supabase Connection Test
                    </h1>
                    <p className="text-gray-300 mb-8">
                        Click the button below to test your Supabase connection and verify database setup.
                    </p>

                    <button
                        onClick={runTest}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Testing...' : 'Run Connection Test'}
                    </button>

                    {result && (
                        <div className="mt-8">
                            <div className={`p-6 rounded-xl ${result.success ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    {result.success ? '✅ Success!' : '❌ Failed'}
                                </h2>

                                {result.message && (
                                    <p className="text-white mb-4">{result.message}</p>
                                )}

                                {result.error && (
                                    <div className="mb-4">
                                        <p className="text-red-300 font-semibold">Error:</p>
                                        <p className="text-red-200">{result.error.message || result.error}</p>
                                    </div>
                                )}

                                {result.tables && (
                                    <div className="mt-4">
                                        <p className="text-white font-semibold mb-2">Database Tables:</p>
                                        <ul className="space-y-1">
                                            {result.tables.map((table: any) => (
                                                <li key={table.table} className="text-gray-200">
                                                    {table.exists ? '✅' : '❌'} {table.table}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {result.buckets && result.buckets.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-white font-semibold mb-2">Storage Buckets:</p>
                                        <ul className="space-y-1">
                                            {result.buckets.map((bucket: string) => (
                                                <li key={bucket} className="text-gray-200">
                                                    ✅ {bucket}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {!result.success && (
                                    <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                                        <p className="text-yellow-200 font-semibold mb-2">💡 Next Steps:</p>
                                        <ol className="list-decimal list-inside text-yellow-100 space-y-1">
                                            <li>Go to your Supabase Dashboard</li>
                                            <li>Navigate to SQL Editor</li>
                                            <li>Copy and paste the contents of <code className="bg-black/30 px-2 py-1 rounded">supabase_schema.sql</code></li>
                                            <li>Click "Run" to execute the SQL</li>
                                            <li>Refresh this page and test again</li>
                                        </ol>
                                    </div>
                                )}
                            </div>

                            <details className="mt-4">
                                <summary className="text-gray-300 cursor-pointer hover:text-white">
                                    View Full Response
                                </summary>
                                <pre className="mt-2 p-4 bg-black/50 rounded-lg overflow-auto text-xs text-gray-300">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
