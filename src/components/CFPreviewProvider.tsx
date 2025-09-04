// src/components/CFPreviewProvider.tsx
"use client";
import { ContentfulLivePreviewProvider } from "@contentful/live-preview/react";

export default function CFPreviewProvider({ children }: { children: React.ReactNode }) {
  return (
    <ContentfulLivePreviewProvider
      locale="en-US"              // <-- required
      enableInspectorMode
      enableLiveUpdates
      // optional but helpful:
      space={process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}
      environment={process.env.NEXT_PUBLIC_CONTENTFUL_ENV || "master"}
    >
      {children}
    </ContentfulLivePreviewProvider>
  );
}
