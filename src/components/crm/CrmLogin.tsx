import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

export default function CrmLogin() {
  // If already logged in, redirect to CRM
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.href = "/crm";
    });
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/crm`,
        // Force Google's account chooser instead of silently reusing
        // whichever Google account is currently active in the browser.
        queryParams: { prompt: "select_account" },
      },
    });
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#f7f4ef]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      <div className="pointer-events-none absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full bg-[#c9a96e] opacity-[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-[320px] w-[320px] rounded-full bg-[#c9a96e] opacity-[0.04] blur-[80px]" />

      {/* Left — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between p-16 lg:flex">
        <div />
        <div>
          <p className="font-mulish mb-5 text-[10px] tracking-[0.3em] text-[#b5b0a8] uppercase">
            El Tambo · Huancayo · Peru
          </p>
          <h2
            className="font-tan-pearl text-[64px] leading-[1.02] font-normal text-[#1c1a16]"
            style={{ letterSpacing: "-0.025em" }}
          >
            Live a<br />
            <em className="text-[#c9a96e]">unique</em>
            <br />
            experience.
          </h2>
          <p className="font-manrope mt-6 max-w-xs text-sm leading-relaxed text-[#9e9890]">
            Find the perfect apartment for you in the heart of the city.
          </p>
          <div className="mt-10 flex items-center gap-5">
            <div className="h-px w-12 bg-[#c9a96e] opacity-60" />
            <div className="h-px flex-1 bg-[#dedad4]" />
          </div>
        </div>
        <span className="font-mulish text-[10px] tracking-[0.25em] text-[#c2bdb6] uppercase">
          CRM · Internal Access
        </span>
      </div>

      <div className="hidden w-px bg-[#e8e3db] lg:block" />

      {/* Right — login */}
      <div className="flex w-full flex-col items-center justify-center bg-[#faf8f5] px-8 lg:w-1/2">
        <div className="w-full max-w-[360px]">
          <div className="mb-14 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-[#c9a96e]" />
              <span className="font-mulish text-[10px] tracking-[0.35em] text-[#c9a96e] uppercase">
                Galvez 1519
              </span>
            </div>
          </div>

          <p className="font-mulish mb-2 text-[10px] tracking-[0.3em] text-[#b5b0a8] uppercase">
            Access
          </p>
          <h1
            className="font-tan-pearl mb-2 text-[32px] leading-tight font-normal text-[#1c1a16]"
            style={{ letterSpacing: "-0.015em" }}
          >
            Welcome back
          </h1>
          <p className="font-manrope mb-10 text-sm text-[#9e9890] italic">Sign in to continue</p>

          <button
            onClick={handleLogin}
            className="group relative w-full overflow-hidden border border-[#dedad4] bg-white px-6 py-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-300 hover:border-[#c9a96e]/50 hover:shadow-[0_4px_16px_rgba(201,169,110,0.12)]"
          >
            <span className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-[#c9a96e] transition-all duration-500 group-hover:w-full" />
            <span className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-manrope text-sm text-[#2a2820] transition-colors duration-200 group-hover:text-[#1c1a16]">
                  Continue with Google
                </span>
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#c2bdb6"
                strokeWidth="1.5"
                className="transition-all duration-300 group-hover:translate-x-1 group-hover:stroke-[#c9a96e]"
              >
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#ede9e3]" />
            <p className="font-mulish text-[10px] tracking-[0.2em] text-[#ccc9c3] uppercase">
              Authorized personnel only
            </p>
            <div className="h-px flex-1 bg-[#ede9e3]" />
          </div>
          <p className="font-manrope mt-6 text-center text-[10px] text-[#d4d0ca]">
            © 2026 Galvez 1519. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
