"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthBrandPanel from "@/components/AuthBrandPanel";
import BrandMark from "@/components/BrandMark";
import { RepoLinksFooter } from "@/components/RepoLinks";
import { apiFetch, ApiError } from "@/lib/api";

type FormData = {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  creditCard: string;
};

/** Response of POST /mask/ — raw originals plus backend-masked display values. */
type MaskResponse = {
  original_email: string;
  original_date_of_birth: string;
  original_phone_number: string;
  original_address: string;
  original_credit_card: string;
  email: string;
  date_of_birth: string;
  phone_number: string;
  address: string;
  credit_card: string;
};

const EMPTY_FORM: FormData = {
  username: "",
  email: "",
  password: "",
  dateOfBirth: "",
  phone: "",
  address: "",
  creditCard: "",
};

const SAMPLE_INFO = "asb@gmail.com 090-123-1234 400/142 1234-1234-1234-1234 16/12/2005";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<"input" | "review">("input");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [personalInfo, setPersonalInfo] = useState("");

  const [plainForm, setPlainForm] = useState<FormData>(EMPTY_FORM);
  const [maskedForm, setMaskedForm] = useState<FormData>(EMPTY_FORM);
  const [showPlain, setShowPlain] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const prepareReview = async () => {
    setError("");

    if (!username.trim() || !password || !personalInfo.trim()) {
      setError("Please fill in username, password, and your personal details.");
      return;
    }

    setLoading(true);
    try {
      // The backend parses the free-form text and returns BOTH the masked
      // display values and the raw originals it extracted. The masked set is
      // for the preview; the raw set is what actually gets registered.
      const masked = await apiFetch<MaskResponse>("/mask/", {
        method: "POST",
        body: JSON.stringify({ text: personalInfo.trim() }),
      });

      if (!masked || typeof masked !== "object") {
        setError("Could not process personal details with masking service.");
        return;
      }

      setPlainForm({
        username: username.trim(),
        password,
        email: masked.original_email ?? "",
        phone: masked.original_phone_number ?? "",
        dateOfBirth: masked.original_date_of_birth ?? "",
        address: masked.original_address ?? "",
        creditCard: masked.original_credit_card ?? "",
      });

      setMaskedForm({
        username: username.trim(),
        password: "••••••••",
        email: masked.email ?? "",
        phone: masked.phone_number ?? "",
        dateOfBirth: masked.date_of_birth ?? "",
        address: masked.address ?? "",
        creditCard: masked.credit_card ?? "",
      });

      setStep("review");
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "The masking service is unavailable. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    setError("");
    setLoading(true);
    try {
      await apiFetch<{ message: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: plainForm.username,
          password: plainForm.password,
          email: plainForm.email,
          tel: plainForm.phone,
          date_of_birth: plainForm.dateOfBirth,
          address: plainForm.address,
          credit_card: plainForm.creditCard,
        }),
      });
      router.push("/Login");
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : "Service offline. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const displayed = showPlain ? plainForm : maskedForm;
  const safeDisplayed = showPlain ? { ...plainForm, password: "••••••••" } : maskedForm;

  return (
    <div className="flex min-h-screen">
      <AuthBrandPanel />
      <main className="soft-grid flex flex-1 flex-col items-center justify-center px-6 py-10 lg:px-14 min-h-screen overflow-y-auto">
        <section className="enter-up w-full max-w-[34rem] py-8 mt-auto mb-auto">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <Link href="/Login" className="flex items-center gap-2.5">
              <BrandMark size="sm" />
              <span className="text-[0.9375rem] font-bold text-[#0d1f1c]">MaskVault</span>
            </Link>
            <span className="badge badge-green">Protected flow</span>
          </div>

          {step === "input" ? (
            <>
              <p className="eyebrow">Create account</p>
              <h1 className="mt-3 text-[2.6rem] font-bold tracking-[-0.06em] leading-[1.1] text-[#0d1f1c]">
                Register your <br />secure identity.
              </h1>
              <p className="mt-4 text-[0.9375rem] leading-7 text-[#52716a]">
                Enter your account credentials and personal details. The backend masking engine will automatically parse and protect sensitive fields.
              </p>

              <div className="mt-8 space-y-4">
                {/* 1. Username */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d1f1c]">1. Username</label>
                  <div className="field-shell">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. somchai"
                      className="h-[3.25rem] w-full bg-transparent px-4 text-[0.9375rem] text-[#0d1f1c] outline-none placeholder:text-[#a0b5af]"
                    />
                  </div>
                </div>

                {/* 2. Password */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0d1f1c]">2. Password</label>
                  <div className="field-shell">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-[3.25rem] w-full bg-transparent px-4 text-[0.9375rem] text-[#0d1f1c] outline-none placeholder:text-[#a0b5af]"
                    />
                  </div>
                </div>

                {/* 3. Personal Info */}
                <div>
                  <div className="mb-2 flex items-baseline justify-between">
                    <label className="block text-sm font-semibold text-[#0d1f1c]">3. Personal Information</label>
                    <button
                      type="button"
                      onClick={() => setPersonalInfo(SAMPLE_INFO)}
                      className="text-xs font-semibold text-[#147a60] hover:underline"
                    >
                      Use sample format
                    </button>
                  </div>
                  <div className="field-shell p-1.5 shadow-sm">
                    <textarea
                      value={personalInfo}
                      onChange={(e) => setPersonalInfo(e.target.value)}
                      placeholder="e.g. somchai.d@company.com 093-245-7894 25/12/2549 689 ซอยลาดกระบัง 19 1234-5678-9012-3456"
                      className="h-[8rem] w-full resize-none rounded-xl bg-transparent px-3 py-2 text-[0.9375rem] leading-relaxed text-[#0d1f1c] outline-none placeholder:text-[#a0b5af]"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#7a9790]">
                    Free-form text containing email, phone, DOB, address, and credit card (no prefixes like DOB: or Address: needed).
                  </p>
                </div>
              </div>

              {error && <Message text={error} />}
              <button
                type="button"
                onClick={prepareReview}
                disabled={loading}
                className="btn-primary w-full mt-8"
              >
                {loading ? "Processing with Mask Engine…" : "Continue to protected review"}
              </button>
              <div className="mt-8 text-center text-[0.9375rem] text-[#52716a]">
                Already have an account? <Link href="/Login" className="font-semibold text-[#147a60] hover:underline">Sign in</Link>
              </div>
              <div className="text-center">
                <RepoLinksFooter />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Protected review</p>
                  <h1 className="mt-3 text-[2.6rem] font-bold tracking-[-0.06em] leading-[1.1] text-[#0d1f1c]">
                    Confirm details.
                  </h1>
                </div>
                <span className={`badge shrink-0 mt-3 ${showPlain ? "badge-neutral" : "badge-green"}`}>
                  {showPlain ? "Unmasked view" : "Masked view"}
                </span>
              </div>
              <p className="mt-4 text-[0.9375rem] leading-7 text-[#52716a]">
                Sensitive values were parsed and masked via backend Regex engine. Verify before creating your account.
              </p>

              <div className="mt-8 flex items-center justify-between rounded-t-2xl border border-b-0 border-[#e0ebe5] bg-[#f5f9f7] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e2f5ec] text-[#083a31]">
                    <ShieldIcon />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0d1f1c]">Privacy preview</p>
                    <p className="text-xs text-[#7a9790]">Parsed by Regex masking engine</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlain((v) => !v)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#083a31] shadow-sm ring-1 ring-inset ring-[#e0ebe5] transition hover:bg-[#f5f9f7]"
                >
                  {showPlain ? "Mask values" : "Show values"}
                </button>
              </div>

              <dl className="card rounded-t-none divide-y divide-[#e0ebe5]">
                <ReviewRow label="Username" value={displayed.username} />
                <ReviewRow label="Email" value={displayed.email} mono />
                <ReviewRow label="Password" value={safeDisplayed.password} />
                <ReviewRow label="Date of birth" value={displayed.dateOfBirth} />
                <ReviewRow label="Phone" value={displayed.phone} mono />
                <ReviewRow label="Address" value={displayed.address} />
                <ReviewRow label="Card" value={displayed.creditCard} mono />
              </dl>

              {error && <Message text={error} />}

              <div className="mt-8 grid gap-3 lg:grid-cols-2">
                <button type="button" onClick={register} disabled={loading} className="btn-primary">
                  {loading ? "Creating…" : "Create account"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("input");
                    setShowPlain(false);
                    setError("");
                  }}
                  className="btn-secondary"
                >
                  Edit input
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function ReviewRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid gap-1 px-6 py-4 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#7a9790]">{label}</dt>
      <dd className={`truncate text-sm text-[#0d1f1c] ${mono ? "font-mono" : ""}`}>{value || "—"}</dd>
    </div>
  );
}

function Message({ text }: { text: string }) {
  return (
    <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#c0392b]">
      {text}
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5 19 6.4v4.7c0 4.4-2.9 8.2-7 9.4-4.1-1.2-7-5-7-9.4V6.4l7-2.9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m8.9 12 2.1 2.1 4.2-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
