import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SearchIcon from "../assets/search-icon.png";
import Dialog from "./Dialog";
import Footer from "./Footer";

/**
 * ViewGroup component
 * 
 * This component displays the group's details and books.
 * The view is different for admins, collaborators and non-members.
 * Admins see the option to create a new book.
 * A search bar helps the user find a specific book.
 * 
 * @returns {JSX.Element}
 */
const ViewGroup = () => {
    const { group_name } = useParams();
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [isMainAdmin, setIsMainAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCollaborator, setIsCollaborator] = useState(false);
    const [dialog, setDialog] = useState(false);
    const [books, setBooks] = useState([""]);

    const [searchBook, setSearchBook] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchGroup();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetches the group's details and books
    async function fetchGroup() {
        const token = sessionStorage.getItem("token");

        try {
            const userDetails = token && token !== "undefined" ? retrieveUserDetails() : null;

            const data = userDetails ? { user_id: userDetails.id } : null;

            if (data) {
                const response = await fetch(`http://localhost:9000/api/groups/${group_name}`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const res = await response.json();

                    setGroupName(res.group.group_name);
                    setGroupDescription(res.group.group_description);

                    if (res.is_main_admin) {
                        setIsMainAdmin(true);
                    } else if (res.is_admin) {
                        setIsAdmin(true);
                    } else if (res.is_collaborator) {
                        setIsCollaborator(true);
                    }

                    const user = {
                        user_id: userDetails.id
                    };

                    const booksResponse = await fetch(`http://localhost:9000/api/books/${group_name}`, {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(user)
                    });

                    if (booksResponse.ok) {
                        const booksRes = await booksResponse.json();

                        setBooks(booksRes);
                    }
                }
            }

        } catch (error) {
            console.log(error);
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

    function redirectToAddMembers() {
        navigate(`/groups/add-members/${group_name}`);
    }

    function redirectToEditGroup(id) {
        navigate(`/groups/edit/${id}`);
    }

    function returnToHomepage() {
        navigate("/");
    }

    function toggleDialog() {
        setDialog(!dialog);
    }

    function redirectToCreateBook(group_name) {
        navigate(`/books/create/${group_name}`);
    }

    async function deleteGroup(id) {
        const token = sessionStorage.getItem("token");

        try {
            if (token && token !== "undefined") {
                const response = await fetch(`http://localhost:9000/api/groups/delete/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
    
                if (response.ok) {
                    navigate(-1);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    function viewBook(id) {
        navigate(`/books/view/${id}`);
    }

    function handleSearchBook(e) {
        setSearchBook(e.target.value);

        if (e.target.value === "") {
            fetchGroup();
        }
    }

    async function findBook(searchBook) {
        if (searchBook.trim() !== "") {
            const data = {
                group_name: group_name
            };

            const response = await fetch(`http://localhost:9000/api/books/search/${searchBook}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const res = await response.json();

                setBooks(res);
            }
        }
    }

    async function leaveGroup(group_name) {
        const userDetails = retrieveUserDetails();
        
        const data = {
            username: userDetails.username
        };

        try {
            const response = await fetch(`http://localhost:9000/api/groups/leave_group/${group_name}`, {
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
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <div className="group-page">
                <div className="top-grid">
                    <h1 className="title">{groupName}</h1>
                    <h2 className="description">{groupDescription}</h2>
                    {isMainAdmin || isAdmin ? (
                        <button type="button" onClick={() => redirectToAddMembers(group_name)}>Add members</button>
                    ) : null}
                    {isMainAdmin || isAdmin ? (
                        <button onClick={() => redirectToEditGroup(group_name)}>Edit group details</button>
                    ) : null}
                    {isMainAdmin ? (
                        <button onClick={toggleDialog}>Delete group</button>
                    ) : null}
                    {isCollaborator ? (
                        <button onClick={() => redirectToEditGroup(group_name)}>View group details</button>
                    ) : null}
                    {isCollaborator || isAdmin ?
                        <button onClick={() => leaveGroup(group_name)}>Leave group</button>
                    : null}
                    <button onClick={() => navigate(-1)}>Back</button>
                    <button onClick={(returnToHomepage)}>Home</button>
                    <Dialog
                        isOpen={dialog}
                        onClose={toggleDialog}
                        title="Attention"
                        content="Are you sure you want to delete this group? You will lose all books and recipes"
                        funct={() => deleteGroup(group_name)}
                    >
                    </Dialog>
                </div>
                <div className="group-options">
                    {isMainAdmin || isAdmin ? 
                        <button type="button" className="create-book-button" onClick={() => redirectToCreateBook(group_name)}>Create a new book</button>
                    : null}
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search for a book"
                            onChange={handleSearchBook}
                        />
                        <img src={SearchIcon} onClick={() => findBook(searchBook)} />
                    </div>
                </div>
                <div className="books">
                    {books.length > 0 ? books.map((book) => (
                        <div key={book._id} id={book._id} className="book" style={{ margin: "0 0 1rem 0" }} onClick={() => viewBook(book._id)}>
                            <div key={book._id} className="cover">    
                                <h3>{book.book_title}</h3>
                                <p>{book.book_description}</p>
                            </div>
                        </div>
                    ))
                    : <p>No books available</p>}
                </div>
            </div>
            <Footer />
        </>
    )

};

export default ViewGroup;