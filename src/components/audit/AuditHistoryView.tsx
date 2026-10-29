import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { AuditLog } from '../../types';
import {
  History,
  Search,
  Filter,
  User,
  Clock,
  ShieldCheck,
  FileText,
  Building2,
  CalendarCheck2,
  IndianRupee,
  Images,
  Receipt,
  PlusCircle,
  Edit,
  Trash2,
} from 'lucide-react';

export const AuditHistoryView: React.FC = () => {
  const { auditLogs } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchEntity = selectedEntityFilter === 'all' || log.entityType === selectedEntityFilter;
    const matchSearch =
      (log.summary || log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.workerId && log.workerId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.siteId && log.siteId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchEntity && matchSearch;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return (
          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
            <PlusCircle className="w-3 h-3" />
            Created
          </span>
        );
      case 'update':
        return (
          <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
            <Edit className="w-3 h-3" />
            Modified
          </span>
        );
      case 'delete':
        return (
          <span className="text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
            <Trash2 className="w-3 h-3" />
            Deactivated/Removed
          </span>
        );
      case 'login':
        return (
          <span className="text-[10px] bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-bold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Security Login
          </span>
        );
      default:
        return (
          <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-bold">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Title Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-400" />
          <h1 className="text-lg font-bold text-white">Audit History & Activity Log • ऑडिट लॉग</h1>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Tamper-evident chronological audit trail for attendance corrections, advances, work reports, and media
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Search Audit Trail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, worker ID, summary..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Filter by Entity Type
          </label>
          <select
            value={selectedEntityFilter}
            onChange={(e) => setSelectedEntityFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
          >
            <option value="all">All Operations</option>
            <option value="attendance">Daily Attendance</option>
            <option value="advance">Advances & Repayments</option>
            <option value="work_report">Site Work Reports</option>
            <option value="next_day_plan">Next-Day Plans</option>
            <option value="expense">Site Expenses</option>
            <option value="worker">Workers Register</option>
            <option value="media">Photos & Videos</option>
            <option value="user">User Logins & Security</option>
          </select>
        </div>
      </div>

      {/* Logs Timeline List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Audit Records ({filteredLogs.length} events logged)
          </span>
          <span className="text-xs text-teal-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Immutable Audit Trail
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p>No audit records match your query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-800/40 transition space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    {getActionBadge(log.action)}
                    <span className="text-xs font-bold text-white">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {log.userRole}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-200 font-medium pl-1">{log.summary}</p>

                {/* Diff Preview if present */}
                {log.previousValues && log.newValues && (
                  <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Change Detail:</span>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500">Previous: </span>
                        <code className="text-rose-300 text-[10px]">
                          {typeof log.previousValues === 'object'
                            ? JSON.stringify(log.previousValues).slice(0, 80)
                            : String(log.previousValues)}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-500">New: </span>
                        <code className="text-emerald-300 text-[10px]">
                          {typeof log.newValues === 'object'
                            ? JSON.stringify(log.newValues).slice(0, 80)
                            : String(log.newValues)}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
