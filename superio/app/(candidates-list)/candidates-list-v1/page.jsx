import dynamic from "next/dynamic";

import CandidatesList from "@/components/candidates-listing-pages/candidates-list-v1";

export const metadata = {
  title: "ABA Job Seekers & Professionals | My ABA Jobs",
  description: "Browse profiles of talented BCBAs, RBTs, and other ABA professionals seeking new opportunities on My ABA Jobs.",
}


const index = () => {
  return (
    <>
      
      <CandidatesList />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
