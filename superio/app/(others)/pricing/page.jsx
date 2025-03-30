import dynamic from "next/dynamic";

import Pricing from "@/components/pages-menu/pricing";

export const metadata = {
  title: "Pricing Plans | My ABA Jobs",
  description: "Choose the best job posting plan for your hiring needs. View pricing options for single posts and multi-job packages on My ABA Jobs.",
}



const index = () => {
  return (
    <>
      
      <Pricing />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
