import dynamic from "next/dynamic";

import About from "@/components/pages-menu/about";

export const metadata = {
  title: "About Us | My ABA Jobs",
  description: "Learn about the mission of My ABA Jobs: connecting quality ABA professionals with supportive employers in the applied behavior analysis field.",
}



const index = () => {
  return (
    <>
      
      <About />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
