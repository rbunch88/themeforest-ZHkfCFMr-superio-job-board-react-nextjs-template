import DestinationRangeSlider from "../components/DestinationRangeSlider";
// import CandidatesGender from "../components/CandidatesGender"; // Removed
import LocationBox from "../components/LocationBox";
import SearchBox from "../components/SearchBox";
import DatePosted from "../components/DatePosted"; // Keep this, will filter application_date
import ExperienceLevel from '@/components/job-listing-pages/components/ExperienceLevel';
// import Categories from "../components/Categories"; // Removed
// import Qualification from "../components/Qualification"; // Removed

const FilterSidebar = () => {
    return (
        <div className="inner-column pd-right">
            <div className="filters-outer">
                <button
                    type="button"
                    className="btn-close text-reset close-filters show-1023"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
                {/* End .close filter */}

                <div className="filter-block">
                    <h4>Search by Keywords</h4>
                    <div className="form-group">
                        <SearchBox />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}

                <div className="filter-block">
                    <h4>Location</h4>
                    <div className="form-group">
                        <LocationBox />
                    </div>

                    {/* <p>Radius around selected destination</p>
                    <DestinationRangeSlider /> */}
                    {/* Radius filter skipped for now */}
                </div>
                {/* <!-- Filter Block --> */}

                {/* Category Filter Removed */}
                {/* <div className="filter-block">
                    <h4>Category</h4>
                    <div className="form-group">
                        <Categories />
                    </div>
                </div> */}
                {/* <!-- Filter Block --> */}

                {/* Gender Filter Removed */}
                {/* <div className="filter-block">
                    <h4>Candidate Gender</h4>
                    <div className="form-group">
                        <CandidatesGender />
                    </div>
                </div> */}
                {/* <!-- Filter Block --> */}

                <div className="checkbox-outer">
                    <h4>Date Applied</h4> {/* Renamed from Date Posted */}
                    <DatePosted />
                </div>
                {/* <!-- Filter Block --> */}

                <div className="checkbox-outer">
                    <h4>Experience Level</h4> {/* Renamed from Experience */}
                    <ExperienceLevel /> {/* Changed from Experience */}
                </div>
                {/* <!-- Filter Block --> */}

                {/* Qualification Filter Removed */}
                {/* <div className=" checkbox-outer">
                    <h4>Qualification</h4>
                    <Qualification />
                </div> */}
                {/* <!-- Filter Block --> */}
            </div>
            {/* Filter Outer */}
        </div>
    );
};

export default FilterSidebar;
