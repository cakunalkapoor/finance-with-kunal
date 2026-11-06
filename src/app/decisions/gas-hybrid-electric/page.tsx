import VehicleDecision from "@/components/decisions/VehicleDecision";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({title:"Gas vs Hybrid vs Electric",path:"/decisions/gas-hybrid-electric",description:"Compare gas, hybrid and electric ownership costs in one simple breakdown: purchase minus resale, energy, maintenance and insurance."});
export default function Page() {return <VehicleDecision/>;}
