import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "./LoadingSpinner";
import Footer from "./Footer";

const FavouriteRecipes = () => {
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            const user_id = userDetails.id;

            fetch(`http://localhost:9000/api/recipes/favourite/${user_id}`, {
                method: "POST"
            })
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                setRecipes(res);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(setLoading(false));
        }

    }, []);

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return null;
    }

    function viewRecipe(id) {
        navigate(`/recipe/${id}`);
    }

    return (
        <>
            {loading ? <LoadingSpinner /> :
                <div className="favourite-recipes">
                    <div className="top-bar">
                        <h1 className="title">Culinary Fusion</h1>
                        <h3 className="title-2">Favourite recipes</h3>
                        <button className="second" onClick={() => navigate(-1)}>Back</button>
                        <button className="third" onClick={() => navigate("/")}>Home</button>
                    </div>
                    <div className="recipes">
                        {recipes.length > 0 ? recipes.map((recipe) => (
                            <div key={recipe._id} id={recipe._id} className="recipe" onClick={() => viewRecipe(recipe._id)}>
                                <div className="recipe-title">{recipe.title}</div>
                                <img
                                    src={`data:image/jpeg;base64,${recipe.image}`}
                                />
                                <p className="description">{recipe.description}</p>
                            </div>
                        )) : <p>You do not have any favourite recipes</p>}
                    </div>
                </div>
            }
            <Footer />
        </>
    );
};

export default FavouriteRecipes;