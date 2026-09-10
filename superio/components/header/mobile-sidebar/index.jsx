"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Sidebar,
  Menu,
  MenuItem,
  // SubMenu removed as we no longer have nested items
} from "react-pro-sidebar";

import mobileMenuData from "../../../data/mobileMenuData";
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import {
  isActiveLink,
  // isActiveParentChaild removed as it's no longer needed
} from "../../../utils/linkActiveChecker";
import { usePathname, useRouter } from "next/navigation";


const Index = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get pathname for active link checking

  // Use Clerk's useUser hook to get authentication state
  const { isSignedIn, user } = useUser();
  
  // This is a placeholder. In a real implementation, you would store user roles in your database
  // and fetch them using Clerk's user ID. For now, we'll assume all signed-in users are "job-seekers"
  const userRole = user?.publicMetadata?.role || "job-seeker";

  return (
    <div
      className="offcanvas offcanvas-start mobile_menu-contnet"
      tabIndex="-1"
      id="offcanvasMenu"
      data-bs-scroll="true"
    >
      <SidebarHeader />
      {/* End pro-header */}

      <Sidebar>
        <Menu>
          {/* Iterate directly over the flat mobileMenuData array */}
          {mobileMenuData.map((menuItem) => {
            // Conditionally render the 'Candidates' item
            if (menuItem.label === 'Candidates') {
              return (
                isSignedIn && userRole === 'employer' && (
                  <MenuItem
                    key={menuItem.id}
                    onClick={() => router.push(menuItem.routePath)}
                    className={
                      isActiveLink(menuItem.routePath, pathname)
                        ? "menu-active-link"
                        : ""
                    }
                  >
                    {menuItem.label}
                  </MenuItem>
                )
              );
            }
            // Render other items normally
            return (
              <MenuItem
                key={menuItem.id}
                onClick={() => router.push(menuItem.routePath)}
                className={
                  isActiveLink(menuItem.routePath, pathname)
                    ? "menu-active-link"
                    : ""
                }
              >
                {menuItem.label}
              </MenuItem>
            );
          })}
        </Menu>
      </Sidebar>

      <SidebarFooter />
    </div>
  );
};

export default Index;