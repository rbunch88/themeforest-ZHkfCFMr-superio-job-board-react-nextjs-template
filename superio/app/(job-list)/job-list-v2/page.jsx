import dynamic from "next/dynamic";
import JobList from "@/components/job-listing-pages/job-list-v2";

export const metadata = {
  title: "Browse ABA Jobs | My ABA Jobs",
  description: "Search and apply for the latest BCBA, RBT, and other ABA therapy jobs. Filter by location, specialty, and setting on My ABA Jobs.",
};

const index = () => {
  return (
    <>
      <JobList />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
