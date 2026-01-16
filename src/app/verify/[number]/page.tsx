"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";

type VerificationResult = {
  verified: boolean;
  studentName?: string;
  message?: string;
  certificate?: {
    number: string;
    language: string;
    level: string;
    issuedDate: string;
  };
};

const CEFR_LABELS: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper Intermediate",
  C1: "Advanced",
  C2: "Proficiency",
};

export default function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = use(params);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/verify/${encodeURIComponent(number)}`);
        const data = await res.json();
        setResult(data);
      } catch (err) {
        setResult({
          verified: false,
          message: "Failed to verify certificate. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [number]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-white">JB Linguistics</h1>
          </Link>
          <p className="text-slate-400 mt-2">Certificate Verification</p>
        </div>

        {/* Verification Card */}
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-slate-400">Verifying certificate...</div>
            </div>
          ) : result?.verified ? (
            <div className="text-center">
              {/* Success */}
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Certificate Verified</h2>
              <p className="text-emerald-400 mb-6">This is an authentic JB Linguistics certificate.</p>

              <div className="bg-slate-700/50 rounded-lg p-6 text-left space-y-4">
                <div>
                  <div className="text-sm text-slate-400">Recipient</div>
                  <div className="text-lg text-white font-semibold">{result.studentName}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-400">Achievement</div>
                  <div className="text-lg text-white">
                    {result.certificate?.level} - {CEFR_LABELS[result.certificate?.level || ""] || ""}
                  </div>
                  <div className="text-white">{result.certificate?.language}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-400">Certificate Number</div>
                  <div className="text-white font-mono">{result.certificate?.number}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-400">Issue Date</div>
                  <div className="text-white">
                    {result.certificate?.issuedDate
                      ? new Date(result.certificate.issuedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {/* Not Found or Revoked */}
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-red-400 mb-6">
                {result?.message || "This certificate could not be verified."}
              </p>

              {result?.certificate && (
                <div className="bg-slate-700/50 rounded-lg p-6 text-left space-y-4 opacity-75">
                  <div>
                    <div className="text-sm text-slate-400">Certificate Number</div>
                    <div className="text-white font-mono">{result.certificate.number}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Status</div>
                    <div className="text-red-400">Revoked</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Questions about this certificate?{" "}
            <Link href="/contact" className="text-teal-400 hover:text-teal-300">
              Contact JB Linguistics
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
