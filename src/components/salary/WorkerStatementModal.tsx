import React, { useState } from 'react';
import { WorkerAccountStatement } from '../../types';
import { X, Printer, Share2, Copy, Check, IndianRupee, Calendar, User, FileText } from 'lucide-react';

interface WorkerStatementModalProps {
  statement: WorkerAccountStatement | null;
  onClose: () => void;
}

export const WorkerStatementModal: React.FC<WorkerStatementModalProps> = ({ statement, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!statement) return null;
  const { worker } = statement;

  const generateStatementText = () => {
    let t = `*KKSInfraWorks - WORKER ACCOUNT STATEMENT*\n`;
    t += `Proprietor: Kalindra Kumar Singh | Estd. 2002\n`;
    t += `Bargawn Road, Mairwa, Bihar - 841239\n`;
    t += `------------------------------------\n`;
    t += `Worker ID: ${worker.id}\n`;
    t += `Name: ${worker.name} (S/O ${worker.fatherName})\n`;
    t += `Trade: ${worker.workCategory} (${worker.skillLevel})\n`;
    t += `Rate: ₹${worker.rate} / ${worker.wageType}\n`;
    t += `Period: ${statement.period}\n`;
    t += `------------------------------------\n`;
    t += `• Present Days: ${statement.presentDays}\n`;
    t += `• Half Days: ${statement.halfDays}\n`;
    t += `• Absent Days: ${statement.absentDays}\n`;
    t += `• Overtime (OT): ${statement.overtimeHours} hours\n`;
    t += `• Gross Earnings: ₹${statement.totalEarnings.toLocaleString('en-IN')}\n`;
    t += `• Advances Taken: ₹${statement.totalAdvancesTaken.toLocaleString('en-IN')}\n`;
    t += `• Total Paid: ₹${statement.totalPaymentsMade.toLocaleString('en-IN')}\n`;
    t += `• *Net Balance Due: ₹${statement.closingBalance.toLocaleString('en-IN')}*\n`;
    t += `------------------------------------\n`;
    return t;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateStatementText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleWhatsApp = () => {
    let cleanPhone = worker.mobile.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generateStatementText())}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Worker Account Statement
                <span className="text-xs text-amber-400 font-mono">({worker.id})</span>
              </h2>
              <p className="text-xs text-slate-400">
                {worker.name} • Month: {statement.period}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Statement Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Worker Info Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {worker.photo ? (
                <img
                  src={worker.photo}
                  alt={worker.name}
                  className="w-12 h-12 rounded-full object-cover border border-amber-500/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold">
                  {worker.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-sm font-bold text-white">{worker.name}</h3>
                <p className="text-xs text-slate-400">
                  S/O {worker.fatherName} • {worker.village}, {worker.district}
                </p>
                <p className="text-xs text-amber-400/90 font-medium">
                  {worker.workCategory} • ₹{worker.rate}/day
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400">Net Due Balance</span>
              <p
                className={`text-xl font-black ${
                  statement.closingBalance > 0 ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                ₹{statement.closingBalance.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Metrics 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Days Worked</span>
              <p className="text-lg font-bold text-white mt-0.5">
                {statement.presentDays}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  ({statement.halfDays} half)
                </span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total OT</span>
              <p className="text-lg font-bold text-amber-400 mt-0.5">{statement.overtimeHours} hrs</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Gross Earned</span>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                ₹{statement.totalEarnings.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Advances Taken</span>
              <p className="text-lg font-bold text-purple-400 mt-0.5">
                ₹{statement.totalAdvancesTaken.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          {/* Transactions Ledger */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Monthly Transaction Ledger • खाता विवरण
            </h4>
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Credit (Earned)</th>
                    <th className="p-3 text-right">Debit (Advance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {statement.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500">
                        No transactions found for this period.
                      </td>
                    </tr>
                  ) : (
                    statement.transactions.map((tx, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="p-3 text-slate-400 font-mono">{tx.date}</td>
                        <td className="p-3 text-slate-200">{tx.description}</td>
                        <td className="p-3 text-right font-medium text-emerald-400">
                          {tx.credit > 0 ? `+₹${tx.credit.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="p-3 text-right font-medium text-purple-400">
                          {tx.debit > 0 ? `-₹${tx.debit.toLocaleString('en-IN')}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>

          <button
            onClick={handleWhatsApp}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Send Statement to Worker (WhatsApp)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
