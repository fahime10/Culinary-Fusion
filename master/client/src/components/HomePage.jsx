import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dataStructRecipe } from "./recipeDataStructure.js";

const HomePage = () => {
    //const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [nameTitle, setNameTitle] = useState("");
    const [lastName, setLastName] = useState("");
    
    const navigate = useNavigate();
    
    useEffect(() => {
        // if (dataStructRecipe.length === 0) {
            
        // }

        fetch("http://localhost:9000/api/recipes", {
            method: "GET"
        })
        .then((res) => res.json())
        .then((res) => {
            setRecipes(res);
            dataStructRecipe.push(...res);
        })
        .catch((err) => {
            console.log(err);
        });

        if (sessionStorage.getItem("name_title") !== "undefined" && sessionStorage.getItem("last_name") !== "undefined") {
            setNameTitle(sessionStorage.getItem("name_title"));
            setLastName(sessionStorage.getItem("last_name"));
        }

    }, []);

    function viewRecipe(id) {
        navigate(`/recipe/${id}`);
    }

    return (
        <>
            <div className="top-bar">
                <h1>Culinary Fusion</h1>
                {lastName === "undefined" || !lastName ? (
                    <button onClick={() => navigate("/sign-up")}>Sign up</button>
                ) : null}
                {lastName !== "undefined" && lastName ? (
                    <button onClick={() => navigate("/add-recipe")}>Add new recipe</button>
                ) : null}
                {lastName === "undefined" || !lastName ? (
                    <button onClick={() => navigate("/login-page")}>Login</button>
                ) : null}
                <p>Hello {nameTitle} {lastName}</p>
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