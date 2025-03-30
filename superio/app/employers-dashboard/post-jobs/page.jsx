import dynamic from "next/dynamic";
import PostJob from "@/components/dashboard-pages/employers-dashboard/post-jobs";

export const metadata = {
  title: "Post a Job | Employer Dashboard | My ABA Jobs",
  description: "Create and post a new job listing on My ABA Jobs to reach qualified ABA professionals.",
};

const index = () => {
  return (
    <>
      <PostJob />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
