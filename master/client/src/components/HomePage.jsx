import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HomePage = (props) => {
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    
    useEffect(() => {
        fetch("http://localhost:9000/api/recipes", {
            method: "GET"
        })
        .then((res) => res.json())
        .then((res) => {
            setRecipes(res)
        })
        .catch((err) => {
            console.log(err);
        });
    }, []);


    return (
        <>
            <div className="top-bar">
                <h1>Culinary Fusion</h1>
                <h3>{props.response}</h3>
                <button>Log out</button>
                <Link to="/add-recipe">
                    <button>Add new recipe</button>
                </Link>
            </div>
            <div className="recipes">
                {recipes.map((recipe) => (
                    <div key={recipe._id} id={recipe._id} className="recipe">
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