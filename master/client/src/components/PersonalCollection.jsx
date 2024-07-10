import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PersonalCollection = () => {
    const [recipes, setRecipes] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const username = sessionStorage.getItem("username");

        fetch(`http://localhost:9000/api/recipes/own/${username}`, {
            method: "POST"
        })
        .then((res) => res.json())
        .then((res) => {
            setRecipes(res);
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
                <h1 className="title">Culinary Fusion</h1>
                <h3 className="title-2">Personal collection</h3>
                <button className="second" onClick={() => navigate("/")}>Home</button>
            </div>
            <div className="recipes">
                {recipes.map((recipe) => (
                    <div key={recipe._id} id={recipe._id} className="recipe" onClick={() => viewRecipe(recipe._id)}>
                        <div className="recipe-title">{recipe.title}</div>
                        <img
                            src={`data:image/jpeg;base64,${recipe.image}`}
                        />
                        <p className="description">{recipe.description}</p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default PersonalCollection;