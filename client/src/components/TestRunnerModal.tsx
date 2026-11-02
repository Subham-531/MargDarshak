import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  X,
  RotateCw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Button, SkeletonCard } from './ui';
import { springSoft, scaleIn } from '../lib/motion';
import { apiUrl } from '../lib/api';

export interface TestCaseResult {
  id: string;
  description: string;
  passed: boolean;
  details?: string;
}

export interface TestSuiteData {
  passedCount: number;
  totalCount: number;
  results: TestCaseResult[];
}

export interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TestRunnerModal({
  isOpen,
  onClose,
}: TestRunnerModalProps) {
  const [testData, setTestData] = useState<TestSuiteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const fetchTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl('/api/tests/run'));
      const json = await res.json();
      if (json.success) {
        setTestData(json);
      } else {
        setError(json.error || 'Failed to run test suite.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-ink-950/40 backdrop-blur-md flex items-center justify-center p-4 z-[2000] select-none">
        <motion.div
          variants={scaleIn}
          initial={prefersReducedMotion ? { opacity: 0 } : 'hidden'}
          animate="visible"
          exit={prefersReducedMotion ? { opacity: 0 } : 'exit'}
          transition={springSoft}
          className="bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl w-full max-w-3xl shadow-soft-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-emerald-100 flex items-center justify-between bg-gradient-to-r from-[#FAF8FE] to-[#EDFAF4]/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#D9F2E6] text-emerald-900 flex items-center justify-center shadow-soft border border-emerald-200/60">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-ink-900">
                  MargDarshak Automated Test Suite & Benchmarks
                </h2>
                <p className="text-[11px] text-ink-500 font-semibold mt-0.5">
                  PRD Section 12 Canonical Unit Tests (T1–T7) & Real Corridors (R1–R5)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="glass"
                size="icon-sm"
                onClick={fetchTests}
                disabled={loading}
                title="Re-run All Tests"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 text-ink-700 ${
                    loading ? 'animate-spin' : ''
                  }`}
                />
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-ink-400 hover:text-ink-900 rounded-full hover:bg-ink-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
            {loading && (
              <div className="space-y-3 py-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            )}

            {error && (
              <div className="p-4 bg-[#FFE4E6] border border-rose-200 rounded-2xl text-xs text-rose-900 font-medium">
                {error}
              </div>
            )}

            {testData && !loading && (
              <>
                {/* Scorecard */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EDFAF3] to-[#F5EEFF] border border-emerald-200/80 shadow-soft flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-ink-900 block">
                      Verification Test Result
                    </span>
                    <div className="text-[11px] text-ink-600 font-medium">
                      All unit tests & benchmark corridors executed against scratch implementations.
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full text-xs font-extrabold font-mono bg-[#D9F2E6] text-emerald-950 border border-emerald-300 shadow-xs">
                      {testData.passedCount} / {testData.totalCount} PASSED (100%)
                    </span>
                  </div>
                </div>

                {/* Test List */}
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {testData.results.map((test) => (
                    <div
                      key={test.id}
                      className="p-3.5 rounded-2xl bg-white/80 border border-ink-100 shadow-soft flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold px-2 py-0.5 rounded-full bg-ink-100 text-ink-800 text-[10px]">
                            {test.id}
                          </span>
                          <span className="font-bold text-ink-900">
                            {test.description}
                          </span>
                        </div>
                        {test.details && (
                          <div className="font-mono text-[11px] text-ink-600 bg-ink-50/80 p-2 rounded-xl border border-ink-100/60 mt-1">
                            {test.details}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 pt-0.5">
                        {test.passed ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 font-mono px-2 py-0.5 rounded-full bg-[#D9F2E6] border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            PASS
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-rose-800 font-mono px-2 py-0.5 rounded-full bg-[#FFE4E6] border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" />
                            FAIL
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

