import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  User,
  ArrowRight,
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api.js';
import { ProfileCorrectionRequest, MarksCorrectionRequest, DocumentRecord, LeaveRequest } from '../../types.js';

export const ApprovalsManagement: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'marks' | 'documents' | 'leaves'>('profile');
  const [profileRequests, setProfileRequests] = useState<ProfileCorrectionRequest[]>([]);
  const [marksRequests, setMarksRequests] = useState<MarksCorrectionRequest[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    loadAllRequests();
  }, []);

  const loadAllRequests = async () => {
    setLoading(true);
    try {
      const [prof, mrk, docs, leaves] = await Promise.all([
        api.getProfileCorrections(),
        api.getMarksCorrections(),
        api.getDocuments(),
        api.getLeaveRequests(),
      ]);
      setProfileRequests(prof);
      setMarksRequests(mrk);
      setDocuments(docs);
      setLeaveRequests(leaves);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewProfile = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    const comment = prompt(`Enter ${decision.toLowerCase()} note/comment (optional):`, decision === 'APPROVE' ? 'Verified against Aadhaar record' : 'Documentation insufficient');
    if (comment === null) return;
    setReviewingId(id);
    try {
      await api.reviewProfileCorrection(id, decision, comment);
      await loadAllRequests();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setReviewingId(null);
    }
  };

  const handleReviewMarks = async (id: string, decision: 'APPROVE' | 'REJECT') => {
    const comment = prompt(`Enter ${decision.toLowerCase()} comment:`, decision === 'APPROVE' ? 'Approved recount adjustment' : 'Rejected after answer script check');
    if (comment === null) return;
    setReviewingId(id);
    try {
      await api.reviewMarksCorrection(id, decision, comment);
      await loadAllRequests();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setReviewingId(null);
    }
  };

  const handleVerifyDoc = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
    setReviewingId(id);
    try {
      await api.verifyDocument(id, status);
      await loadAllRequests();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setReviewingId(null);
    }
  };

  const pendingProfileCount = profileRequests.filter(p => p.status === 'PENDING').length;
  const pendingMarksCount = marksRequests.filter(m => m.status === 'PENDING').length;
  const pendingDocsCount = documents.filter(d => d.status === 'PENDING').length;
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'PENDING').length;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-purple-600" />
            <span>Workflow & Correction Approvals</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Authorize immutable profile corrections, faculty marks adjustment requests, and document clearance.
          </p>
        </div>

        {/* Segmented Sub Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Student Profile ({pendingProfileCount})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('marks')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'marks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Locked Marks ({pendingMarksCount})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('documents')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'documents' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Documents ({pendingDocsCount})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('leaves')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'leaves' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Leaves ({pendingLeavesCount})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Profile Correction Requests */}
      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Immutable Student Profile Correction Requests (Name, DoB, Reg No, Program)
            </span>
            <span className="text-[11px] text-slate-500">
              Approval directly mutates student record and updates database
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {profileRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No profile correction requests.</div>
            ) : (
              profileRequests.map(item => (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.studentName}</span>
                      <span className="font-mono text-[11px] text-slate-500">({item.studentRegNo})</span>
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

                    <div className="text-xs text-slate-700 flex items-center gap-2">
                      <span className="font-semibold text-slate-500">Field Requested:</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-800">{item.fieldLabel}</span>
                      <span>·</span>
                      <span>Current: <span className="line-through text-slate-400 font-mono">{item.currentValue}</span></span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>Requested: <strong className="text-emerald-700 font-mono">{item.requestedValue}</strong></span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                      <strong className="text-slate-500">Reason:</strong> {item.reason}
                    </div>

                    {item.adminComment && (
                      <div className="text-[11px] text-purple-700">
                        Admin Note: {item.adminComment} ({new Date(item.reviewedAt || '').toLocaleDateString()})
                      </div>
                    )}
                  </div>

                  {item.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewProfile(item.id, 'APPROVE')}
                        disabled={reviewingId === item.id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve & Apply</span>
                      </button>
                      <button
                        onClick={() => handleReviewProfile(item.id, 'REJECT')}
                        disabled={reviewingId === item.id}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
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
      )}

      {/* Tab 2: Marks Correction Requests */}
      {activeSubTab === 'marks' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Submitted Marks Correction Requests (Faculty cannot edit submitted marks directly)
            </span>
            <span className="text-[11px] text-slate-500">
              Approval unlocks & updates score in marks register
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {marksRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No marks correction requests.</div>
            ) : (
              marksRequests.map(item => (
                <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.teacherName} (Faculty)</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-xs font-semibold text-slate-800">{item.studentName} ({item.studentRegNo})</span>
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

                    <div className="text-xs text-slate-700 flex items-center gap-2">
                      <span className="font-semibold text-slate-500">Exam & Subject:</span>
                      <span>{item.subjectName} · {item.examTitle}</span>
                      <span>·</span>
                      <span>Old Marks: <span className="line-through text-slate-400 font-mono">{item.oldMarks}</span></span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>Requested: <strong className="text-emerald-700 font-mono">{item.requestedMarks}</strong></span>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                      <strong className="text-slate-500">Instructor Justification:</strong> {item.reason}
                    </div>

                    {item.adminComment && (
                      <div className="text-[11px] text-purple-700">
                        Admin Note: {item.adminComment}
                      </div>
                    )}
                  </div>

                  {item.status === 'PENDING' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleReviewMarks(item.id, 'APPROVE')}
                        disabled={reviewingId === item.id}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Marks Correction</span>
                      </button>
                      <button
                        onClick={() => handleReviewMarks(item.id, 'REJECT')}
                        disabled={reviewingId === item.id}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors"
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
      )}

      {/* Tab 3: Documents Clearance */}
      {activeSubTab === 'documents' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Student Document Verification & Eligibility Clearance</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-[11px] font-bold">
                <th className="py-2.5 px-4">Student</th>
                <th className="py-2.5 px-4">Document Type</th>
                <th className="py-2.5 px-4">Upload Date</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{doc.studentName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{doc.studentRegNo}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">{doc.documentType}</td>
                  <td className="py-3 px-4 text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      doc.status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : doc.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {doc.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleVerifyDoc(doc.id, 'VERIFIED')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-medium hover:bg-emerald-700"
                        >
                          Verify & Approve
                        </button>
                        <button
                          onClick={() => handleVerifyDoc(doc.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-[11px] font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Verified by {doc.verifierName || 'Staff'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Student Leave Requests */}
      {activeSubTab === 'leaves' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-700">Institutional Student Leave Oversight</span>
          </div>

          <div className="divide-y divide-slate-100">
            {leaveRequests.map(leave => (
              <div key={leave.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{leave.studentName} ({leave.studentRegNo})</span>
                    <span className="text-xs text-slate-500">· {leave.className}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      leave.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Duration: <strong>{leave.fromDate}</strong> to <strong>{leave.toDate}</strong> ({leave.totalDays} Days)
                  </div>
                  <div className="text-xs text-slate-500 italic mt-0.5">"{leave.reason}"</div>
                </div>

                {leave.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        await api.reviewLeave(leave.id, 'APPROVE');
                        await loadAllRequests();
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        await api.reviewLeave(leave.id, 'REJECT');
                        await loadAllRequests();
                      }}
                      className="px-3 py-1 bg-rose-50 text-rose-700 rounded text-xs font-semibold hover:bg-rose-100"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
