import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LocomotiveScroll from "locomotive-scroll";

const App = () => {
  const locomotiveScroll = new LocomotiveScroll();

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
    </>
  );
};

export default App;
