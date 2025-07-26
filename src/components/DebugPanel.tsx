import { useState } from 'react';
import { supabase, debugSupabaseConnection } from '../supabaseClient';
import { clearSupabaseSession, forceSignOut, isSessionCorrupted, autoFixSession } from '../utils/sessionCleanup';

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: any = {};

    try {
      // Check environment variables
      info.environment = {
        nodeEnv: process.env.NODE_ENV,
        supabaseUrl: process.env.VITE_SUPABASE_URL ? 'Present' : 'Missing',
        supabaseKey: process.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
        currentUrl: window.location.href,
        userAgent: navigator.userAgent
      };

      // Check Supabase connection
      info.connection = await debugSupabaseConnection();

      // Check session status
      const { data: userData, error: userError } = await supabase.auth.getUser();
      info.session = {
        hasUser: !!userData.user,
        error: userError?.message || null,
        userId: userData.user?.id || null
      };

      // Check session corruption
      info.corruption = await isSessionCorrupted();

      // Check localStorage
      const keys = Object.keys(localStorage);
      const supabaseKeys = keys.filter(key => 
        key.includes('supabase') || key.includes('sb-') || key.includes('auth')
      );
      info.localStorage = {
        totalKeys: keys.length,
        supabaseKeys: supabaseKeys,
        supabaseKeyCount: supabaseKeys.length
      };

      // Test database access
      try {
        const { data: testData, error: testError } = await supabase
          .from('categories')
          .select('count')
          .limit(1);
        info.database = {
          accessible: !testError,
          error: testError?.message || null
        };
      } catch (error) {
        info.database = {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

    } catch (error) {
      info.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const handleClearSession = async () => {
    setLoading(true);
    await clearSupabaseSession();
    await runDiagnostics();
  };

  const handleForceSignOut = async () => {
    setLoading(true);
    await forceSignOut();
  };

  const handleAutoFix = async () => {
    setLoading(true);
    const fixed = await autoFixSession();
    if (fixed) {
      alert('Session cleared. Please refresh the page.');
    } else {
      alert('No session issues detected.');
    }
    await runDiagnostics();
  };

  return (
    <>
      {/* Debug button - only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full z-50"
          title="Debug Panel"
        >
          🐛
        </button>
      )}

      {/* Debug panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-bg-primary border border-dark-border-primary rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Debug Panel</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-dark-text-muted hover:text-dark-text-primary"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={runDiagnostics}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Running...' : 'Run Diagnostics'}
                </button>
                <button
                  onClick={handleClearSession}
                  disabled={loading}
                  className="btn-secondary"
                >
                  Clear Session
                </button>
                <button
                  onClick={handleAutoFix}
                  disabled={loading}
                  className="btn-secondary"
                >
                  Auto Fix
                </button>
                <button
                  onClick={handleForceSignOut}
                  disabled={loading}
                  className="btn-secondary"
                >
                  Force Sign Out
                </button>
              </div>

              {Object.keys(debugInfo).length > 0 && (
                <div className="space-y-4">
                  {Object.entries(debugInfo).map(([key, value]) => (
                    <div key={key} className="border border-dark-border-primary rounded p-3">
                      <h3 className="font-semibold mb-2">{key}</h3>
                      <pre className="text-xs bg-dark-bg-secondary p-2 rounded overflow-x-auto">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 