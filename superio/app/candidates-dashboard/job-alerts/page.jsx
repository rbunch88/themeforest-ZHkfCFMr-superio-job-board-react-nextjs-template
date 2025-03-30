import dynamic from "next/dynamic";
import JobAlerts from "@/components/dashboard-pages/candidates-dashboard/job-alerts";

export const metadata = {
  title: "Job Alerts | Candidate Dashboard | My ABA Jobs",
  description: "Manage your job alerts to get notified about new ABA job postings matching your preferences on My ABA Jobs.",
};

const index = () => {
  return (
    <>
      <JobAlerts />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
