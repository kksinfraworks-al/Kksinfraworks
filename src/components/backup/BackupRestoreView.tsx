import React, { useState, useEffect } from 'react';
import { localDb } from '../../services/localDb';
import { useData } from '../../context/DataContext';
import {
  Download,
  Upload,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Database,
  FileJson,
  Trash2,
} from 'lucide-react';

export const BackupRestoreView: React.FC = () => {
  const { workers, sites, attendance, advances, siteReports, triggerSync, resetDemoData } = useData();

  const [storageInfo, setStorageInfo] = useState<{ usedBytes: number; quotaBytes: number; percent: number }>({
    usedBytes: 0,
    quotaBytes: 0,
    percent: 0,
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  useEffect(() => {
    loadStorageEstimate();
  }, []);

  const loadStorageEstimate = async () => {
    const est = await localDb.getStorageEstimate();
    setStorageInfo(est);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    setStatusMessage(null);
    try {
      const backupJson = await localDb.exportFullBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `KKSInfraWorks_Backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Backup exported and downloaded successfully! Keep this file in a safe folder or Google Drive.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to export backup.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      setIsImporting(true);
      setStatusMessage(null);
      try {
        const text = e.target?.result as string;
        const res = await localDb.importFullBackup(text);
        if (res.success) {
          await triggerSync();
          await loadStorageEstimate();
          setStatusMessage({
            type: 'success',
            text: res.message,
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: res.message,
          });
        }
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err?.message || 'Failed to parse backup file.',
        });
      } finally {
        setIsImporting(false);
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    try {
      await resetDemoData();
      setShowResetConfirm(false);
      setStatusMessage({
        type: 'success',
        text: 'Database cleared and restored to initial state.',
      });
      await loadStorageEstimate();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to reset data.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-3 sm:px-4 pt-3">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-400" />
          <span>Local Backup, Restore & Storage</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          100% offline data storage on your phone/browser. Export backups to prevent accidental data loss.
        </p>
      </div>

      {/* Notification banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 animate-fadeIn text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Storage Quota Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Device IndexedDB Storage</h2>
              <p className="text-[11px] text-slate-400">Local persistent browser database</p>
            </div>
          </div>
          <button
            onClick={loadStorageEstimate}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="Refresh Storage Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-300">Space Used: {formatBytes(storageInfo.usedBytes)}</span>
            <span className="text-slate-500">Available: {formatBytes(storageInfo.quotaBytes)}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(2, storageInfo.percent)}%` }}
            />
          </div>
        </div>

        {/* Item Count Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <div className="p-2 rounded-xl bg-slate-950 text-center">
            <span className="text-[10px] text-slate-400">Workers</span>
            <p className="text-sm font-bold text-white mt-0.5">{workers.length}</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 text-center">
            <span className="text-[10px] text-slate-400">Sites</span>
            <p className="text-sm font-bold text-white mt-0.5">{sites.length}</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 text-center">
            <span className="text-[10px] text-slate-400">Attendance</span>
            <p className="text-sm font-bold text-white mt-0.5">{attendance.length}</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-950 text-center">
            <span className="text-[10px] text-slate-400">Reports</span>
            <p className="text-sm font-bold text-white mt-0.5">{siteReports.length}</p>
          </div>
        </div>
      </div>

      {/* Backup & Restore Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Export Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Create & Download Backup</h3>
            <p className="text-xs text-slate-400 mt-1">
              Exports all workers, attendance registers, advances, daily reports, plans, and expenses into a single offline JSON file.
            </p>
          </div>

          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating Backup...' : 'Download JSON Backup'}</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Restore from Backup File</h3>
            <p className="text-xs text-slate-400 mt-1">
              Restore your construction database on a new phone or browser from a previously saved JSON backup file.
            </p>
          </div>

          <label className="mt-5 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition active:scale-95 cursor-pointer text-center">
            <FileJson className="w-4 h-4" />
            <span>{isImporting ? 'Restoring Data...' : 'Choose JSON Backup File'}</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isImporting}
            />
          </label>
        </div>
      </div>

      {/* Security & Offline Best Practices Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Offline Best Practices • KKSInfraWorks Security Note</span>
        </div>
        <p className="leading-relaxed">
          • All construction entries remain strictly inside your device's browser memory (IndexedDB) without relying on internet servers.
        </p>
        <p className="leading-relaxed">
          • <strong>Crucial:</strong> Clear-browsing-data on your phone might erase IndexedDB. Download a JSON backup weekly and share your daily reports via WhatsApp to Kalindra Kumar Singh to keep immutable records.
        </p>
      </div>

      {/* Reset Data Confirmation */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-300">Reset Local Database</h4>
          <p className="text-[11px] text-slate-500">Restore factory sample demo records</p>
        </div>

        {showResetConfirm ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleResetData}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
            >
              Confirm Reset
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Database</span>
          </button>
        )}
      </div>
    </div>
  );
};
