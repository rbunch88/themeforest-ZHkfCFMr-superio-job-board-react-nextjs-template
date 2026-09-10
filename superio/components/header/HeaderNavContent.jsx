"use client";

import Link from "next/link";
// Import the default export from mainMenuData
import mainMenuData from "../../data/mainMenuData";
// Keep isActiveLink for styling the current page link
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const HeaderNavContent = () => {
  const pathname = usePathname(); // Get the current path
  const { isSignedIn, user } = useUser();
  
  // This is a placeholder. In a real implementation, you would store user roles in your database
  // and fetch them using Clerk's user ID. For now, we'll assume all signed-in users are "job-seekers"
  const userRole = user?.publicMetadata?.role || "job-seeker";

  return (
    <>
      <nav className="nav main-menu">
        <ul className="navigation" id="navbar">
          {/* Iterate over the simplified mainMenuData array */}
          {mainMenuData.map((item) => {
            // Conditionally render the 'Candidates' item
            if (item.name === 'Candidates') {
              return (
                isSignedIn && userRole === 'employer' && (
                  <li
                    className={isActiveLink(item.routePath, pathname) ? "current" : ""}
                    key={item.id}
                  >
                    <Link href={item.routePath}>{item.name}</Link>
                  </li>
                )
              );
            }
            // Render other items normally
            return (
              <li
                className={isActiveLink(item.routePath, pathname) ? "current" : ""}
                key={item.id}
              >
                <Link href={item.routePath}>{item.name}</Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default HeaderNavContent;
