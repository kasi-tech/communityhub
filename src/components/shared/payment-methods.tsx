"use client";

type PaymentMethod = "paypal" | "paynow";

interface PaymentMethodsProps {
  selected?: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
}

function PayPalIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
      PP
    </div>
  );
}

function PayNowIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
      PN
    </div>
  );
}

const methods: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  icon: React.FC;
}> = [
  {
    id: "paypal",
    label: "PayPal",
    description: "Pay securely with PayPal",
    icon: PayPalIcon,
  },
  {
    id: "paynow",
    label: "PayNow",
    description: "Pay via PayNow QR code",
    icon: PayNowIcon,
  },
];

export function PaymentMethods({ selected, onSelect }: PaymentMethodsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment methods">
      {methods.map((method) => {
        const isSelected = selected === method.id;
        const Icon = method.icon;
        return (
          <button
            key={method.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(method.id)}
            className={`flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
              isSelected
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Icon />
            <div>
              <p className="text-sm font-medium text-gray-900">{method.label}</p>
              <p className="text-xs text-gray-500">{method.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
