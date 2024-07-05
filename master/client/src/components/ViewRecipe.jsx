import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import  Dialog from "./Dialog";
import { dataStructRecipe } from "./recipeDataStructure.js";

const ViewRecipe = () => {
    const { id } = useParams();
    const recipe = dataStructRecipe.find(recipe => recipe._id === id);
    const [dialog, setDialog] = useState(false);

    const navigate = useNavigate();

    if (!recipe) {
        return <div>Recipe not found...</div>;
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
                <h1>{recipe.title}</h1>
                <img src={`data:image/jpeg;base64,${recipe.image}`} />
                <p>{recipe.desciption}</p>
                <p>Chef/s: {recipe.chef}</p>
                <p>Ingredients:</p>
                <ul>
                    {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                    ))}
                </ul>
                <p>Steps:</p>
                <ul>
                    {recipe.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ul>
                <p>Added: {formatDate(recipe.timestamp)}</p>
                <p>Stars: {recipe.stars}</p>
            </div>
        </>
    );
}

export default ViewRecipe;