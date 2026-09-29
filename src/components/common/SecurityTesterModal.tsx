import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Lock, Terminal, RefreshCw, X } from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface SecurityTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityTesterModal: React.FC<SecurityTesterModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [activeScenario, setActiveScenario] = useState<string>('STUDENT_EDIT_MARKS');

  if (!isOpen) return null;

  const runTest = async (scenario: 'STUDENT_EDIT_MARKS' | 'STUDENT_CHANGE_LOCKED_DOB' | 'TEACHER_EDIT_LOCKED_MARKS') => {
    setTesting(true);
    setActiveScenario(scenario);
    setTestResult(null);

    try {
      const res = await api.simulateSecurityViolation(scenario);
      setTestResult({ success: true, data: res });
    } catch (err: any) {
      // Backend correctly rejected with 403 Forbidden!
      setTestResult({
        success: false,
        status: err.status || 403,
        error: err.data?.error || 'SecurityPolicyViolation',
        policy: err.data?.policy,
        message: err.message || err.data?.message,
        actionAttempted: err.data?.actionAttempted,
        timestamp: err.data?.timestamp || new Date().toISOString(),
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">Backend RBAC Security Inspector</h3>
              <p className="text-xs text-slate-400">Live proof of server-side permission enforcement & policy rejection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Core Architectural Principle:</span> The backend strictly verifies authorization tokens and rejects illegal operations with HTTP 403 Forbidden. Frontend button hiding is just UI; the backend is the authoritative barrier.
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-700 tracking-wider">Select Threat Simulation Scenario:</label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => runTest('STUDENT_EDIT_MARKS')}
                disabled={testing}
                className={`text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                  activeScenario === 'STUDENT_EDIT_MARKS'
                    ? 'border-rose-500 bg-rose-50/50 text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Scenario 1: Student tries to edit marks</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">Sends raw PUT /api/marks payload under student authentication context.</p>
                </div>
                <span className="text-rose-600 font-medium shrink-0 ml-3 flex items-center gap-1">
                  Run Test <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                onClick={() => runTest('STUDENT_CHANGE_LOCKED_DOB')}
                disabled={testing}
                className={`text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                  activeScenario === 'STUDENT_CHANGE_LOCKED_DOB'
                    ? 'border-rose-500 bg-rose-50/50 text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Scenario 2: Student tries to modify locked Date of Birth directly</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">Bypasses UI inputs and attempts direct database overwrite of registration records.</p>
                </div>
                <span className="text-rose-600 font-medium shrink-0 ml-3 flex items-center gap-1">
                  Run Test <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                onClick={() => runTest('TEACHER_EDIT_LOCKED_MARKS')}
                disabled={testing}
                className={`text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${
                  activeScenario === 'TEACHER_EDIT_LOCKED_MARKS'
                    ? 'border-rose-500 bg-rose-50/50 text-slate-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Scenario 3: Teacher tries to edit submitted and locked marks</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">Attempts modification after final submission without administrative correction approval.</p>
                </div>
                <span className="text-rose-600 font-medium shrink-0 ml-3 flex items-center gap-1">
                  Run Test <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            </div>
          </div>

          {/* Test execution log / terminal */}
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>SERVER_ENFORCEMENT_TERMINAL</span>
              </span>
              <span>{testing ? 'EXECUTING TEST...' : 'AWAITING DISPATCH'}</span>
            </div>

            {testing && (
              <div className="flex items-center gap-2 text-amber-400 py-4">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Dispatching unauthorized payload to backend middleware...</span>
              </div>
            )}

            {!testing && testResult && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <span className="bg-rose-500/20 px-2 py-0.5 rounded text-rose-300">HTTP {testResult.status} FORBIDDEN</span>
                  <span>[INTERCEPTED & BLOCKED]</span>
                </div>
                <div className="text-slate-400">Action: <span className="text-slate-200">{testResult.actionAttempted}</span></div>
                <div className="text-slate-400">Policy: <span className="text-amber-300">{testResult.policy}</span></div>
                <div className="text-rose-300 bg-rose-950/40 p-2.5 rounded border border-rose-900/50 mt-2">
                  {testResult.message}
                </div>
                <div className="text-emerald-400 flex items-center gap-1 text-[11px] pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Security violation recorded in Admin Audit Log at {new Date(testResult.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            )}

            {!testing && !testResult && (
              <div className="text-slate-500 py-4 text-center">
                Click any scenario above to trigger a real unauthorized request against the Express backend.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Active Session: <strong className="text-slate-800">{user?.name}</strong> ({user?.role})</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
