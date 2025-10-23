import React from "react";
import HeaderView from "../../presentation/components/HeaderView.jsx";
import BannerSection from "../../presentation/components/BannerSection.jsx";
import StudyPerformance from "../../presentation/components/StudyPerformance.js";
import NotEasyDashboard from "../../presentation/components/NotEasyDashboard.jsx";
const LandingPage = () => {
  return (
    <>
      <HeaderView />
      <BannerSection />
      <StudyPerformance />
      <NotEasyDashboard/>
    </>
  );
};

export default LandingPage;
