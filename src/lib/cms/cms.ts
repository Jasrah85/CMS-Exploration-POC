// src/lib/cms/cms.ts
import type { CMSProvider } from "./types";
export type { CMSProvider } from "./types";

export async function getCMS(): Promise<CMSProvider> {
  const provider = process.env.NEXT_PUBLIC_CMS ?? "mock";

  switch (provider) {
    case "contentful":
      return (await import("./providers/contentful")).contentfulProvider();
    case "sanity":
      return (await import("./providers/sanity")).sanityProvider();
    case "storyblok":
      return (await import("./providers/storyblok")).storyblokProvider();
    case "builder":
      return (await import("./providers/builder")).builderProvider();
    case "prismic":
      return (await import("./providers/prismic")).prismicProvider();
    default:
      return (await import("./providers/mock")).mockProvider();
  }
}

