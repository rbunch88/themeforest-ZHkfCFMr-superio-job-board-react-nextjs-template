import Link from "next/link";
import ApplicantsList from "./ApplicantsList";
import Image from "next/image";

const About2 = () => {
  return (
    <>
      {/* <!-- Content Column --> */}
      <div className="content-column col-lg-6 col-md-12 col-sm-12 order-2">
        <div className="inner-column" data-aos="fade-left">
          <div className="sec-title">
            <h2>Reach ABA Professionals Who Think Like You Do.</h2>
            <div className="text">Stop sorting through generic applications. Post on My ABA Jobs to connect with data-driven, client-centered BCBAs, RBTs, and specialists who are passionate about effective, ethical ABA. Find candidates ready to contribute meaningfully to your team from day one.</div>
          </div>
          <ul className="list-style-one">
            <li>Bring to the table win-win survival</li>
            <li>Capitalize on low hanging fruit to identify</li>
            <li>But I must explain to you how all this</li>
          </ul>
          <Link
            href="/employers-dashboard/post-jobs"
            className="theme-btn btn-style-one"
          >
            Post Your Job &amp; Connect with ABA Experts Today
          </Link>
        </div>
      </div>
      {/* End .content-column */}

      {/* <!-- Image Column --> */}
      <div className="image-column col-lg-6 col-md-12 col-sm-12">
        <figure className="image-box" data-aos="fade-right">
          <Image
            width={660}
            height={540}
            src="/images/resource/image-3.png"
            alt="resource"
          />
        </figure>

        {/* <!-- Count Employers --> */}
        <div className="applicants-list" data-aos="fade-up">
          <div className="title-box">
            <h4>Applicants List</h4>
          </div>
          <ul className="applicants">
            <ApplicantsList />
          </ul>
        </div>
      </div>
      {/* End image-column */}
    </>
  );
};

export default About2;
