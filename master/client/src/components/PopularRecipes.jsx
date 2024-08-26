import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NoImageIcon from "../assets/no-image.png";
import LoadingSpinner from "./LoadingSpinner";
import Footer from "./Footer";
import { getRecipe, setRecipe } from "../indexedDb";

const PopularRecipes = () => {
    const TEN_MINUTES = 10 * 60 * 1000;

    const [loading, setLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [limitPage, setLimitPage] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.setItem("popularPageCount", 1);

        async function fetchRecipesDelayed() {
            setLoading(true);

            await new Promise(resolve => setTimeout(resolve, 2000));

            await fetchRecipes();

            setLoading(false);
        }

        fetchRecipesDelayed();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    async function fetchAndCacheRecipes() {
        const now = new Date().getTime();

        const pageCount = parseInt(sessionStorage.getItem("popularPageCount"));

        const recipesPerPage = 20;
        const requiredCount = pageCount * recipesPerPage;

        const existentSubset = requiredCount - recipesPerPage;

        const cachedRecipes = await getCachedRecipes("popular_recipes") || [];

        const data = {
            page_count: pageCount
        };

        if (cachedRecipes.length < requiredCount && cachedRecipes.length === existentSubset) {
            const response = await fetch("http://localhost:9000/api/popular-recipes", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            if (response.ok) {
                const res = await response.json();
                const newRecipes = res.page;
                const isLimit = res.limit;
        
                const updatedRecipes = [...cachedRecipes, ...newRecipes];
        
                if (isLimit) {
                    setLimitPage(isLimit);
                    let limit = sessionStorage.getItem("pageCount");
                    sessionStorage.setItem("limit", parseInt(limit));
                }

                await setRecipe("popular_recipes", { ...updatedRecipes, timestamp: now });
                return newRecipes;
            }
        }

        return [];
    }

    async function handleRecipes() {
        const pageCount = parseInt(sessionStorage.getItem("popularPageCount"));
        const cachedRecipes = await getCachedRecipes("popular_recipes");

        const recipesPerPage = 20;
        const startIndex = (pageCount - 1) * recipesPerPage;
        const endIndex = pageCount * recipesPerPage;

        if (cachedRecipes && (cachedRecipes.length >= endIndex || limitPage)) {
            const pageRecipes = cachedRecipes.slice(startIndex, endIndex);

            setRecipes(pageRecipes);
            if (pageRecipes.length % 20 !== 0) {
                setLimitPage(true);
            } else {
                setLimitPage(false);
            }
            setLoading(false);
            return;
        }

        const fetchedRecipes = await fetchAndCacheRecipes("http://localhost:9000/api/popular-recipes", "popular_recipes", pageCount);
        const allRecipes = cachedRecipes ? [...cachedRecipes, ...fetchedRecipes] : fetchedRecipes;
        const pageRecipes = allRecipes.slice(startIndex, endIndex);

        if (pageRecipes.length % 20 !== 0) {
            setLimitPage(true);
        } else {
            setLimitPage(false);
        }

        setRecipes(pageRecipes);
        setLoading(false);
    }
    
    async function fetchRecipes() {
        setLoading(true);

        try {
            await handleRecipes();
        } catch (error) {
            console.log(error);
            setLoading(false);
        } 
    }

    async function changeToPrevious() {
        let popularPageCount = sessionStorage.getItem("popularPageCount");
        popularPageCount = parseInt(popularPageCount);
        popularPageCount -= 1;

        if (popularPageCount < 1) {
            popularPageCount = 1;
            sessionStorage.setItem("popularPageCount", 1);
        } else {
            sessionStorage.setItem("popularPageCount", popularPageCount);
        }

        await fetchRecipes();
        setLimitPage(false);
    }

    async function changeToNext() {
        let popularPageCount = sessionStorage.getItem("popularPageCount");
        if (popularPageCount === null) {
            popularPageCount = 1;
        } else {
            popularPageCount = parseInt(popularPageCount);
            popularPageCount += 1;
        }
        
        sessionStorage.setItem("popularPageCount", popularPageCount);
        await fetchRecipes();
    }

    function viewRecipe(id) {
        navigate(`/recipe/${id}`);
    }

    return (
        <>
            {loading ?  (<LoadingSpinner />) : 
                <div className="grid-container">
                    <div className="top-bar">
                        <h1 className="title">Most popular recipes</h1>
                    </div>
                    <div className="popular-recipes">
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
                    {parseInt(sessionStorage.getItem("popularPageCount")) === 1 ? 
                        <div className="pages">
                            <p>Page</p>
                            <p>{parseInt(sessionStorage.getItem("popularPageCount"))}</p>
                            <button 
                                type="button" 
                                onClick={changeToNext} 
                                disabled={limitPage}
                            >Next
                            </button>
                        </div> :
                        <div className="pages">
                            <button type="button" onClick={changeToPrevious}>Previous</button>
                            <p>Page</p>
                            <p>{parseInt(sessionStorage.getItem("popularPageCount"))}</p>
                            <button 
                                type="button" 
                                onClick={changeToNext} 
                                disabled={limitPage}
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

export default PopularRecipes;