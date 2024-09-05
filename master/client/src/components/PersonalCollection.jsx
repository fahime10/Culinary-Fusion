import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LoadingSpinner from "./LoadingSpinner";
import Footer from "./Footer";

/**
 * PersonalCollection component
 * 
 * This component displays a list of the current user's recipes. This includes both public and private recipes.
 * However, book recipes are not displayed here.
 * 
 * @returns {JSX.Element}
 */
const PersonalCollection = () => {
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [isLogged, setIsLogged] = useState(false);

    const navigate = useNavigate();

    // Retrieves user's recipes
    useEffect(() => {
        setLoading(true);
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            setIsLogged(true);
            const username = userDetails.username;

            fetch(`http://localhost:9000/api/recipes/own/${username}`, {
                method: "POST"
            })
            .then((res) => res.json())
            .then((res) => {
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
                isLogged ?
                    <div className="personal-collection">
                        <div className="top-bar">
                            <h1 className="title">Culinary Fusion</h1>
                            <h3 className="title-2">Personal collection</h3>
                            <button className="second" onClick={() => navigate("/")}>Home</button>
                            <button className="third" onClick={() => navigate(-1)}>Back</button>
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
                            )) : <p>You have not made any recipes</p>}
                        </div>
                    </div>
            : 
            <div>
                <p>Sorry, you are not authorised</p>
                <p>You need to login first</p>
                <button onClick={navigate("/login-page")}></button>
            </div>}
            <Footer/>
        </>
    );
};

export default PersonalCollection;