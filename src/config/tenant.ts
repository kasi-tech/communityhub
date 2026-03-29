import type { TenantConfig, MembershipTier } from "@/types";

/**
 * Default tenant configuration for STS (Singapore Telugu Samajam).
 * In production this is loaded from the database; this constant serves as
 * the seed / fallback for local development.
 */
export const DEFAULT_TENANT: TenantConfig = {
  id: "sts-default",
  name: "Singapore Telugu Samajam",
  slug: "sts",
  branding: {
    primaryColor: "#6366F1",
    secondaryColor: "#0EA5E9",
    logoUrl: "/images/logo.png",
    logoDarkUrl: "/images/logo-dark.png",
    favicon: "/favicon.ico",
    tagline: "Uniting the Telugu community in Singapore",
    customCss: "",
  },
  features: {
    aiChatbot: true,
    smartRecommendations: true,
    aiNewsletter: true,
    photoGallery: true,
    donations: true,
    volunteerManagement: true,
    eventCheckin: true,
    pwa: true,
  },
  onboardingSteps: [
    {
      id: "personal-info",
      name: "Personal Information",
      enabled: true,
      required: true,
      order: 1,
    },
    {
      id: "contact-details",
      name: "Contact Details",
      enabled: true,
      required: true,
      order: 2,
    },
    {
      id: "phone-verification",
      name: "Phone Verification",
      enabled: true,
      required: true,
      order: 3,
    },
    {
      id: "email-verification",
      name: "Email Verification",
      enabled: true,
      required: true,
      order: 4,
    },
    {
      id: "membership-tier",
      name: "Membership Tier",
      enabled: true,
      required: true,
      order: 5,
    },
    {
      id: "family-members",
      name: "Family Members",
      enabled: true,
      required: false,
      order: 6,
    },
    {
      id: "referrer",
      name: "Referrer Information",
      enabled: true,
      required: false,
      order: 7,
    },
    {
      id: "payment",
      name: "Payment",
      enabled: true,
      required: true,
      order: 8,
    },
  ],
  createdAt: new Date().toISOString(),
};

/**
 * Default membership tiers for the STS tenant.
 */
export const DEFAULT_TIERS: MembershipTier[] = [
  {
    id: "tier-individual-annual",
    tenantId: "sts-default",
    name: "Individual Annual",
    price: 16,
    durationMonths: 12,
    isFamily: false,
    benefits: [
      "Event access",
      "Newsletter",
      "Community directory listing",
      "Voting rights at AGM",
    ],
    isLifetime: false,
  },
  {
    id: "tier-family-annual",
    tenantId: "sts-default",
    name: "Family Annual",
    price: 26,
    durationMonths: 12,
    isFamily: true,
    benefits: [
      "All individual benefits",
      "Family member access",
      "Family event discounts",
      "Priority event registration",
    ],
    isLifetime: false,
  },
  {
    id: "tier-individual-lifetime",
    tenantId: "sts-default",
    name: "Individual Lifetime",
    price: 151,
    durationMonths: 0,
    isFamily: false,
    benefits: [
      "All individual benefits",
      "Lifetime membership",
      "VIP event seating",
      "Recognition on donor wall",
    ],
    isLifetime: true,
  },
  {
    id: "tier-family-lifetime",
    tenantId: "sts-default",
    name: "Family Lifetime",
    price: 251,
    durationMonths: 0,
    isFamily: true,
    benefits: [
      "All family benefits",
      "Lifetime membership",
      "VIP event seating",
      "Recognition on donor wall",
      "Complimentary annual dinner tickets",
    ],
    isLifetime: true,
  },
];
