import RedirectNotice from "./RedirectNotice";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "US & Canada Economy",
  description: "This page has moved: US and Canada economic data now have separate pages.",
  path: "/us-canada",
  noIndex: true,
});

export default function USCanadaPage() {
  return <RedirectNotice />;
}
