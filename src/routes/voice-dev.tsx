import { createFileRoute } from "@tanstack/react-router";
import { VoiceDevChat } from "@/components/pal/voice-dev-chat";

export const Route = createFileRoute("/voice-dev")({
  component: VoiceDevStandalone,
});

function VoiceDevStandalone() {
  return (
    <div className="mx-auto max-w-2xl bg-background px-4 py-6">
      <VoiceDevChat />
    </div>
  );
}
