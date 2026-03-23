"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, HelpCircle, Lock, Loader2, AlertCircle } from "lucide-react";

interface FinderClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answers: string[]) => Promise<{ success: boolean; message: string }>;
  questions: { question: string; hint?: string }[];
  rewardAmount: number;
  itemTitle: string;
}

export function FinderClaimModal({
  isOpen,
  onClose,
  onSubmit,
  questions,
  rewardAmount,
  itemTitle,
}: FinderClaimModalProps) {
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleAnswerChange = (index: number, value: string) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    if (answers.some((a) => !a.trim())) {
      setResult({ success: false, message: "Please answer all questions" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await onSubmit(answers);
      setResult(response);
      if (response.success) {
        setAttempts(0);
      } else {
        setAttempts((prev) => prev + 1);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setResult({ success: false, message: errorMessage });
      setAttempts((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAnswers(Array(questions.length).fill(""));
    setResult(null);
    setAttempts(0);
    setIsLoading(false);
    onClose();
  };

  const maxAttempts = 3;
  const isLocked = attempts >= maxAttempts;

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
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"
                >
                  <Lock className="text-emerald-400" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Claim Reward</h2>
                  <p className="text-sm text-slate-400">Answer verification questions</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {!result?.success ? (
                <>
                  {/* Info Banner */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{itemTitle}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Answer the verification questions set by the owner to claim the{" "}
                          <span className="text-emerald-400 font-bold">${rewardAmount.toFixed(2)}
                          </span>{" "}
                          reward.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attempts Warning */}
                  {attempts > 0 && attempts < maxAttempts && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2"
                    >
                      <AlertCircle className="text-amber-400 shrink-0" size={16} />
                      <p className="text-sm text-amber-400">
                        Incorrect answers. {maxAttempts - attempts} attempts remaining.
                      </p>
                    </motion.div>
                  )}

                  {/* Locked Message */}
                  {isLocked && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
                    >
                      <div className="flex items-center gap-3"
                      >
                        <Lock className="text-rose-400 shrink-0" size={20} />
                        <div>
                          <p className="text-sm font-medium text-white">Claim Locked</p>
                          <p className="text-xs text-slate-400 mt-1">
                            You&#39;ve reached the maximum number of attempts. Please contact the owner directly.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  {!isLocked && (
                    <div className="space-y-4">
                      {questions.map((q, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="space-y-2"
                        >
                          <label className="block text-sm font-medium text-slate-300"
                          >
                            Question {index + 1}
                          </label>
                          <p className="text-sm text-white">{q.question}</p>
                          {q.hint && (
                            <p className="text-xs text-slate-500 italic">Hint: {q.hint}</p>
                          )}
                          <input
                            type="text"
                            value={answers[index]}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            placeholder="Your answer"
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                          />
                        </motion.div>
                      ))}

                      {result && !result.success && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400"
                        >
                          {result.message}
                        </motion.div>
                      )}

                      <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-slate-900 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Verifying...
                          </>
                        ) : (
                          "Submit Answers"
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 space-y-4"
                >
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <CheckCircle className="text-emerald-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Claim Verified!</h3>
                  <p className="text-slate-400">{result.message}</p>
                  <p className="text-sm text-slate-500">
                    The ${rewardAmount.toFixed(2)} reward will be transferred to your account once the owner confirms the return.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-4 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
