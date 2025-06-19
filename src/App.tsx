import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import AppRoutes from "./routes";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-[#0f1123] text-white">
          <AppRoutes />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
