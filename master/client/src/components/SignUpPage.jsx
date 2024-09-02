import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const SignUpPage = () => {
    const [nameTitle, setNameTitle] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");

    const [error, setError] = useState("");
    const errorRef = useRef(null);

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

    const [otherDiets, setOtherDiets] = useState("");

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

    const [otherCategories, setOtherCategories] = useState("");
 
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

    const [otherCuisineTypes, setOtherCuisineTypes] = useState("");

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

    const [otherAllergens, setOtherAllergens] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            errorRef.current.style.display = "block";
        } else {
            errorRef.current.style.display = "none";
        }

    }, [error]);

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

    function handlePassword(e) {
        setPassword(e.target.value);
    }

    function handleEmail(e) {
        setEmail(e.target.value);
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

    function handleOtherDiets(e) {
        setOtherDiets(e.target.value);
    }

    function handleOtherCategories(e) {
        setOtherCategories(e.target.value);
    }

    function handleOtherCuisineTypes(e) {
        setOtherCuisineTypes(e.target.value);
    }

    function handleOtherAllergens(e) {
        setOtherAllergens(e.target.value);
    }

    function handleSave(event) {
        event.preventDefault();

        const selectedDietaryPreferences = Object.keys(dietaryPreferences).filter(key => dietaryPreferences[key]);
        const selectedCategories = Object.keys(categories).filter(key => categories[key]);
        const selectedCuisineTypes = Object.keys(cuisineTypes).filter(key => cuisineTypes[key]);
        const selectedAllergens = Object.keys(allergies).filter(key => allergies[key]);

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;

        if (!passwordPattern.test(password)) {
            setError("Password must be at least 4 characters, contain at least 1 letter, 1 symbol and 1 number");
        } else if (!emailPattern.test(email)) {
            setError("Email format is wrong");
        } else {
            const data = {
                name_title: nameTitle,
                first_name: firstName,
                last_name: lastName,
                username: username,
                password: password,
                email: email,
                dietary_preferences: selectedDietaryPreferences,
                preferred_categories: selectedCategories,
                preferred_cuisine_types: selectedCuisineTypes,
                allergies: selectedAllergens,
                other_diets: otherDiets,
                other_categories: otherCategories,
                other_cuisine_types: otherCuisineTypes,
                other_allergens: otherAllergens
            };
    
            fetch("http://localhost:9000/api/users/add-user", {
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
                    setError(res.error);
                } else {
                    sessionStorage.setItem("token", res.token);
                    navigate("/");
                }
            })
            .catch(err => console.log(err));
        }
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">Sign up page</h1>
            </div>
            <div className="sign-up">
                <form className="forms" onSubmit={(event) => handleSave(event)}>
                    <select value={nameTitle} className="name-title" onChange={handleNameTitle} required={true}>
                        <option value="" disabled>Please select an option</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Miss">Miss</option>
                        <option value="Dr">Dr</option>
                        <option value="Chef">Chef</option>
                    </select>
                    <div className="user-details">
                        <div className="labels">
                            <label htmlFor="first-name">First name:</label>
                            <label htmlFor="last-name">Last name:</label>
                            <label htmlFor="username">Username:</label>
                            <label htmlFor="password">Password:</label>
                            <label htmlFor="email">Email:</label>
                        </div>
                        <div className="inputs">
                            <input
                                type="text"
                                id="first-name"
                                name="first-name"
                                required={true}
                                minLength={1}
                                maxLength={50}
                                onChange={handleFirstName}
                                placeholder="First name"
                            />
                            <input
                                type="text"
                                id="last-name"
                                name="last-name"
                                required={true}
                                minLength={1}
                                maxLength={50}
                                onChange={handleLastName}
                                placeholder="Last name"
                            />
                            <input
                                type="text"
                                id="username"
                                name="username"
                                required={true}
                                minLength={3}
                                maxLength={20}
                                onChange={handleUsername}
                                placeholder="Username"
                            />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                required={true}
                                minLength={4}
                                onChange={handlePassword}
                                placeholder="Password"
                            />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required={true}
                                minLength={1}
                                onChange={handleEmail}
                                style={{marginBottom: "1rem"}}
                                placeholder="Email"
                            />
                        </div>
                    </div>
                    <div className="box">
                        <div className="box-title">Dietary preferences:</div>
                        <div className="checkboxes">
                            {Object.keys(dietaryPreferences).map(dietaryPreference => (
                                <label key={dietaryPreference}>
                                    <input 
                                        type="checkbox"
                                        checked={dietaryPreferences[dietaryPreference]}
                                        onChange={() => handleCheckboxChange("dietaryPreferences", dietaryPreference)}
                                    />
                                    {dietaryPreference}
                                </label>
                            ))}
                        </div>
                    </div>
                    <label htmlFor="other-diets">Any other diets:</label>
                    <p>Please separate each diet by comma</p>
                    <textarea 
                        id="other-diets"
                        name="other-diets" 
                        rows={5}
                        cols={30}
                        onChange={handleOtherDiets}
                        placeholder="Other diets"
                        style={{ margin: "0 0 1rem 0" }}
                    />
                    <div className="box">
                        <div className="box-title">Category preferences:</div>
                        <div className="checkboxes">
                            {Object.keys(categories).map(category => (
                                <label key={category}>
                                    <input 
                                        type="checkbox"
                                        checked={categories[category]}
                                        onChange={() => handleCheckboxChange("categories", category)}
                                    />
                                    {category}
                                </label>
                            ))}
                        </div>
                    </div>
                    <label htmlFor="other-categories">Any other categories:</label>
                    <p>Please separate each category by comma</p>
                    <textarea 
                        id="other-categories"
                        name="other-categories" 
                        rows={5}
                        cols={30}
                        onChange={handleOtherCategories}
                        placeholder="Other categories"
                        style={{ margin: "0 0 1rem 0" }}
                    />
                    <div className="box">
                        <div className="box-title">Preferred cuisine types:</div>
                        <div className="checkboxes">
                            {Object.keys(cuisineTypes).map(cuisineType => (
                                <label key={cuisineType}>
                                    <input 
                                        type="checkbox"
                                        checked={cuisineTypes[cuisineType]}
                                        onChange={() => handleCheckboxChange("cuisineTypes", cuisineType)}
                                    />
                                    {cuisineType}
                                </label>
                            ))}
                        </div>
                    </div>
                    <label htmlFor="other-cuisine-types">Any other cuisine types:</label>
                    <p>Please separate each cuisine type by comma</p>
                    <textarea 
                        id="other-cuisine-types"
                        name="other-cuisine-types" 
                        rows={5}
                        cols={30}
                        onChange={handleOtherCuisineTypes}
                        placeholder="Other cuisine types"
                        style={{ margin: "0 0 1rem 0" }}
                    />
                    <div className="box">
                        <div className="box-title">Any allergies:</div>
                        <div className="checkboxes">
                            {Object.keys(allergies).map(allergy => (
                                <label key={allergy}>
                                    <input 
                                        type="checkbox"
                                        checked={allergies[allergy]}
                                        onChange={() => handleCheckboxChange("allergies", allergy)}
                                    />
                                    {allergy}
                                </label>
                            ))}
                        </div>
                    </div>
                    <label htmlFor="other-allergens">Any other allergies:</label>
                    <p>Please separate each allergens by comma</p>
                    <textarea 
                        id="other-allergens"
                        name="other-allergens" 
                        rows={5}
                        cols={30}
                        onChange={handleOtherAllergens}
                        placeholder="Other allergens"
                        style={{ margin: "0 0 1rem 0" }}
                    />
                    <div ref={errorRef} style={{ display: "none", color: "red" }}>
                        <p>{error}</p>
                    </div>
                    <button style={{marginBottom: "1rem"}}>Save</button>
                    <button type="button" onClick={() => navigate("/")}>Cancel</button>
                </form>
            </div>
            <Footer />
        </>
    );
}

export default SignUpPage;