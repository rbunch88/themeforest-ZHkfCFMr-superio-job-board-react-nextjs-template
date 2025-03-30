import dynamic from "next/dynamic";

import BlogList from "@/components/blog-meu-pages/blog-list-v1";

export const metadata = {
  title: "ABA Career Insights & News | My ABA Jobs Blog",
  description: "Read the latest articles on ABA careers, job searching, professional development, and industry news on the My ABA Jobs blog.",
};
const index = () => {
  return (
    <>
      <BlogList />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
