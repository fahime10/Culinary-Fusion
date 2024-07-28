import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "./Dialog";
import { jwtDecode } from "jwt-decode";

const UserProfile = () => {
    const [nameTitle, setNameTitle] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [passcode, setPasscode] = useState("");

    const [dietaryPreferences, setDietaryPreferences] = useState({
        "Vegetarian": false,
        "Vegan": false,
        "Pescatarian": false,
        "Gluten-free": false,
        "Dairy-free": false,
        "Low carb": false,
        "High protein": false,
        "Paleo": false,
        "Halal": false,
        "Kosher": false,
        "Low sodium": false,
        "Sugar free": false,
        "Nut-Free": false,
        "Soy-free": false,
        "Low FODMAP": false,
        "Whole30": false,
        "Raw food": false,
        "Anti-inflammatory": false,
        "Lactose-free": false
    });

    const [categories, setCategories] = useState({
        "Appetizer": false,
       "Salad": false,
       "Soup": false,
       "Main Course": false,
       "Side dish": false,
       "Dessert": false,
       "Beverage": false, 
       "Breads": false,
       "Snack": false,
       "Halal": false,
       "Kosher": false,
       "Sandwich": false,
       "Pasta and Noodles": false,
       "Rice and Grains": false,
       "Vegetarian": false,
       "Vegan": false,
       "Gluten-free": false,
       "Dairy-free": false,
       "Low carb": false,
       "High protein": false,
       "Quick and Easy": false,
       "One Pot Meal": false,
       "Barbecue": false
    });
 
    const [cuisineTypes, setCuisineTypes] = useState({
        "Italian": false,
        "Mexican": false,
        "Chinese": false,
        "Indian": false,
        "Japanese": false,
        "French": false,
        "English": false,
        "Thai": false,
        "Greek": false,
        "Spanish": false,
        "Mediterranean": false,
        "Korean": false,
        "Vietnamese": false,
        "Lebanese": false,
        "Moroccan": false,
        "Caribbean": false
    });

    const [allergies, setAllergies] = useState({
        "Celery": false,
        "Cereals containing gluten": false,
        "Crustaceans (prawns, crabs, lobster)": false,
        "Eggs": false,
        "Milk": false,
        "Fish": false,
        "Lupin": false,
        "Molluscs": false,
        "Mustard": false,
        "Peanuts": false,
        "Sesame": false,
        "Soybeans": false,
        "Sulphur dioxide": false,
        "Tree nuts (almonds, hazelnuts, walnuts, ...)": false
    });

    const [isNotEnabled, setIsNotEnabled] = useState(true);
    const [dialog, setDialog] = useState(false);

    const [message, setMessage] = useState("");
    const messageRef = useRef(null);
    const [error, setError] = useState("");
    const errorRef = useRef(null);

    const dietararyPreferencesRef = useRef(dietaryPreferences);
    const categoriesRef = useRef(categories);
    const cuisineTypesRef = useRef(cuisineTypes);
    const allergiesRef = useRef(allergies);

    const navigate = useNavigate();

    useEffect(() => {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            fetch(`http://localhost:9000/api/users/${userDetails.username}`, {
                method: "POST"
            })
            .then((res) => res.json())
            .then((res) => {
                setNameTitle(res.name_title);
                setFirstName(res.first_name);
                setLastName(res.last_name);
                setUsername(res.username);
                
                const dietaryPreferencesCheckedBoxes = { ...dietaryPreferences };
                res.dietary_preferences.forEach(dietaryPreference => {
                    if (Object.prototype.hasOwnProperty.call(dietaryPreferencesCheckedBoxes, dietaryPreference)) {
                        dietaryPreferencesCheckedBoxes[dietaryPreference] = true;
                    }
                });
                setDietaryPreferences(dietaryPreferencesCheckedBoxes);
                dietararyPreferencesRef.current = dietaryPreferencesCheckedBoxes;
    
                const categoriesCheckedBoxes = { ...categories };
                res.preferred_categories.forEach(category => {
                    if (Object.prototype.hasOwnProperty.call(categoriesCheckedBoxes, category)) {
                        categoriesCheckedBoxes[category] = true;
                    }
                });
                setCategories(categoriesCheckedBoxes);
                categoriesRef.current = categoriesCheckedBoxes;
    
                const cuisineTypesCheckedBoxes = { ...cuisineTypes };
                res.preferred_cuisine_types.forEach(cuisineType => {
                    if (Object.prototype.hasOwnProperty.call(cuisineTypesCheckedBoxes, cuisineType)) {
                        cuisineTypesCheckedBoxes[cuisineType] = true;
                    }
                });
                setCuisineTypes(cuisineTypesCheckedBoxes);
                cuisineTypesRef.current = cuisineTypesCheckedBoxes;
    
                const allergiesCheckedBoxes = { ...allergies };
                res.allergies.forEach(allergy => {
                    if (Object.prototype.hasOwnProperty.call(allergiesCheckedBoxes, allergy)) {
                        allergiesCheckedBoxes[allergy] = true;
                    }
                });
                setAllergies(allergiesCheckedBoxes);
                allergiesRef.current = allergiesCheckedBoxes;
            })
            .catch(err => console.log(err));
        }

    }, [setUsername]);

    useEffect(() => {
        if (message) {
            messageRef.current.style.display = "block";
        } else {
            messageRef.current.style.display = "none";
        }

        if (error) {
            errorRef.current.style.display = "block";
        } else {
            errorRef.current.style.display = "none";
        }

    }, [message, error]);

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return null;
    }

    function handleNameTitle(e) {
        setNameTitle(e.target.value);
    }

    function handleFirstName(e) {
        setFirstName(e.target.value);
    }

    function handleLastName(e) {
        setLastName(e.target.value);
    }

    function handleUsername(e) {
        setUsername(e.target.value);
    }

    function handlePasscode(e) {
        setPasscode(e.target.value);
    }

    function handleCheckboxChange(group, name) {
        switch(group) {
            case "dietaryPreferences":
                setDietaryPreferences(prevState => ({
                    ...prevState,
                    [name]: !prevState[name]
                }));
                break;
            case "categories":
                setCategories(prevState => ({
                    ...prevState,
                    [name]: !prevState[name]
                }));
                break;
            case "cuisineTypes":
                setCuisineTypes(prevState => ({
                    ...prevState,
                    [name]: !prevState[name]
                }));
                break;
            case "allergies":
                setAllergies(prevState => ({
                    ...prevState,
                    [name]: !prevState[name]
                }));
                break;
            default:
                break;
        }
    }

    function toggleEnabled(e) {
        setIsNotEnabled(!isNotEnabled);

        if (!isNotEnabled) {
            e.target.textContent = "Edit: Off";
            e.target.style.backgroundColor = "red";
        } else {
            e.target.textContent = "Edit: On";
            e.target.style.backgroundColor = "green";
        }
    }

    function handleEdit(event) {
        event.preventDefault();

        const userDetails = retrieveUserDetails();

        if (userDetails) {
            const selectedDietaryPreferences = Object.keys(dietaryPreferences).filter(key => dietaryPreferences[key]);
            const selectedCategories = Object.keys(categories).filter(key => categories[key]);
            const selectedCuisineTypes = Object.keys(cuisineTypes).filter(key => cuisineTypes[key]);
            const selectedAllergens = Object.keys(allergies).filter(key => allergies[key]);

            const data = {
                name_title: nameTitle,
                first_name: firstName,
                last_name: lastName,
                username: username,
                passcode: passcode,
                dietary_preferences: selectedDietaryPreferences,
                preferred_categories: selectedCategories,
                preferred_cuisine_types: selectedCuisineTypes,
                allergies: selectedAllergens
            }

            fetch(`http://localhost:9000/api/users/edit-user/${userDetails.username}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then((res) => res.json())
            .then((res) => {
                if (res.error) {
                    setMessage("");
                    setError(res.error);
                } else {
                    setError("");
                    setMessage(res.message);
                    sessionStorage.setItem("token", res.token);
                    sessionStorage.setItem("editedUser", true);
                }
            })
            .catch(err => console.log(err));
        }
        
    }

    function toggleDialog() {
        setDialog(!dialog);
    }

    function handleDelete() {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            fetch(`http://localhost:9000/api/users/delete-user/${userDetails.username}`, {
                method: "DELETE"
            })
            .then((res) => {
                console.log(res);
                if (res.status === 204) {
                    sessionStorage.removeItem("username");
                    sessionStorage.removeItem("last_name");
                    sessionStorage.removeItem("name_title");
                    navigate("/");
    
                } else {
                    return res.json();
                }
            })
            .then((res) => {
                if (res && res.error) {
                    console.log(res.error);
                }
            })
            .catch(err => console.log(err));
        }
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">User Profile</h1>
            </div>
            <div className="edit-user">
                <button type="button" id="toggleButton" className="edit-button" onClick={(e) => toggleEnabled(e)}>Edit: Off</button>
                <form className="forms" onSubmit={(event) => handleEdit(event)}>
                    <select value={nameTitle} onChange={handleNameTitle} required={true} disabled={isNotEnabled}>
                        <option value="" disabled>Please select an option</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Miss">Miss</option>
                        <option value="Dr">Dr</option>
                        <option value="Chef">Chef</option>
                    </select>
                    <label>First name:
                        <input
                            type="text"
                            name="first-name"
                            required={true}
                            value={firstName}
                            minLength={1}
                            maxLength={50}
                            onChange={handleFirstName}
                            disabled={isNotEnabled}
                        />
                    </label>
                    <label>Last name:
                        <input
                            type="text"
                            name="last-name"
                            required={true}
                            value={lastName}
                            minLength={1}
                            maxLength={50}
                            onChange={handleLastName}
                            disabled={isNotEnabled}
                        />
                    </label>
                    <div ref={errorRef} style={{ display: "none", color: "red" }}>
                        <p>{error}</p>
                    </div>
                    <label>Username:
                        <input
                            type="text"
                            name="username"
                            required={true}
                            value={username}
                            minLength={3}
                            maxLength={20}
                            onChange={handleUsername}
                            disabled={isNotEnabled}
                        />
                    </label>
                    <label>
                        If you have forgotten your passcode, you can input a new one here:
                        <input
                            type="text"
                            name="passcode"
                            onChange={handlePasscode}
                            disabled={isNotEnabled}
                        />
                    </label>
                    <div className="box">
                        <div className="box-title">Dietary preferences:</div>
                        <div className="checkboxes">
                            {Object.keys(dietaryPreferences).map(dietaryPreference => (
                                <label key={dietaryPreference}>
                                    <input 
                                        type="checkbox"
                                        checked={dietaryPreferences[dietaryPreference]}
                                        onChange={() => handleCheckboxChange("dietaryPreferences", dietaryPreference)}
                                        disabled={isNotEnabled}
                                    />
                                    {dietaryPreference}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="box">
                        <div className="box-title">Category preferences:</div>
                        <div className="checkboxes">
                            {Object.keys(categories).map(category => (
                                <label key={category}>
                                    <input 
                                        type="checkbox"
                                        checked={categories[category]}
                                        onChange={() => handleCheckboxChange("categories", category)}
                                        disabled={isNotEnabled}
                                    />
                                    {category}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="box">
                        <div className="box-title">Preferred cuisine types:</div>
                        <div className="checkboxes">
                            {Object.keys(cuisineTypes).map(cuisineType => (
                                <label key={cuisineType}>
                                    <input 
                                        type="checkbox"
                                        checked={cuisineTypes[cuisineType]}
                                        onChange={() => handleCheckboxChange("cuisineTypes", cuisineType)}
                                        disabled={isNotEnabled}
                                    />
                                    {cuisineType}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="box">
                        <div className="box-title">Any allergies:</div>
                        <div className="checkboxes">
                            {Object.keys(allergies).map(allergy => (
                                <label key={allergy}>
                                    <input 
                                        type="checkbox"
                                        checked={allergies[allergy]}
                                        onChange={() => handleCheckboxChange("allergies", allergy)}
                                        disabled={isNotEnabled}
                                    />
                                    {allergy}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div ref={messageRef} style={{ display: "none", color: "green" }}>
                        <p>{message}</p>
                    </div>
                    <button disabled={isNotEnabled}>Save</button>
                    <button type="button" onClick={() => navigate(-1)}>Back</button>
                    <button type="button" onClick={toggleDialog}>Delete account</button>
                    <Dialog
                        isOpen={dialog} 
                        onClose={toggleDialog} 
                        title="Attention" 
                        content="Are you sure you want to delete your account?"
                        funct={handleDelete}
                    >
                    </Dialog>
                </form>
            </div>
        </>
    );
};

export default UserProfile;