import Link from "next/link"; // Import Link

const PopularSearch = () => {
  return (
    <div className="popular-searches" data-aos="fade-up" data-aos-delay="1000">
      <span className="title">Popular Searches : </span>
      <Link href="/job-list-v2">Designer</Link>, <Link href="/job-list-v2">Developer</Link>, <Link href="/job-list-v2">Web</Link>,
      <Link href="/job-list-v2"> IOS</Link>, <Link href="/job-list-v2">PHP</Link>, <Link href="/job-list-v2">Senior</Link>,
      <Link href="/job-list-v2"> Engineer</Link>,
    </div>
  );
};

export default PopularSearch;
