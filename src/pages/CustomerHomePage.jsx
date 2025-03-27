import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import styles from "../css/CustomerHomePage.module.css";
import { useLocation } from "react-router-dom";

const Home = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [recordID, setRecordID] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    gender: "",
    dob: "",
    age: "",
    city: "",
  });

  const toggleMenu = () => {
    setIsOpen((prevIsOpen) => {
      const newIsOpen = !prevIsOpen;
      if (newIsOpen) {
        fetchUserData(email);
      } 
      return newIsOpen;
    });
  };

  const calculateAge = (dob) => {
    if (dob) {
      const today = new Date();
      const birthDate = new Date(dob);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      setFormData((prevData) => ({
        ...prevData,
        age: age.toString(),
      }));
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || "",
    }));
    if (name === "dob") {
      calculateAge(value);
    }
  };

  // ✅ Fetch cities and store them in state
  const fetchCities = () => {
    const xhr = new XMLHttpRequest();

    const queryParams = new URLSearchParams({
      objectName: "ABA_City_Master",
      fieldList: "RecordID,Name", // ✅ Include RecordID to map GUID with city name
      pageSize: 100000,
      pageNumber: 1,
      isAscending: true,
    }).toString();

    xhr.open(
      "GET",
      `https://ndem.quickappflow.com/api/rupb?${queryParams}`,
      true
    );
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log("City data:", response);

        const cities = response.map((item) => ({
          id: String(item.RecordID),
          name: item.Name,
        }));

        setCityOptions(cities);
      }
    };

    xhr.send();
  };

  //  Fetch user data and map city GUID to city name
  const [originalData, setOriginalData] = useState(null);
  const fetchUserData = (email) => {
    try {
      const objectName = "ABA_Customers";
      const fieldList =
        "RecordID,FirstName,LastName,Email,ContactNumber,Gender,DateofBirth,Age,City";
      const whereClause = encodeURIComponent(`Email='${email}'`);
      const pageSize = 1000;
      const pageNumber = 1;
      const isAscending = true;
  
      const url =
        `https://ndem.quickappflow.com/api/GetRecordsForFields?` +
        `objectName=${objectName}` +
        `&fieldList=${fieldList}` +
        `&whereClause=${whereClause}` +
        `&pageSize=${pageSize}` +
        `&pageNumber=${pageNumber}` +
        `&isAscending=${isAscending}`;
  
      console.log("Request URL:", url);
  
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
  
      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log("API Response:", data);
  
          if (data && data.length > 0) {
            const user = data[0];
            setRecordID(user.RecordID || "");
  
            const formatDate = (dateString) => {
              if (!dateString) return "";
              return dateString.split("T")[0];
            };
  
            const matchedCity =
              cityOptions.find((city) => city.id === user.City) || {};
  
            const fetchedData = {
              firstName: user.FirstName || "",
              lastName: user.LastName || "",
              email: user.Email || "",
              contactNumber: user.ContactNumber || "",
              gender: user.Gender || "",
              dob: formatDate(user.DateofBirth),
              age: user.Age || "",
              city: matchedCity.name || "",
              RecordId: user.RecordID || "",
            };
  
            // ✅ Save original data
            setOriginalData(fetchedData);
            // ✅ Set form data
            setFormData(fetchedData);
          } else {
            console.log("No user data found");
          }
        } else {
          console.error("Failed to fetch user data:", xhr.statusText);
        }
      };
  
      xhr.onerror = () => {
        console.error("Error fetching user data:", xhr.statusText);
      };
  
      xhr.send();
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  

  // ✅ Use ref to avoid multiple fetches
  const isFetched = React.useRef(false);

  useEffect(() => {
    if (!isFetched.current) {
      isFetched.current = true;
      fetchCities(); // ✅ First, fetch city options
    }
  }, []);

  // ✅ Fetch user data AFTER cities are loaded
  const [isManualEdit, setIsManualEdit] = useState(false);
  const handleCityChange = (value) => {
    setFormData((prev) => ({ ...prev, city: value }));
    setIsManualEdit(true); // ✅ Mark as manual edit
  };
  useEffect(() => {
    if (cityOptions.length > 0 && !isManualEdit) {
      fetchUserData(email);
    }
  }, [cityOptions]);

  const handleSave = () => {
    try {
      const url = "https://ndem.quickappflow.com/api/UpdateRecord";

      // ✅ Map formData fields to the expected format
      const selectedCity = cityOptions.find(
        (city) => city.name === formData.city
      );
      const cityGUID = selectedCity ? selectedCity.id : "";

      const requestBody = JSON.stringify({
        recordID,
        recordFieldValues: [
          {
            fieldInternalName: "FirstName",
            fieldValue: formData.firstName,
          },
          {
            fieldInternalName: "LastName",
            fieldValue: formData.lastName,
          },
          {
            fieldInternalName: "Email",
            fieldValue: formData.email,
          },
          {
            fieldInternalName: "ContactNumber",
            fieldValue: formData.contactNumber,
          },
          {
            fieldInternalName: "Gender",
            fieldValue: formData.gender,
          },
          {
            fieldInternalName: "DateofBirth",
            fieldValue: formData.dob,
          },
          {
            fieldInternalName: "City",
            fieldValue: cityGUID,
          },
        ],
        objectID: "ABA_Customers",
      });

      console.log("Save Request Body:", requestBody);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log("Save Success:", xhr.responseText);
          alert("Profile saved successfully!");
        } else {
          console.error("Save Failed:", xhr.statusText);
          alert("Failed to save profile.");
        }
      };

      xhr.onerror = () => {
        console.error("Error saving profile:", xhr.statusText);
        alert("Error occurred while saving profile.");
      };

      xhr.send(requestBody);
    } catch (error) {
      console.error("Error in handleSave:", error);
      alert("Unexpected error occurred.");
    }
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setShowForm(false);
  };

  // Add useRef for the sidebar
  const sidebarRef = React.useRef(null);

  // Add click handler for outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.closest(`.${styles.hamburger}`)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* Hamburger Icon */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBars} />
      </div>

      {/* Sidebar - Add ref here */}
      <div ref={sidebarRef} className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeButton} onClick={toggleMenu}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <nav className={styles.nav}>
          <button
            onClick={() => {
              setShowForm(false);
            }}
            className={styles.navItem}
          >
            Appointment
          </button>
          <button 
            className={styles.navItem} 
            onClick={() => {
              fetchUserData(email);  // Fetch fresh data
              setShowForm(true);     // Show the form
            }}
          >
            My Profile
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        
        {showForm ? (
          <div className={styles.formContainer}>
            <h2>My Profile</h2>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              {/* First Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  className={styles.input}
                  required
                />
              </div>

              {/* Last Name */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  className={styles.input}
                  required
                />
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className={styles.input}
                  required
                  readOnly
                />
              </div>

              {/* Contact Number */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Contact Number *</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleFormChange}
                  className={styles.input}
                  required
                />
              </div>

              {/* Gender */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormChange}
                  className={styles.input}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleFormChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  readOnly
                  onChange={handleFormChange}
                  className={styles.input}
                />
              </div>

              {/* City */}
              {/* City */}
              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <div className={styles.cityInput}>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    className={styles.input}
                  >
                    <option value="">Select City</option>
                    {cityOptions.map((city) => (
                      <option key={city.id} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {formData.city && (
                    <FontAwesomeIcon
                      icon={faTimes}
                      className={styles.clearIcon}
                      onClick={() => {
                        setFormData({ ...formData, city: "" }); // ✅ Just clear the field, no need to refetch
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={styles.saveButton}
                  onClick={handleSave}
                >
                  Save
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <h1>Home Page</h1>
            <p>This is the home page content.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;