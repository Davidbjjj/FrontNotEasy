import React from "react";
import RouterConfig from "./RouterConfig";

const App = () => {
  return (
    <div style={styles.container}>
      <RouterConfig />
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#fff",
  },
};

export default App;
