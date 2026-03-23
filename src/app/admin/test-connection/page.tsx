'use client';

import { useState } from 'react';

interface TestResult {
  success: boolean;
  message?: string;
  error?: { message?: string } | string;
  tables?: { table: string; exists: boolean }[];
  buckets?: string[];
}

export default function TestConnectionPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-connection');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResult({ success: false, error: errorMessage });
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
                    <p className="text-red-200">
                      {typeof result.error === 'string' ? result.error : result.error.message || 'Unknown error'}
                    </p>
                  </div>
                )}

                {result.tables && (
                  <div className="mt-4">
                    <p className="text-white font-semibold mb-2">Database Tables:</p>
                    <ul className="space-y-1">
                      {result.tables.map((table) => (
                        <li key={table.table} className="text-gray-200">
                          {table.exists ? '✅' : '❌'} {table.table}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.buckets && (
                  <div className="mt-4">
                    <p className="text-white font-semibold mb-2">Storage Buckets:</p>
                    <ul className="space-y-1">
                      {result.buckets.map((bucket) => (
                        <li key={bucket} className="text-gray-200">
                          📁 {bucket}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
