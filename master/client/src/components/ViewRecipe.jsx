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
    const [ingredients, setIngredients] = useState([{ id: uuidv4(), value: ""}]);
    const [steps, setSteps] = useState([{ id: uuidv4(), value: ""}]);
    const [timestamp, setTimestamp] = useState(null);
    const [stars, setStars] = useState();

    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:9000/api/recipes/${id}`, {
            method: "GET"
        })
        .then((res) => res.json())
        .then((res) => {
            setTitle(res.title);
            setChef(res.chef);
            setDescription(res.description);
            setIngredients(res.ingredients.map(ingredient => ({ id: uuidv4(), value: ingredient })));
            setSteps(res.steps.map(step => ({ id: uuidv4(), value: step})));
            setTimestamp(res.timestamp);
            setStars(res.stars);

            if (res.image) {
                setImageUrl(`data:image/jpeg;base64,${res.image}`);
            }
        })
        .catch(err => console.log(err));

    }, [id])

    // if (!recipe) {
    //     return <div>Recipe not found...</div>;
    // }

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
        fetch(`http://localhost:9000/api/recipes/delete/${id}`, {
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
                <button onClick={() => redirectToEditRecipe(id)}>Edit Recipe</button>
                <button onClick={toggleDialog}>Delete Recipe</button>
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
                {imageUrl && <img src={imageUrl} /> }
                <p>{description}</p>
                <p>Chef/s: {chef}</p>
                <p>Ingredients:</p>
                <ul>
                    {ingredients.map((ingredient) => (
                        <li key={ingredient.id}>{ingredient.value}</li>
                    ))}
                </ul>
                <p>Steps:</p>
                <ul>
                    {steps.map((step) => (
                        <li key={step.id}>{step.value}</li>
                    ))}
                </ul>
                <p>Added: {formatDate(timestamp)}</p>
                <p>Stars: {stars}</p>
            </div>
        </>
    );
}

export default ViewRecipe;