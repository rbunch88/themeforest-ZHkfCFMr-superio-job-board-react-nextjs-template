import dynamic from "next/dynamic";
import DashboadHome from "@/components/dashboard-pages/candidates-dashboard/dashboard";

export const metadata = {
  title: "Candidate Dashboard | My ABA Jobs",
  description: "Manage your profile, resume, applications, and job alerts on the My ABA Jobs candidate dashboard.",
};

const index = () => {
  return (
    <>
      <DashboadHome />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
