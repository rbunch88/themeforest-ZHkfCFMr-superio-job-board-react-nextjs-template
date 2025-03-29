import SearchForm2 from "../../common/job-search/SearchForm2";
import PopularSearch from "../PopularSearch";
import ImageBox from "./ImageBox";

const index = () => {
  return (
    <section className="banner-section-three">
      <div className="auto-container">
        <div className="row">
          <div className="content-column col-lg-7 col-md-12 col-sm-12">
            <div className="inner-column">
              <div className="title-box" data-aos="fade-up">
                <h3>
                  Feeling <span className="hero-emphasis-italic">Stuck?</span> Stop Searching, Start <span className="hero-emphasis-bold">Growing.</span> <br />
                  <span className="hero-emphasis-brand">My ABA Jobs</span> Connects You to Roles Where Your ABA Expertise <span className="hero-emphasis-bold">Thrives.</span>
                </h3>
                <div className="text">Skip the noise of generic boards. Find rewarding BCBA, RBT, and leadership roles in supportive, ethical environments.</div>
              </div>

              {/* <!-- Job Search Form --> */}
              <div
                className="job-search-form-two"
                data-aos-delay="500"
                data-aos="fade-up"
              >
                <SearchForm2 />
              </div>
              {/* <!-- Job Search Form --> */}

              {/* <!-- Popular Search --> */}
              <PopularSearch />
              {/* <!-- End Popular Search --> */}
            </div>
          </div>

          <div className="image-column col-lg-5 col-md-12">
            <ImageBox />
          </div>
        </div>
      </div>
    </section>
  );
};

export default index;
