'use client' // Make it a client component

import { useEffect } from "react"; // Import useEffect
import { useDispatch } from "react-redux"; // Import useDispatch
import { supabase } from "../../../utils/supabaseClient"; // Import supabase client
import { setExperienceLevels } from "../../../features/candidate/candidateSlice"; // Import action

import FooterDefault from "../../footer/common-footer";
import Breadcrumb from "../../common/Breadcrumb";
import LoginPopup from "../../common/form/login/LoginPopup";
import DefaulHeader2 from "../../header/DefaulHeader2";
import MobileMenu from "../../header/MobileMenu";
import FilterTopBox from "./FilterTopBox";
import FilterSidebar from "./FilterSidebar";

const Index = () => {
    const dispatch = useDispatch();

    // Fetch experience levels on mount
    useEffect(() => {
        const fetchExperienceLevels = async () => {
            if (!supabase) {
                console.error('Supabase client not available');
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('experience_levels')
                    .select('id, name')
                    .order('name', { ascending: true }); // Or a more logical order if needed

                if (error) throw error;

                dispatch(setExperienceLevels(data || []));
            } catch (error) {
                console.error("Error fetching experience levels:", error);
            }
        };

        fetchExperienceLevels();
    }, [dispatch]); // Dependency array includes dispatch

    return (
        <>
            {/* <!-- Header Span --> */}
            <span className="header-span"></span>

            <LoginPopup />
            {/* End Login Popup Modal */}

            <DefaulHeader2 />
            {/* End Header with upload cv btn */}

            <MobileMenu />
            {/* End MobileMenu */}

            <Breadcrumb title="Applicants" meta="Applicants" /> {/* Changed title */}
            {/* <!--End Breadcrumb Start--> */}

            <section className="ls-section">
                <div className="auto-container">
                    <div className="row">
                        <div
                            className="offcanvas offcanvas-start"
                            tabIndex="-1"
                            id="filter-sidebar"
                            aria-labelledby="offcanvasLabel"
                        >
                            <div className="filters-column hide-left">
                                <FilterSidebar />
                            </div>
                        </div>
                        {/* End filter column for tablet and mobile devices */}

                        <div className="filters-column hidden-1023 col-lg-4 col-md-12 col-sm-12">
                            <FilterSidebar />
                        </div>
                        {/* <!-- End Filters Column for destop and laptop --> */}

                        <div className="content-column col-lg-8 col-md-12 col-sm-12">
                            <div className="ls-outer">
                                <FilterTopBox />
                                {/* <!-- ls Switcher --> */}
                            </div>
                        </div>
                        {/* <!-- End Content Column --> */}
                    </div>
                    {/* End row */}
                </div>
                {/* End container */}
            </section>
            {/* <!--End Listing Page Section --> */}

            <FooterDefault footerStyle="alternate5" />
            {/* <!-- End Main Footer --> */}
        </>
    );
};

export default Index;
