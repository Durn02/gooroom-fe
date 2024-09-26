'use client';

import React, { useState, useMemo } from "react";
// import { getAccessTokenFromCookie } from "../utils/getAccessTokenFromCookie";
import { IsLoginContext } from "./IsLoginContext";

interface IsLoginProviderProps {
  children: React.ReactNode;
}

const userId = '' // TODO sessionStorage.getItem("userId");
const access_token = '' // TODO getAccessTokenFromCookie("access_token");

export function IsLoginProvider({ children }: IsLoginProviderProps) {
  const [isLogin, setIsLogin] = useState(
    userId === null && access_token === null ? false : true
  );

  const value = useMemo(() => ({ isLogin, setIsLogin }), [isLogin, setIsLogin]);

  return (
    <IsLoginContext.Provider value={value}>{children}</IsLoginContext.Provider>
  );
}
