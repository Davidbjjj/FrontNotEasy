import React from "react";
import HeaderView from "../../presentation/components/HeaderView.jsx";
import BannerSection from "../../presentation/components/BannerSection.jsx";
import StudyPerformance from "../../presentation/components/StudyPerformance.js";
import NotEasyDashboard from "../../presentation/components/NotEasyDashboard.jsx";
import PlanCarousel from "../../presentation/components/PlanCarousel.jsx";
import Footer from "../../presentation/components/Footer.jsx";
const LandingPage = () => {
  return (
    <>
      <HeaderView />
      <BannerSection />
      <StudyPerformance />
      <NotEasyDashboard/>
      <PlanCarousel/>
      <Footer />
    </>
  );
};

export default LandingPage;
