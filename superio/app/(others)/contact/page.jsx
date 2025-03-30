import dynamic from "next/dynamic";

import Contact from "@/components/pages-menu/contact";

export const metadata = {
  title: "Contact Us | My ABA Jobs",
  description: "Get in touch with My ABA Jobs for support, inquiries, or feedback. Contact us via email or our contact form.",
}



const index = () => {
  return (
    <>
      
      <Contact />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
