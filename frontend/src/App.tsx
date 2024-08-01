import React from "react";
import Landing from "./pages/landingpage/LandingPage";
import Signin from "./pages/signinpage/SigninPage";
import NoPage from "./pages/nopage/NoPage";
import Main from "./pages/mainpage/MainPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/main" element={<Main />} />
        <Route path="/*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
