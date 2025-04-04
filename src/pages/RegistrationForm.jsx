import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../css/RegistrationForm.module.css";

const RegistrationForm = () => {
  const location = useLocation();
  const userEmail = location.state?.email || ""; // Get email from navigation state

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: userEmail, // Initialize email with the value from EmailPage
    contactNumber: "",
    gender: "",
    city: "",
    dob:"",
    age:"",
  });

  const navigate = useNavigate();
  const [cityOptions, setCityOptions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

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

  useEffect(() => {
    let isMounted = true;

    const fetchCities = () => {
      const xhr = new XMLHttpRequest();

      const queryParams = new URLSearchParams({
        objectName: "ABA_City_Master",
        fieldList: "Name",
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
        if (xhr.readyState === 4 && xhr.status === 200 && isMounted) {
          const response = JSON.parse(xhr.responseText);
          console.log("City data:", response);

          const cities = response.map((item) => ({
            id: String(item.RecordID), // Convert id to string
            name: item.Name,
          }));

          setCityOptions(cities);
        }
      };

      xhr.send();
    };

    fetchCities();

    return () => {
      isMounted = false; // Cleanup
    };
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "dob") {
      calculateAge(value);
    }
  };

 
  

  // Add this new function to handle OK button click
  const handlePopupClose = () => {
    setShowPopup(false);
    const firstName = localStorage.getItem("submittedFirstName");
    navigate("/thankyou", { state: { firstName: firstName } });
    localStorage.removeItem("submittedFirstName");
  };


   // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCity = formData.city;
    console.log("Selected city:", selectedCity);
    console.log("City options:", cityOptions);

    const city = cityOptions.find(
      (city) => String(city.id) === String(selectedCity)
    );

    if (!city) {
      console.error("City not found in options");
      alert("Invalid city selected");
      return;
    }

    let isFirstAPISuccessful = false;

    const xhr1 = new XMLHttpRequest();
    const xhr2 = new XMLHttpRequest();
    xhr1.open("POST", "https://ndem.quickappflow.com/api/SaveRecord", true);
    xhr1.setRequestHeader("Content-Type", "application/json");
    xhr2.open("POST","https://ndem.quickappflow.com/api/SaveRecord", true);
    xhr2.setRequestHeader("Content-Type" , "application/json");

    xhr1.onreadystatechange = function () {
      if (xhr1.readyState === 4 && xhr1.status === 200) {
        console.log("First API Success:", xhr1.responseText);
        isFirstAPISuccessful = true;
        
        if(isFirstAPISuccessful) {
          console.log("Second API call happening");

          xhr2.onreadystatechange = function (){
            if(xhr2.readyState === 4 && xhr2.status === 200){
              console.log("Second API success",xhr2.responseText);
              setShowPopup(true);
              setFormData({
                firstName: "",
                lastName: "",
                email: "",
                contactNumber: "",
                gender: "",
                dob: "",
                age: "",
                city: "",
              });
            }
          }
        }

        const submittedFirstName = formData.firstName;
        localStorage.setItem("submittedFirstName", submittedFirstName);
      }
    };

    //  Prepare payload for first API
    const payload = JSON.stringify({
      DrMode: false,
      createdByID: 10,
      lastModifiedBy: 10,
      objectID: "ABA_Customers",
      recordFieldValues: [
        { fieldID: "FirstName", fieldValue: formData.firstName },
        { fieldID: "LastName", fieldValue: formData.lastName },
        { fieldID: "Email", fieldValue: formData.email },
        { fieldID: "ContactNumber", fieldValue: formData.contactNumber },
        { fieldID: "Gender", fieldValue: formData.gender },
        { fieldID: "City", fieldValue: `${city.id};#${city.name}` },
        { fieldID: "DateofBirth", fieldValue: formData.dob },
        { fieldID: "Age", fieldValue: formData.age },
      ],
      recordFieldValuesChild: [],
      recordID: "",
      
    });
    
    // prepare payload2 for second API
    const payload2 = JSON.stringify({
     DrMode : false,
     CreatedById : "",
     lastModifiedBy : "",
     objectID : "QAF_Users",
     recordFieldValues :[
      {fieldInternalName : "UserType" , fieldValue:"Customer_User"},
      {fieldInternalName : "FirstName" , fieldValue: formData.firstName},
      {fieldInternalName : "LastName" , fieldValue: formData.lastName},
      {fieldInternalName : "ContactNumber" , fieldValue: formData.contactNumber},
      {fieldInternalName : "Email" , fieldValue: formData.email},
      {fieldInternalName : "Home" , fieldValue : ""},
      {fieldInternalName : "MobileHomeURL" , fieldValue : ""},
      {fieldInternalName : "Active" , fieldValue: ""},
      {fieldInternalName : "SendWelcomeMail" ,fieldValue: true}
     ],
     recordFieldValuesChild: [],
     recordID : "",
    })

    xhr1.send(payload);
    xhr2.send(payload2);

  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.title}>Customer Registration</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* First Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              First Name<span className={styles.asteric}> *</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your first name"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Last Name<span className={styles.asteric}> *</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your last name"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className={`${styles.input} ${styles.readOnlyInput}`}
              readOnly // Make the field readonly
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Contact Number<span className={styles.asteric}> *</span>
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className={styles.input}
              placeholder="Enter your contact number"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Gender<span className={styles.asteric}> *</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className={styles.input}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Date of Birth<span className={styles.asteric}> *</span>
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Age</label>
            <input
              type="number"
              name="age"
              value={formData.age || ""}
              onChange={handleChange}
              disabled
              className={`${styles.input} ${styles.readOnlyInput}`}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              City<span className={styles.asteric}> *</span>
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              className={styles.input}
            >
              <option value="">Select City</option>
              {cityOptions.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className={styles.submitButton}>
            Register
          </button>
        </form>
      </div>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupCheckmark}>✓</div>
            <p className={styles.popupText}>Registration Successful!</p>
            <button className={styles.popupButton} onClick={handlePopupClose}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
