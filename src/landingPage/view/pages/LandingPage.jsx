import React from "react";
import HeaderView from "../../presentation/components/HeaderView.jsx";
import BannerSection from "../../presentation/components/BannerSection.jsx";
import FeaturesSection from "../../presentation/components/FeaturesSection.jsx";
import StudyPerformance from "../../presentation/components/StudyPerformance.js";
import NotEasyDashboard from "../../presentation/components/NotEasyDashboard.jsx";
import PlanCarousel from "../../presentation/components/PlanCarousel.jsx";
import FaqSection from "../../presentation/components/FaqSection.jsx";
import Footer from "../../presentation/components/Footer.jsx";
const LandingPage = () => {
  return (
    <>
      <HeaderView />
      <BannerSection />
      <FeaturesSection />
      <section id="conheca">
        <StudyPerformance />
        <NotEasyDashboard/>
      </section>
      <section id="planos">
        <PlanCarousel/>
      </section>
      <FaqSection />
      <Footer />
    </>
  );
};

export default LandingPage;
