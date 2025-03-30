
'use client'

import { useState } from 'react'; // Import useState
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import LoginWithSocial from "./LoginWithSocial";
import FormContent2 from "./FormContent2";
import Link from "next/link";

const Register2 = () => {
  const [selectedRole, setSelectedRole] = useState('candidate'); // Add state for role

  const handleTabSelect = (index) => {
    setSelectedRole(index === 0 ? 'candidate' : 'employer'); // Update role based on tab index
  };

  return (
    <div className="form-inner">
      <h3>Create a Free My ABA Jobs Account</h3> {/* Update Title */}

      <Tabs onSelect={handleTabSelect}> {/* Add onSelect handler */}
        <div className="form-group register-dual">
          <TabList className="btn-box row">
            <Tab className="col-lg-6 col-md-12">
              <button className="theme-btn btn-style-four">
                <i className="la la-user"></i> Candidate
              </button>
            </Tab>

            <Tab className="col-lg-6 col-md-12">
              <button className="theme-btn btn-style-four">
                <i className="la la-briefcase"></i> Employer
              </button>
            </Tab>
          </TabList>
        </div>
        {/* End .form-group */}

        <TabPanel>
          <FormContent2 role={selectedRole} /> {/* Pass role prop */}
        </TabPanel>
        {/* End Candidates Form */}

        <TabPanel>
          <FormContent2 role={selectedRole} /> {/* Pass role prop */}
        </TabPanel>
        {/* End Employer Form */}
      </Tabs>
      {/* End form-group */}

      <div className="bottom-box">
        <div className="text">
          Already have an account?{" "}
          <Link href="/login" className="call-modal login">
            LogIn
          </Link>
        </div>
        <div className="divider">
          <span>or</span>
        </div>
        <LoginWithSocial />
      </div>
      {/* End bottom-box LoginWithSocial */}
    </div>
  );
};

export default Register2;
