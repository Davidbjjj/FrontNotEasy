import React from "react";
import RouterConfig from "./RouterConfig";
import MainLayout from "./listMain/presentation/components/MainLayout";

const App = () => {
  return (
    <MainLayout>
      <RouterConfig />
    </MainLayout>
  );
};

export default App;
