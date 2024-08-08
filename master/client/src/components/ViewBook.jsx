import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NoImageIcon from "../assets/no-image.png";
import { jwtDecode } from "jwt-decode";
import Dialog from "./Dialog";
import Footer from "./Footer";

const ViewBook = () => {
    const { id } = useParams();
    const [isMainAdmin, setIsMainAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCollaborator, setIsCollaborator] = useState(false);
    const [bookTitle, setBookTitle] = useState("");
    const [bookDescription, setBookDescription] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [dialog, setDialog] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userDetails = retrieveUserDetails();

        async function fetchBooks() {
            if (userDetails) {
                try {
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
                        setRecipes(res.recipes);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
           
        }
        fetchBooks();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    function toggleDialog() {
        setDialog(!dialog);
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

    return (
        <>
            <div className="top-bar-book">
                <h1 className="title">{bookTitle}</h1>
                <p className="description">{bookDescription}</p>
                {isMainAdmin || isAdmin ? 
                    <button type="button" className="first" onClick={() => redirectToEditBook(id)}>Edit book details</button>
                : null}
                {isMainAdmin || isAdmin ? 
                    <button type="button" className="second" onClick={toggleDialog}>Delete book</button>
                : null}
                <Dialog
                    isOpen={dialog}
                    onClose={toggleDialog}
                    title="Attention"
                    content="Are you sure you want to delete the book? You will lose all the recipes in it"
                    funct={() => deleteBook(id)}
                ></Dialog>
            </div>
            <div className="recipes">
                {recipes.length > 0 ? recipes.map((recipe) => (
                    <div key={recipe._id} id={recipe._id} className="recipe">
                        <div className="recipe-title">{recipe.title}</div>
                        {recipe.image !== null || recipe.image ? (
                            <img
                                src={`data:image/jpeg;base64,${recipe.image}`}
                            />
                        ) : <img src={NoImageIcon} />}
                        <p className="description">{recipe.description}</p>
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((index) => {
                                const isFilled = index <= Math.round(recipe.average);
                                return (
                                    <span 
                                        key={index}
                                        className={`star ${isFilled ? "average": ""}`}
                                        style={{ color: isFilled ? "gold" : "grey"}}
                                    ></span>
                                );
                            })}
                        </div>
                    </div>
            )): <p>No recipes created yet</p>}
            </div>
            <Footer />
        </>
    );
};

export default ViewBook;