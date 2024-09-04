import React from "react";
import Landing from "./pages/landingpage/LandingPage";
import Signin from "./pages/signinpage/SigninPage";
import Signup from "./pages/signuppage/SignupPage";
import NoPage from "./pages/nopage/NoPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { IsLoginProvider } from "./shared/IsLoginProvider";

function App() {
  return (
    <IsLoginProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/*" element={<NoPage />} />
        </Routes>
      </BrowserRouter>
    </IsLoginProvider>
  );
}

export default App;
