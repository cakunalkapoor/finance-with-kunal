import ExpandedDecision from "@/components/decisions/ExpandedDecision";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({title:"Pay Off Debt vs Invest",path:"/decisions/debt-vs-invest",description:"Compare pay off debt vs invest using your own assumptions and yearly projections."});
export default function Page() {return <ExpandedDecision kind="debt"/>;}
