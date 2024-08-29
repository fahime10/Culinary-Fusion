import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Footer from "./Footer";

const CreateBook = () => {
    const { id } = useParams();
    const [bookTitle, setBookTitle] = useState("");
    const [bookDescription, setBookDescription] = useState("");

    const navigate = useNavigate();

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return null;
    }

    function handleBookTitle(e) {
        setBookTitle(e.target.value);
    }

    function handleBookDescription(e) {
        setBookDescription(e.target.value);
    }

    async function handleSaveBook(event) {
        event.preventDefault();

        const userDetails = retrieveUserDetails();

        const data = {
            user_id: userDetails.id,
            book_title: bookTitle,
            book_description: bookDescription
        };

        const response = await fetch(`http://localhost:9000/api/books/create/${id}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            navigate(-1);
        }
    }

    return (
        <>
            <div className="create-book">
                <div className="top-grid">
                    <h1 className="title">Create a new book</h1>
                </div>
                <form className="forms" onSubmit={(event) => handleSaveBook(event)}>
                    <label htmlFor="book-title">Book title:</label>
                    <input
                        type="text"
                        id="book-title"
                        name="book-title"
                        required={true}
                        minLength={1}
                        maxLength={50}
                        onChange={handleBookTitle}
                    />
                    <label htmlFor="book-description">Book description (optional):</label>
                    <textarea
                        type="text"
                        id="book-description"
                        name="book-description"
                        rows={4}
                        cols={30}
                        onChange={handleBookDescription}
                    />
                    <button style={{ margin: "1rem 0 0 0"}}>Create</button>
                    <button style={{ margin: "1rem 0 0 0"}} type="button" onClick={() => navigate(-1)}>Cancel</button>
                </form>
            </div>
            <Footer />
        </>
    );
};

export default CreateBook;