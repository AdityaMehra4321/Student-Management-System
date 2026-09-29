import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Edit2,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ShieldAlert,
  Send,
  Save,
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { StudentProfile, ProfileCorrectionRequest } from '../../types.js';

export const StudentProfileView: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [correctionRequests, setCorrectionRequests] = useState<ProfileCorrectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit editable fields state
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editableForm, setEditableForm] = useState({
    phone: '',
    email: '',
    emergencyContact: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [savingContact, setSavingContact] = useState(false);

  // Modal: Request Profile Correction for locked fields
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedField, setSelectedField] = useState<'dob' | 'name' | 'admissionYear' | 'department' | 'course'>('dob');
  const [requestedValue, setRequestedValue] = useState('2005-08-12');
  const [correctionReason, setCorrectionReason] = useState('Incorrect date entered during registration. Verified against attached Aadhaar.');
  const [submittingCorrection, setSubmittingCorrection] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const me = await api.getMe();
      if (me.user?.studentProfile) {
        setStudent(me.user.studentProfile);
        setEditableForm({
          phone: me.user.studentProfile.phone || '',
          email: me.user.studentProfile.email || '',
          emergencyContact: me.user.studentProfile.emergencyContact || '',
          address: me.user.studentProfile.address || '',
          city: me.user.studentProfile.city || '',
          state: me.user.studentProfile.state || '',
          pincode: me.user.studentProfile.pincode || '',
        });
      }
      const corrs = await api.getProfileCorrections();
      setCorrectionRequests(corrs);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSavingContact(true);
    try {
      await api.updateStudent(student.id, editableForm);
      await refreshUser();
      await loadProfile();
      setIsEditingContact(false);
      alert('Contact information updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update contact details');
    } finally {
      setSavingContact(false);
    }
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCorrection(true);
    try {
      await api.submitProfileCorrection(selectedField, requestedValue, correctionReason);
      setShowCorrectionModal(false);
      const updatedCorrs = await api.getProfileCorrections();
      setCorrectionRequests(updatedCorrs);
      alert('Profile correction request submitted to Admin. You will be notified once reviewed.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit correction request');
    } finally {
      setSubmittingCorrection(false);
    }
  };

  const currentFieldValue = (field: string) => {
    if (!student) return '';
    return String((student as any)[field] || '');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            <span>Student Official Record & Profile</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View verified institutional registration data, update contact details, or request locked attribute changes.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedField('dob');
            setRequestedValue('2005-08-12');
            setShowCorrectionModal(true);
          }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-start md:self-auto"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Request Profile Correction</span>
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-2xl border-2 border-emerald-200 shrink-0">
          {student?.name?.charAt(0) || 'R'}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">{student?.name || 'Rahul Sharma'}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {student?.studentId || 'STU20260045'}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {student?.courseName} · {student?.departmentName} · Semester {student?.semester} (Sec {student?.section})
          </p>
          <div className="text-[11px] text-slate-400 font-mono">
            Admission No: {student?.admissionNo} · Academic Year: {student?.admissionYear}
          </div>
        </div>
      </div>

      {/* Main Grid: Locked vs Editable Attributes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Non-Editable / Locked Attributes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-sm text-slate-900">Official Registration Data (Locked 🔒)</h3>
            </div>
            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">
              Administrative Approval Required
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Student Full Name</span>
                <span className="font-semibold text-slate-900">{student?.name}</span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Cannot be changed
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Registration Number / Student ID</span>
                <span className="font-mono font-bold text-slate-900">{student?.studentId}</span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Cannot be changed
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Date of Birth</span>
                <span className="font-mono font-semibold text-slate-900">{student?.dob}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedField('dob');
                  setRequestedValue('2005-08-12');
                  setShowCorrectionModal(true);
                }}
                className="text-[11px] text-purple-700 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Request Edit</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Admission Number</span>
                <span className="font-mono font-semibold text-slate-900">{student?.admissionNo}</span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Cannot be changed
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Academic Course Program</span>
                <span className="font-semibold text-slate-900">{student?.courseName}</span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Cannot be changed
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block text-[11px]">Academic Department</span>
                <span className="font-semibold text-slate-900">{student?.departmentName}</span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Cannot be changed
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Basic Contact Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-sm text-slate-900">Personal & Contact Info (Editable ✏)</h3>
            </div>
            {!isEditingContact ? (
              <button
                onClick={() => setIsEditingContact(true)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-semibold flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditingContact(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
          </div>

          {!isEditingContact ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Mobile Phone</span>
                  <span className="font-mono font-semibold text-slate-900">{student?.phone}</span>
                </div>
                <span className="text-emerald-700 text-[11px] font-medium">✏ Editable</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Personal Email</span>
                  <span className="font-semibold text-slate-900">{student?.email}</span>
                </div>
                <span className="text-emerald-700 text-[11px] font-medium">✏ Editable</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Emergency Contact Phone</span>
                  <span className="font-mono font-semibold text-slate-900">{student?.emergencyContact || '9876543299'}</span>
                </div>
                <span className="text-emerald-700 text-[11px] font-medium">✏ Editable</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                <span className="text-slate-500 block text-[11px]">Residential Address</span>
                <p className="font-medium text-slate-900 leading-relaxed">
                  {student?.address}, {student?.city}, {student?.state} - {student?.pincode}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editableForm.phone}
                    onChange={e => setEditableForm({ ...editableForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editableForm.email}
                    onChange={e => setEditableForm({ ...editableForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  value={editableForm.emergencyContact}
                  onChange={e => setEditableForm({ ...editableForm, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={editableForm.address}
                  onChange={e => setEditableForm({ ...editableForm, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editableForm.city}
                    onChange={e => setEditableForm({ ...editableForm, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editableForm.state}
                    onChange={e => setEditableForm({ ...editableForm, state: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editableForm.pincode}
                    onChange={e => setEditableForm({ ...editableForm, pincode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingContact(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {savingContact ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Correction Requests Tracking Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">My Profile Correction Requests (Approval Status)</span>
          <span className="text-[11px] text-slate-500">{correctionRequests.length} requests logged</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {correctionRequests.length === 0 ? (
            <div className="py-6 text-center text-slate-400">No profile correction requests submitted.</div>
          ) : (
            correctionRequests.map(req => (
              <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{req.fieldLabel}</span>
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
                    Current: <span className="line-through text-slate-400 font-mono">{req.currentValue}</span> → Proposed: <strong className="text-emerald-700 font-mono">{req.requestedValue}</strong>
                  </div>
                  <div className="text-slate-500 italic text-[11px]">
                    Reason: "{req.reason}"
                  </div>
                  {req.adminComment && (
                    <div className="text-[11px] text-purple-700">
                      Admin Decision: {req.adminComment} ({new Date(req.reviewedAt || '').toLocaleDateString()})
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  Requested {new Date(req.requestedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Request Profile Correction */}
      {showCorrectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Request Profile Correction</h3>
              <button onClick={() => setShowCorrectionModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Field to Correct *</label>
                <select
                  value={selectedField}
                  onChange={e => {
                    const f = e.target.value as any;
                    setSelectedField(f);
                    setRequestedValue(f === 'dob' ? '2005-08-12' : '');
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="dob">Date of Birth</option>
                  <option value="name">Student Legal Name</option>
                  <option value="admissionYear">Admission Year</option>
                  <option value="admissionNo">Admission Number</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Registered Value</label>
                <input
                  type="text"
                  disabled
                  value={currentFieldValue(selectedField)}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Correct Value *</label>
                <input
                  type="text"
                  required
                  value={requestedValue}
                  onChange={e => setRequestedValue(e.target.value)}
                  placeholder="e.g. 2005-08-12"
                  className="w-full px-3 py-2 border rounded-lg font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Justification Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={correctionReason}
                  onChange={e => setCorrectionReason(e.target.value)}
                  placeholder="Explain why this value needs correction..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowCorrectionModal(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button
                  type="submit"
                  disabled={submittingCorrection}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {submittingCorrection ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
