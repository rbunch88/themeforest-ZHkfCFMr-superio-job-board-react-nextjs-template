import dynamic from "next/dynamic";
import Packages from "@/components/dashboard-pages/candidates-dashboard/packages";

export const metadata = {
  title: "Packages | Candidate Dashboard | My ABA Jobs",
  description: "View available candidate packages and features on My ABA Jobs.",
};

const index = () => {
  return (
    <>
      <Packages />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
