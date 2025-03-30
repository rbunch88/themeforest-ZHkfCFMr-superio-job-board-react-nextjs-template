import dynamic from "next/dynamic";
import CvManager from "@/components/dashboard-pages/candidates-dashboard/cv-manager";

export const metadata = {
  title: "CV Manager | Candidate Dashboard | My ABA Jobs",
  description: "Upload and manage your CVs/resumes on the My ABA Jobs candidate dashboard.",
};

const index = () => {
  return (
    <>
      <CvManager />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
