import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../css/MyProfilePage.module.css";

function MyProfilePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [cityOptions, setCityOptions] = useState([]);
  const [recordID, setRecordID] = useState("");
  const [qafUserRecordID, setQafUserRecordID] = useState("");

  const [originalData, setOriginalData] = useState(null);
  const email = location.state?.email || "";

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

  useEffect(() => {
    if (location.pathname === "/profile") {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [location.pathname]);

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

  const fetchCities = async () => {
    try {
      const queryParams = new URLSearchParams({
        objectName: "ABA_City_Master",
        fieldList: "RecordID,Name",
        pageSize: 100000,
        pageNumber: 1,
        isAscending: true,
      }).toString();

      const response = await fetch(
        `https://ndem.quickappflow.com/api/rupb?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch cities: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("City data:", data);

      const cities = data.map((item) => ({
        id: String(item.RecordID),
        name: item.Name,
      }));

      setCityOptions(cities);
      return cities;
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
  };

  const fetchUserData = async (email, cities) => {
    try {
      const objectName = "ABA_Customers";
      const fieldList =
        "RecordID,FirstName,LastName,Email,ContactNumber,Gender,DateofBirth,Age,City";
      const whereClause = encodeURIComponent(`Email='${email}'`);
      const url = `https://ndem.quickappflow.com/api/GetRecordsForFields?objectName=${objectName}&fieldList=${fieldList}&whereClause=${whereClause}&pageSize=1000&pageNumber=1&isAscending=true`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("User data:", data);

      if (data && data.length > 0) {
        const user = data[0];
        setRecordID(user.RecordID || "");

        const formatDate = (dateString) => {
          if (!dateString) return "";
          return dateString.split("T")[0];
        };

        console.log("Cities available for mapping:", cities);
        console.log("User city value:", user.City);

        // ✅ Match city GUID with city name directly using passed cities
        // Extract just the GUID part from the City field
        const cityGUIDFromUser = user.City?.split(";#")[0] || "";

        // Match with cityOptions
        const matchedCity =
          cities.find((city) => String(city.id) === cityGUIDFromUser) || {};

        console.log("Mapped city:", matchedCity);

        const fetchedData = {
          firstName: user.FirstName || "",
          lastName: user.LastName || "",
          email: user.Email || "",
          contactNumber: user.ContactNumber || "",
          gender: user.Gender || "",
          dob: formatDate(user.DateofBirth),
          age: user.Age || "",
          city: matchedCity.name || "", // ✅ Set city name from matched city
        };

        setOriginalData(fetchedData);
        setFormData(fetchedData);
      } else {
        console.log("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchQafUserRecordID = async (email) => {
    try {
      const objectName = "QAF_Users";
      const fieldList = "RecordID,Email";
      const whereClause = encodeURIComponent(`Email='${email}'`);
      const url = `https://ndem.quickappflow.com/api/GetRecordsForFields?objectName=${objectName}&fieldList=${fieldList}&whereClause=${whereClause}&pageSize=1000&pageNumber=1&isAscending=true`;
  
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch QAF_Users RecordID: ${response.statusText}`);
      }
  
      const data = await response.json();
      if (data && data.length > 0) {
        setQafUserRecordID(data[0].RecordID || "");
      } else {
        console.warn("No QAF_Users record found for email:", email);
      }
    } catch (error) {
      console.error("Error fetching QAF_Users RecordID:", error);
    }
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching cities...");
        const cities = await fetchCities();
        console.log("Cities fetched:", cities);

        if (cities.length > 0) {
          console.log("Fetching user data...");
          await fetchUserData(email, cities);
           await fetchQafUserRecordID(email); 
          console.log(email);
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    if (showForm) {
      fetchData();
    }
  }, [showForm]);

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

      setFormData((prev) => ({ ...prev, age: age.toString() }));
    }
  };

  const handleSave = () => {
    try {
      const url = "https://ndem.quickappflow.com/api/UpdateRecord";
      const url2 = "https://ndem.quickappflow.com/api/UpdateRecord";

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

      const requestBody2 = JSON.stringify({
        DrMode: false,
        objectID: "QAF_Users",
        recordID : qafUserRecordID,
        recordFieldValues: [
          { fieldInternalName: "UserType", fieldValue: "Customer_User" },
          { fieldInternalName: "FirstName", fieldValue: formData.firstName },
          { fieldInternalName: "LastName", fieldValue: formData.lastName },
          {fieldInternalName: "ContactNumber",fieldValue: formData.contactNumber},
          { fieldInternalName: "Email", fieldValue: formData.email },
          { fieldInternalName: "Home", fieldValue: "" },
          { fieldInternalName: "MobileHomeURL", fieldValue: "" },
          { fieldInternalName: "Active", fieldValue: "" },
          { fieldInternalName: "SendWelcomeMail", fieldValue: false },
        ],
        recordFieldValuesChild: [],
      });

      console.log("Save Request Body:", requestBody);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log("First API Success Update Record", xhr.responseText);
          const xhr2 = new XMLHttpRequest();
          xhr2.open("POST", url2, true);
          xhr2.setRequestHeader("Content-Type", "application/json");

          xhr2.onload = () => {
            if (xhr2.status === 200) {
              console.log("Second Update Success:", xhr2.responseText);
              alert("Profile updated successfully in both repositories!");
            } else {
              console.error("Second Update Failed:", xhr2.statusText);
              alert("Failed to update profile in the second repository.");
            }
          };

          xhr2.onerror = () => {
            console.error("Error in second API call:", xhr2.statusText);
            alert("Error occurred while updating the second repository.");
          };

          xhr2.send(requestBody2);
        } else {
          console.error("First Update Failed:", xhr1.statusText);
          alert("Failed to update profile in the first repository.");
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
        <h2 className={styles.title}>Aba-Products</h2>
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

      {/* Form */}
      {showForm && (
        <div className={styles.formContainer}>
          <h2>My Profile</h2>
          <form className={styles.form}>
            {/* First Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                First Name <span className={styles.asteric}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                name="firstName"
                value={formData.firstName}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Last Name */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Last Name <span className={styles.asteric}>*</span>
              </label>
              <input
                type="text"
                className={styles.input}
                name="lastName"
                value={formData.lastName}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Email <span className={styles.asteric}>*</span>
              </label>
              <input
                type="email"
                className={styles.input}
                name="email"
                value={formData.email}
                readOnly
              />
            </div>

            {/* Contact Number */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Contact Number <span className={styles.asteric}>*</span>
              </label>
              <input
                type="tel"
                className={styles.input}
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Gender */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Gender</label>
              <select
                className={styles.input}
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Date of Birth <span className={styles.asteric}>*</span>
              </label>
              <input
                type="date"
                className={styles.input}
                name="dob"
                value={formData.dob}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Age */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Age</label>
              <input
                type="number"
                className={styles.input}
                name="age"
                value={formData.age}
                readOnly
              />
            </div>

            {/* City */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                City <span className={styles.asteric}>*</span>
              </label>
              <div className={styles.cityInput}>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  className={styles.input}
                  required
                >
                  <option value="">Select City </option>
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
                      setFormData({ ...formData, city: "" });
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
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default MyProfilePage;
