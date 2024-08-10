import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NoImageIcon from "../assets/no-image.png";
import { v4 as uuidv4 } from "uuid";
import { jwtDecode } from "jwt-decode";
import { getRecipe, setRecipe, clearBookRecipes } from "../indexedDb";
import Dialog from "./Dialog";
import Footer from "./Footer";

const ViewBook = () => {
    const TEN_MINUTES = 10 * 60 * 1000;

    const { id } = useParams();
    const [isMainAdmin, setIsMainAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCollaborator, setIsCollaborator] = useState(false);
    const [bookTitle, setBookTitle] = useState("");
    const [bookDescription, setBookDescription] = useState("");
    const [bookDialog, setBookDialog] = useState(false);
    const [recipeDialog, setRecipeDialog] = useState(false);

    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState(null);
    const [chef, setChef] = useState("");
    const [chefUsername, setChefUsername] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState([{ id: uuidv4(), value: "", quantity: ""}]);
    const [steps, setSteps] = useState([{ id: uuidv4(), value: ""}]);
    const [diet, setDiet] = useState([""]);
    const [categories, setCategories] = useState([""]);
    const [cuisineTypes, setCuisineTypes] = useState([""]);
    const [allergens, setAllergens] = useState([""]);
    const [timestamp, setTimestamp] = useState(null);

    const [limitPage, setLimitPage] = useState();
    const [currentPage, setCurrentPage] = useState();

    const navigate = useNavigate();

    useEffect(() => {
        async function removeBookCache() {
            await clearBookRecipes();
        }

        removeBookCache();
        const userDetails = retrieveUserDetails();
        sessionStorage.setItem("bookPage", 1);
        setCurrentPage(1);

        async function fetchBook() {
            if (userDetails) {
                await handleRecipes(parseInt(sessionStorage.getItem("bookPage")));
            }
        }
        fetchBook();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function setRecipeState(recipe) {
        setTitle(recipe.title);
        setChef(recipe.chef);
        setChefUsername(recipe.chef_username);
        setDescription(recipe.description);

        const parsedIngredients = recipe.ingredients.map((ingredient, index) => ({
            id: uuidv4(),
            value: ingredient,
            quantity: recipe.quantities[index]
        }));

        setIngredients(parsedIngredients);
        setSteps(recipe.steps.map(step => ({ id: uuidv4(), value: step})));
        setDiet(recipe.diet);
        setCategories(recipe.categories);
        setCuisineTypes(recipe.cuisine_types);
        setAllergens(recipe.allergens);
        setTimestamp(recipe.timestamp);
                
        if (recipe.image) {
            setImageUrl(`data:image/jpeg;base64,${recipe.image}`);
        }
    }

    async function getCachedRecipes() {
        const now = new Date().getTime();
        const cachedData = await getRecipe("book_recipes");

        if (cachedData && cachedData.timestamp && now - cachedData.timestamp < TEN_MINUTES) {
            const recipes = Object.keys(cachedData)
                .filter(key => !isNaN(key))
                .map(key => cachedData[key]);

            return recipes;
        }
        return null;
    }

    async function fetchAndCacheRecipes() {
        const userDetails = retrieveUserDetails();
        const now = new Date().getTime();

        if (userDetails) {
            try {
                const cachedRecipes = await getCachedRecipes() || [];
                
                if (cachedRecipes.length === 0) {
                    const data = {
                        user_id: userDetails.id
                    };
    
                    const response = await fetch(`http://localhost:9000/api/books/view/${id}`, {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });
    
                    if (response.ok) {
                        const res = await response.json();
    
                        if (res.is_main_admin) {
                            setIsMainAdmin(true);
                        } else if (res.is_admin) {
                            setIsAdmin(true);
                        } else if (res.is_collaborator) {
                            setIsCollaborator(true);
                        }
    
                        setBookTitle(res.book.book_title);
                        setBookDescription(res.book.book_description);

                        const newRecipes = res.recipes;
                        const updatedRecipes = [...cachedRecipes, ...newRecipes];

                        await setRecipe("book_recipes", 
                            { ...updatedRecipes, timestamp: now, 
                                book_title: res.book.book_title, 
                                book_description: res.book.book_description, 
                                is_main_admin: res.is_main_admin,
                                is_admin: res.is_admin, 
                                is_collaborator: res.is_collaborator
                            });

                        sessionStorage.setItem("bookLimit", newRecipes.length);
                        return newRecipes;
                    }
                } else {
                    const cachedData = await getRecipe("book_recipes");
                    setBookTitle(cachedData.book_title);
                    setBookDescription(cachedData.book_description);

                    if (cachedData.is_main_admin) {
                        setIsMainAdmin(true);
                    } else if (cachedData.is_admin) {
                        setIsAdmin(true);
                    } else if (cachedData.is_collaborator) {
                        setIsCollaborator(true);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    async function handleRecipes(pageCount) {
        const cachedRecipes = await getCachedRecipes("book_recipes");
        let allRecipes = cachedRecipes || [];

        if (allRecipes.length > 0) {
            const currentIndex = (pageCount - 1);

            setRecipeState(allRecipes[currentIndex]);
        }

        const fetchedRecipes = await fetchAndCacheRecipes();
        if (fetchedRecipes && fetchedRecipes.length > 0) {
            allRecipes = [...allRecipes, ...fetchedRecipes];
            const currentIndex = (pageCount - 1);
            
            setRecipeState(allRecipes[currentIndex])
        }
    }

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return null;
    }

    function redirectToEditBook(id) {
        navigate(`/books/edit/${id}`);
    }

    function toggleBookDialog() {
        setBookDialog(!bookDialog);
    }

    async function deleteBook(id) {
        try {
            const response = await fetch(`http://localhost:9000/api/books/delete/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                navigate(-1);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function redirectToIndludeRecipe(id) {
        navigate(`/books/include/${id}`);
    }

    function formatDate(timestamp) {
        const date = new Date(timestamp);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear());

        return `${day}/${month}/${year}`;
    }

    async function changeToPrevious() {
        let bookPage = sessionStorage.getItem("bookPage");
        bookPage = parseInt(bookPage);

        if (bookPage > 1) {
            bookPage -= 1;
            sessionStorage.setItem("bookPage", bookPage);
            setLimitPage(false);
            setCurrentPage(bookPage);
        }

        await handleRecipes(bookPage);
    }

    async function changeToNext() {
        let bookPage = sessionStorage.getItem("bookPage");

        if (parseInt(sessionStorage.getItem("bookLimit")) === parseInt(sessionStorage.getItem("bookPage"))) {
            setLimitPage(true);
        } else {
            if (bookPage === null) {
                bookPage = 1;
            } else {
                bookPage = parseInt(bookPage);
                bookPage += 1;
            }
            setLimitPage(false);
            setCurrentPage(bookPage);

            sessionStorage.setItem("bookPage", bookPage);
            await handleRecipes(bookPage);
        }
    }

    async function handlePageChange(e) {
        const page = e.target.value;
        const bookPage = parseInt(page);
        const bookLimit = parseInt(sessionStorage.getItem("bookLimit"));

        if (isNaN(bookPage)) {
            setCurrentPage("");
        }

        if (bookPage >= 1 && bookPage <= bookLimit) {
            setCurrentPage(bookPage);
            sessionStorage.setItem("bookPage", bookPage);
            await handleRecipes(bookPage);
        } 
    }

    function toggleRecipeDialog() {
        setRecipeDialog(!recipeDialog);
    }

    async function redirectToEditBookRecipe() {
        let bookPage = sessionStorage.getItem("bookPage");
        bookPage = parseInt(bookPage);

        const cachedRecipes = await getCachedRecipes("book_recipes");
        let allRecipes = cachedRecipes || [];

        if (allRecipes.length > 0) {
            const currentIndex = (bookPage - 1);

            const recipe_id = allRecipes[currentIndex]._id;

            navigate(`/books/recipes/edit/${id}/${recipe_id}`)
        }
    }

    async function deleteCurrentRecipe() {
        let bookPage = sessionStorage.getItem("bookPage");
        bookPage = parseInt(bookPage);

        const cachedRecipes = await getCachedRecipes("book_recipes");
        let allRecipes = cachedRecipes || [];

        if (allRecipes.length > 0) {
            const currentIndex = (bookPage - 1);

            const recipe_id = allRecipes[currentIndex]._id;

            const data = {
                book_id: id
            };

            try {
                const response = await fetch(`http://localhost:9000/api/books/delete/recipe/${recipe_id}`, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
    
                if (response.ok) {
                    const recipes = Object.keys(cachedRecipes)
                        .filter(key => !isNaN(key))
                        .map(key => cachedRecipes[key]);

                    const updatedRecipes = recipes.filter(recipe => recipe._id !== recipe_id);

                    await setRecipe("book_recipes", {
                        ...updatedRecipes
                    });

                    toggleRecipeDialog();
                    
                    let limit = sessionStorage.getItem("bookLimit");
                    limit = parseInt(limit) - 1;
                    sessionStorage.setItem("bookLimit", limit);

                    if (bookPage > 1) {
                        setCurrentPage(bookPage - 1);
                        sessionStorage.setItem("bookPage", bookPage - 1);
                        await handleRecipes(bookPage - 1);
                    } else {
                        setCurrentPage(bookPage);
                        sessionStorage.setItem("bookPage", bookPage);
                        await handleRecipes(bookPage);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <>
            <div className="top-bar-book">
                <h1 className="title">{bookTitle}</h1>
                <p className="description">{bookDescription}</p>
                {isMainAdmin || isAdmin ? 
                    <button type="button" className="first" onClick={() => redirectToEditBook(id)}>Edit book details</button>
                : null}
                {isMainAdmin || isAdmin ? 
                    <button type="button" className="second" onClick={toggleBookDialog}>Delete book</button>
                : null}
                <button type="button" className="third" onClick={() => navigate(-1)}>Back</button>
                <button type="button" className="fourth" onClick={() => navigate("/")}>Home</button>
                <Dialog
                    isOpen={bookDialog}
                    onClose={toggleBookDialog}
                    title="Attention"
                    content="Are you sure you want to delete the book? You will lose all the recipes in it"
                    funct={() => deleteBook(id)}
                ></Dialog>
            </div>
            {isMainAdmin || isAdmin || isCollaborator ? 
                <button type="button" className="third" onClick={() => redirectToIndludeRecipe(id)}>Add a recipe</button>
            : null}
            {isMainAdmin || isAdmin || isCollaborator ?
                    <button type="button" onClick={redirectToEditBookRecipe}>Edit this recipe</button>
                : null}
            {isMainAdmin || isAdmin ?
                <button type="button" onClick={toggleRecipeDialog}>Delete this recipe</button>
            : null}
            <Dialog
                isOpen={recipeDialog}
                onClose={toggleRecipeDialog}
                title="Attention"
                content="Are you sure you want to delete this recipe"
                funct={deleteCurrentRecipe}
            ></Dialog>
            <div className="book-recipe">
                <button type="button" className="previous" onClick={changeToPrevious}></button>
                <button type="button" className="next" disabled={limitPage} onClick={changeToNext}></button>
                <h1>{title}</h1>
                {imageUrl ? (imageUrl && <img src={imageUrl} />) : <img src={NoImageIcon} />}
                <div className="info">
                    <p>Description: {description}</p>
                    <p>Chef/s: {chef}</p>
                    <p>Added by: {chefUsername}</p>
                </div>
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
                    <ol>
                        {steps.map((step) => (
                            <li key={step.id} className="step">{step.value}</li>
                        ))}
                    </ol>
                </div>
                <p>Added: {formatDate(timestamp)}</p>
                <div>
                    <p>Type of diet:</p>
                    <ul>
                        {diet.length > 0 ? diet.map((typeOfDiet) => (
                            <li key={typeOfDiet} className="typeOfDiet">{typeOfDiet}</li>
                        )) : "No type of diet mentioned" }
                    </ul>
                </div>
                <div>
                    <p>Categories:</p>
                    <ul>
                        {categories.length > 0 ? categories.map((category) => (
                            <li key={category} className="category">{category}</li>
                        )) : "No category mentioned" }
                    </ul>
                </div>
                <div>
                    <p>Cuisine types:</p>
                    <ul>
                        {cuisineTypes.length > 0 ? cuisineTypes.map((cuisineType) => (
                            <li key={cuisineType} className="cuisine">{cuisineType}</li>
                        )) : "No cuisine type mentioned"}
                    </ul>
                </div>
                <div>
                    <p>Allergens:</p>
                    <ul>
                        {allergens.length > 0 ? allergens.map((allergen) => (
                            <li key={allergen} className="allergen">{allergen}</li>
                        )) : "No allergens mentioned. Please do check the ingredients" }
                    </ul>
                </div>
            </div>
            <div className="bookpage">
                <label htmlFor="current-page">Current page:</label>
                <input
                    type="number"
                    id="current-page"
                    value={currentPage}
                    onChange={handlePageChange}
                />
            </div>
            <Footer />
        </>
    );
};

export default ViewBook;