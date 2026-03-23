"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Shield, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { calculatePaymentSummary } from "@/lib/escrow";
import { createRewardPaymentIntent } from "@/lib/stripe";
import { createRewardPreference } from "@/lib/rewards";

interface RewardDepositModalProps {
  incidentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [25, 50, 100, 200, 500];

export function RewardDepositModal({
  incidentId,
  isOpen,
  onClose,
  onSuccess,
}: RewardDepositModalProps) {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"amount" | "questions" | "payment">("amount");
  const [verificationQuestions, setVerificationQuestions] = useState<{ question: string; answer: string }[]>([
    { question: "", answer: "" },
  ]);

  const summary = calculatePaymentSummary(isCustom ? parseFloat(customAmount) || 0 : amount);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
  };

  const handleAddQuestion = () => {
    if (verificationQuestions.length < 3) {
      setVerificationQuestions([...verificationQuestions, { question: "", answer: "" }]);
    }
  };

  const handleQuestionChange = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...verificationQuestions];
    updated[index][field] = value;
    setVerificationQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    if (verificationQuestions.length > 1) {
      setVerificationQuestions(verificationQuestions.filter((_, i) => i !== index));
    }
  };

  const handleContinueToQuestions = () => {
    const finalAmount = isCustom ? parseFloat(customAmount) : amount;
    if (finalAmount < 10) {
      setError("Minimum reward amount is $10");
      return;
    }
    if (finalAmount > 5000) {
      setError("Maximum reward amount is $5,000");
      return;
    }
    setError(null);
    setStep("questions");
  };

  const handleContinueToPayment = async () => {
    const validQuestions = verificationQuestions.filter((q) => q.question.trim() && q.answer.trim());
    if (validQuestions.length === 0) {
      setError("Please add at least one verification question");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const finalAmount = isCustom ? parseFloat(customAmount) : amount;

      // Create reward preference first
      const { preference, error: prefError } = await createRewardPreference(incidentId, finalAmount, {
        anonymous: isAnonymous,
        verificationQuestions: validQuestions,
      });

      if (prefError || !preference) {
        throw prefError || new Error("Failed to create reward");
      }

      // Create payment intent
      const { data, error: paymentError } = await createRewardPaymentIntent(incidentId, finalAmount);

      if (paymentError || !data) {
        throw new Error(paymentError?.message || "Failed to create payment");
      }

      // TODO: Initialize Stripe Elements and confirm payment
      // For now, we'll simulate success
      setStep("payment");
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("amount");
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
            className="fixed inset-0 m-auto w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900/95 border border-slate-700/50 rounded-2xl z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 p-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="text-emerald-400" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Add Reward</h2>
                  <p className="text-sm text-slate-400">Step {step === "amount" ? "1" : step === "questions" ? "2" : "3"} of 3</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3"
                >
                  <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-rose-400">{error}</p>
                </motion.div>
              )}

              {step === "amount" && (
                <>
                  {/* Amount Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-slate-300">Select Reward Amount</label>
                    <div className="grid grid-cols-3 gap-3">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handleAmountSelect(preset)}
                          className={`p-4 rounded-xl border transition-all ${
                            !isCustom && amount === preset
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                              : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          <span className="text-lg font-bold">${preset}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount */}
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        placeholder="Custom amount"
                        className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                          isCustom
                            ? "border-emerald-500/50 ring-2 ring-emerald-500/20"
                            : "border-slate-700/50 focus:border-emerald-500/50"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Anonymous Option */}
                  <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">Anonymous Reward</p>
                      <p className="text-xs text-slate-400">Your name won&#39;t be shown to finders</p>
                    </div>
                  </label>

                  {/* Summary */}
                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Reward Amount</span>
                      <span className="text-white font-medium">${summary.rewardAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Platform Fee (10%)</span>
                      <span className="text-white font-medium">${summary.platformFee.toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-700/50 flex justify-between">
                      <span className="text-slate-300 font-medium">Total Charge</span>
                      <span className="text-emerald-400 font-bold">${summary.totalCharge.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToQuestions}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Continue
                  </button>
                </>
              )}

              {step === "questions" && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                      <Shield className="text-blue-400 shrink-0" size={20} />
                      <div>
                        <p className="text-sm font-medium text-white">Verification Questions</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Ask questions only the true owner would know. Finders must answer correctly to claim the reward.
                        </p>
                      </div>
                    </div>

                    {verificationQuestions.map((q, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Question {index + 1}
                          </span>
                          {verificationQuestions.length > 1 && (
                            <button
                              onClick={() => handleRemoveQuestion(index)}
                              className="text-xs text-rose-400 hover:text-rose-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <input
                          value={q.question}
                          onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                          placeholder="e.g., What color is the phone case?"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                        />
                        <input
                          value={q.answer}
                          onChange={(e) => handleQuestionChange(index, "answer", e.target.value)}
                          placeholder="Expected answer"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </motion.div>
                    ))}

                    {verificationQuestions.length < 3 && (
                      <button
                        onClick={handleAddQuestion}
                        className="w-full py-3 border border-dashed border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300 rounded-xl transition-colors text-sm font-medium"
                      >
                        + Add Another Question
                      </button>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep("amount")}
                        className="flex-1 py-4 border border-slate-600 text-slate-300 font-medium rounded-xl hover:bg-slate-800/50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleContinueToPayment}
                        disabled={isLoading}
                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Processing...
                          </>
                        ) : (
                          "Continue to Payment"
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {step === "payment" && (
                <>
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="text-emerald-400" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Reward Created!</h3>
                    <p className="text-slate-400">
                      Your ${summary.rewardAmount.toFixed(2)} reward is now active.
                    </p>
                    <p className="text-sm text-slate-500">
                      Funds will be held in escrow until someone claims your item.
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-6 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
