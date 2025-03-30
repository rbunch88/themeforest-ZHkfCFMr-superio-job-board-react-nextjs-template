import dynamic from "next/dynamic";
import ShortlistedResumes from "@/components/dashboard-pages/employers-dashboard/shortlisted-resumes";

export const metadata = {
  title: "Shortlisted Resumes | Employer Dashboard | My ABA Jobs",
  description: "View and manage candidates you have shortlisted for your job postings on My ABA Jobs.",
};

const index = () => {
  return (
    <>
      <ShortlistedResumes />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
