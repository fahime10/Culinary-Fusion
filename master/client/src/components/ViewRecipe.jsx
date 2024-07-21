import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import  Dialog from "./Dialog";
import { v4 as uuidv4 } from "uuid";
import NoImageIcon from "../assets/no-image.png";
import { jwtDecode } from "jwt-decode";
import { getRecipe, setRecipe } from "../indexedDb";

const ViewRecipe = () => {
    const { id } = useParams();
    const [dialog, setDialog] = useState(false);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [chef, setChef] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState([{ id: uuidv4(), value: "", quantity: ""}]);
    const [steps, setSteps] = useState([{ id: uuidv4(), value: ""}]);
    const [categories, setCategories] = useState([""]);
    const [cuisineTypes, setCuisineTypes] = useState([""]);
    const [allergens, setAllergens] = useState([""]);
    const [timestamp, setTimestamp] = useState(null);
    const [stars, setStars] = useState();

    const [isOwner, setIsOwner] = useState(false);

    const navigate = useNavigate();

    function setRecipeState(recipe) {
        const userDetails = retrieveUserDetails();
        setTitle(recipe.title);
        setChef(recipe.chef);
        setDescription(recipe.description);

        const parsedIngredients = recipe.ingredients.map((ingredient, index) => ({
            id: uuidv4(),
            value: ingredient,
            quantity: recipe.quantities[index]
        }));

        setIngredients(parsedIngredients);
        setSteps(recipe.steps.map(step => ({ id: uuidv4(), value: step})));
        setCategories(recipe.categories);
        setCuisineTypes(recipe.cuisine_types);
        setAllergens(recipe.allergens);
        setTimestamp(recipe.timestamp);
        setStars(recipe.stars);
                
        if (recipe.image) {
            setImageUrl(`data:image/jpeg;base64,${recipe.image}`);
        }

        if (userDetails.id === recipe.user_id) {
            setIsOwner(true);
        }
    }

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const key = token && token !== "undefined" ? "user_recipes" : "public_recipes";

        async function fetchRecipe() {
            try {
                const cachedData = await getRecipe(key);

                if (cachedData && cachedData.timestamp) {
                    const recipes = Object.keys(cachedData)
                        .filter(key => !isNaN(key))
                        .map(key => cachedData[key]);

                    const recipe = recipes.find(recipe => recipe._id === id);

                    if (recipe) {
                        setRecipeState(recipe);
                        return;
                    }
                }

                const userDetails = token && token !== "undefined" ? retrieveUserDetails() : null;
                const data = userDetails ? { username: userDetails.username } : null;
                
                const response = await fetch(`http://localhost:9000/api/recipes/recipe/${id}`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: data ? JSON.stringify(data) : undefined
                });

                const res = await response.json();

                setTitle(res.recipe.title);
                setChef(res.recipe.chef);
                setDescription(res.recipe.description);

                const parsedIngredients = res.recipe.ingredients.map((ingredient, index) => ({
                    id: uuidv4(),
                    value: ingredient,
                    quantity: res.recipe.quantities[index]
                }));

                setIngredients(parsedIngredients);
                setSteps(res.recipe.steps.map(step => ({ id: uuidv4(), value: step})));
                setCategories(res.recipe.categories);
                setCuisineTypes(res.recipe.cuisine_types);
                setAllergens(res.recipe.allergens);
                setTimestamp(res.recipe.timestamp);
                setStars(res.recipe.stars);
        
                if (res.recipe.image) {
                    setImageUrl(`data:image/jpeg;base64,${res.recipe.image}`);
                }
        
                if (res.owner === true) {
                    setIsOwner(true);
                }

            } catch (error) {
                console.log(error);
            }
        }

        fetchRecipe();

    }, [id]);

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return null;
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear());

        return `${day}/${month}/${year}`;
    }

    function redirectToEditRecipe(id) {
        navigate(`/recipe/edit/${id}`);
    }

    function returnToHomepage() {
        navigate("/");
    }

    function toggleDialog() {
        setDialog(!dialog);
    }

    async function deleteRecipe(id) {
        async function updateCache(key) {
            const cachedData = await getRecipe(key);

            if (cachedData) {
                const recipes = Object.keys(cachedData)
                    .filter(key => !isNaN(key))
                    .map(key => cachedData[key]);

                const updatedRecipes = recipes.filter(recipe => recipe._id !== id);

                await setRecipe(key, {
                    ...updatedRecipes
                });
            }
        }

        try {
            const response = await fetch(`http://localhost:9000/api/recipes/delete-recipe/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                const token = sessionStorage.getItem("token");
                const key = token && token !== "undefined" ? "user_recipes" : "public_recipes";

                await updateCache(key);
                navigate("/");
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <div className="top">
                {isOwner ? (
                    <button onClick={() => redirectToEditRecipe(id)}>Edit Recipe</button>
                ) : null}
                {isOwner ? (
                    <button onClick={toggleDialog}>Delete Recipe</button>
                ) : null}
                <button onClick={returnToHomepage}>Home</button>
            </div>
            <Dialog
                isOpen={dialog} 
                onClose={toggleDialog} 
                title="Attention" 
                content="Are you sure you want to delete this recipe?"
                funct={() => deleteRecipe(id)}
            >
            </Dialog>
            <div className="recipe-details">
                <h1>{title}</h1>
                <p>Stars: {stars}</p>
                {imageUrl ? (imageUrl && <img src={imageUrl} />) :  <img src={NoImageIcon} />}
                <p>{description}</p>
                <p>Chef/s: {chef}</p>
                <div className="ingredient-list">
                    <p>Ingredients:</p>
                    <ul>
                        {ingredients.map((ingredient) => (
                            <li key={ingredient.id} className="ingredient">{ingredient.quantity} {ingredient.value}</li>
                        ))}
                    </ul>
                </div>
                <div className="step-list">
                    <p>Steps:</p>
                    <ul>
                        {steps.map((step) => (
                            <li key={step.id} className="step">{step.value}</li>
                        ))}
                    </ul>
                </div>
                <p>Added: {formatDate(timestamp)}</p>
                <div>
                    <p>Categories:</p>
                    <ul>
                        {categories.map((category) => (
                            <li key={category} className="category">{category}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p>Cuisine types:</p>
                    <ul>
                        {cuisineTypes.map((cuisineType) => (
                            <li key={cuisineType} className="cuisine">{cuisineType}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <p>Allergens:</p>
                    <ul>
                        {allergens.map((allergen) => (
                            <li key={allergen} className="allergen">{allergen}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default ViewRecipe;