'use client';

import dynamic from "next/dynamic";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from "@/utils/supabase/client";

// Remove metadata export as it's not allowed in Client Components
// export const metadata = {
//   title: "Login | My ABA Jobs",
//   description: "Login to your My ABA Jobs account to manage job postings or your candidate profile.",
// }

const LoginPage = () => {
  const supabase = createClient();
  // Use the planned callback URL
  const redirectURL = '/auth/callback';

  return (
    <div style={{ maxWidth: '420px', margin: '96px auto' }}>
        <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            redirectTo={redirectURL} // Ensure this uses the updated variable
            view="sign_in"
            showLinks={true}
            onlyThirdPartyProviders={false}
        />
    </div>
  );
};

export default dynamic(() => Promise.resolve(LoginPage), { ssr: false });
