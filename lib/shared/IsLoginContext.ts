'use client';

import { createContext } from "react";
// import { getAccessTokenFromCookie } from "../utils/getAccessTokenFromCookie";

const userId = '' // TODO sessionStorage.getItem("userId");
const access_token = '' // TODO  getAccessTokenFromCookie("access_token");

export const IsLoginContext = createContext({
  isLogin: userId === null && access_token === null ? false : true,
});
