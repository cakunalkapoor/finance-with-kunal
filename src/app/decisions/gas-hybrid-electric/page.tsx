import ExpandedDecision from "@/components/decisions/ExpandedDecision";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({title:"Gas vs Hybrid vs Electric",path:"/decisions/gas-hybrid-electric",description:"Compare gas vs hybrid vs electric using your own assumptions and yearly projections."});
export default function Page() {return <ExpandedDecision kind="vehicle"/>;}
