import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../css/ThankYouPage.module.css';

function ThankYouPage() {
  const location = useLocation();
  const firstName = location.state?.firstName || 'Customer';

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.checkmark}>✓</div>
        <h1 className={styles.title}>Thank You, {firstName}!</h1>
        <p className={styles.message}>
        Thank you for joining with us! Our team will reach out soon to learn about your needs and assist you.
        </p>
      </div>
    </div>
  );
}

export default ThankYouPage;
