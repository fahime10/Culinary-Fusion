import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import  Dialog from "./Dialog";
import { v4 as uuidv4 } from "uuid";
//import { dataStructRecipe } from "./recipeDataStructure.js";

const ViewRecipe = () => {
    const { id } = useParams();
    //const recipe = dataStructRecipe.find(recipe => recipe._id === id);
    const [dialog, setDialog] = useState(false);
    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [chef, setChef] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState([{ id: uuidv4(), value: "", quantity: ""}]);
    const [steps, setSteps] = useState([{ id: uuidv4(), value: ""}]);
    const [timestamp, setTimestamp] = useState(null);
    const [stars, setStars] = useState();

    const [isOwner, setIsOwner] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (sessionStorage.getItem("last_name") === null || sessionStorage.getItem("last_name") === "undefined") {
            fetch(`http://localhost:9000/api/recipes/recipe/${id}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                }
            })
            .then((res) => res.json())
            .then((res) => {
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
                setTimestamp(res.recipe.timestamp);
                setStars(res.recipe.stars);
    
                if (res.recipe.image) {
                    setImageUrl(`data:image/jpeg;base64,${res.recipe.image}`);
                }
    
                if (res.owner === true) {
                    setIsOwner(true);
                }
            })
            .catch(err => console.log(err));
        } else {
            const data = {
                username: sessionStorage.getItem("username")
            };
    
            fetch(`http://localhost:9000/api/recipes/recipe/${id}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then((res) => res.json())
            .then((res) => {
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
                setTimestamp(res.recipe.timestamp);
                setStars(res.recipe.stars);
    
                if (res.recipe.image) {
                    setImageUrl(`data:image/jpeg;base64,${res.recipe.image}`);
                }
    
                if (res.owner === true) {
                    setIsOwner(true);
                }
            })
            .catch(err => console.log(err));
        }

    }, [id]);

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

    function deleteRecipe(id) {
        fetch(`http://localhost:9000/api/recipes/delete-recipe/${id}`, {
            method: "DELETE",
        })
        .catch((err) => {
            console.log(err);
        })
        .finally(navigate("/"));
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
                {imageUrl && <img src={imageUrl} /> }
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
            </div>
        </>
    );
}

export default ViewRecipe;