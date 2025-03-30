import dynamic from "next/dynamic";
import EmployersList from "@/components/employers-listing-pages/employers-list-v1";

export const metadata = {
  title: "ABA Employers & Practices | My ABA Jobs",
  description: "Discover ABA therapy practices and employers committed to quality care and staff support. Find your next partner on My ABA Jobs.",
};

const index = () => {
  return (
    <>
      <EmployersList />
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
