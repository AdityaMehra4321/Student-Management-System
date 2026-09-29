import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Clock, AlertTriangle, FileCheck, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api.js';
import { DocumentRecord } from '../../types.js';

export const StudentDocumentsView: React.FC = () => {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocs(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span>My Verified Registration Documents</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Status of institutional certificates, identity verification, and registrar clearance.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">Verification Ledger</span>
          <span className="text-[11px] text-slate-500">Registrar Office & Academic Coordinator</span>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-[11px] font-bold">
              <th className="py-3 px-4">Document Title</th>
              <th className="py-3 px-4">Upload Timestamp</th>
              <th className="py-3 px-4">Verification Clearance</th>
              <th className="py-3 px-4">Verified By</th>
              <th className="py-3 px-4">Registrar Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {docs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-slate-400" />
                  <span>{doc.documentType}</span>
                </td>
                <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                    doc.status === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {doc.status === 'VERIFIED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{doc.status}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700 font-medium">
                  {doc.verifierName || 'Awaiting Review'}
                </td>
                <td className="py-3 px-4 text-slate-500 text-[11px] italic">
                  {doc.notes || 'Original physical document verified'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
