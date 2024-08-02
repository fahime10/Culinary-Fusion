import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../assets/search-icon.png";
import NoImageIcon from "../assets/no-image.png";
import MenuContainer from "./MenuContainer.jsx";
import DropDownMenu from "./DropDownMenu.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import Footer from "./Footer.jsx";
import { jwtDecode } from "jwt-decode";
import { getRecipe, setRecipe, clearRecipes, clearUserRecipes } from "../indexedDb";

const HomePage = () => {
    // 10 minutes in milliseconds
    const TEN_MINUTES = 10 * 60 * 1000;

    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [nameTitle, setNameTitle] = useState("");
    const [lastName, setLastName] = useState("");
    const [searchRecipe, setSearchRecipe] = useState("");
    const [limitPage, setLimitPage] = useState(false);

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

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return "";
    }

    async function getCachedRecipes(cacheKey) {
        const now = new Date().getTime();
        const cachedData = await getRecipe(cacheKey);

        if (cachedData && cachedData.timestamp && now - cachedData.timestamp < TEN_MINUTES) {
            const recipes = Object.keys(cachedData)
                .filter(key => !isNaN(key))
                .map(key => cachedData[key]);

            return recipes;
        }
        return null;
    }

    async function fetchAndCacheRecipes(url, cacheKey, pageCount) {
        const now = new Date().getTime();

        const recipesPerPage = 20;
        const requiredCount = pageCount * recipesPerPage;

        const cachedRecipes = await getCachedRecipes(cacheKey) || [];

        const mapRecipesIds = cachedRecipes.map(recipe => recipe._id);

        const data = {
            cache: mapRecipesIds
        };

        if (cachedRecipes.length < requiredCount && !limitPage) {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error("Failed to fetch recipes");
            }
    
            const res = await response.json();
            const newRecipes = res.result;
            const isLimit = res.limit;
    
            const updatedRecipes = [...cachedRecipes, ...newRecipes];
    
            if (isLimit) {
                setLimitPage(isLimit);
                let limit = sessionStorage.getItem("pageCount");
                sessionStorage.setItem("limit", parseInt(limit));
            }

            await setRecipe(cacheKey, { ...updatedRecipes, timestamp: now });
            return newRecipes;
        }
    }

    async function handleRecipes(url, cacheKey, pageCount, isUserEdited) {
        const cachedRecipes = await getCachedRecipes(cacheKey);

        const recipesPerPage = 20;
        const startIndex = (pageCount - 1) * recipesPerPage;
        const endIndex = pageCount * recipesPerPage;

        if (!isUserEdited) {
            if (cachedRecipes && (cachedRecipes.length >= endIndex || parseInt(sessionStorage.getItem("limit")) === parseInt(sessionStorage.getItem("pageCount")))) {
                const pageRecipes = cachedRecipes.slice(startIndex, endIndex);
                
                setRecipes(pageRecipes);
                await fetchRecipeDetails(pageRecipes.map(recipe => recipe._id));
                setLoading(false);
                return;
            }
        }

        const fetchedRecipes = await fetchAndCacheRecipes(url, cacheKey, pageCount, startIndex, endIndex);
        const allRecipes = cachedRecipes ? [...cachedRecipes, ...fetchedRecipes] : fetchedRecipes;
        const pageRecipes = allRecipes.slice(startIndex, endIndex);

        setRecipes(pageRecipes);
        await fetchRecipeDetails(pageRecipes.map(recipe => recipe._id));
        setLoading(false);
    }
    
    async function fetchRecipes(pageCount) {
        setLoading(true);

        try {
            const token = sessionStorage.getItem("token");

            if (!token || token === "undefined") {
                await handleRecipes("http://localhost:9000/api/recipes", "public_recipes", pageCount);
            } else {
                const isUserEdited = sessionStorage.getItem("editedUser") === "true";
                const userDetails = retrieveUserDetails();
                const url = `http://localhost:9000/api/recipes/${userDetails.username}`;

                if (!isUserEdited) {
                    await handleRecipes(url, "user_recipes", pageCount, isUserEdited);
                } else {
                    sessionStorage.setItem("editedUser", false);
                    await handleRecipes(url, "user_recipes", pageCount, isUserEdited);
                }
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        } 
    }

    // Separate function to retrieve stars asynchronously and to avoid binding stars values into the cache
    // to have real time updates on user feedback
    async function fetchRecipeDetails(recipeIds) {
        const data = {
            recipe_ids: recipeIds
        };

        try {
            const response = await fetch("http://localhost:9000/api/stars/get-all-ratings", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const ratings = await response.json();
            const ratingMap = new Map(ratings.map(rating => [rating.recipe_id, rating.average]));

            setRecipes((prevRecipes) => 
                prevRecipes.map(recipe => ({
                    ...recipe,
                    average: ratingMap.get(recipe._id) || 0
                }))
            );
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        async function initialize() {
            if (!sessionStorage.getItem("initialized")) {
                await clearRecipes();
                sessionStorage.setItem("initialized", true);
            }

            if (!sessionStorage.getItem("editedUser")) {
                sessionStorage.setItem("editedUser", false);
            }
        }

        async function fetchRecipesDelayed() {
            setLoading(true);

            await new Promise(resolve => setTimeout(resolve, 2000));

            await fetchRecipes(parseInt(sessionStorage.getItem("pageCount")));

            setLoading(false);
        }

        setLoading(true);
        initialize();

        const userDetails = retrieveUserDetails();

        if (userDetails) {
            setNameTitle(userDetails.name_title);
            setLastName(userDetails.last_name);
        }

        fetchRecipesDelayed();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function viewRecipe(id) {
        navigate(`/recipe/${id}`);
    }

    const fetchFilteredRecipes = useCallback(async () => {
        const selectedCategories = Object.keys(categories).filter(key => categories[key]);
        const selectedCuisineTypes = Object.keys(cuisineTypes).filter(key => cuisineTypes[key]);

        const userDetails = retrieveUserDetails();

        const data = {
            username: userDetails.username,
            categories: selectedCategories,
            cuisine_types: selectedCuisineTypes
        }

        const response = await fetch("http://localhost:9000/api/recipes/filter/set", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const res = await response.json();

        if (res.status === 200) {
            if (res.recipes.length > 0) {
                setRecipes(res.recipes);
                const recipeIds = res.recipes.map(recipe => recipe._id);
                await fetchRecipeDetails(recipeIds);
            } else {
                setRecipes([]);
            }
        }

        setLoading(false);

    }, [categories, cuisineTypes]);

    useEffect(() => {
        const noFilters = Object.values(categories).every(val => !val) && Object.values(cuisineTypes).every(val => !val);

        if (noFilters) {
            fetchRecipes(parseInt(sessionStorage.getItem("pageCount")));
            setLoading(false);
        } else {
            fetchFilteredRecipes();
            setLoading(false);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchFilteredRecipes]);

    async function handleLogout() {
        sessionStorage.removeItem("token");
        await clearUserRecipes();
        window.location.reload();
    }

    function handleSearchRecipe(e) {
        const { value } = e.target;
        setSearchRecipe(value);

        if (value === "") {
            fetchRecipes(sessionStorage.getItem("pageCount"));
        }
    }

    async function findRecipe(searchRecipe) {
        if (searchRecipe.trim() !== "") {
            let data = {};

            const userDetails = retrieveUserDetails();

            if (userDetails) {
                data = {
                    username: userDetails.username,
                    last_name: userDetails.last_name,
                    name_title: userDetails.name_title
                };
            }

            const response = await fetch(`http://localhost:9000/api/recipes/search/${searchRecipe}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const res = await response.json();

            setRecipes(res);
            const recipeIds = res.map(recipe => recipe._id);
            await fetchRecipeDetails(recipeIds);
        }
    }

    async function changeToPrevious() {
        let pageCount = sessionStorage.getItem("pageCount");
        pageCount = parseInt(pageCount);
        pageCount -= 1;

        if (pageCount < 1) {
            pageCount = 1;
            sessionStorage.setItem("pageCount", 1);
        } else {
            sessionStorage.setItem("pageCount", pageCount);
        }

        setLimitPage(false);
        await fetchRecipes(pageCount);
    }

    async function changeToNext() {
        let pageCount = sessionStorage.getItem("pageCount");
        if (pageCount === null) {
            pageCount = 1;
        } else {
            pageCount = parseInt(pageCount);
            pageCount += 1;
        }
        
        sessionStorage.setItem("pageCount", pageCount);
        await fetchRecipes(pageCount);
    }

    return (
        <>
            {loading ?  (<LoadingSpinner />) : 
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
                            <button className="third" onClick={() => navigate("/groups")}>Find groups</button>
                        ) : null}
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
                        {recipes.length > 0 ? recipes.map((recipe) => (
                            <div key={recipe._id} id={recipe._id} className="recipe" onClick={() => viewRecipe(recipe._id)}>
                                <div className="recipe-title">{recipe.title}</div>
                                {recipe.image !== null || recipe.image ? (
                                    <img
                                        src={`data:image/jpeg;base64,${recipe.image}`}
                                    />
                                ) : <img src={NoImageIcon} />}
                                <p className="description">{recipe.description}</p>
                                <div className="stars">
                                    {[1, 2, 3, 4, 5].map((index) => {
                                        const isFilled = index <= Math.round(recipe.average);
                                        return (
                                            <span 
                                                key={index}
                                                className={`star ${isFilled ? "average": ""}`}
                                                style={{ color: isFilled ? "gold" : "grey"}}
                                            ></span>
                                        );
                                    })}
                                </div>
                            </div>
                        )): <p>No recipes found</p>}
                    </div>
                    {parseInt(sessionStorage.getItem("pageCount")) === 1 ? 
                        <div className="pages">
                            <p>Page</p>
                            <p>{parseInt(sessionStorage.getItem("pageCount"))}</p>
                            <button 
                                type="button" 
                                onClick={changeToNext} 
                                disabled={sessionStorage.getItem("limit") === sessionStorage.getItem("pageCount")}
                            >Next
                            </button>
                        </div> :
                        <div className="pages">
                            <button type="button" onClick={changeToPrevious}>Previous</button>
                            <p>Page</p>
                            <p>{parseInt(sessionStorage.getItem("pageCount"))}</p>
                            <button 
                                type="button" 
                                onClick={changeToNext} 
                                disabled={sessionStorage.getItem("limit") === sessionStorage.getItem("pageCount")}
                            >Next
                            </button>
                        </div>
                    }
                    <Footer />
                </div>
            }
        </>
    );
};

export default HomePage;