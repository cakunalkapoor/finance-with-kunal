import RedirectNotice from "./RedirectNotice";

export const metadata = {
  title: "US & Canada Economy — Finance with Kunal",
  description: "This page has moved: US and Canada economic data now have separate pages.",
  robots: { index: false, follow: true },
};

export default function USCanadaPage() {
  return <RedirectNotice />;
}
