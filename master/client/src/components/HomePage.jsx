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

/**
 * HomePage component
 * 
 * This components provides various functions.
 * Public users can see public recipes, in no particular order.
 * Signed in users can see recipes that should be tailored to their preferences.
 * Recipes can be searched, and there are filters for categories and cuisine types.
 * Recipes are cached in IndexedDB.
 * Users can see up to 20 recipes per page. Previous and Next buttons allow navigating the pages.
 * 
 * @returns {JSX.Element}
 */
const HomePage = () => {
    // 10 minutes in milliseconds
    const TEN_MINUTES = 10 * 60 * 1000;

    const [loading, setLoading] = useState(true);
    const [isLogged, setIsLogged] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [nameTitle, setNameTitle] = useState("");
    const [lastName, setLastName] = useState("");
    const [searchRecipe, setSearchRecipe] = useState("");
    const [limitPage, setLimitPage] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const [isFetching, setIsFetching] = useState(false);

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

    // Extracts recipes from the cache with the provided key
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

    // Fetches recipes either from the cache or from the server
    async function fetchAndCacheRecipes(url, cacheKey, pageCount) {
        const now = new Date().getTime();

        const recipesPerPage = 20;
        const requiredCount = pageCount * recipesPerPage;

        const existentSubset = requiredCount - recipesPerPage;

        const cachedRecipes = await getCachedRecipes(cacheKey) || [];

        const mapRecipesIds = cachedRecipes.map(recipe => recipe._id);

        const data = {
            cache: mapRecipesIds
        };

        if (cachedRecipes.length < requiredCount && cachedRecipes.length === existentSubset) {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            if (response.ok) {
                const res = await response.json();
                const newRecipes = res.result;
                const isLimit = res.limit;
        
                const updatedRecipes = [...cachedRecipes, ...newRecipes];

                const token = sessionStorage.getItem("token");

                let key = "";

                if (token !== null && token !== "undefined") {
                    key = "userPageCount";
                } else {
                    key = "publicPageCount";
                }
        
                if (isLimit) {
                    setLimitPage(isLimit);
                    let limit = sessionStorage.getItem(key);
                    sessionStorage.setItem(`${key}Limit`, parseInt(limit));
                }

                await setRecipe(cacheKey, { ...updatedRecipes, timestamp: now });
                return newRecipes;
            }
        }

        return [];
    }

    async function handleRecipes(url, cacheKey, pageCount, isUserEdited) {
        const cachedRecipes = await getCachedRecipes(cacheKey);

        const recipesPerPage = 20;
        const startIndex = (pageCount - 1) * recipesPerPage;
        const endIndex = pageCount * recipesPerPage;

        if (!isUserEdited) {
            if (cachedRecipes && (cachedRecipes.length >= endIndex || limitPage)) {
                const pageRecipes = cachedRecipes.slice(startIndex, endIndex);

                setRecipes(pageRecipes);
                await fetchRecipeDetails(pageRecipes.map(recipe => recipe._id));
                if (pageRecipes.length % 20 !== 0) {
                    setLimitPage(true);
                } else {
                    setLimitPage(false);
                }
                setLoading(false);
                return;
            }
        }

        if (isUserEdited) {
            clearUserRecipes();
            sessionStorage.setItem("userPageCount", 1);
        }

        const fetchedRecipes = await fetchAndCacheRecipes(url, cacheKey, pageCount);
        const allRecipes = cachedRecipes ? [...cachedRecipes, ...fetchedRecipes] : fetchedRecipes;
        const pageRecipes = allRecipes.slice(startIndex, endIndex);

        if (pageRecipes.length % 20 !== 0) {
            setLimitPage(true);
        } else {
            setLimitPage(false);
        }

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

    async function getAllNotifications() {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            const data = {
                username: userDetails.username
            };

            const response = await fetch(`http://localhost:9000/api/join-requests`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const res = await response.json();
                setNotifications(res);
            }
        }
    }

    useEffect(() => {
        async function initialize() {
            if (!sessionStorage.getItem("initialized")) {
                await clearRecipes();
                sessionStorage.setItem("initialized", true);
                sessionStorage.setItem("publicPageCountLimit", -1);
                sessionStorage.setItem("userPageCountLimit", -1);
                sessionStorage.setItem("publicPageCount", 1);
                sessionStorage.setItem("userPageCount", 1);
            }

            if (!sessionStorage.getItem("editedUser")) {
                sessionStorage.setItem("editedUser", false);
            }

            sessionStorage.setItem("popularPageCount", -1);
            sessionStorage.setItem("popularLimit", -1);
        }

        async function fetchRecipesDelayed() {
            const token = sessionStorage.getItem("token");

            let key = "";

            if (token !== null && token !== "undefined") {
                key = "userPageCount";
                setIsLogged(true);
            } else {
                key = "publicPageCount";
                setIsLogged(false);
            }

            setLoading(true);

            await new Promise(resolve => setTimeout(resolve, 2000));

            await fetchRecipes(parseInt(sessionStorage.getItem(key)));

            await getAllNotifications();

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
        const token = sessionStorage.getItem("token");

        if (noFilters && token !== null && token !== "undefined") {
            fetchRecipes(parseInt(sessionStorage.getItem("userPageCount")));
            setLoading(false);
        } else if (noFilters) {
            fetchRecipes(parseInt(sessionStorage.getItem("publicPageCount")));
            setLoading(false);
        } else {
            fetchFilteredRecipes();
            setLoading(false);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchFilteredRecipes]);

    async function handleLogout() {
        sessionStorage.removeItem("token");
        sessionStorage.setItem("publicPageCountLimit", -1);
        sessionStorage.setItem("userPageCountLimit", -1);
        sessionStorage.setItem("userPageCount", 1);
        sessionStorage.setItem("publicPageCount", 1);
        await clearUserRecipes();
        window.location.reload();
    }

    function handleSearchRecipe(e) {
        const { value } = e.target;
        setSearchRecipe(value);

        const token = sessionStorage.getItem("token");

        if (value === "" && token !== null && token !== "undefined") {
            fetchRecipes(sessionStorage.getItem("userPageCount"));
        } else if (value === "") {
            fetchRecipes(sessionStorage.getItem("publicPageCount"));
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
        if (isFetching) return;

        setIsFetching(true);
        const token = sessionStorage.getItem("token");

        let key = "";

        if (token !== null && token !== "undefined") {
            key = "userPageCount";
        } else {
            key = "publicPageCount";
        }
        
        let pageCount = sessionStorage.getItem(key);

        pageCount = parseInt(pageCount);
        pageCount -= 1;

        setLimitPage(false);
        sessionStorage.setItem(key, pageCount);
        await fetchRecipes(pageCount);
        setIsFetching(false);
    }

    async function changeToNext() {
        if (isFetching) return;

        setIsFetching(true);
        const token = sessionStorage.getItem("token");

        let key = "";

        if (token !== null && token !== "undefined") {
            key = "userPageCount";
        } else {
            key = "publicPageCount";
        }

        let pageCount = sessionStorage.getItem(key);

        if (pageCount === null) {
            pageCount = 1;
        } else {
            pageCount = parseInt(pageCount);
            pageCount += 1;
        }
        
        sessionStorage.setItem(key, pageCount);
        await fetchRecipes(pageCount);
        setIsFetching(false);
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
                                <MenuContainer notifications={notifications} setNotifications={setNotifications} />
                            </div>
                        ) : null}
                    </div>
                    <div className="side-bar">
                        <DropDownMenu title="Categories" options={categories} setOptions={setCategories} />
                        <DropDownMenu title="Cuisine types" options={cuisineTypes} setOptions={setCuisineTypes} />
                    </div>
                    <div className="sort">
                        <button type="button" onClick={() => navigate("/popular-recipes")}>Most Popular</button>
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
                        {isLogged ? 
                            (parseInt(sessionStorage.getItem("userPageCount")) === 1 ? 
                                <div className="pages">
                                    <p>Page</p>
                                    <p>{parseInt(sessionStorage.getItem("userPageCount"))}</p>
                                    <button type="button"className="page-button" onClick={changeToNext} disabled={limitPage || isFetching}>Next</button>
                                </div> :
                                <div className="pages">
                                    <button type="button" className="page-button" onClick={changeToPrevious} disabled={isFetching}>Previous</button>
                                    <p>Page</p>
                                    <p>{parseInt(sessionStorage.getItem("userPageCount"))}</p>
                                    <button type="button" className="page-button" onClick={changeToNext} disabled={limitPage || isFetching}>Next</button>
                                </div>
                            ) : (
                            parseInt(sessionStorage.getItem("publicPageCount")) === 1 ? 
                                <div className="pages">
                                    <p>Page</p>
                                    <p>{parseInt(sessionStorage.getItem("publicPageCount"))}</p>
                                    <button type="button"className="page-button" onClick={changeToNext} disabled={limitPage || isFetching}>Next</button>
                                </div> :
                                <div className="pages">
                                    <button type="button" className="page-button" onClick={changeToPrevious} disabled={isFetching}>Previous</button>
                                    <p>Page</p>
                                    <p>{parseInt(sessionStorage.getItem("publicPageCount"))}</p>
                                    <button type="button" className="page-button" onClick={changeToNext} disabled={limitPage || isFetching}>Next</button>
                                </div>
                            )
                        }
                    </div>
                    <Footer />
                </div>
            }
        </>
    );
};

export default HomePage;