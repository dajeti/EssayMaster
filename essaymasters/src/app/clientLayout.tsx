// clientLayout.tsx (Client Component)
"use client"; // This makes the file a Client Component

import { SessionProvider } from "next-auth/react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
