"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Stepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { OtpInput } from "@/components/onboarding/otp-input";
import { TierSelector } from "@/components/onboarding/tier-selector";
import { ReferralLookup } from "@/components/onboarding/referral-lookup";
import { FamilyDetailsForm, type FamilyData } from "@/components/onboarding/family-details-form";
import { PaymentMethods } from "@/components/shared/payment-methods";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_TIERS } from "@/config/tenant";
import type { MembershipTier } from "@/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  { label: "Phone" },
  { label: "Email" },
  { label: "Details" },
  { label: "Tier" },
  { label: "Referral" },
  { label: "Payment" },
  { label: "Done" },
];

const COUNTRY_CODES = [
  { code: "+65", label: "SG (+65)" },
  { code: "+91", label: "IN (+91)" },
  { code: "+1", label: "US (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+60", label: "MY (+60)" },
];

const INTEREST_OPTIONS = [
  "Cultural Events",
  "Sports",
  "Music",
  "Dance",
  "Movies",
  "Volunteering",
  "Religious",
  "Travel",
];

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"];
const RESIDENTIAL_STATUS_OPTIONS = ["Citizen", "Permanent Resident", "Employment Pass", "Work Permit", "Dependent Pass", "Student Pass", "Long Term Visit Pass", "Other"];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PersonalDetails {
  name: string;
  dob: string;
  gender: string;
  nationality: string;
  postalCode: string;
  residentialStatus: string;
  interests: string[];
  familyMembers: FamilyData | null;
}

interface ReferrerInfo {
  name: string;
  memberNumber: string;
  memberSince: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function JoinWizard() {
  const { toast } = useToast();

  // Global state
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1: Phone OTP
  const [countryCode, setCountryCode] = useState("+65");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  // Step 2: Email
  const [email, setEmail] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  // Step 3: Details
  const [details, setDetails] = useState<PersonalDetails>({
    name: "",
    dob: "",
    gender: "",
    nationality: "",
    postalCode: "",
    residentialStatus: "",
    interests: [],
    familyMembers: null,
  });
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Step 4: Tier
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [tierLoading, setTierLoading] = useState(false);

  // Step 5: Referral
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null);

  // Step 6: Payment
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "paynow" | undefined>();
  const [pdpaConsent, setPdpaConsent] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Step 7: Result
  const [autoApproved, setAutoApproved] = useState(false);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const markCompleted = useCallback(
    (step: number) => {
      setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
    },
    [],
  );

