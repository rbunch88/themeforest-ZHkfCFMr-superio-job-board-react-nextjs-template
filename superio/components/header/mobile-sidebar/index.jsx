"use client";

import { useState, useEffect } from 'react';
import { createClient } from '../../../utils/supabase/client';
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

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
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
            setProfile(null);
          } else {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error fetching profile:', error.message);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    };

    fetchData();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, updatedSession) => {
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

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

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
                session && profile?.role === 'employer' && (
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