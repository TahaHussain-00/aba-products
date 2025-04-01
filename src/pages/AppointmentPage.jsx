import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import styles from "../css/CustomerHomePage.module.css";
import { useLocation } from "react-router-dom";

const AppointmentPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ""; 
  console.log(email)

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={styles.container}>
      {/* Hamburger Icon */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} />
      </div>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeButton} onClick={toggleMenu}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <nav className={styles.nav}>
          <button
            className={styles.navItem}
            onClick={() => {
              toggleMenu();
              navigate("/appointment" ,{state:{email}});
            }}
          >
            Appointment
          </button>
          <button
            className={styles.navItem}
            onClick={() => {
              toggleMenu();
              navigate("/profile" ,{state:{email}});
            }}
          >
            My Profile
          </button>
        </nav>
      </div>

      {/* Page Content */}
      <div className={styles.mainContent}>
        <h2>Appointment Page</h2>
        {/* Add your appointment-specific content here */}
      </div>
    </div>
  );
};

export default AppointmentPage;
