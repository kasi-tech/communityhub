"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";
import { PipelineBuilder } from "@/components/admin/pipeline-builder";
import { useToast } from "@/components/ui/toast";
import type { TenantBranding, FeatureFlags, OnboardingStep, MembershipTier } from "@/types";

type ConfigTab =
  | "branding"
  | "tiers"
  | "payments"
  | "onboarding"
  | "features"
  | "emails"
  | "language";

const TABS: { id: ConfigTab; label: string }[] = [
  { id: "branding", label: "Branding" },
  { id: "tiers", label: "Tiers" },
  { id: "payments", label: "Payments" },
  { id: "onboarding", label: "Onboarding Pipeline" },
  { id: "features", label: "Feature Flags" },
  { id: "emails", label: "Email Templates" },
  { id: "language", label: "Language" },
];

const FEATURE_FLAG_LABELS: Record<keyof FeatureFlags, string> = {
  aiChatbot: "AI Chatbot",
  smartRecommendations: "Smart Recommendations",
  aiNewsletter: "AI Newsletter",
  photoGallery: "Photo Gallery",
  donations: "Donations",
  volunteerManagement: "Volunteer Management",
  eventCheckin: "Event Check-in",
  pwa: "Progressive Web App",
};

export default function AdminConfigPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<ConfigTab>("branding");
  const [saving, setSaving] = useState(false);

  // Branding state
  const [branding, setBranding] = useState<TenantBranding>({
    primaryColor: "#6366F1",
    secondaryColor: "#0EA5E9",
    logoUrl: "",
    logoDarkUrl: "",
    favicon: "",
    tagline: "",
    customCss: "",
  });
  const [orgName, setOrgName] = useState("");

  // Features state
  const [features, setFeatures] = useState<FeatureFlags>({
    aiChatbot: true,
    smartRecommendations: true,
    aiNewsletter: true,
    photoGallery: true,
    donations: true,
    volunteerManagement: true,
    eventCheckin: true,
    pwa: true,
  });

  // Onboarding state
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [autoApproveThreshold, setAutoApproveThreshold] = useState(30);

  // Tiers state
  const [tiers, setTiers] = useState<MembershipTier[]>([]);

  // Payment state
  const [payments, setPayments] = useState({
    paypalEnabled: false,
    paypalClientId: "",
    paynowEnabled: false,
    paynowUen: "",
    serviceCharge: 0,
  });

  // Language state
  const [language, setLanguage] = useState({
    primary: "en",
    secondary: "",
    chatbotLanguages: ["en"],
  });

  // Load config
  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/config");
      if (!res.ok) return;
      const config = await res.json();
      if (config.branding) setBranding(config.branding);
      if (config.name) setOrgName(config.name);
      if (config.features) setFeatures(config.features);
      if (config.onboardingSteps) setSteps(config.onboardingSteps);
      if (config.tiers) setTiers(config.tiers);
    } catch {
      // Use defaults
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const saveBranding = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/config/branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branding),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Saved", message: "Branding updated successfully", variant: "success" });
    } catch {
      toast({ title: "Error", message: "Failed to save branding", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const saveFeatures = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/config/features", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(features),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Saved", message: "Feature flags updated", variant: "success" });
    } catch {
      toast({ title: "Error", message: "Failed to save features", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const saveOnboarding = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/config/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast({ title: "Saved", message: "Onboarding pipeline updated", variant: "success" });
    } catch {
      toast({ title: "Error", message: "Failed to save onboarding config", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuration</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your community settings</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-4 overflow-x-auto" aria-label="Configuration tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
              aria-selected={tab === t.id}
              role="tab"
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {/* BRANDING */}
        {tab === "branding" && (
          <Card>
            <CardContent className="space-y-4">
              <Input
                label="Organization Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <Input
                label="Tagline"
                value={branding.tagline}
                onChange={(e) => setBranding((b) => ({ ...b, tagline: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primary-color" className="mb-1 block text-sm font-medium text-gray-700">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="primary-color"
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding((b) => ({ ...b, primaryColor: e.target.value }))}
                      className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                    />
                    <span className="text-sm text-gray-600">{branding.primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="secondary-color" className="mb-1 block text-sm font-medium text-gray-700">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="secondary-color"
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(e) => setBranding((b) => ({ ...b, secondaryColor: e.target.value }))}
                      className="h-10 w-10 cursor-pointer rounded border border-gray-300"
                    />
                    <span className="text-sm text-gray-600">{branding.secondaryColor}</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700">Logo Upload</p>
                <ImageUpload maxFiles={1} />
              </div>
              <Button loading={saving} onClick={saveBranding}>
                Save Branding
              </Button>
            </CardContent>
          </Card>
        )}

        {/* TIERS */}
        {tab === "tiers" && (
          <Card>
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Membership Tiers</h2>
              <Button
                size="sm"
                onClick={() =>
                  toast({
                    title: "Coming soon",
                    message: "Adding new tiers will be available in a future update",
                    variant: "info",
                  })
                }
              >
                + Add Tier
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Membership tiers">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Tier Name</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Family</th>
                    <th className="px-6 py-3">Benefits</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tiers.map((tier) => (
                    <tr key={tier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{tier.name}</td>
                      <td className="px-6 py-3 text-gray-700">${tier.price}</td>
                      <td className="px-6 py-3 text-gray-700">
                        {tier.isLifetime ? "Lifetime" : `${tier.durationMonths} months`}
                      </td>
                      <td className="px-6 py-3 text-gray-700">{tier.isFamily ? "Yes" : "No"}</td>
                      <td className="px-6 py-3 text-gray-700">
                        {tier.benefits.length} benefits
                      </td>
                      <td className="px-6 py-3">
                        <button
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                          onClick={() =>
                            toast({
                              title: "Coming soon",
                              message: "Tier editing will be available in a future update",
                              variant: "info",
                            })
                          }
                          aria-label={`Edit ${tier.name}`}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* PAYMENTS */}
        {tab === "payments" && (
          <Card>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <h3 className="font-medium text-gray-900">PayPal</h3>
                  <p className="text-sm text-gray-500">Accept payments via PayPal</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={payments.paypalEnabled}
                  aria-label="Toggle PayPal"
                  onClick={() => setPayments((p) => ({ ...p, paypalEnabled: !p.paypalEnabled }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                    payments.paypalEnabled ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${payments.paypalEnabled ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              {payments.paypalEnabled && (
                <Input
                  label="PayPal Client ID"
                  value={payments.paypalClientId}
                  onChange={(e) => setPayments((p) => ({ ...p, paypalClientId: e.target.value }))}
                  placeholder="Enter PayPal client ID..."
                />
              )}

              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <h3 className="font-medium text-gray-900">PayNow</h3>
                  <p className="text-sm text-gray-500">Accept payments via PayNow QR</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={payments.paynowEnabled}
                  aria-label="Toggle PayNow"
                  onClick={() => setPayments((p) => ({ ...p, paynowEnabled: !p.paynowEnabled }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                    payments.paynowEnabled ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${payments.paynowEnabled ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              {payments.paynowEnabled && (
                <Input
                  label="PayNow UEN"
                  value={payments.paynowUen}
                  onChange={(e) => setPayments((p) => ({ ...p, paynowUen: e.target.value }))}
                  placeholder="Enter UEN..."
                />
              )}

              <Input
                label="Service Charge (%)"
                type="number"
                step="0.1"
                value={String(payments.serviceCharge)}
                onChange={(e) => setPayments((p) => ({ ...p, serviceCharge: Number(e.target.value) }))}
              />

              <Button
                loading={saving}
                onClick={() =>
                  toast({
                    title: "Coming soon",
                    message: "Payment configuration saving will be available in a future update",
                    variant: "info",
                  })
                }
              >
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ONBOARDING PIPELINE */}
        {tab === "onboarding" && (
          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Onboarding Pipeline</h2>
              <p className="text-sm text-gray-500">
                Configure the steps new members go through during registration.
                Drag steps to reorder. Some steps are always enabled.
              </p>
              <PipelineBuilder
                steps={steps}
                onChange={setSteps}
                autoApproveThreshold={autoApproveThreshold}
                onThresholdChange={setAutoApproveThreshold}
              />
              <Button loading={saving} onClick={saveOnboarding}>
                Save Pipeline
              </Button>
            </CardContent>
          </Card>
        )}

        {/* FEATURE FLAGS */}
        {tab === "features" && (
          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Feature Flags</h2>
              <p className="text-sm text-gray-500">
                Enable or disable features for your community.
              </p>
              <div className="space-y-3">
                {(Object.keys(FEATURE_FLAG_LABELS) as (keyof FeatureFlags)[]).map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {FEATURE_FLAG_LABELS[key]}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={features[key]}
                      aria-label={`Toggle ${FEATURE_FLAG_LABELS[key]}`}
                      onClick={() =>
                        setFeatures((f) => ({ ...f, [key]: !f[key] }))
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                        features[key] ? "bg-indigo-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          features[key] ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <Button loading={saving} onClick={saveFeatures}>
                Save Feature Flags
              </Button>
            </CardContent>
          </Card>
        )}

        {/* EMAIL TEMPLATES */}
        {tab === "emails" && (
          <Card>
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Email templates">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-3">Template Name</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Last Modified</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: "Welcome Email", subject: "Welcome to the Community!", modified: "2 days ago" },
                    { name: "Application Approved", subject: "Your Membership Has Been Approved!", modified: "1 week ago" },
                    { name: "Application Rejected", subject: "Membership Application Update", modified: "1 week ago" },
                    { name: "Event Reminder", subject: "Upcoming Event Reminder", modified: "2 weeks ago" },
                    { name: "Payment Receipt", subject: "Payment Receipt", modified: "1 month ago" },
                    { name: "Membership Renewal", subject: "Time to Renew Your Membership", modified: "1 month ago" },
                  ].map((template) => (
                    <tr key={template.name} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-gray-900">{template.name}</td>
                      <td className="px-6 py-3 text-gray-700">{template.subject}</td>
                      <td className="px-6 py-3 text-gray-500">{template.modified}</td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            onClick={() =>
                              toast({
                                title: "Coming soon",
                                message: "Template editing will be available in a future update",
                                variant: "info",
                              })
                            }
                            aria-label={`Edit ${template.name}`}
                          >
                            Edit
                          </button>
                          <button
                            className="text-sm font-medium text-gray-500 hover:text-gray-700"
                            onClick={() =>
                              toast({
                                title: "Coming soon",
                                message: "Template preview will be available in a future update",
                                variant: "info",
                              })
                            }
                            aria-label={`Preview ${template.name}`}
                          >
                            Preview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* LANGUAGE */}
        {tab === "language" && (
          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Language Settings</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primary-lang" className="mb-1 block text-sm font-medium text-gray-700">
                    Primary Language
                  </label>
                  <select
                    id="primary-lang"
                    value={language.primary}
                    onChange={(e) => setLanguage((l) => ({ ...l, primary: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="en">English</option>
                    <option value="te">Telugu</option>
                    <option value="ta">Tamil</option>
                    <option value="hi">Hindi</option>
                    <option value="zh">Chinese (Simplified)</option>
                    <option value="ms">Malay</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="secondary-lang" className="mb-1 block text-sm font-medium text-gray-700">
                    Secondary Language
                  </label>
                  <select
                    id="secondary-lang"
                    value={language.secondary}
                    onChange={(e) => setLanguage((l) => ({ ...l, secondary: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  >
                    <option value="">None</option>
                    <option value="en">English</option>
                    <option value="te">Telugu</option>
                    <option value="ta">Tamil</option>
                    <option value="hi">Hindi</option>
                    <option value="zh">Chinese (Simplified)</option>
                    <option value="ms">Malay</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">AI Chatbot Languages</p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { code: "en", label: "English" },
                    { code: "te", label: "Telugu" },
                    { code: "ta", label: "Tamil" },
                    { code: "hi", label: "Hindi" },
                    { code: "zh", label: "Chinese" },
                    { code: "ms", label: "Malay" },
                  ].map((lang) => (
                    <label key={lang.code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={language.chatbotLanguages.includes(lang.code)}
                        onChange={(e) => {
                          setLanguage((l) => ({
                            ...l,
                            chatbotLanguages: e.target.checked
                              ? [...l.chatbotLanguages, lang.code]
                              : l.chatbotLanguages.filter((c) => c !== lang.code),
                          }));
                        }}
                        className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-300"
                      />
                      {lang.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">UI String Overrides</p>
                <p className="text-xs text-gray-500">
                  Custom overrides for UI text will be available in a future update.
                  This allows you to customize button labels, page titles, and system messages.
                </p>
              </div>

              <Button
                loading={saving}
                onClick={() =>
                  toast({
                    title: "Coming soon",
                    message: "Language configuration saving will be available in a future update",
                    variant: "info",
                  })
                }
              >
                Save Language Settings
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
