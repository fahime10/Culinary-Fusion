import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dataStructRecipe } from "./recipeDataStructure.js";
import SearchIcon from "../assets/search-icon.png";
import NoImageIcon from "../assets/no-image.png";
import MenuContainer from "./MenuContainer.jsx";

const HomePage = () => {
    //const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [nameTitle, setNameTitle] = useState("");
    const [lastName, setLastName] = useState("");
    const [searchRecipe, setSearchRecipe] = useState("");

    const navigate = useNavigate();
    
    async function fetchRecipes() {
        if (sessionStorage.getItem("last_name") === null || sessionStorage.getItem("last_name") === "undefined") {
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

        } else {
            const username = sessionStorage.getItem("username");
            fetch(`http://localhost:9000/api/recipes/${username}`, {
                method: "POST"
            })
            .then((res) => res.json())
            .then((res) => {
                setRecipes(res);
                dataStructRecipe.push(...res);
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }

    useEffect(() => {
        // if (dataStructRecipe.length === 0) {
            
        // }

        fetchRecipes();

        if (sessionStorage.getItem("name_title") !== "undefined" && sessionStorage.getItem("last_name") !== "undefined") {
            setNameTitle(sessionStorage.getItem("name_title"));
            setLastName(sessionStorage.getItem("last_name"));
        }

    }, []);

    function viewRecipe(id) {
        navigate(`/recipe/${id}`);
    }

    function handleLogout() {
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("name_title");
        sessionStorage.removeItem("last_name");
        window.location.reload();
    }

    function handleSearchRecipe(e) {
        const { value } = e.target;
        setSearchRecipe(value);

        if (value === "") {
            fetchRecipes();
        }
    }

    function findRecipe(searchRecipe) {
        if (searchRecipe.trim() !== "") {
            const data = {
                username: sessionStorage.getItem("username"),
                last_name: sessionStorage.getItem("last_name"),
                name_title: sessionStorage.getItem("name_title"),
            };

            fetch(`http://localhost:9000/api/recipes/search/${searchRecipe}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then((res) => res.json())
            .then((res) => setRecipes(res))
            .catch(err => console.log(err));
        }
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">Culinary Fusion</h1>
                {lastName === "undefined" || !lastName ? (
                    <button className="first" onClick={() => navigate("/sign-up")}>Sign up</button>
                ) : null}
                {lastName !== "undefined" && lastName ? (
                    <button className="first" onClick={() => navigate("/add-recipe")}>Add new recipe</button>
                ) : null}
                {lastName === "undefined" || !lastName ? (
                    <button className="second" onClick={() => navigate("/login-page")}>Login</button>
                ) : null}
                {lastName !== "undefined" && lastName ? (
                    <button className="second" onClick={handleLogout}>Logout</button>
                ) : null}
                <p className="greeting">Hello {nameTitle} {lastName}</p>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search for a recipe"
                        onChange={handleSearchRecipe}
                    />
                    <img src={SearchIcon} onClick={() => findRecipe(searchRecipe)} />
                </div>
                {lastName !== "undefined" && lastName ? (
                    <div className="account">
                        <MenuContainer />
                    </div>
                ) : null}
            </div>
            <div className="recipes">
                {recipes.map((recipe) => (
                    <div key={recipe._id} id={recipe._id} className="recipe" onClick={() => viewRecipe(recipe._id)}>
                        <div className="recipe-title">{recipe.title}</div>
                        {recipe.image !== null || recipe.image ? (
                            <img
                                src={`data:image/jpeg;base64,${recipe.image}`}
                            />
                        ) : <img src={NoImageIcon} />}
                        <p className="description">{recipe.description}</p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default HomePage;