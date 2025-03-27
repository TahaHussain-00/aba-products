import React from "react";
import RegistrationForm from "./pages/RegistrationForm";
import EmailPage from "./pages/EmailPage";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import ValidatePage from "./pages/ValidatePage";
import ThankYouPage from "./pages/ThankYouPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/CustomerHomePage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EmailPage />} />
        <Route path="/validate" element={<ValidatePage />} />
        <Route path="/register" element={<RegistrationForm />} />
        <Route path="/thankyou" element={<ThankYouPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />}/>
      </Routes>
    </Router>
  );
};

export default App;
