import React, { useState } from "react";
import styles from "../css/ValidatePage.module.css";
import { useLocation, useNavigate } from "react-router-dom";

function ValidatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const handleChange = (e) => {
    setOtp(e.target.value);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrorMessage("Please enter the OTP");
      return;
    }

    try {
      const response = await fetch("https://ndem.quickappflow.com/api/rguv", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          Eumail: email,
          Duc: otp,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      const data = await response.json();
      if (data.RType === 0) {
        setErrorMessage(data.RMcs);
      } else if (data.RType === 1) {
        navigate("/register" ,{state :{email }});
      } else {
        setErrorMessage("Unexpected error from server");
      }
    } catch (error) {
      console.error("Failed to verify OTP", error);
      setErrorMessage("Falied to verify OTP. Please try again.");
    }
  };
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Check Your Email</h2>

      <p>
        A confirmation code was sent 
        <br />
        to {email}
      </p>

      <p className={styles.msg}>Enter confirmation code to register your account</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.input}
          value={otp}
          onChange={handleChange}
        />
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <button type="submit" className={styles.submitButton}>
          Verify
        </button>
      </form>
      
      <p className={styles.noEmailText}>
        Haven't received the email from us yet ?
      </p>
      <p 
        className={styles.changeEmail}
        onClick={() => navigate("/")}
      >
        Change email address
      </p>
    </div>
  );
}

export default ValidatePage;
