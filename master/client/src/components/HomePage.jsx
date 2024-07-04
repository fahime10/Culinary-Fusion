import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dataStructRecipe } from "./recipeDataStructure.js";

const HomePage = () => {
    //const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    
    const navigate = useNavigate();
    
    useEffect(() => {
        // if (dataStructRecipe.length === 0) {
            
        // }

        fetch("http://localhost:9000/api/recipes", {
            method: "GET"
        })
        .then((res) => res.json())
        .then((res) => {
            setRecipes(res)
            dataStructRecipe.push(...res);
        })
        .catch((err) => {
            console.log(err);
        });
    }, []);

    function viewRecipe(id) {
        navigate(`/recipe/${id}`);
    }

    return (
        <>
            <div className="top-bar">
                <h1>Culinary Fusion</h1>
                <button>Log out</button>
                <Link to="/add-recipe">
                    <button>Add new recipe</button>
                </Link>
            </div>
            <div className="recipes">
                {recipes.map((recipe) => (
                    <div key={recipe._id} id={recipe._id} className="recipe" onClick={() => viewRecipe(recipe._id)}>
                        <p>{recipe.title}</p>
                        <img
                            src={`data:image/jpeg;base64,${recipe.image}`}
                        />
                        <p>{recipe.description}</p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default HomePage;