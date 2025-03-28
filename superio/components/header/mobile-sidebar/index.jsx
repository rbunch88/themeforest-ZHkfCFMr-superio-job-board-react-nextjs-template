"use client";

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
          {mobileMenuData.map((menuItem) => (
            <MenuItem
              key={menuItem.id}
              onClick={() => router.push(menuItem.routePath)}
              className={
                isActiveLink(menuItem.routePath, pathname)
                  ? "menu-active-link"
                  : ""
              }
              // The routerLink prop is commented out in original, keeping it that way
              // routerLink={<Link href={menuItem.routePath} />}
            >
              {menuItem.label} {/* Use label from the data */}
            </MenuItem>
          ))}
        </Menu>
      </Sidebar>

      <SidebarFooter />
    </div>
  );
};

export default Index;