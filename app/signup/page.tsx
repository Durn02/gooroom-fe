'use client';
import dynamic from "next/dynamic";

const SignupPage = dynamic(() => import("@/lib/pages/signuppage/SignupPage"), { ssr: false });

export default SignupPage