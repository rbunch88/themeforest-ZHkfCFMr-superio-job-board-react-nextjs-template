"use client";

import Link from "next/link";
import { useState, useEffect } from 'react';
import { createClient } from '../../utils/supabase/client';
// Import the default export from mainMenuData
import mainMenuData from "../../data/mainMenuData";
// Keep isActiveLink for styling the current page link
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname } from "next/navigation";

const HeaderNavContent = () => {
  const pathname = usePathname(); // Get the current path
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession(); // Renamed to avoid conflict
      setSession(currentSession);

      if (currentSession?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error.message);
            setProfile(null); // Handle error case
          } else {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error fetching profile:', error.message);
          setProfile(null);
        }
      } else {
        setProfile(null); // No user, no profile
      }
    };

    fetchData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, updatedSession) => { // Renamed to avoid conflict
        setSession(updatedSession);
        if (updatedSession?.user) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', updatedSession.user.id)
              .single();

            if (error) {
              console.error('Error fetching profile on auth change:', error.message);
              setProfile(null);
            } else {
              setProfile(data);
            }
          } catch (error) {
            console.error('Error fetching profile on auth change:', error.message);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]); // Add supabase as dependency


  return (
    <>
      <nav className="nav main-menu">
        <ul className="navigation" id="navbar">
          {/* Iterate over the simplified mainMenuData array */}
          {mainMenuData.map((item) => {
            // Conditionally render the 'Candidates' item
            if (item.name === 'Candidates') {
              return (
                session && profile?.role === 'employer' && (
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
