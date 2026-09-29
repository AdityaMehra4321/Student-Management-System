import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Plus, CheckCircle, Clock, AlertCircle, Receipt, X } from 'lucide-react';
import { api } from '../../services/api.js';
import { FeeRecord } from '../../types.js';

export const FeeManagement: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Record payment modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(10000);
  const [paymentMode, setPaymentMode] = useState<string>('Online Banking');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    setLoading(true);
    try {
      const data = await api.getFees();
      setFees(data);
    } catch (err) {
      console.error('Failed to load fees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    setActionLoading(true);
    try {
      await api.recordFeePayment(selectedFee.id, paymentAmount, paymentMode);
      setShowPayModal(false);
      await loadFees();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setActionLoading(false);
    }
  };

  const totalCollected = fees.reduce((acc, f) => acc + f.paidFee, 0);
  const totalPending = fees.reduce((acc, f) => acc + f.remainingFee, 0);

  const filteredFees = fees.filter(f => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.studentRegNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span>Institutional Fee Management & Accounts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor tuition schedules, record student installment collections, and generate official receipts.
          </p>
        </div>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Tuition Receivable</span>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            ₹{((totalCollected + totalPending) * 30).toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Full institutional cohort</span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-800 block">Total Collected Fees</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block tabular-nums">
            ₹{(totalCollected * 30).toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block font-medium">Verified in treasury</span>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 bg-amber-50/20 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-amber-800 block">Outstanding Pending Dues</span>
          <span className="text-2xl font-bold font-mono text-amber-700 mt-1 block tabular-nums">
            ₹{(totalPending * 30).toLocaleString()}
          </span>
          <span className="text-[11px] text-amber-600 mt-1 block font-medium">Due by 31st October</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by student or registration ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-slate-900 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium"
          >
            <option value="ALL">All Payment Status</option>
            <option value="PAID">Fully Paid</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="PENDING">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Ledgers table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500">
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Course & Semester</th>
              <th className="py-3 px-4 text-right">Total Fee</th>
              <th className="py-3 px-4 text-right">Paid Amount</th>
              <th className="py-3 px-4 text-right">Pending Balance</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFees.map(fee => (
              <tr key={fee.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900">{fee.studentName}</div>
                  <div className="text-[11px] font-mono text-slate-400">{fee.studentRegNo}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-slate-800">{fee.courseName}</div>
                  <div className="text-[11px] text-slate-500">Semester {fee.semester}</div>
                </td>
                <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-slate-900">
                  ₹{fee.totalFee.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                  ₹{fee.paidFee.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-amber-700 tabular-nums">
                  ₹{fee.remainingFee.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    fee.status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700'
                      : fee.status === 'PARTIAL'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {fee.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {fee.remainingFee > 0 ? (
                    <button
                      onClick={() => {
                        setSelectedFee(fee);
                        setPaymentAmount(Math.min(20000, fee.remainingFee));
                        setShowPayModal(true);
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold shadow-2xs"
                    >
                      Record Payment
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Cleared</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Modal */}
      {showPayModal && selectedFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-slate-900">Record Fee Collection</h3>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <div className="font-bold text-slate-900">{selectedFee.studentName} ({selectedFee.studentRegNo})</div>
                <div className="text-slate-500">Remaining Due: <strong className="text-amber-700">₹{selectedFee.remainingFee.toLocaleString()}</strong></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  max={selectedFee.remainingFee}
                  min={100}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="Online Net Banking">Online Net Banking</option>
                  <option value="UPI / QR Transfer">UPI / QR Transfer</option>
                  <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
                  <option value="Cash Counter">Cash Counter</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowPayModal(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
                <button type="submit" disabled={actionLoading} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg font-semibold">
                  {actionLoading ? 'Recording...' : 'Issue Receipt & Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
