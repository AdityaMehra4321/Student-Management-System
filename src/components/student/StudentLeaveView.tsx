import React, { useState, useEffect } from 'react';
import { Send, Clock, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { LeaveRequest } from '../../types.js';

export const StudentLeaveView: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState('2026-10-02');
  const [toDate, setToDate] = useState('2026-10-04');
  const [reason, setReason] = useState('Family function attendance');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaveRequests();
      setLeaves(data);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.applyLeave(fromDate, toDate, reason);
      setReason('');
      await loadLeaves();
      alert('Leave application submitted to your class teacher for approval.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit leave');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Send className="w-5 h-5 text-emerald-600" />
          <span>Student Absence & Leave Management</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Submit formal leave applications for faculty evaluation and track approval decisions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Apply Leave */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-semibold text-sm text-slate-900">Apply for Leave</h3>
            <p className="text-xs text-slate-500 mt-0.5">Reviewed by your primary class teacher.</p>
          </div>

          <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">From Date</label>
                <input
                  type="date"
                  required
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">To Date</label>
                <input
                  type="date"
                  required
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Detailed Reason *</label>
              <textarea
                required
                rows={4}
                placeholder="Specify purpose of absence..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting Application...' : 'Submit Leave Request'}</span>
            </button>
          </form>
        </div>

        {/* History / Applications List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">My Leave Applications</span>
            <span className="text-[11px] text-slate-500 font-mono">{leaves.length} records</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {leaves.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No leave applications submitted.</div>
            ) : (
              leaves.map(item => (
                <div key={item.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">{item.fromDate} to {item.toDate}</span>
                      <span className="text-slate-500 font-mono">({item.totalDays} Days)</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : item.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                    "{item.reason}"
                  </p>

                  {item.teacherComment && (
                    <div className="text-[11px] text-blue-700">
                      Instructor Decision: {item.teacherComment} (By {item.reviewedByTeacherName || 'Class Teacher'})
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 font-mono">
                    Submitted: {new Date(item.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
