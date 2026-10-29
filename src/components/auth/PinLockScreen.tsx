import React, { useState } from 'react';
import { usePinLock } from '../../context/PinLockContext';
import { Lock, Delete, Fingerprint, ShieldCheck, HardHat, Info } from 'lucide-react';

export const PinLockScreen: React.FC = () => {
  const { unlockWithPin, biometricsAvailable, unlockWithBiometrics, resetToDefaultPin, settings } = usePinLock();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      // Auto verify when 4 digits reached
      if (nextPin.length === 4) {
        setTimeout(() => {
          const success = unlockWithPin(nextPin);
          if (!success) {
            triggerError('Incorrect PIN. Default is 2002.');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setPin('');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-6 select-none text-slate-100">
      {/* Top Branding */}
      <div className="w-full max-w-sm flex flex-col items-center text-center mt-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-xl shadow-amber-500/20 mb-3 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <HardHat className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white">KKSInfraWorks</h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/90 mt-0.5">
          Civil & Shuttering Contractor
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Bargawn Road, Mairwa, Bihar – 841239
        </p>

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Offline Protected Mode</span>
        </div>
      </div>

      {/* Middle PIN Entry & Dots */}
      <div className="w-full max-w-sm flex flex-col items-center my-4">
        <div className="flex items-center gap-2 mb-4 text-slate-300">
          <Lock className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold tracking-wide">Enter Security PIN</span>
        </div>

        {/* PIN Dots */}
        <div className={`flex items-center gap-4 py-2 ${isShaking ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-amber-400 scale-110 shadow-lg shadow-amber-400/50'
                    : 'bg-slate-800 border-2 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {errorMsg ? (
          <p className="text-xs text-rose-400 font-medium mt-3 text-center">{errorMsg}</p>
        ) : (
          <p className="text-xs text-slate-400 mt-3 text-center">
            Protected local access for Proprietor & Site Supervisor
          </p>
        )}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 mb-4">
        {[
          { num: '1', sub: '' },
          { num: '2', sub: 'ABC' },
          { num: '3', sub: 'DEF' },
          { num: '4', sub: 'GHI' },
          { num: '5', sub: 'JKL' },
          { num: '6', sub: 'MNO' },
          { num: '7', sub: 'PQRS' },
          { num: '8', sub: 'TUV' },
          { num: '9', sub: 'WXYZ' },
        ].map((item) => (
          <button
            key={item.num}
            onClick={() => handleKeyPress(item.num)}
            className="h-16 rounded-2xl bg-slate-900 border border-slate-800/80 active:bg-amber-500/20 active:border-amber-500/50 flex flex-col items-center justify-center transition-all hover:bg-slate-850"
          >
            <span className="text-2xl font-bold text-white leading-none">{item.num}</span>
            {item.sub && (
              <span className="text-[10px] text-slate-400 font-medium tracking-widest mt-0.5">
                {item.sub}
              </span>
            )}
          </button>
        ))}

        {/* Clear Button */}
        <button
          onClick={handleClear}
          className="h-16 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-bold text-slate-400 active:bg-slate-800 flex items-center justify-center transition-all"
        >
          CLEAR
        </button>

        {/* Zero */}
        <button
          onClick={() => handleKeyPress('0')}
          className="h-16 rounded-2xl bg-slate-900 border border-slate-800 active:bg-amber-500/20 active:border-amber-500/50 flex flex-col items-center justify-center transition-all hover:bg-slate-850"
        >
          <span className="text-2xl font-bold text-white leading-none">0</span>
        </button>

        {/* Backspace or Biometric */}
        {pin.length > 0 ? (
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 active:bg-slate-800 flex items-center justify-center transition-all"
            aria-label="Delete last digit"
          >
            <Delete className="w-6 h-6 text-slate-300" />
          </button>
        ) : biometricsAvailable ? (
          <button
            onClick={() => unlockWithBiometrics()}
            className="h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 active:bg-amber-500/20 flex items-center justify-center transition-all"
            title="Biometric Unlock"
          >
            <Fingerprint className="w-6 h-6" />
          </button>
        ) : (
          <div className="h-16" />
        )}
      </div>

      {/* Bottom Help & Reset */}
      <div className="w-full max-w-sm flex flex-col items-center text-center pb-2">
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Forgot PIN or Need Help?</span>
        </button>

        {showHint && (
          <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2 text-left animate-fadeIn">
            <p>
              • <strong>Default PIN:</strong> <code className="text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded">2002</code> (Firm Established Year).
            </p>
            <p className="text-slate-400">
              • All data is saved strictly in your device's offline IndexedDB storage.
            </p>
            <button
              onClick={() => {
                resetToDefaultPin();
                setPin('2002');
                unlockWithPin('2002');
              }}
              className="w-full py-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-center border border-amber-500/40 mt-1"
            >
              Reset to Default PIN (2002) & Unlock
            </button>
          </div>
        )}

        <p className="text-[10px] text-slate-400 mt-3">
          Proprietor: {settings.proprietorName} • Estd. {settings.established}
        </p>
      </div>
    </div>
  );
};
