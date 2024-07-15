import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../assets/search-icon.png";
import NoImageIcon from "../assets/no-image.png";
import MenuContainer from "./MenuContainer.jsx";
import DropDownMenu from "./DropDownMenu.jsx";

const HomePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [nameTitle, setNameTitle] = useState("");
    const [lastName, setLastName] = useState("");
    const [searchRecipe, setSearchRecipe] = useState("");

    const navigate = useNavigate();

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
        "Sandwich": false,
        "Pasta and Noodles": false,
        "Rice and Grains": false,
        "Vegetarian and Vegan": false,
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
    
    function fetchRecipes() {
        if (sessionStorage.getItem("last_name") === null || sessionStorage.getItem("last_name") === "undefined") {
            fetch("http://localhost:9000/api/recipes", {
                method: "GET"
            })
            .then((res) => res.json())
            .then((res) => {
                setRecipes(res);
            })
            .catch((err) => {
                console.log(err);
            });

        } else {
            const username = sessionStorage.getItem("username");
            fetch(`http://localhost:9000/api/recipes/${username}`, {
                method: "POST"
            })
            .then((res) => res.json())
            .then((res) => {
                setRecipes(res);
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }

    useEffect(() => {
        fetchRecipes();

        if (sessionStorage.getItem("name_title") !== "undefined" && sessionStorage.getItem("last_name") !== "undefined") {
            setNameTitle(sessionStorage.getItem("name_title"));
            setLastName(sessionStorage.getItem("last_name"));
        }

    }, []);

    function viewRecipe(id) {
        navigate(`/recipe/${id}`);
    }

    const fetchFilteredRecipes = useCallback(() => {
        const selectedCategories = Object.keys(categories).filter(key => categories[key]);
        const selectedCuisineTypes = Object.keys(cuisineTypes).filter(key => cuisineTypes[key]);

        const data = {
            username: sessionStorage.getItem("username"),
            categories: selectedCategories,
            cuisine_types: selectedCuisineTypes
        }

        fetch("http://localhost:9000/api/recipes/filter/set", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(res => {
            if (res.status === 200) {
                setRecipes(res.recipes);
            } else {
                console.log(res.error);
            }
        })
        .catch(err => console.log(err));
    }, [categories, cuisineTypes]);

    useEffect(() => {
        fetchFilteredRecipes();
    }, [fetchFilteredRecipes]);

    function handleLogout() {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("name_title");
        sessionStorage.removeItem("last_name");
        window.location.reload();
    }

    function handleSearchRecipe(e) {
        const { value } = e.target;
        setSearchRecipe(value);

        if (value === "") {
            fetchRecipes();
        }
    }

    function findRecipe(searchRecipe) {
        if (searchRecipe.trim() !== "") {
            const data = {
                username: sessionStorage.getItem("username"),
                last_name: sessionStorage.getItem("last_name"),
                name_title: sessionStorage.getItem("name_title"),
            };

            fetch(`http://localhost:9000/api/recipes/search/${searchRecipe}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then((res) => res.json())
            .then((res) => setRecipes(res))
            .catch(err => console.log(err));
        }
    }

    return (
        <>
            <div className="grid-container">
                <div className="top-bar">
                    <h1 className="title">Culinary Fusion</h1>
                    {lastName === "undefined" || !lastName ? (
                        <button className="first" onClick={() => navigate("/sign-up")}>Sign up</button>
                    ) : null}
                    {lastName !== "undefined" && lastName ? (
                        <button className="first" onClick={() => navigate("/add-recipe")}>Add new recipe</button>
                    ) : null}
                    {lastName === "undefined" || !lastName ? (
                        <button className="second" onClick={() => navigate("/login-page")}>Login</button>
                    ) : null}
                    {lastName !== "undefined" && lastName ? (
                        <button className="second" onClick={handleLogout}>Logout</button>
                    ) : null}
                    <p className="greeting">Hello {nameTitle} {lastName}</p>
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search for a recipe"
                            onChange={handleSearchRecipe}
                        />
                        <img src={SearchIcon} onClick={() => findRecipe(searchRecipe)} />
                    </div>
                    {lastName !== "undefined" && lastName ? (
                        <div className="account">
                            <MenuContainer />
                        </div>
                    ) : null}
                </div>
                <div className="side-bar">
                    <DropDownMenu title="Categories" options={categories} setOptions={setCategories} />
                    <DropDownMenu title="Cuisine types" options={cuisineTypes} setOptions={setCuisineTypes} />
                </div>
                <div className="recipes">
                    {recipes.map((recipe) => (
                        <div key={recipe._id} id={recipe._id} className="recipe" onClick={() => viewRecipe(recipe._id)}>
                            <div className="recipe-title">{recipe.title}</div>
                            {recipe.image !== null || recipe.image ? (
                                <img
                                    src={`data:image/jpeg;base64,${recipe.image}`}
                                />
                            ) : <img src={NoImageIcon} />}
                            <p className="description">{recipe.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default HomePage;