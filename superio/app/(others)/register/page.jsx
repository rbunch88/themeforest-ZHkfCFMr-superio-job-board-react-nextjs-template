'use client';

import dynamic from "next/dynamic";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from "@/utils/supabase/client";

// Remove metadata export as it's not allowed in Client Components
// export const metadata = {
//   title: "Register | My ABA Jobs",
//   description: "Create your My ABA Jobs account. Register as a job seeker or an employer to get started.",
// }

const RegisterPage = () => {
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
            view="sign_up"
            showLinks={true}
            onlyThirdPartyProviders={false}
        />
    </div>
  );
};

export default dynamic(() => Promise.resolve(RegisterPage), { ssr: false });
