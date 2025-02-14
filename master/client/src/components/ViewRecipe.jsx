import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import  Dialog from "./Dialog";
import { v4 as uuidv4 } from "uuid";
import NoImageIcon from "../assets/no-image.png";
import { jwtDecode } from "jwt-decode";
import { getRecipe, setRecipe } from "../indexedDb";
import LoadingSpinner from "./LoadingSpinner";
import Footer from "./Footer";

/**
 * ViewRecipe component
 * 
 * This component displays a single recipe.
 * The user can see the average rating and the comments.
 * Signed in users can leave comments.
 * 
 * @returns {JSX.Element}
 */
const ViewRecipe = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [logged, setLogged] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [chef, setChef] = useState("");
    const [chefUsername, setChefUsername] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState([{ id: uuidv4(), value: "", quantity: ""}]);
    const [steps, setSteps] = useState([{ id: uuidv4(), value: ""}]);
    const [diet, setDiet] = useState([""]);
    const [categories, setCategories] = useState([""]);
    const [cuisineTypes, setCuisineTypes] = useState([""]);
    const [allergens, setAllergens] = useState([""]);
    const [timestamp, setTimestamp] = useState(null);

    const [isFavourite, setIsFavourite] = useState(false);

    const [isOwner, setIsOwner] = useState(false);

    const [hoveredStar, setHoveredStar] = useState(null);
    const [average, setAverage] = useState(0);
    const [userRating, setUserRating] = useState(0);

    const [comments, setComments] = useState([]);
    const [text, setText] = useState("");
    const [limit, setLimit] = useState(false);

    const navigate = useNavigate();

    function setRecipeState(recipe, chefUsername) {
        const userDetails = retrieveUserDetails();
        setTitle(recipe.title);
        setChef(recipe.chef);
        setChefUsername(chefUsername);
        setDescription(recipe.description);

        const parsedIngredients = recipe.ingredients.map((ingredient, index) => ({
            id: uuidv4(),
            value: ingredient,
            quantity: recipe.quantities[index]
        }));

        setIngredients(parsedIngredients);
        setSteps(recipe.steps.map(step => ({ id: uuidv4(), value: step})));
        setDiet(recipe.diet);
        setCategories(recipe.categories);
        setCuisineTypes(recipe.cuisine_types);
        setAllergens(recipe.allergens);
        setTimestamp(recipe.timestamp);

        if (recipe.image) {
            setImageUrl(`data:image/jpeg;base64,${recipe.image}`);
        }

        if (userDetails) {
            if (userDetails.username === recipe.user_id.username) {
                setIsOwner(true);
            } else if (userDetails.username === recipe.chef_username) {
                setIsOwner(true);
            }
        }
    }

    // Fetches the recipe either from the cache or from the server
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const key = token && token !== "undefined" ? "user_recipes" : "public_recipes";

        if (token) {
            setLogged(true);
        }

        async function fetchRecipe() {
            setLoading(true);
            
            try {
                const cachedData = await getRecipe(key);

                if (cachedData && cachedData.timestamp) {
                    const recipes = Object.keys(cachedData)
                        .filter(key => !isNaN(key))
                        .map(key => cachedData[key]);

                    const recipe = recipes.find(recipe => recipe._id === id);

                    if (recipe) {
                        setRecipeState(recipe, recipe.chef_username);
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

                setRecipeState(res.recipe, res.chef_username);

                if (res.owner === true) {
                    setIsOwner(true);
                }

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

        fetchRecipe();

        const userDetails = retrieveUserDetails();

        let data = {
            recipe_id: id
        };

        if (userDetails) {
            data.user_id = userDetails.id;
        }

        fetch("http://localhost:9000/api/stars/rating-recipe", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then((res) => {
            if (res.average) {
                setAverage(res.average);
                setUserRating(res.user_rating);
            }
        })
        .catch(err => console.log(err));

        fetchAllComments();

        checkFavourite();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return null;
    }

    function handleMouseEnter(index) {
        setHoveredStar(index);
    }

    function handleMouseLeave() {
        setHoveredStar(null);
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

    function handleText(e) {
        setText(e.target.value);
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
            const token = sessionStorage.getItem("token");

            if (token && token !== "undefined") {
                const response = await fetch(`http://localhost:9000/api/recipes/delete-recipe/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
    
                if (response.ok) {
                    const token = sessionStorage.getItem("token");
                    const key = token && token !== "undefined" ? "user_recipes" : "public_recipes";
    
                    await updateCache(key);
                    navigate(-1);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    function handleStarClick(index) {
        const token = sessionStorage.getItem("token");

        if (token) {
            rateRecipe(index);
        }
    }

    function rateRecipe(stars) {
        const token = sessionStorage.getItem("token");
        const userDetails = retrieveUserDetails();

        if (token) {
            const data = {
                user_id: userDetails.id,
                recipe_id: id,
                stars: stars
            };

            fetch("http://localhost:9000/api/stars", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then((res) => res.json())
            .then((res) => {
                if (res.average) {
                    setAverage(res.average);
                    setUserRating(stars);
                }
            })
            .catch(err => console.log(err));
        }
    }

    // Fetches all the comments associated with this recipe
    function fetchAllComments() {
        fetch(`http://localhost:9000/api/comments/${id}`, {
            method: "POST"
        })
        .then((res) => res.json())
        .then((res) => {
            setComments(res.allComments);
            setLimit(res.limit);
        })
        .catch(error => console.log(error));
    }

    // Retrieves more comments
    function getMoreComments() {
        const commentIds = comments.map(comment => comment._id);

        const data = {
            comments: commentIds
        };

        fetch(`http://localhost:9000/api/comments/${id}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then((res) => {
            setComments(res.allComments);
            setLimit(res.limit);
        })
        .catch(error => console.log(error));
    }

    function createComment() {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            const data = {
                user_id: userDetails.id,
                text: text
            };

            fetch(`http://localhost:9000/api/comments/create/${id}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then((res) => res.json())
            .then((res) => {
                setComments(res);
                setText("");
            })
            .catch(error => console.log(error));
        }
    }

    function timeDifference(timestamp) {
        const now = new Date();
        const givenDate = new Date(timestamp);

        const timeDiff = now - givenDate;

        const seconds = Math.floor(timeDiff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const years = Math.floor(days / 365);

        if (years > 0) {
            return `${years}y ago`;
        } else if (days > 0) {
            return `${days}d ago`;
        } else if (hours > 0) {
            return `${hours}h ago`;
        } else if (minutes > 0) {
            return `${minutes}m ago`;
        } else {
            return `${seconds}s ago`;
        }
    }

    function checkOwnComment(user_id) {
        const userDetails = retrieveUserDetails();

        if (userDetails && user_id === userDetails.username) {
            return true;
        }
        return false;
    }

    async function checkFavourite() {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            const data = {
                user_id: userDetails.id,
                recipe_id: id
            };
    
            try {
                const response = await fetch('http://localhost:9000/api/recipe/check_favourite', {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
    
                if (response.ok) {
                    const res = await response.json();
                    setIsFavourite(res);
                }
    
            } catch (error) {
                console.log(error);
            }
        }
    }

    async function toggleFavourite() {
        const userDetails = retrieveUserDetails();

        const data = {
            user_id: userDetails.id,
            recipe_id: id
        };

        try {
            const response = await fetch('http://localhost:9000/api/recipe/set_favourite', {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                setIsFavourite(!isFavourite);
            }

        } catch (error) {
            console.log(error);
        }
    }

    function deleteComment(id) {
        fetch(`http://localhost:9000/api/comments/delete/${id}`, {
            method: "DELETE"
        })
        .then((res) => res.json())
        .then((res) => {
            if (res.message === "Successfully deleted comment") {
                fetchAllComments();
            }
        })
        .catch(error => console.log(error));
    }

    return (
        <>
            {loading ? <LoadingSpinner /> : 
                <div className="view-recipe">
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
                        <div className="stars">
                            <p>Stars:</p>
                            {[1, 2, 3, 4, 5].map((index) =>  {
                                const isFilled = index <= Math.round(average);
                                const isSelected = index <= userRating;
                                const isHovered = index <= hoveredStar;
                            
                            return (
                                <span 
                                    key={index}
                                    className={`star ${isFilled ? "average": ""} ${isHovered ? "highlighted" : ""}`}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => handleStarClick(index)}
                                    style={{ 
                                        cursor: logged ? "pointer" : "not-allowed", 
                                        border: isSelected ? "2px solid gold" : "none",
                                        color: isFilled && !isHovered && !isSelected ? "green" : ""
                                    }}
                                ></span>
                            )})}
                        </div>
                        {logged ? 
                            <div className="favourite-section">
                                <div className={`favourite ${isFavourite ? 'filled' : ''}`} onClick={toggleFavourite}></div>
                                {isFavourite ?
                                    <p>Saved</p>
                                : <p>Not saved</p>}
                            </div>
                        : null}
                        {imageUrl ? (imageUrl && <img src={imageUrl} />) :  <img src={NoImageIcon} />}
                        <div className="info">
                            <p>Description: {description}</p>
                            <p>Chef/s: {chef}</p>
                            <p>Added by: {chefUsername}</p>
                        </div>
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
                            <ol>
                                {steps.map((step) => (
                                    <li key={step.id} className="step">{step.value}</li>
                                ))}
                            </ol>
                        </div>
                        <p>Added: {formatDate(timestamp)}</p>
                        <div>
                            <p>Type of diet:</p>
                            <ul>
                                {diet.length > 0 ? diet.map((typeOfDiet) => (
                                    <li key={typeOfDiet} className="typeOfDiet">{typeOfDiet}</li>
                                )) : "No type of diet mentioned" }
                            </ul>
                        </div>
                        <div>
                            <p>Categories:</p>
                            <ul>
                                {categories.length > 0 ? categories.map((category) => (
                                    <li key={category} className="category">{category}</li>
                                )) : "No category mentioned" }
                            </ul>
                        </div>
                        <div>
                            <p>Cuisine types:</p>
                            <ul>
                                {cuisineTypes.length > 0 ? cuisineTypes.map((cuisineType) => (
                                    <li key={cuisineType} className="cuisine">{cuisineType}</li>
                                )) : "No cuisine type mentioned"}
                            </ul>
                        </div>
                        <div>
                            <p>Allergens:</p>
                            <ul>
                                {allergens.length > 0 ? allergens.map((allergen) => (
                                    <li key={allergen} className="allergen">{allergen}</li>
                                )) : "No allergens mentioned. Please do check the ingredients" }
                            </ul>
                        </div>
                        <div className="comments">
                            {logged ?
                                <div className="comment-options">
                                    <textarea
                                        rows={2}
                                        cols={40}
                                        required={true}
                                        placeholder="Leave a comment"
                                        value={text}
                                        onChange={handleText}
                                    />
                                    <button type="button" onClick={createComment}>Send</button>
                                </div>
                            : null}
                            <p>Comment section</p>
                            {comments.length > 0 ? comments.map(comment => (
                                <div key={comment._id} id={comment._id} className="comment">
                                    <div className="flex">
                                        <p>{comment.user_id.username}</p>
                                        <div className="time">{timeDifference(comment.timestamp)}</div>
                                    </div>
                                    <p>{comment.text}</p>
                                    {checkOwnComment(comment.user_id.username) ? 
                                        <button type="button" onClick={() => deleteComment(comment._id)}>Delete comment</button>
                                    : null}
                                </div>
                            )) : null}
                            {!limit ?
                                <button type="button" onClick={getMoreComments}>Load more comments</button>
                            : null}
                        </div>
                    </div>
                    <Footer />
                </div>
            }
        </>
    );
}

export default ViewRecipe;