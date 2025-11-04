import React from "react";
import { DashboardPage } from "../../dashboard/views/dashboardPage";
import { Link } from "react-router-dom"

const DashboardComponent = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <DashboardPage /> {/* aqui você mostra a página */}
    </div>
  );
};

export default DashboardComponent;
