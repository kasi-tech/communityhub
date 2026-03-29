// ---------------------------------------------------------------------------
// CommunityHub — Shared TypeScript Types
// ---------------------------------------------------------------------------

// ---- Enums / Union Types --------------------------------------------------

export type MemberStatus =
  | "applying"
  | "pending"
  | "active"
  | "expired"
  | "suspended"
  | "rejected";

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export type RegistrationStatus = "confirmed" | "waitlisted" | "cancelled";

export type PaymentProvider = "paypal" | "paynow";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type ApplicationStatus =
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

// ---- Core Entities --------------------------------------------------------

export interface Member {
  id: string;
  tenantId: string;
  userId: string;
  tierId: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  nationality: string;
  postalCode: string;
  interests: string[];
  status: MemberStatus;
  fraudScore: number;
  memberNumber: string;
  membershipExpires: string;
  createdAt: string;
  embedding?: number[];
}

export interface EventImage {
  id: string;
  originalUrl: string;
  coverUrl: string;
  galleryUrl: string;
  thumbnailUrl: string;
  altText: string;
  isCover: boolean;
  uploadedAt: string;
}

export interface Event {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  venueAddress: string;
  venueLat: number;
  venueLng: number;
  capacity: number;
  priceAdult: number;
  priceChild: number;
  status: EventStatus;
  images: EventImage[];
  coverImageUrl: string;
  schedule: string;
  speakers: string[];
  createdBy: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  memberId: string;
  status: RegistrationStatus;
  attendeeAdults: number;
  attendeeChildren: number;
  dietaryPreference: string;
  specialRequirements: string;
  totalAmount: number;
  waitlistPosition: number | null;
  checkedInAt: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  memberId: string;
  registrationId: string | null;
  applicationId: string | null;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  providerRef: string;
  status: PaymentStatus;
  refundAmount: number;
  createdAt: string;
}

export interface Application {
  id: string;
  tenantId: string;
  stepData: Record<string, unknown>;
  currentStep: number;
  phone: string;
  phoneVerified: boolean;
  email: string;
  emailVerified: boolean;
  referrerMemberId: string | null;
  referrerConfirmed: boolean;
  fraudScore: number;
  fraudFactors: FraudFactor[];
  paymentId: string | null;
  status: ApplicationStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

// ---- Tenant / Config ------------------------------------------------------

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  logoDarkUrl: string;
  favicon: string;
  tagline: string;
  customCss: string;
}

export interface FeatureFlags {
  aiChatbot: boolean;
  smartRecommendations: boolean;
  aiNewsletter: boolean;
  photoGallery: boolean;
  donations: boolean;
  volunteerManagement: boolean;
  eventCheckin: boolean;
  pwa: boolean;
}

export interface OnboardingStep {
  id: string;
  name: string;
  enabled: boolean;
  required: boolean;
  order: number;
}

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  branding: TenantBranding;
  features: FeatureFlags;
  onboardingSteps: OnboardingStep[];
  createdAt: string;
}

// ---- Membership Tiers -----------------------------------------------------

export interface MembershipTier {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  durationMonths: number;
  isFamily: boolean;
  benefits: string[];
  isLifetime: boolean;
}

// ---- Donations & Volunteers -----------------------------------------------

export interface Donation {
  id: string;
  tenantId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  paymentId: string;
  message: string;
  showOnWall: boolean;
  createdAt: string;
}

export interface Volunteer {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  availability: string;
  notes: string;
  createdAt: string;
}

// ---- AI Chat --------------------------------------------------------------

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  tenantId: string;
  memberId: string;
  sessionId: string;
  messages: ChatMessage[];
  satisfaction: number | null;
  resolved: boolean;
  createdAt: string;
}

// ---- Audit & Fraud --------------------------------------------------------

export interface AuditLog {
  id: string;
  tenantId: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface FraudFactor {
  name: string;
  weight: number;
  value: string;
  signal: string;
}

export interface FraudScore {
  score: number;
  factors: FraudFactor[];
}

// ---- Family Members -------------------------------------------------------

export interface FamilyMember {
  id: string;
  memberId: string;
  name: string;
  relationship: "spouse" | "child";
  dob: string;
  email?: string;
  phone?: string;
}

// ---- Generic API Types ----------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
