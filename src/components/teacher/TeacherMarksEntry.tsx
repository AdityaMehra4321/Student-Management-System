import React, { useState, useEffect } from 'react';
import {
  Award,
  Lock,
  Unlock,
  CheckCircle,
  Save,
  Send,
  AlertTriangle,
  FileCheck2,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Subject, ClassSection, StudentProfile, MarkRecord, MarksCorrectionRequest, Exam } from '../../types.js';

export const TeacherMarksEntry: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [correctionRequests, setCorrectionRequests] = useState<MarksCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-dbms');
  const [selectedClassId, setSelectedClassId] = useState<string>('cls-btech-5a');
  const [selectedExamId, setSelectedExamId] = useState<string>('ex-internal-assessment-1');

  // Input states for marks draft
  const [marksInput, setMarksInput] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);

  // Modal: Request Marks Correction
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionStudent, setCorrectionStudent] = useState<MarkRecord | null>(null);
  const [requestedMarks, setRequestedMarks] = useState<number>(80);
  const [correctionReason, setCorrectionReason] = useState<string>('');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [subs, cls, ex, stu, mrk, corrs] = await Promise.all([
        api.getSubjects(),
        api.getClasses(),
        api.getExams(),
        api.getStudents(),
        api.getMarks(),
        api.getMarksCorrections(),
      ]);
      setSubjects(subs);
      setClasses(cls);
      setExams(ex);
      setStudents(stu);
      setMarks(mrk);
      setCorrectionRequests(corrs);

      if (subs.length > 0) setSelectedSubjectId(subs[0].id);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
      if (ex.length > 0) setSelectedExamId(ex[0].id);
    } catch (err) {
      console.error('Failed to load marks entry data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync marks inputs when subject/class selection changes
  useEffect(() => {
    const relevantMarks = marks.filter(
      m => m.subjectId === selectedSubjectId && m.classId === selectedClassId
    );
    const inputs: Record<string, number> = {};
    relevantMarks.forEach(m => {
      inputs[m.studentId] = m.marksObtained;
    });

    // For students with no mark record yet, default to 75
    const classStudents = students.filter(s => s.classId === selectedClassId);
    classStudents.forEach(s => {
      if (inputs[s.id] === undefined) {
        inputs[s.id] = 75;
      }
    });

    setMarksInput(inputs);
  }, [selectedSubjectId, selectedClassId, marks, students]);

  // Check if current subject marks are submitted/locked
  const matchingMarks = marks.filter(
    m => m.subjectId === selectedSubjectId && m.classId === selectedClassId
  );
  const isLocked = matchingMarks.length > 0 && matchingMarks.every(m => m.status === 'SUBMITTED');

  // Handle Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const entries = Object.entries(marksInput).map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained,
      }));
      await api.saveMarksBatch(selectedSubjectId, selectedExamId, entries);
      const updatedMarks = await api.getMarks();
      setMarks(updatedMarks);
      alert('Draft marks saved successfully in database.');
    } catch (err: any) {
      alert(err.message || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  // Handle Submit Final Marks (Lock protocol)
  const handleSubmitFinal = async () => {
    if (!confirm('CRITICAL ACTION: Submitting final marks will permanently LOCK 🔒 this assessment. You will NOT be able to directly modify scores afterward without administrative correction approval. Proceed?')) {
      return;
    }
    setLocking(true);
    try {
      // First save draft values
      const entries = Object.entries(marksInput).map(([studentId, marksObtained]) => ({
        studentId,
        marksObtained,
      }));
      await api.saveMarksBatch(selectedSubjectId, selectedExamId, entries);

      // Now lock
      await api.submitFinalMarks(selectedSubjectId, selectedClassId);
      const updatedMarks = await api.getMarks();
      setMarks(updatedMarks);
      alert('Marks have been submitted and LOCKED 🔒. Direct modification is now disabled.');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setLocking(false);
    }
  };

  // Handle Submit Correction Request
  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionStudent) return;
    setSubmittingCorrection(true);
    try {
      await api.requestMarksCorrection(correctionStudent.id, requestedMarks, correctionReason);
      setShowCorrectionModal(false);
      setCorrectionReason('');
      const updatedCorrs = await api.getMarksCorrections();
      setCorrectionRequests(updatedCorrs);
      alert('Marks correction request submitted to Admin for review.');
    } catch (err: any) {
      alert(err.message || 'Correction submission failed');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const classStudents = students.filter(s => s.classId === selectedClassId);
  const activeSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span>Marks Entry & Evaluation Register</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record assessment scores, maintain draft revisions, and submit authoritative locked grades.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              <Lock className="w-3.5 h-3.5" />
              <span>Status: SUBMITTED 🔒 (LOCKED)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              <Unlock className="w-3.5 h-3.5" />
              <span>Status: DRAFT (EDITABLE)</span>
            </span>
          )}
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Assigned Class / Cohort</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Examination Event</label>
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          >
            {exams.map(e => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Important Security Notice Banner */}
      {isLocked ? (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 flex items-start gap-3">
          <Lock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Evaluation Records are Locked:</span> Final marks for {activeSubject?.name} have been finalized and locked in the institutional registry. Direct edits are rejected by the backend server. If you discovered an evaluation or calculation error, click <strong>"Request Correction"</strong> on any student row below to submit an amendment proposal to the Administrator.
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
          <Unlock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Draft Mode Active:</span> You can safely adjust student marks below and click <strong>"Save Draft"</strong>. When you are ready to publish final report card scores, click <strong>"Submit Final Marks (Lock 🔒)"</strong>.
          </div>
        </div>
      )}

      {/* Student Marks Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Student Evaluation Roster · {activeSubject?.name}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Max Marks: 100 · Passing Threshold: 40
          </span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold">
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4 text-center">Marks Obtained (100)</th>
              <th className="py-3 px-4 text-center">Grade</th>
              <th className="py-3 px-4 text-center">Lock Status</th>
              <th className="py-3 px-4 text-right">Correction Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classStudents.map(student => {
              const markRec = matchingMarks.find(m => m.studentId === student.id);
              const score = marksInput[student.id] ?? markRec?.marksObtained ?? 75;

              let grade = 'F';
              if (score >= 90) grade = 'A+';
              else if (score >= 80) grade = 'A';
              else if (score >= 70) grade = 'B+';
              else if (score >= 60) grade = 'B';
              else if (score >= 50) grade = 'C';
              else if (score >= 40) grade = 'D';

              return (
                <tr key={student.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">{student.studentId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{student.name}</td>
                  <td className="py-3 px-4 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      disabled={isLocked}
                      value={score}
                      onChange={e => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value)));
                        setMarksInput({ ...marksInput, [student.id]: val });
                      }}
                      className={`w-20 text-center py-1 font-mono font-bold text-sm rounded-md border ${
                        isLocked
                          ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed'
                          : 'bg-white text-slate-900 border-slate-300 focus:outline-blue-600'
                      }`}
                    />
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-sm">
                    <span className={`px-2 py-0.5 rounded ${
                      grade === 'A+' || grade === 'A'
                        ? 'text-emerald-700 bg-emerald-50'
                        : grade === 'B+' || grade === 'B'
                        ? 'text-blue-700 bg-blue-50'
                        : 'text-amber-700 bg-amber-50'
                    }`}>
                      {grade}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                      isLocked ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>{isLocked ? 'LOCKED' : 'DRAFT'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isLocked && markRec && (
                      <button
                        onClick={() => {
                          setCorrectionStudent(markRec);
                          setRequestedMarks(markRec.marksObtained);
                          setShowCorrectionModal(true);
                        }}
                        className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-xs font-semibold border border-purple-200"
                      >
                        Request Correction
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Action Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {isLocked
              ? 'Marks are locked. To modify scores, click Request Correction above.'
              : 'Save draft frequently or submit final when all marks are verified.'}
          </div>

          {!isLocked && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
              </button>

              <button
                onClick={handleSubmitFinal}
                disabled={locking}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>{locking ? 'Submitting & Locking...' : 'Submit Final Marks (Lock 🔒)'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submitted Marks Correction Request Queue (Faculty view) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700">My Marks Correction Requests (Admin Approval Tracking)</span>
          <span className="text-[11px] text-slate-500">{correctionRequests.length} total requests</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {correctionRequests.length === 0 ? (
            <div className="py-6 text-center text-slate-400">No marks correction requests submitted.</div>
          ) : (
            correctionRequests.map(req => (
              <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{req.studentName} ({req.studentRegNo})</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{req.subjectName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Adjustment: <span className="line-through text-slate-400 font-mono">{req.oldMarks}</span> → <strong className="text-emerald-700 font-mono">{req.requestedMarks}</strong>
                  </div>
                  <div className="text-slate-500 italic text-[11px]">
                    "{req.reason}"
                  </div>
                  {req.adminComment && (
                    <div className="text-[11px] text-purple-700">
                      Admin Note: {req.adminComment}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(req.requestedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Request Marks Correction */}
      {showCorrectionModal && correctionStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Request Marks Correction</h3>
              <button onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-lg space-y-1">
                <div className="font-bold text-purple-900">{correctionStudent.studentName} ({correctionStudent.studentRegNo})</div>
                <div className="text-purple-700">{correctionStudent.subjectName} · {correctionStudent.examTitle}</div>
                <div className="text-slate-600 pt-1">
                  Current Locked Score: <strong className="font-mono">{correctionStudent.marksObtained}/100</strong>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Corrected Score (0-100) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={requestedMarks}
                  onChange={e => setRequestedMarks(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Rationale / Explanation *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Recounting error in Question 4 schema normalization section."
                  value={correctionReason}
                  onChange={e => setCorrectionReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowCorrectionModal(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {submittingCorrection ? 'Submitting...' : 'Submit to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
