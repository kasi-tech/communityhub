"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SpouseData {
  name: string;
  dob: string;
  email: string;
  phone: string;
}

interface ChildData {
  name: string;
  dob: string;
}

export interface FamilyData {
  spouse: SpouseData | null;
  children: ChildData[];
}

interface FamilyDetailsFormProps {
  onChange: (data: FamilyData) => void;
  initialData?: FamilyData;
}

const MAX_CHILDREN = 3;

const emptySpouse: SpouseData = { name: "", dob: "", email: "", phone: "" };
const emptyChild: ChildData = { name: "", dob: "" };

export function FamilyDetailsForm({ onChange, initialData }: FamilyDetailsFormProps) {
  const [isOpen, setIsOpen] = useState(!!initialData);
  const [includeSpouse, setIncludeSpouse] = useState(!!initialData?.spouse);
  const [spouse, setSpouse] = useState<SpouseData>(initialData?.spouse ?? { ...emptySpouse });
  const [children, setChildren] = useState<ChildData[]>(initialData?.children ?? []);

  const emitChange = useCallback(
    (newSpouse: SpouseData | null, newChildren: ChildData[]) => {
      onChange({ spouse: newSpouse, children: newChildren });
    },
    [onChange],
  );

  const handleSpouseChange = (field: keyof SpouseData, value: string) => {
    const updated = { ...spouse, [field]: value };
    setSpouse(updated);
    emitChange(includeSpouse ? updated : null, children);
  };

  const toggleSpouse = () => {
    const next = !includeSpouse;
    setIncludeSpouse(next);
    if (next) {
      emitChange(spouse, children);
    } else {
      setSpouse({ ...emptySpouse });
      emitChange(null, children);
    }
  };

  const addChild = () => {
    if (children.length >= MAX_CHILDREN) return;
    const updated = [...children, { ...emptyChild }];
    setChildren(updated);
    emitChange(includeSpouse ? spouse : null, updated);
  };

  const removeChild = (index: number) => {
    const updated = children.filter((_, i) => i !== index);
    setChildren(updated);
    emitChange(includeSpouse ? spouse : null, updated);
  };

  const handleChildChange = (index: number, field: keyof ChildData, value: string) => {
    const updated = children.map((child, i) =>
      i === index ? { ...child, [field]: value } : child,
    );
    setChildren(updated);
    emitChange(includeSpouse ? spouse : null, updated);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={isOpen}
      >
        <div>
          <h3 className="text-sm font-medium text-gray-900">Family Details</h3>
          <p className="text-xs text-gray-500">Optional — add spouse and children information</p>
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-5 border-t border-gray-200 px-4 py-4">
          {/* Spouse section */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={includeSpouse}
                onChange={toggleSpouse}
                className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
              />
              Include Spouse
            </label>

            {includeSpouse && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Input
                  label="Spouse Name"
                  placeholder="Full name"
                  value={spouse.name}
                  onChange={(e) => handleSpouseChange("name", e.target.value)}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={spouse.dob}
                  onChange={(e) => handleSpouseChange("dob", e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="spouse@example.com"
                  value={spouse.email}
                  onChange={(e) => handleSpouseChange("email", e.target.value)}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+65 9xxx xxxx"
                  value={spouse.phone}
                  onChange={(e) => handleSpouseChange("phone", e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Children section */}
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Children</h4>
              {children.length < MAX_CHILDREN && (
                <Button type="button" variant="ghost" size="sm" onClick={addChild}>
                  <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Child
                </Button>
              )}
            </div>

            {children.length === 0 && (
              <p className="mt-1 text-xs text-gray-400">
                No children added. Click &quot;Add Child&quot; to include dependents.
              </p>
            )}

            {children.map((child, index) => (
              <div key={index} className="mt-3 flex items-end gap-3">
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <Input
                    label={`Child ${index + 1} Name`}
                    placeholder="Full name"
                    value={child.name}
                    onChange={(e) => handleChildChange(index, "name", e.target.value)}
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={child.dob}
                    onChange={(e) => handleChildChange(index, "dob", e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeChild(index)}
                  className="mb-1 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove child ${index + 1}`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
