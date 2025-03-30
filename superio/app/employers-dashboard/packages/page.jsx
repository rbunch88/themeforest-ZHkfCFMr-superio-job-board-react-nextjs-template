import dynamic from "next/dynamic";
import Packages from "@/components/dashboard-pages/employers-dashboard/packages";

export const metadata = {
  title: "Job Posting Packages | Employer Dashboard | My ABA Jobs",
  description: "View your current job posting package status and purchase additional packages on the My ABA Jobs employer dashboard.",
};

const index = () => {
  return (
    <>
      <Packages />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
