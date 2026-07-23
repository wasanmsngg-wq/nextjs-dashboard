import {fetchHospitals} from "@/app/lib/support/data";
import HospitalManager from "@/app/ui/support/hospital-manager";

export default async function HospitalTable({query,page,pageSize} : {query: string, page: number, pageSize: number}){
    const dataSource = await fetchHospitals(query,page,pageSize);
    return <HospitalManager hospitals={dataSource} pageSize={pageSize} />;
}
