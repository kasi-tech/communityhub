"use client";

import type { MembershipTier } from "@/types";

interface TierSelectorProps {
  tiers: MembershipTier[];
  selected: string | null;
  onSelect: (tierId: string) => void;
}

const POPULAR_TIER_ID = "tier-family-annual";

export function TierSelector({ tiers, selected, onSelect }: TierSelectorProps) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2"
      role="radiogroup"
      aria-label="Membership tier selection"
    >
      {tiers.map((tier) => {
        const isSelected = selected === tier.id;
        const isPopular = tier.id === POPULAR_TIER_ID;

        return (
          <button
            key={tier.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(tier.id)}
            className={`relative flex flex-col rounded-xl border-2 p-5 text-left transition-all ${
              isSelected
                ? "border-indigo-500 bg-indigo-50 shadow-md ring-1 ring-indigo-500"
                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            {/* Popular badge */}
            {isPopular && (
              <span className="absolute -top-2.5 right-3 inline-flex items-center rounded-full bg-indigo-500 px-2.5 py-0.5 text-xs font-medium text-white">
                Popular
              </span>
            )}

            {/* Selected checkmark */}
            {isSelected && (
              <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Tier name */}
            <h3 className="text-base font-semibold text-gray-900">{tier.name}</h3>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">${tier.price}</span>
              <span className="text-sm text-gray-500">
                {tier.isLifetime ? "one-time" : "/year"}
              </span>
            </div>

            {/* Duration */}
            <p className="mt-1 text-xs text-gray-500">
              {tier.isLifetime
                ? "Lifetime membership"
                : `${tier.durationMonths}-month membership`}
              {tier.isFamily ? " (Family)" : " (Individual)"}
            </p>

            {/* Benefits */}
            <ul className="mt-3 space-y-1.5">
              {tier.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
