import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/EmailPage.module.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      const response = await fetch("https://ndem.quickappflow.com/api/rgup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
           "Eumail": "faiyaz.kazi@quickappflow.com",
        },
        body: JSON.stringify({ Eumail: email }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();

      if (data.RType === 0) {
        console.log(data);
        setErrorMessage(data.RMcs);
      } else if (data.RType === 1) {
        navigate("/validate", { state: { email } });
      } else {
        alert("Unexpected error from server");
      }
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert("Failed to send the OTP");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to ABA Products</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
            required
          />
          {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        </div>
        <button type="submit" className={styles.submitButton}>
          Continue
        </button>
      </form>
      <a href="/login" className={styles.alreadyCustomerButton}>
        Already a Customer ?
      </a>
    </div>
  );
}

export default LoginPage;