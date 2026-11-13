import LegacyLedgerRedirect from "@/components/ledger/LegacyLedgerRedirect";
import { metadata as ledgerMetadata } from "../ledger/page";

export const metadata = {
  ...ledgerMetadata,
  robots: { index: false, follow: true },
};

export default function LegacyBlogPage() {
  return <LegacyLedgerRedirect href="/ledger/" />;
}
