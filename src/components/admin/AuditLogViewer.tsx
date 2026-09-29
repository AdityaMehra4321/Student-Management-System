import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, ShieldAlert, CheckCircle2, User, Clock, Terminal } from 'lucide-react';
import { api } from '../../services/api.js';
import { AuditLogEntry } from '../../types.js';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, [searchTerm, roleFilter]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs({ search: searchTerm, actorRole: roleFilter });
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span>Institutional Security & Activity Audit Log</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log tracking administrative overrides, teacher marks submissions, student actions, and security rejections.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold self-start md:self-auto"
        >
          Refresh Feed
        </button>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by actor, action name, or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:outline-slate-900 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500">Filter Actor:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="TEACHER">TEACHER</option>
            <option value="STUDENT">STUDENT</option>
            <option value="STAFF">STAFF</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans text-xs">Loading audit entries...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans text-xs">No audit logs found.</td>
                </tr>
              ) : (
                logs.map(log => {
                  const isSecurity = log.action.includes('SECURITY');
                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSecurity ? 'bg-rose-50/40 text-rose-900' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-sans font-semibold text-slate-900 whitespace-nowrap">
                        {log.actorName}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                          log.actorRole === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : log.actorRole === 'TEACHER'
                            ? 'bg-blue-100 text-blue-800'
                            : log.actorRole === 'STUDENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`font-semibold ${isSecurity ? 'text-rose-600' : 'text-slate-800'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-sans text-[11px]">
                        {log.entityType}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-700 leading-relaxed">
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
