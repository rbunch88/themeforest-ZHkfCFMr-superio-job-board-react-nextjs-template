"use client";

import Link from "next/link";
// Import the default export from mainMenuData
import mainMenuData from "../../data/mainMenuData";
// Keep isActiveLink for styling the current page link
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname } from "next/navigation";

const HeaderNavContent = () => {
  const pathname = usePathname(); // Get the current path

  return (
    <>
      <nav className="nav main-menu">
        <ul className="navigation" id="navbar">
          {/* Iterate over the simplified mainMenuData array */}
          {mainMenuData.map((item) => (
            <li
              // Apply 'current' class if the link matches the current path
              className={isActiveLink(item.routePath, pathname) ? "current" : ""}
              key={item.id}
            >
              <Link href={item.routePath}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default HeaderNavContent;
