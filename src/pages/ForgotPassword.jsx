import React, { useState } from "react";
import styles from "../css/ForgotPassword.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [isEmailsent, setIsEmailsent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  
    setErrorMessage(""); // Clear previous error messages
  
    const xhr = new XMLHttpRequest();
    const url = `https://ndem.quickappflow.com/api/Skrm?email=${email}`;
  
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
  
    xhr.onload = () => {
      if (xhr.status === 200) {
        setIsEmailsent(true);
      } else if (xhr.status === 404) {
        setErrorMessage("Email ID could not be found!");
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setErrorMessage(data?.message || "Failed to send reset email");
        } catch (error) {
          setErrorMessage("Failed to send reset email");
        }
      }
    };
  
    xhr.onerror = () => {
      console.error("An error occurred while sending the request");
      setErrorMessage("An error occurred. Please try again.");
    };
  
    xhr.send();
  };
  

  if (isEmailsent) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Reset Password</h1>
        <div className={`${styles.form} ${styles.centerAlign}`}>
          <div className={styles.successMessage}>
            <div
              className={`${styles.popupCheckmark} ${styles.successCheckmark}`}
            >
              <FontAwesomeIcon   className={styles.successIcon}   icon={faCheckCircle} />
            </div>
            <p className={styles.resetInstructions}>
              <strong>
                Please check your email account for changing the password.
              </strong>
            </p>
          </div>
          <button
            type="button"
            className={styles.submitButton}
            onClick={onBackToLogin}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Reset Password</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <p className={styles.instructionText}>
          Enter your email address below. We'll send you instructions to reset
          your password.
        </p>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">
            Email <span className={styles.asteric}>*</span>
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Error Popup */}
        {errorMessage && (
          <div className={styles.errorPopup}>
            <FontAwesomeIcon icon={faExclamationCircle} />
            <span>{errorMessage}</span>
          </div>
        )}

        <button type="submit" className={styles.submitButton}>
          Reset Password
        </button>
        <button
          type="button"
          onClick={onBackToLogin}
          className={styles.linkButton}
        >
          Back to Login
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
