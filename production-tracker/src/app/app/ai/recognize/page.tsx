import { AiRecognizePageView } from "@/components/ai/ai-pages";
import { listAiScans } from "@/lib/ai-recognition";

export default function AiRecognizePage() {
  return <AiRecognizePageView scans={listAiScans()} />;
}
