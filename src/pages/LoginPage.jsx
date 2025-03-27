import React, { useState } from "react";
import styles from '../css/LoginPage.module.css';
import ForgotPassword from './ForgotPassword.jsx';
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // For showing login errors
  const [successMessage, setSuccessMessage] = useState(""); // For showing success message
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages

    try {
      const response = await fetch("https://ndem.quickappflow.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Email: email,
          PasswordKey: password,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to login");
      }

      const data = await response.json();

      if (data && data.EmployeeID) {
        // Successful login
        setSuccessMessage(`Welcome, ${data.FirstName} ${data.LastName}!`);
        setShowPopup(true);
      } else {
        // Login failed
        setErrorMessage("Invalid email or password. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again later.");
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    navigate('/home' ,{state: { email }});
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login to Your Account</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">
            Email <span className={styles.asteric}>*</span>
          </label>
          <input
            type="email"
            id="email"
            className={styles.input}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            Password <span className={styles.asteric}>*</span>
          </label>
          <input
            type="password"
            id="password"
            className={styles.input}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {errorMessage && (
          <p className={styles.errorMessage}>{errorMessage}</p>
        )}

        <button type="submit" className={styles.submitButton}>
          Login
        </button>

        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            className={styles.forgotPassword}
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </div>
      </form>

      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupCheckmark}>✓</div>
            <p className={styles.popupText}>{successMessage}</p>
            <button className={styles.popupButton} onClick={closePopup}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
