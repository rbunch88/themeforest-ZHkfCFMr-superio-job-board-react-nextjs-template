import dynamic from "next/dynamic";
import MyProfile from "@/components/dashboard-pages/candidates-dashboard/my-profile";

export const metadata = {
  title: "My Profile | Candidate Dashboard | My ABA Jobs",
  description: "Update your personal information, contact details, and professional summary on the My ABA Jobs candidate dashboard.",
};

const index = () => {
  return (
    <>
      <MyProfile />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
