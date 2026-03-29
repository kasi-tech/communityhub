import type { Metadata } from "next";
import { JoinWizard } from "./join-wizard";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Join Us | CommunityHub",
  description:
    "Apply for membership to join our community. Complete the onboarding process with phone verification, personal details, and payment.",
};

export default function JoinPage() {
  return (
    <ToastProvider>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <JoinWizard />
      </main>
    </ToastProvider>
  );
}
