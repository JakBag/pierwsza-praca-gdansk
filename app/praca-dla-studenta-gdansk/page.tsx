import CityOffersLanding from "@/components/CityOffersLanding";
import { getPublishedJobsByCity } from "@/lib/jobsDb";
import {
  buildLandingMetadata,
  gdanskBody,
  gdanskFaq,
  gdanskFaqLinks,
  gdanskRelatedLinks,
  gdanskSections,
} from "./gdanskLandingData";

export const dynamic = "force-dynamic";

export const metadata = buildLandingMetadata(
  "Praca student Gdańsk - oferty dla studentów bez doświadczenia",
  "/praca-dla-studenta-gdansk"
);

export default async function StudentJobsGdanskPage() {
  const jobs = await getPublishedJobsByCity("Gdansk");

  return (
    <CityOffersLanding
      h1="Praca student Gdańsk - oferty dla studentów bez doświadczenia"
      intro="Lokalne oferty dla studentów z Gdańska: praca bez doświadczenia, dorywcza, weekendowa, zdalna i pierwsze stanowiska, które da się pogodzić z zajęciami."
      cityDisplayName="Gdańska"
      jobs={jobs}
      body={gdanskBody}
      contentSections={gdanskSections}
      faq={gdanskFaq}
      faqLinks={gdanskFaqLinks}
      relatedLinks={gdanskRelatedLinks}
      relatedLinksTitle="Popularne frazy i miasta"
    />
  );
}
