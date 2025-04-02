// In your main page component
export default function MainPage({ searchParams }: { searchParams: { sessionId?: string } }) {
  const sessionId = searchParams.sessionId;
  
  // Use sessionId to load the specific session if provided
  return <EssayForm sessionId={sessionId} />;
}