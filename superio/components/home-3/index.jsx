import FooterDefault from "../footer/common-footer";
import Hero3 from "../hero/hero-3";
import Partner from "../common/partner/Partner";
import JobCategorie2 from "../job-categories/JobCategorie2";
import JobFeatured3 from "../job-featured/JobFeatured3";
import Testimonial2 from "../testimonial/Testimonial2";
import TopCompany from "../top-company/TopCompany";
import About2 from "../about/About2";
import Pricing from "../pricing/Pricing";
import LoginPopup from "../common/form/login/LoginPopup";
import MobileMenu from "../header/MobileMenu";
import DefaulHeader2 from "../header/DefaulHeader2";
import Link from "next/link";
import Image from "next/image";

const index = () => {
  return (
    <>
      <LoginPopup />
      {/* End Login Popup Modal */}

      <DefaulHeader2 />
      {/* End Header with upload cv btn */}

      <MobileMenu />
      {/* End MobileMenu */}

      <Hero3 />
      {/* <!-- End Banner Section Three--> */}

      <section className="clients-section-two">
        <div className="sponsors-outer" data-aos="fade">
          {/* <!--Sponsors Carousel--> */}
          <ul className="sponsors-carousel">
            <Partner />
          </ul>
        </div>
      </section>
      {/* <!-- End Clients Section--> */}

      <section className="job-categories">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Focus Your Impact: Explore Roles by Specialty &amp; Setting</h2>
            <div className="text">Find opportunities where your unique skills in assessment, intervention, and data analysis will make a real difference.</div>
          </div>

          <div className="row" data-aos="fade-up">
            <JobCategorie2 />
          </div>
        </div>
      </section>
      {/* <!-- End Job Categories --> */}

      <section className="job-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>Advance Your Career: Featured Roles Offering Growth &amp; Impact</h2>
          </div>
          {/* End .sec-title */}

          <div className="row" data-aos="fade-up">
            <JobFeatured3 />
          </div>

          <div className="btn-box">
            <Link
              href="/job-list-v3"
              className="theme-btn btn-style-one bg-blue"
            >
              <span className="btn-title">Load More Listing</span>
            </Link>
          </div>
        </div>
      </section>
      {/* <!-- End Job Section --> */}

      <section className="testimonial-section-two">
        <div className="container-fluid">
          <div className="testimonial-left">
            <Image
              width={504}
              height={451}
              src="/images/resource/testimonial-left.png"
              alt="testimonial"
            />
          </div>
          {/* End left img group */}

          <div className="testimonial-right">
            <Image
              width={504}
              height={451}
              src="/images/resource/testimonial-right.png"
              alt="testimonial"
            />
          </div>
          {/* End right img group */}

          <div className="sec-title text-center">
            <h2>Tired of Hitting a Wall? See How Others Leveled Up with My ABA Jobs.</h2>
            <div className="text">Real stories from ABA pros who found supportive roles and reignited their passion:</div>
          </div>
          {/* <!-- Sec Title --> */}

          <div className="carousel-outer" data-aos="fade-up">
            <div className="testimonial-carousel">
              <Testimonial2 />
            </div>
            {/* <!-- Testimonial Carousel --> */}
          </div>
        </div>
      </section>
      {/* <!-- End Testimonial Section --> */}

      <section className="top-companies">
        <div className="auto-container">
          <div className="sec-title">
            <h2>Connect with ABA Practices Committed to Quality Care &amp; Staff Support</h2>
            <div className="text">Discover employers who invest in their teams, value ethical practices, and provide environments where you can do your best work.</div>
          </div>

          <div className="carousel-outer" data-aos="fade-up">
            <div className="companies-carousel">
              <TopCompany />
            </div>
          </div>
        </div>
      </section>
      {/* <!-- End Top Companies --> */}

      <section className="about-section-two">
        <div className="auto-container">
          <div className="row">
            <About2 />
          </div>
        </div>
      </section>
      {/* <!-- End About Section --> */}

      <section className="pricing-section">
        <div className="auto-container">
          <div className="sec-title text-center">
            <h2>
              Invest in Finding the <em>Right</em> BCBA or RBT. Build a Team That Lasts.
            </h2>
            <div className="text">
              Lorem ipsum dolor sit amet elit, sed do eiusmod tempor.
            </div>
          </div>
          {/* End title */}
          <Pricing />
          {/* End .{/* <!--Pricing Tabs--> */}
        </div>
      </section>
      {/* <!-- End Pricing Section --> */}

      <FooterDefault footerStyle="alternate" />
      {/* <!-- End Main Footer --> */}
    </>
  );
};

export default index;
