import React, { useState, useRef } from 'react';
import { Worker, ConstructionSite, SkillLevel } from '../../types';
import {
  X,
  Camera,
  Upload,
  User,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  IndianRupee,
  Building2,
  CreditCard,
  AlertCircle,
  Save,
} from 'lucide-react';

interface WorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workerData: Partial<Worker>) => Promise<void>;
  worker: Worker | null;
  sites: ConstructionSite[];
}

export const WorkerModal: React.FC<WorkerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  worker,
  sites,
}) => {
  if (!isOpen) return null;

  const [id, setId] = useState(worker?.id || '');
  const [name, setName] = useState(worker?.name || '');
  const [fatherName, setFatherName] = useState(worker?.fatherName || '');
  const [photo, setPhoto] = useState(worker?.photo || '');
  const [mobile, setMobile] = useState(worker?.mobile || '');
  const [villageAddress, setVillageAddress] = useState(worker?.villageAddress || '');
  const [emergencyContact, setEmergencyContact] = useState(worker?.emergencyContact || '');
  const [joiningDate, setJoiningDate] = useState(
    worker?.joiningDate || new Date().toISOString().split('T')[0]
  );
  const [workCategory, setWorkCategory] = useState(
    worker?.workCategory || 'Shuttering Carpenter'
  );
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(
    worker?.skillLevel || 'Skilled'
  );
  const [designation, setDesignation] = useState(
    worker?.designation || 'Shuttering Mistri'
  );
  const [wageType, setWageType] = useState<'daily' | 'monthly'>(
    worker?.wageType || 'daily'
  );
  const [rate, setRate] = useState<number>(worker?.rate || 700);
  const [assignedSiteId, setAssignedSiteId] = useState(
    worker?.assignedSiteId || sites[0]?.id || 'SITE-01'
  );
  const [bankName, setBankName] = useState(worker?.bankDetails?.bankName || '');
  const [accountNo, setAccountNo] = useState(worker?.bankDetails?.accountNo || '');
  const [ifsc, setIfsc] = useState(worker?.bankDetails?.ifsc || '');
  const [upiId, setUpiId] = useState(worker?.bankDetails?.upiId || '');
  const [status, setStatus] = useState<'active' | 'inactive' | 'left'>(
    worker?.status || 'active'
  );
  const [remarks, setRemarks] = useState(worker?.remarks || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setPhoto(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Worker name is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const assignedSite = sites.find((s) => s.id === assignedSiteId);

    const workerPayload: Partial<Worker> = {
      id: id.trim() || undefined,
      name: name.trim(),
      fatherName: fatherName.trim(),
      photo,
      mobile: mobile.trim(),
      villageAddress: villageAddress.trim(),
      emergencyContact: emergencyContact.trim(),
      joiningDate,
      workCategory,
      skillLevel,
      designation: designation.trim() || workCategory,
      wageType,
      rate: Number(rate) || 0,
      assignedSiteId,
      assignedSiteName: assignedSite?.name || 'Default Site',
      bankDetails: {
        bankName: bankName.trim(),
        accountNo: accountNo.trim(),
        ifsc: ifsc.trim(),
        upiId: upiId.trim(),
      },
      status,
      remarks: remarks.trim(),
    };

    try {
      await onSave(workerPayload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save worker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 rounded-t-3xl sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-white">
              {worker ? `Edit Worker: ${worker.name} (${worker.id})` : 'Add New Construction Worker'}
            </h2>
            <p className="text-xs text-slate-400">KKSInfraWorks Labour & Artisan Profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Top Section: Photo and Basic IDs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-800 border-2 border-amber-500/50 flex items-center justify-center">
                {photo ? (
                  <img src={photo} alt="Worker" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-500" />
                )}
              </div>
              {/* Photo controls */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
                  title="Take photo using phone camera"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 transition"
                  title="Upload from mobile gallery"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto('')}
                    className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 transition"
                    title="Remove photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Worker ID (Auto or Custom)
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. KKS009"
                  disabled={!!worker}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dharmendra Kumar Yadav"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Father's Name (पिता का नाम)
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="e.g. Ram Bachan Yadav"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Mobile Number (मोबाइल नं.)
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Trade, Skill & Wages */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Trade, Wages & Site Assignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Work Category (कार्य श्रेणी)
                </label>
                <select
                  value={workCategory}
                  onChange={(e) => setWorkCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Shuttering Carpenter">Shuttering Carpenter (शटरिंग मिस्त्री)</option>
                  <option value="Steel Fixer">Steel Fixer / Bar Bender (लोहा फिटर)</option>
                  <option value="Rajmistri / Mason">Rajmistri / Mason (राजमिस्त्री)</option>
                  <option value="Helper / Beldar">Helper / Beldar (बेलदार / हेल्पर)</option>
                  <option value="Mixer / Vibrator Operator">Mixer / Vibrator Operator</option>
                  <option value="Shuttering Supervisor">Shuttering Supervisor</option>
                  <option value="Plumber / Electrician">Plumber / Electrician</option>
                  <option value="Other Civil Work">Other Civil Work</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Skill Level (दक्षता)
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Master Mistri">Master Mistri (उस्ताद मिस्त्री)</option>
                  <option value="Skilled">Skilled (कुशल कारीगर)</option>
                  <option value="Semi-Skilled">Semi-Skilled (अर्ध-कुशल)</option>
                  <option value="Unskilled">Unskilled (अकुशल मजदूर)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Designation / Role
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Head Shuttering Mistri"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Wage Type & Rate (दिहाड़ी / वेतन ₹)
                </label>
                <div className="flex gap-2">
                  <select
                    value={wageType}
                    onChange={(e) => setWageType(e.target.value as 'daily' | 'monthly')}
                    className="w-24 bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                  >
                    <option value="daily">Daily / दिन</option>
                    <option value="monthly">Monthly / माह</option>
                  </select>
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 text-xs">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      placeholder="e.g. 750"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-6 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Assigned Construction Site
                </label>
                <select
                  value={assignedSiteId}
                  onChange={(e) => setAssignedSiteId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Worker Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                >
                  <option value="active">Active (सक्रिय)</option>
                  <option value="inactive">Inactive (निष्क्रिय)</option>
                  <option value="left">Left Firm (काम छोड़ दिया)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Personal Details */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Address & Joining Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Village & Permanent Address (गांव व पता)
                </label>
                <input
                  type="text"
                  value={villageAddress}
                  onChange={(e) => setVillageAddress(e.target.value)}
                  placeholder="e.g. Village Siswa, PO Mairwa, Siwan, Bihar"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Emergency Contact (आपातकालीन संपर्क)
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. 9835XXXXXX (Brother)"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Joining Date (शामिल होने की तिथि)
                </label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Remarks / Special Experience (विशेष टिप्पणी)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Staircase curved shuttering specialist, punctual"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Bank / UPI Payment Details */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bank & Payment Account Details (Optional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. SBI Mairwa"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Account No.</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="Account number"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  placeholder="e.g. SBIN0002974"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. worker@sbi"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Worker...' : 'Save Worker Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
