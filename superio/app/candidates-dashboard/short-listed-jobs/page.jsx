import dynamic from "next/dynamic";
import ShortListedJobs from "@/components/dashboard-pages/candidates-dashboard/short-listed-jobs";

export const metadata = {
  title: "Shortlisted Jobs | Candidate Dashboard | My ABA Jobs",
  description: "View jobs you have shortlisted or saved for later on the My ABA Jobs candidate dashboard.",
};

const index = () => {
  return (
    <>
      <ShortListedJobs />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
