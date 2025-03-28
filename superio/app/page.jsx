import Wrapper from "@/layout/Wrapper";
import Home from "@/components/home-3"; // Changed import from home-1 to home-3

export const metadata = {
  title: "Home-3 || Superio - Job Borad React NextJS Template", // Updated title
  description: "Superio - Job Borad React NextJS Template",
};

export default function page() {
  return (
    <Wrapper>
      <Home />
    </Wrapper>
  );
}
