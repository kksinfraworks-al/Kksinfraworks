import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { PinLockProvider, usePinLock } from './context/PinLockContext';
import { PinLockScreen } from './components/auth/PinLockScreen';
import { WhatsAppReportModal } from './components/whatsapp/WhatsAppReportModal';
import { Navbar } from './components/common/Navbar';
import { BottomNav } from './components/common/BottomNav';
import { MoreMenuDrawer } from './components/common/MoreMenuDrawer';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { Dashboard } from './components/dashboard/Dashboard';
import { WorkerList } from './components/workers/WorkerList';
import { AttendanceView } from './components/attendance/AttendanceView';
import { SiteWorkManagement } from './components/sitework/SiteWorkManagement';
import { DailyWorkReportView } from './components/reports/DailyWorkReportView';
import { FoodAllowanceRegister } from './components/foodallowance/FoodAllowanceRegister';
import { CompleteWorkerLedgerView } from './components/ledger/CompleteWorkerLedgerView';
import { SalaryAccountsView } from './components/salary/SalaryAccountsView';
import { AdvanceRegister } from './components/advances/AdvanceRegister';
import { NextDayPlanningView } from './components/planning/NextDayPlanningView';
import { MediaGallery } from './components/gallery/MediaGallery';
import { ExpenseRegister } from './components/expenses/ExpenseRegister';
import { BackupRestoreView } from './components/backup/BackupRestoreView';
import { ExportReportsView } from './components/exports/ExportReportsView';
import { SiteManager } from './components/sites/SiteManager';
import { AuditHistoryView } from './components/audit/AuditHistoryView';
import { SettingsView } from './components/settings/SettingsView';
import { WorkerPortalView } from './components/auth/WorkerPortalView';
import { Share2 } from 'lucide-react';

function MainApp() {
  const { isLocked } = usePinLock();
  const { isWorker } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState<boolean>(false);

  // Quick Action Triggers
  const [initialWorkerModal, setInitialWorkerModal] = useState(false);
  const [initialAdvanceModal, setInitialAdvanceModal] = useState(false);
  const [initialReportModal, setInitialReportModal] = useState(false);
  const [initialPlanModal, setInitialPlanModal] = useState(false);

  // If logged in as worker, strictly show Worker Portal
  if (isWorker) {
    return <WorkerPortalView />;
  }

  // If local app lock is active, show PIN screen
  if (isLocked) {
    return <PinLockScreen />;
  }

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    setInitialWorkerModal(false);
    setInitialAdvanceModal(false);
    setInitialReportModal(false);
    setInitialPlanModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add_worker':
        setInitialWorkerModal(true);
        setActiveTab('workers');
        break;
      case 'add_advance':
        setInitialAdvanceModal(true);
        setActiveTab('advances');
        break;
      case 'add_report':
        setInitialReportModal(true);
        setActiveTab('site_work');
        break;
      case 'upload_media':
        setActiveTab('gallery');
        break;
      case 'plan_tomorrow':
        setInitialPlanModal(true);
        setActiveTab('planning');
        break;
      default:
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Offline Alert */}
      <OfflineIndicator />

      {/* Top Navbar */}
      <Navbar
        onOpenTab={handleSelectTab}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={handleSelectTab}
            onOpenQuickAction={handleQuickAction}
          />
        )}
        {activeTab === 'workers' && (
          <WorkerList initialCreateOpen={initialWorkerModal} />
        )}
        {activeTab === 'attendance' && <AttendanceView />}
        {activeTab === 'site_work' && (
          <SiteWorkManagement initialCreateOpen={initialReportModal} />
        )}
        {activeTab === 'food_allowance' && <FoodAllowanceRegister />}
        {activeTab === 'ledger' && <CompleteWorkerLedgerView />}
        {activeTab === 'salary' && <SalaryAccountsView />}
        {activeTab === 'advances' && (
          <AdvanceRegister initialCreateOpen={initialAdvanceModal} />
        )}
        {activeTab === 'planning' && (
          <NextDayPlanningView initialCreateOpen={initialPlanModal} />
        )}
        {activeTab === 'gallery' && (
          <MediaGallery
            onOpenReport={() => {
              setActiveTab('site_work');
            }}
          />
        )}
        {activeTab === 'expenses' && <ExpenseRegister />}
        {activeTab === 'backup' && <BackupRestoreView />}
        {activeTab === 'reports' && <ExportReportsView />}
        {activeTab === 'sites' && <SiteManager />}
        {activeTab === 'audit' && <AuditHistoryView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Floating 1-Tap WhatsApp Report Button */}
      <button
        onClick={() => setIsWhatsAppOpen(true)}
        className="fixed bottom-20 right-4 z-40 px-3.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-900/50 flex items-center gap-2 border border-emerald-400/40 active:scale-95 transition"
        title="Share Daily Site Report on WhatsApp"
      >
        <Share2 className="w-4 h-4 text-emerald-100" />
        <span className="font-bold">WhatsApp Report</span>
      </button>

      {/* WhatsApp Daily Report Modal */}
      <WhatsAppReportModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenMoreMenu={() => setIsMoreOpen(true)}
        isMoreOpen={isMoreOpen}
      />

      {/* More Menu Drawer */}
      <MoreMenuDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onSelectTab={handleSelectTab}
        activeTab={activeTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <PinLockProvider>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </PinLockProvider>
  );
}
