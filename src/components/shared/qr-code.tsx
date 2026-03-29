import { Button } from "@/components/ui/button";

interface QrCodeProps {
  data: string;
  size?: number;
  label?: string;
}

export function QrCode({ data, size = 200, label }: QrCodeProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <p className="text-sm font-medium text-gray-700">{label}</p>
      )}
      {/* Placeholder QR code area */}
      <div
        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-4"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`QR code for: ${data}`}
      >
        <div className="text-center">
          <svg
            className="mx-auto mb-2 h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          <p className="break-all text-xs text-gray-500">{data}</p>
        </div>
      </div>
      <Button variant="secondary" size="sm">
        Download QR Code
      </Button>
    </div>
  );
}
