// app/[sessionId]/page.tsx
import EssayForm from "../Components/EssayForm";

export default function SessionPage({ params }: { params: { sessionId: string } }) {
  return <EssayForm sessionId={params.sessionId} />;
}