'use client' // Make this a client component to use hooks in children

import CallToActions from "../components/CallToActions";
// import Categories from "../components/Categories"; // Removed - Not implemented for companies
// import DestinationRangeSlider from "../components/DestinationRangeSlider"; // Removed - Not implemented for companies
// import CompanySize from "../components/CompanySize"; // Removed - Commented out previously
import LocationBox from "../components/LocationBox"; // Keep - Needs refactoring
import FoundationDate from "../components/FoundationDate"; // Keep - Needs refactoring
import SearchBox from "../components/SearchBox"; // Keep - Needs refactoring

const FilterSidebar = ({ searchParams }) => { // Accept searchParams prop
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
                        {/* Pass searchParams down */}
                        <SearchBox searchParams={searchParams} />
                    </div>
                </div>
                {/* <!-- Filter Block --> */}

                <div className="filter-block">
                    <h4>Location</h4>
                    <div className="form-group">
                         {/* Pass searchParams down */}
                        <LocationBox searchParams={searchParams} />
                    </div>

                    {/* Removed Destination/Radius Slider */}
                    {/* <p>Radius around selected destination</p>
                    <DestinationRangeSlider /> */}
                </div>
                {/* <!-- Filter Block --> */}

                {/* Removed Category Filter */}
                {/* <div className="filter-block">
                    <h4>Category</h4>
                    <div className="form-group">
                        <Categories />
                    </div>
                </div> */}
                {/* <!-- Filter Block --> */}

                {/* Removed Company Size Filter (was already commented out) */}

                <div className="filter-block">
                    <h4>Foundation Date</h4>
                     {/* Pass searchParams down */}
                    <FoundationDate searchParams={searchParams} />
                </div>
                {/* <!-- Filter Block --> */}
            </div>
            {/* Filter Outer */}

            <CallToActions />
            {/* <!-- End Call To Action --> */}
        </div>
    );
};

export default FilterSidebar;
