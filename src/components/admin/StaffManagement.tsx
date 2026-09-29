import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Check, X, Shield, Mail, Phone } from 'lucide-react';
import { api } from '../../services/api.js';
import { StaffProfile, Department } from '../../types.js';

export const StaffManagement: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    departmentId: 'dept-cse',
    roleTitle: 'Academic Registrar Coordinator',
    permissions: ['STUDENT_VIEW', 'FEE_VIEW', 'DOCUMENT_VERIFY'],
  });

  const availablePermissions = [
    { key: 'STUDENT_VIEW', label: 'View Student Directory' },
    { key: 'FEE_VIEW', label: 'Access Fee Management' },
    { key: 'DOCUMENT_VERIFY', label: 'Verify Uploaded Documents' },
    { key: 'ANNOUNCEMENT_CREATE', label: 'Broadcast Announcements' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, d] = await Promise.all([
        api.getStaff(),
        api.getDepartments(),
      ]);
      setStaffList(s);
      setDepartments(d);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.createStaff(formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        departmentId: 'dept-cse',
        roleTitle: 'Academic Registrar Coordinator',
        permissions: ['STUDENT_VIEW', 'FEE_VIEW'],
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create staff');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <span>Administrative Staff & Operations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage administrative personnel, department roles, and specific granular permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staffList.map(stf => (
          <div key={stf.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                  {stf.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{stf.name}</h3>
                  <div className="text-[11px] text-slate-500">{stf.roleTitle} · <span className="font-mono text-amber-800 font-semibold">{stf.staffId}</span></div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                {stf.status}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-slate-800">{stf.departmentName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{stf.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{stf.phone || '+91 98765 00004'}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>Granted Operations Permissions:</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stf.permissions.map(perm => (
                  <span key={perm} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200">
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 mb-3">Add Staff Personnel</h3>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Joshi"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@sms.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Title</label>
                  <input
                    type="text"
                    placeholder="Registrar Officer"
                    value={formData.roleTitle}
                    onChange={e => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Permissions</label>
                <div className="space-y-1.5 p-3 bg-slate-50 border rounded-lg">
                  {availablePermissions.map(p => (
                    <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(p.key)}
                        onChange={e => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, p.key] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter(k => k !== p.key) });
                          }
                        }}
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">
                  {actionLoading ? 'Saving...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
