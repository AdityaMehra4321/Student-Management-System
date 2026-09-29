import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { api } from '../../services/api.js';
import { LeaveRequest } from '../../types.js';

export const TeacherLeaveReview: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaveRequests();
      setLeaveRequests(data);
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    const comment = prompt(`Enter ${decision.toLowerCase()} note/comment for student:`, decision === 'APPROVE' ? 'Granted with advice to catch up lecture notes' : 'Leave period overlaps with mandatory assessment');
    if (comment === null) return;
    try {
      await api.reviewLeave(id, decision, comment);
      await loadLeaves();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>Student Absence & Leave Applications</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate absence requests from students in your assigned classroom cohorts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {leaveRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No active leave applications found.</div>
          ) : (
            leaveRequests.map(leave => (
              <div key={leave.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{leave.studentName}</span>
                    <span className="font-mono text-[11px] text-slate-500">({leave.studentRegNo})</span>
                    <span className="text-xs text-slate-500">· {leave.className}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      leave.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : leave.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {leave.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duration: <strong>{leave.fromDate}</strong> to <strong>{leave.toDate}</strong></span>
                    <span>·</span>
                    <span className="font-semibold text-slate-900">{leave.totalDays} Total Days</span>
                  </div>

                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    <strong className="text-slate-500">Reason:</strong> {leave.reason}
                  </div>

                  {leave.teacherComment && (
                    <div className="text-[11px] text-blue-700">
                      Instructor Note: {leave.teacherComment} (Reviewed by {leave.reviewedByTeacherName || 'Faculty'})
                    </div>
                  )}
                </div>

                {leave.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReview(leave.id, 'APPROVE')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve Leave</span>
                    </button>
                    <button
                      onClick={() => handleReview(leave.id, 'REJECT')}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
