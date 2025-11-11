import React from "react";
import HeaderView from "../../presentation/components/HeaderView.jsx";
import BannerSection from "../../presentation/components/BannerSection.jsx";
import StudyPerformance from "../../presentation/components/StudyPerformance.js";
import NotEasyDashboard from "../../presentation/components/NotEasyDashboard.jsx";
import PlanCarousel from "../../presentation/components/PlanCarousel.jsx";
import Footer from "../../presentation/components/Footer.jsx";
import VerticalNavbar from "../../../VerticalNavbar/presentation/components/VerticalNavbar.tsx";
import TopBarPage from "../../../TopBar/view/pages/TopBarPage.tsx";
import ListarQuestoesPage from "../../../listaQuestoes/view/pages/QuestionListPage.tsx";
import QuestionPage from "../../../question/view/pages/QuestionPage.tsx";
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
