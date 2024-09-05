import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

/**
 * EditBook component
 * 
 * This component present a web form to edit an existing book.
 * An initial fetch request is performed to find the book, and input fields are auto-filled based on the book.
 * 
 * @returns {JSX.Element}
 */
const EditBook = () => {
    const { id } = useParams();
    const [bookTitle, setBookTitle] = useState("");
    const [bookDescription, setBookDescription] = useState("");

    const [isMainAdmin, setIsMainAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const navigate = useNavigate();

    // Retrieve the book
    useEffect(() => {
        const userDetails = retrieveUserDetails();
        
        async function fetchBook() {
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
                        }

                        setBookTitle(res.book.book_title);
                        setBookDescription(res.book.book_description);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
        fetchBook();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);

    function handleBookTitle(e) {
        setBookTitle(e.target.value);
    }

    function handleBookDescription(e) {
        setBookDescription(e.target.value);
    }

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return null;
    }

    // Extracts all book details and packages it into a JSON object to be validated by the server
    async function handleEditBook(event) {
        event.preventDefault();

        const userDetails = retrieveUserDetails();

        const data = {
            user_id: userDetails.id,
            book_title: bookTitle,
            book_description: bookDescription
        };

        const response = await fetch(`http://localhost:9000/api/books/edit/${id}`, {
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
            {isMainAdmin || isAdmin ?
                <div className="edit-book">
                    <div className="top">
                        <h1 className="title">Edit book</h1>
                    </div>
                    <form className="forms" onSubmit={(event) => handleEditBook(event)}>
                        <label htmlFor="book-title">Book title:</label>
                        <input
                            type="text"
                            id="book-title"
                            name="book-title"
                            required={true}
                            minLength={1}
                            maxLength={50}
                            value={bookTitle}
                            onChange={handleBookTitle}
                        />
                        <label htmlFor="book-description">Book description (optional):</label>
                        <textarea
                            type="text"
                            id="book-description"
                            name="book-description"
                            rows={4}
                            cols={30}
                            value={bookDescription}
                            onChange={handleBookDescription}
                        />
                        <button style={{ margin: "1rem 0 0 0" }}>Save</button>
                        <button type="button" style={{ margin: "1rem 0 0 0" }} onClick={() => navigate(-1)}>Cancel</button>
                    </form>
                </div>
            : <p>You must be an admin to make changes</p>}
        </>
    );
};

export default EditBook;