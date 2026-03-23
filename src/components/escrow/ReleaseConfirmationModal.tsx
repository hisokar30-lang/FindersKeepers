"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Loader2, Shield } from "lucide-react";

interface ReleaseConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  finderName: string;
  rewardAmount: number;
}

export function ReleaseConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  finderName,
  rewardAmount,
}: ReleaseConfirmationModalProps) {
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onConfirm();
      setStep("success");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to release reward";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setError(null);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-slate-700/50 rounded-2xl z-50 shadow-2xl"
          >
            {step === "confirm" ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Shield className="text-emerald-400" size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">Confirm Return</h2>
                      <p className="text-sm text-slate-400">Release reward to finder</p>
                    </div>
                  </div>
                  <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Warning */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                    <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-medium text-white">This action cannot be undone</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Once you confirm, the reward will be released to {finderName} and cannot be recovered.
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Finder</span>
                      <span className="text-white font-medium">{finderName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Reward Amount</span>
                      <span className="text-emerald-400 font-bold">${rewardAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-3 border border-slate-600 text-slate-300 font-medium rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={isLoading}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={18} />
                          Processing...
                        </>
                      ) : (
                        "Confirm Release"
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="text-emerald-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Reward Released!</h3>
                <p className="text-slate-400">
                  ${rewardAmount.toFixed(2)} has been sent to {finderName}.
                </p>
                <p className="text-sm text-slate-500">
                  Thank you for using FindersKeepers!
                </p>
                <button
                  onClick={handleClose}
                  className="mt-4 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
