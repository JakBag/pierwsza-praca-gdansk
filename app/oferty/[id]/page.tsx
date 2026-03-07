import { permanentRedirect } from "next/navigation";

export default async function LegacyOfferDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  permanentRedirect(`/praca-dla-studentow-gdansk/${id}`);
}
