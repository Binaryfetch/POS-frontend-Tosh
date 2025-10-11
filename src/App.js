import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Layout from "./components/Layout";
import CompanyDashboard from "./pages/CompanyDashboard";
import DistributorDashboard from "./pages/DistributorDashboard";
import DealerDashboard from "./pages/DealerDashboard";

function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  if (!token || !user) {
    return <Login setUser={setUser} setToken={setToken} />;
  }

  // Render dashboards based on role
  const renderDashboard = () => {
    switch (user.role) {
      case "Company":
        return <CompanyDashboard />;
      case "Distributor":
        return <DistributorDashboard />;
      case "Dealer":
        return <DealerDashboard />;
      default:
        return <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Unknown Role</h2>
          <p className="text-gray-600">Please contact support</p>
        </div>;
    }
  };

  return (
    <Layout user={user} setUser={setUser} setToken={setToken}>
      {renderDashboard()}
    </Layout>
  );
}

export default App;
