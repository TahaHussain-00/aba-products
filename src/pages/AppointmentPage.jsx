import React, { useState , useRef, useEffect} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes,faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import styles from "../css/AppointmentPage.module.css";
import { useLocation } from "react-router-dom";

const AppointmentPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);
  console.log(email);

  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };  

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside sidebar and hamburger button
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    navigate("/login");
  };

  return (
    <div className={styles.container}>
      {/* Hamburger Icon */}
      <div className={styles.navbar} ref={hamburgerRef}>
        <div className={styles.hamburger} onClick={toggleMenu}>
          <FontAwesomeIcon icon={faBars} />
        </div>
        {/* <h2 className={styles.title}>QuickAppFlow</h2> */}
        <button className={styles.logoutButton} onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} /> Logout
        </button>
      </div>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
      >
        {/* <button className={styles.closeButton} onClick={toggleMenu}>
        <FontAwesomeIcon icon={faTimes} />
      </button> */}
        <nav className={styles.nav}>
          <button
            className={styles.navItem}
            onClick={() => navigate("/appointment", { state: { email } })}
          >
            Appointment
          </button>
          <button
            className={styles.navItem}
            onClick={() => {
              navigate("/profile", { state: { email } });
              setIsOpen(false);
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
