import type { Metadata } from "next";
import { HomePageLive } from "@/components/home/home-page-live";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Main Character Streetwear`,
  description:
    "MY ROACH — Gen Z streetwear for the underground. Squad up, survived the plot, still standing.",
};

export default function HomePage() {
  return <HomePageLive />;
}
