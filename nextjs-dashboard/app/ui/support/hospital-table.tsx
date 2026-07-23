import {fetchHospitals} from "@/app/lib/support/data";
import HospitalManager from "@/app/ui/support/hospital-manager";

export default async function HospitalTable({query,page} : {query: string, page: number}){
    const dataSource = await fetchHospitals(query,page);
    return <HospitalManager hospitals={dataSource} />;
}