  const startResendCooldown = useCallback(() => {
    setOtpResendCooldown(60);
    const interval = setInterval(() => {
      setOtpResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ---------------------------------------------------------------------------
  // Step 1: Send OTP & Verify
  // ---------------------------------------------------------------------------

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      toast({ title: "Phone number is required", variant: "error" });
      return;
    }

    setOtpLoading(true);
    try {
      // Create or resume application
      const startRes = await fetch("/api/v1/onboarding/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), countryCode }),
      });
      const startData = await startRes.json();

      if (!startRes.ok) {
        toast({ title: startData.message || "Failed to start application", variant: "error" });
        return;
      }

      setApplicationId(startData.applicationId);

      // Send OTP
      const otpRes = await fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), countryCode }),
      });

      if (!otpRes.ok) {
        const otpData = await otpRes.json();
        toast({ title: otpData.message || "Failed to send OTP", variant: "error" });
        return;
      }

      setOtpSent(true);
      startResendCooldown();
      toast({ title: "OTP sent to your phone", variant: "success" });
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "error" });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    if (!applicationId) return;

    setOtpLoading(true);
    try {
      const res = await fetch(`/api/v1/onboarding/${applicationId}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.message || "Invalid OTP", variant: "error" });
        return;
      }

      markCompleted(0);
      setCurrentStep(1);
      toast({ title: "Phone verified", variant: "success" });
    } catch {
      toast({ title: "Verification failed", variant: "error" });
    } finally {
      setOtpLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 2: Email Verification
  // ---------------------------------------------------------------------------

  const handleSendEmailCode = async () => {
    if (!email.trim()) {
      toast({ title: "Email is required", variant: "error" });
      return;
    }

    setEmailLoading(true);
    try {
      // For prototype: just mark as sent (no actual email service call needed)
      setEmailCodeSent(true);
      toast({ title: "Verification code sent to your email", variant: "success" });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmail = async (code: string) => {
    if (!applicationId) return;

    setEmailLoading(true);
    try {
      const res = await fetch(`/api/v1/onboarding/${applicationId}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.message || "Invalid code", variant: "error" });
        return;
      }

      markCompleted(1);
      setCurrentStep(2);
      toast({ title: "Email verified", variant: "success" });
    } catch {
      toast({ title: "Verification failed", variant: "error" });
    } finally {
      setEmailLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 3: Personal Details
  // ---------------------------------------------------------------------------

  const handleDetailsSubmit = async () => {
    if (!applicationId) return;
    if (!details.name || !details.dob || !details.gender || !details.nationality || !details.postalCode) {
      toast({ title: "Please fill in all required fields", variant: "error" });
      return;
    }

    setDetailsLoading(true);
    try {
      const res = await fetch(`/api/v1/onboarding/${applicationId}/details`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name,
          dob: details.dob,
          gender: details.gender,
          nationality: details.nationality,
          postalCode: details.postalCode,
          residentialStatus: details.residentialStatus,
          interests: details.interests,
          familyMembers: details.familyMembers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.message || "Failed to save details", variant: "error" });
        return;
      }

      markCompleted(2);
      setCurrentStep(3);
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setDetailsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 4: Tier Selection
  // ---------------------------------------------------------------------------

  const handleTierConfirm = async () => {
    if (!applicationId || !selectedTier) {
      toast({ title: "Please select a membership tier", variant: "error" });
      return;
    }

    setTierLoading(true);
    try {
      const res = await fetch(`/api/v1/onboarding/${applicationId}/tier`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tierId: selectedTier }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast({ title: data.message || "Failed to select tier", variant: "error" });
        return;
      }

      markCompleted(3);
      setCurrentStep(4);
    } catch {
      toast({ title: "Something went wrong", variant: "error" });
    } finally {
      setTierLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 5: Referral
  // ---------------------------------------------------------------------------

  const handleReferralFound = (ref: ReferrerInfo) => {
    setReferrer(ref);
    markCompleted(4);
  };

  const handleReferralSkip = () => {
    markCompleted(4);
    setCurrentStep(5);
  };

  const handleReferralNext = () => {
    if (referrer) {
      setCurrentStep(5);
    }
  };

  // ---------------------------------------------------------------------------
  // Step 6: Payment & Submit
  // ---------------------------------------------------------------------------

  const getSelectedTierData = (): MembershipTier | undefined => {
    return DEFAULT_TIERS.find((t) => t.id === selectedTier);
  };

  const handlePayAndSubmit = async () => {
    if (!applicationId) return;
    if (!paymentMethod) {
      toast({ title: "Please select a payment method", variant: "error" });
      return;
    }
    if (!pdpaConsent) {
      toast({ title: "Please agree to the PDPA consent", variant: "error" });
      return;
    }

    setSubmitLoading(true);
    try {
      // In production: process payment first via PayPal/PayNow API
      // For prototype: skip payment processing
      const paymentId = `pay_proto_${Date.now()}`;

      const res = await fetch(`/api/v1/onboarding/${applicationId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, pdpaConsent: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast({ title: data.message || "Failed to submit", variant: "error" });
        return;
      }

      setAutoApproved(data.autoApproved);
      markCompleted(5);
      setCurrentStep(6);
      toast({
        title: data.autoApproved ? "Application Approved!" : "Application Submitted!",
        variant: "success",
      });
    } catch {
      toast({ title: "Submission failed. Please try again.", variant: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render step content
  // ---------------------------------------------------------------------------

  const renderStep = () => {
    switch (currentStep) {
      // ---- Step 1: Phone OTP ------------------------------------------------
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Verify Your Phone</h2>
              <p className="mt-1 text-sm text-gray-500">
                We will send a 6-digit code to verify your phone number
              </p>
            </div>

            {!otpSent ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="w-32">
                    <label htmlFor="country-code" className="mb-1 block text-sm font-medium text-gray-700">
                      Code
                    </label>
                    <select
                      id="country-code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {COUNTRY_CODES.map((cc) => (
                        <option key={cc.code} value={cc.code}>
                          {cc.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="9123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleSendOtp}
                  loading={otpLoading}
                >
                  Send OTP
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-600">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium">{countryCode} {phone}</span>
                </p>

                <OtpInput onComplete={handleVerifyOtp} disabled={otpLoading} />

                <div className="text-center">
                  {otpResendCooldown > 0 ? (
                    <p className="text-sm text-gray-400">
                      Resend code in {otpResendCooldown}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <p className="text-center text-xs text-gray-400">
                  For prototype: use code <span className="font-mono font-medium">123456</span>
                </p>
              </div>
            )}
          </div>
        );

      // ---- Step 2: Email Verification ----------------------------------------
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter your email address and verify with a code
              </p>
            </div>

            {!emailCodeSent ? (
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleSendEmailCode}
                  loading={emailLoading}
                >
                  Send Verification Code
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-600">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-medium">{email}</span>
                </p>

                <OtpInput onComplete={handleVerifyEmail} disabled={emailLoading} />

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setEmailCodeSent(false)}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Change email address
                  </button>
                </div>

                <p className="text-center text-xs text-gray-400">
                  For prototype: use code <span className="font-mono font-medium">123456</span>
                </p>
              </div>
            )}

            {/* Back button */}
            <div className="flex justify-start">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(0)}
              >
                Back
              </Button>
            </div>
          </div>
        );

      // ---- Step 3: Personal Details ------------------------------------------
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                Tell us about yourself to complete your membership application
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Name *"
                placeholder="Enter your full name"
                value={details.name}
                onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
                autoComplete="name"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Date of Birth *"
                  type="date"
                  value={details.dob}
                  onChange={(e) => setDetails((d) => ({ ...d, dob: e.target.value }))}
                />
                <div>
                  <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    value={details.gender}
                    onChange={(e) => setDetails((d) => ({ ...d, gender: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">Select gender</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nationality *"
                  placeholder="e.g. Indian, Singaporean"
                  value={details.nationality}
                  onChange={(e) => setDetails((d) => ({ ...d, nationality: e.target.value }))}
                />
                <Input
                  label="Postal Code *"
                  placeholder="e.g. 123456"
                  value={details.postalCode}
                  onChange={(e) => setDetails((d) => ({ ...d, postalCode: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="residential-status" className="mb-1 block text-sm font-medium text-gray-700">
                  Residential Status
                </label>
                <select
                  id="residential-status"
                  value={details.residentialStatus}
                  onChange={(e) => setDetails((d) => ({ ...d, residentialStatus: e.target.value }))}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Select status</option>
                  {RESIDENTIAL_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Interests */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => {
                    const isSelected = details.interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() =>
                          setDetails((d) => ({
                            ...d,
                            interests: isSelected
                              ? d.interests.filter((i) => i !== interest)
                              : [...d.interests, interest],
                          }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Family Details */}
              <FamilyDetailsForm
                onChange={(data) => setDetails((d) => ({ ...d, familyMembers: data }))}
                initialData={details.familyMembers ?? undefined}
              />
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleDetailsSubmit}
                loading={detailsLoading}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      // ---- Step 4: Membership Tier -------------------------------------------
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Choose Your Membership</h2>
              <p className="mt-1 text-sm text-gray-500">
                Select the plan that best fits your needs
              </p>
            </div>

            <TierSelector
              tiers={DEFAULT_TIERS}
              selected={selectedTier}
              onSelect={setSelectedTier}
            />

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handleTierConfirm}
                loading={tierLoading}
                disabled={!selectedTier}
              >
                Continue
              </Button>
            </div>
          </div>
        );

      // ---- Step 5: Referral --------------------------------------------------
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Referral</h2>
              <p className="mt-1 text-sm text-gray-500">
                Were you referred by an existing member? This is optional.
              </p>
            </div>

            {applicationId && (
              <ReferralLookup
                applicationId={applicationId}
                onFound={handleReferralFound}
                onSkip={handleReferralSkip}
              />
            )}

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              {referrer && (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  onClick={handleReferralNext}
                >
                  Continue
                </Button>
              )}
            </div>
          </div>
        );

      // ---- Step 6: Payment & Submit ------------------------------------------
      case 5: {
        const tierData = getSelectedTierData();
        const tierPrice = tierData?.price ?? 0;
        const serviceCharge = 0.5;
        const total = tierPrice + serviceCharge;

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Payment</h2>
              <p className="mt-1 text-sm text-gray-500">
                Complete your payment to submit the application
              </p>
            </div>

            {/* Payment summary */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="text-sm font-medium text-gray-700">Order Summary</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{tierData?.name ?? "Membership"}</span>
                  <span className="font-medium">${tierPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service charge</span>
                  <span className="font-medium">${serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-semibold text-gray-900">SGD ${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">Payment Method</h3>
              <PaymentMethods selected={paymentMethod} onSelect={setPaymentMethod} />
            </div>

            {/* PDPA consent */}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={pdpaConsent}
                onChange={(e) => setPdpaConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">
                I agree to the{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-500">
                  Personal Data Protection Act (PDPA) Policy
                </a>{" "}
                and consent to the collection and use of my personal data for membership purposes.
              </span>
            </label>

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(4)}>
                Back
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handlePayAndSubmit}
                loading={submitLoading}
                disabled={!paymentMethod || !pdpaConsent}
              >
                Pay & Submit (SGD ${total.toFixed(2)})
              </Button>
            </div>
          </div>
        );
      }

      // ---- Step 7: Success ---------------------------------------------------
      case 6:
        return (
          <div className="space-y-8 text-center">
            {/* Success animation */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {autoApproved ? "Welcome Aboard!" : "Application Submitted!"}
              </h2>
              <p className="mt-2 text-gray-500">
                {autoApproved
                  ? "Your membership has been approved. You can now sign in and explore."
                  : "Your application is under review. We will notify you by email once it has been processed."}
              </p>
            </div>

            {/* Status tracker */}
            <div className="mx-auto max-w-xs space-y-3 text-left">
              {[
                { label: "Phone Verified", done: true },
                { label: "Email Verified", done: true },
                { label: "Personal Details", done: true },
                { label: "Tier Selected", done: true },
                { label: "Referral", done: true },
                { label: "Payment Completed", done: true },
                {
                  label: autoApproved ? "Approved" : "Under Review",
                  done: autoApproved,
                  current: !autoApproved,
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  {item.done ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : item.current ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-yellow-400 bg-yellow-50">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                  )}
                  <span
                    className={`text-sm ${
                      item.done
                        ? "text-gray-900"
                        : item.current
                          ? "font-medium text-yellow-700"
                          : "text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {autoApproved && (
                <Link href="/login">
                  <Button variant="primary" size="lg">
                    Sign In Now
                  </Button>
                </Link>
              )}
              <Link href="/">
                <Button variant="secondary" size="lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Main layout
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
            CH
          </div>
          <span className="text-lg font-bold text-gray-900">CommunityHub</span>
        </Link>
      </div>

      {/* Stepper (hidden on success step) */}
      {currentStep < 6 && (
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          className="mb-8"
        />
      )}

      {/* Step content */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-gray-400">
        Already a member?{" "}
        <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </div>
  );
}
