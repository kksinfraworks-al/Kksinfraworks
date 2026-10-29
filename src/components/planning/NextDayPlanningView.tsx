import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { NextDayPlan, PlanPriority, PlanStatus } from '../../types';
import {
  CalendarClock,
  Plus,
  Calendar,
  Building2,
  Copy,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Wrench,
  ShieldCheck,
  User,
  ArrowRight,
  Edit,
  X,
  ListTodo,
} from 'lucide-react';

export const NextDayPlanningView: React.FC<{ initialCreateOpen?: boolean }> = ({
  initialCreateOpen = false,
}) => {
  const { user } = useAuth();
  const { sites, nextDayPlans, siteReports, createNextDayPlan, updateNextDayPlan, copyIncompleteTasks } = useData();

  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(initialCreateOpen);
  const [editingPlan, setEditingPlan] = useState<NextDayPlan | null>(null);

  // Form states
  const [planDate, setPlanDate] = useState(tomorrowStr);
  const [siteId, setSiteId] = useState(sites[0]?.id || 'SITE-01');
  const [expectedWork, setExpectedWork] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [activitiesInput, setActivitiesInput] = useState('');
  const [expectedWorkersCount, setExpectedWorkersCount] = useState<number>(5);
  const [assignedTeam, setAssignedTeam] = useState('');
  const [materialsRequired, setMaterialsRequired] = useState('');
  const [toolsEquipmentRequired, setToolsEquipmentRequired] = useState('');
  const [concreteShutteringRequirements, setConcreteShutteringRequirements] = useState('');
  const [priority, setPriority] = useState<PlanPriority>('high');
  const [dependenciesOrApprovals, setDependenciesOrApprovals] = useState('');
  const [expectedStartTime, setExpectedStartTime] = useState('08:00 AM');
  const [expectedCompletionTime, setExpectedCompletionTime] = useState('06:00 PM');
  const [responsibleSupervisor, setResponsibleSupervisor] = useState(user?.name || 'Ramesh Sharma');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [safetyPrecautions, setSafetyPrecautions] = useState('');
  const [status, setStatus] = useState<PlanStatus>('planned');
  const [delayReason, setDelayReason] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  const filteredPlans = nextDayPlans.filter((p) => {
    const matchSite = selectedSiteFilter === 'all' || p.siteId === selectedSiteFilter;
    const matchDate = !selectedDateFilter || p.planDate === selectedDateFilter;
    return matchSite && matchDate;
  });

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setPlanDate(tomorrowStr);
    setSiteId(sites[0]?.id || 'SITE-01');
    setExpectedWork('');
    setWorkLocation('');
    setActivitiesInput('');
    setExpectedWorkersCount(5);
    setAssignedTeam('');
    setMaterialsRequired('');
    setToolsEquipmentRequired('');
    setConcreteShutteringRequirements('');
    setPriority('high');
    setDependenciesOrApprovals('');
    setExpectedStartTime('08:00 AM');
    setExpectedCompletionTime('06:00 PM');
    setResponsibleSupervisor(user?.name || 'Ramesh Sharma');
    setSpecialInstructions('');
    setSafetyPrecautions('Safety helmet, safety shoes and safety harness mandatory.');
    setStatus('planned');
    setDelayReason('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: NextDayPlan) => {
    setEditingPlan(plan);
    setPlanDate(plan.planDate);
    setSiteId(plan.siteId);
    setExpectedWork(plan.expectedWork);
    setWorkLocation(plan.workLocation);
    setActivitiesInput((plan.plannedActivities || []).join('\n'));
    setExpectedWorkersCount(plan.expectedWorkersCount);
    setAssignedTeam(plan.assignedTeam);
    setMaterialsRequired(plan.materialsRequired);
    setToolsEquipmentRequired(plan.toolsEquipmentRequired);
    setConcreteShutteringRequirements(plan.concreteShutteringRequirements || '');
    setPriority(plan.priority);
    setDependenciesOrApprovals(plan.dependenciesOrApprovals || '');
    setExpectedStartTime(plan.expectedStartTime || '08:00 AM');
    setExpectedCompletionTime(plan.expectedCompletionTime || '06:00 PM');
    setResponsibleSupervisor(plan.responsibleSupervisor);
    setSpecialInstructions(plan.specialInstructions || '');
    setSafetyPrecautions(plan.safetyPrecautions || '');
    setStatus(plan.status);
    setDelayReason(plan.delayReason || '');
    setIsModalOpen(true);
  };

  const handleCopyIncomplete = async () => {
    try {
      const count = await copyIncompleteTasks();
      setCopyNotice(`Copied ${count} incomplete/delayed tasks to tomorrow.`);
      setTimeout(() => setCopyNotice(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Copy failed');
    }
  };

  const handleStatusChange = async (plan: NextDayPlan, newStatus: PlanStatus) => {
    let reason = plan.delayReason;
    if (newStatus === 'delayed' && !reason) {
      reason = prompt('Enter reason for delay (e.g. material shortage, rain):') || 'Delayed due to site constraints';
    }
    await updateNextDayPlan(plan.id, { status: newStatus, delayReason: reason });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expectedWork.trim()) {
      setError('Expected work description is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const site = sites.find((s) => s.id === siteId);
    const activities = activitiesInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Partial<NextDayPlan> = {
      planDate,
      siteId,
      siteName: site?.name || 'Site',
      expectedWork: expectedWork.trim(),
      workLocation: workLocation.trim(),
      plannedActivities: activities.length > 0 ? activities : [expectedWork.trim()],
      expectedWorkersCount: Number(expectedWorkersCount) || 1,
      assignedTeam: assignedTeam.trim(),
      materialsRequired: materialsRequired.trim(),
      toolsEquipmentRequired: toolsEquipmentRequired.trim(),
      concreteShutteringRequirements: concreteShutteringRequirements.trim(),
      priority,
      dependenciesOrApprovals: dependenciesOrApprovals.trim(),
      expectedStartTime,
      expectedCompletionTime,
      responsibleSupervisor: responsibleSupervisor.trim(),
      specialInstructions: specialInstructions.trim(),
      safetyPrecautions: safetyPrecautions.trim(),
      status,
      delayReason: status === 'delayed' ? delayReason.trim() : '',
    };

    try {
      if (editingPlan) {
        await updateNextDayPlan(editingPlan.id, payload);
      } else {
        await createNextDayPlan(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold text-white">Tomorrow's Work Planning • कल की योजना</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Plan site operations in advance: team assignments, shuttering material, equipment & safety
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyIncomplete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            title="Carry forward all delayed and uncompleted tasks to tomorrow"
          >
            <Copy className="w-3.5 h-3.5 text-amber-400" />
            <span>Copy Incomplete to Tomorrow</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tomorrow's Plan (योजना बनाएं)</span>
          </button>
        </div>
      </div>

      {copyNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{copyNotice}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Filter by Site
          </label>
          <select
            value={selectedSiteFilter}
            onChange={(e) => setSelectedSiteFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
          >
            <option value="all">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 mb-1">
            Filter by Date
          </label>
          <input
            type="date"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <CalendarClock className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-bold text-slate-300">No work plans scheduled</h3>
            <p className="text-xs text-slate-500 mt-1">
              Create a next-day work plan today to coordinate team and materials.
            </p>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const isCompleted = plan.status === 'completed';
            const isDelayed = plan.status === 'delayed';
            const isInProgress = plan.status === 'in_progress';

            return (
              <div
                key={plan.id}
                className={`bg-slate-900/90 border rounded-2xl p-4 sm:p-5 shadow-sm transition space-y-3.5 ${
                  isCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/5'
                    : isDelayed
                    ? 'border-rose-500/40 bg-rose-950/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header: Target Date, Site, Priority, Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                        Target Date: {plan.planDate}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          plan.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {plan.priority} Priority
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isDelayed
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : isInProgress
                            ? 'bg-sky-500/20 text-sky-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        Status: {plan.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{plan.siteName}</h3>
                    {plan.workLocation && (
                      <p className="text-xs text-slate-400 mt-0.5">Location: {plan.workLocation}</p>
                    )}
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      onClick={() => handleStatusChange(plan, 'completed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-emerald-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(plan, 'in_progress')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        isInProgress
                          ? 'bg-sky-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-sky-300'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(plan, 'delayed')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        isDelayed
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-rose-300'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Delayed</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </div>

                {/* Primary Expected Work Statement */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                  <h4 className="text-xs font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5" />
                    <span>Expected Work • लक्षित कार्य</span>
                  </h4>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    {plan.expectedWork}
                  </p>
                </div>

                {/* Planned Activities Checklist */}
                {plan.plannedActivities && plan.plannedActivities.length > 0 && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Planned Step-by-Step Activities:
                    </label>
                    <ul className="space-y-1">
                      {plan.plannedActivities.map((act, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-300 bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-700/50"
                        >
                          <span className="text-amber-500 font-bold shrink-0">{idx + 1}.</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Resources Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                  {plan.assignedTeam && (
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned Team:</span>
                      <p className="text-white font-medium mt-0.5">{plan.assignedTeam}</p>
                    </div>
                  )}

                  {plan.materialsRequired && (
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Materials Needed:</span>
                      <p className="text-amber-300 font-medium mt-0.5">{plan.materialsRequired}</p>
                    </div>
                  )}

                  {plan.toolsEquipmentRequired && (
                    <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/60">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Tools & Equipment:</span>
                      <p className="text-slate-200 mt-0.5">{plan.toolsEquipmentRequired}</p>
                    </div>
                  )}
                </div>

                {/* Delay Notice */}
                {plan.status === 'delayed' && plan.delayReason && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong>Delay Reason: </strong>
                      <span>{plan.delayReason}</span>
                    </div>
                  </div>
                )}

                {/* Footer notes */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                  <span>Supervisor: <strong className="text-slate-200">{plan.responsibleSupervisor}</strong></span>
                  <span>Team Size: <strong className="text-slate-200">{plan.expectedWorkersCount} workers</strong></span>
                  <span>Shift: {plan.expectedStartTime} - {plan.expectedCompletionTime}</span>
                  {plan.dependenciesOrApprovals && (
                    <span className="text-amber-400">Approval needed: {plan.dependenciesOrApprovals}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 shadow-2xl my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingPlan ? 'Edit Next-Day Work Plan' : "Create Tomorrow's Work Plan"}
                </h3>
                <p className="text-xs text-slate-400">KKSInfraWorks Next-Day Operational Planner</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Construction Site *
                  </label>
                  <select
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    required
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Execution Date (लक्ष्य तारीख) *
                  </label>
                  <input
                    type="date"
                    value={planDate}
                    onChange={(e) => setPlanDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expected Work Summary (मुख्य कार्य का विवरण) *
                  </label>
                  <input
                    type="text"
                    value={expectedWork}
                    onChange={(e) => setExpectedWork(e.target.value)}
                    placeholder="e.g. Complete staircase shuttering inspection, arrange shuttering material near lift staircase, proceed with concrete pour."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Location within Site
                  </label>
                  <input
                    type="text"
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
                    placeholder="e.g. 2nd Floor Gymnasium & Lift Shaft"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PlanPriority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="high">High Priority (अति आवश्यक)</option>
                    <option value="medium">Medium Priority</option>
                    <option value="normal">Normal Priority</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Step-by-Step Planned Activities (One item per line)
                  </label>
                  <textarea
                    rows={3}
                    value={activitiesInput}
                    onChange={(e) => setActivitiesInput(e.target.value)}
                    placeholder="Inspection of staircase reinforcement with client engineer at 9:30 AM&#10;Shift 20 shuttering plates and 30 props from ground stock to lift well&#10;Check cover blocks (25mm) on landing slab"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expected Workers & Assigned Team
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      value={expectedWorkersCount}
                      onChange={(e) => setExpectedWorkersCount(Number(e.target.value))}
                      className="w-18 bg-slate-800 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white text-center focus:outline-hidden focus:border-amber-500"
                      title="Workers count"
                    />
                    <input
                      type="text"
                      value={assignedTeam}
                      onChange={(e) => setAssignedTeam(e.target.value)}
                      placeholder="e.g. Dharmendra Mistri (Lead), 2 Carpenters, 2 Helpers"
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Responsible Supervisor
                  </label>
                  <input
                    type="text"
                    value={responsibleSupervisor}
                    onChange={(e) => setResponsibleSupervisor(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Materials Required (आवश्यक सामग्री)
                  </label>
                  <input
                    type="text"
                    value={materialsRequired}
                    onChange={(e) => setMaterialsRequired(e.target.value)}
                    placeholder="e.g. Shuttering oil 15L, binding wire 10kg, 20mm cover blocks"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tools & Equipment Required
                  </label>
                  <input
                    type="text"
                    value={toolsEquipmentRequired}
                    onChange={(e) => setToolsEquipmentRequired(e.target.value)}
                    placeholder="e.g. Concrete vibrator, level tube, scaffold clamps"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Safety Precautions & Special Instructions (सुरक्षा निर्देश)
                  </label>
                  <input
                    type="text"
                    value={safetyPrecautions}
                    onChange={(e) => setSafetyPrecautions(e.target.value)}
                    placeholder="e.g. Safety harness mandatory inside lift well; barricade floor edges"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Saving Plan...' : 'Save Next-Day Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
