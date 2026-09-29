import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, Clock, Receipt, Download, AlertCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { FeeRecord } from '../../types.js';

export const StudentFeesView: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    setLoading(true);
    try {
      const data = await api.getFees();
      setFees(data);
    } catch (err) {
      console.error('Failed to load fee info:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentFee = fees[0] || {
    totalFee: 80000,
    paidFee: 60000,
    remainingFee: 20000,
    dueDate: '2026-10-31',
    status: 'PARTIAL',
    payments: [
      {
        id: 'pay-1',
        amount: 60000,
        date: '2026-08-10',
        receiptNo: 'REC-2026-8801',
        paymentMode: 'Net Banking',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <span>My Academic Tuition & Ledger</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tuition ledger, due schedules, and administrative payment verification receipts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Semester Tuition</span>
          <span className="text-3xl font-bold font-mono text-slate-900 mt-1 block tabular-nums">
            ₹{currentFee.totalFee.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Odd Semester 2026–27</span>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100 bg-emerald-50/20 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-800 block">Tuition Paid</span>
          <span className="text-3xl font-bold font-mono text-emerald-700 mt-1 block tabular-nums">
            ₹{currentFee.paidFee.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-600 mt-0.5 block font-medium">Receipt Issued</span>
        </div>

        <div className="bg-white rounded-xl border border-amber-100 bg-amber-50/20 p-5 shadow-2xs">
          <span className="text-xs font-semibold text-amber-800 block">Remaining Balance Due</span>
          <span className="text-3xl font-bold font-mono text-amber-700 mt-1 block tabular-nums">
            ₹{currentFee.remainingFee.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-600 mt-0.5 block font-medium">
            Due Date: {currentFee.dueDate}
          </span>
        </div>
      </div>

      {/* Payment Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Verified Payment Receipts</span>
          <span className="text-[11px] text-slate-500 font-mono">Issued by Accounts Department</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-[11px] font-bold">
              <th className="py-3 px-4">Receipt Number</th>
              <th className="py-3 px-4">Transaction Date</th>
              <th className="py-3 px-4">Payment Channel</th>
              <th className="py-3 px-4 text-right">Amount Paid</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentFee.payments?.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-mono font-semibold text-slate-900 flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.receiptNo}</span>
                </td>
                <td className="py-3 px-4 text-slate-600 font-mono">{p.date}</td>
                <td className="py-3 px-4 text-slate-700">{p.paymentMode}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                  ₹{p.amount.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    VERIFIED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
