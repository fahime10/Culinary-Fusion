import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Footer from "./Footer";

/**
 * CreateGroup component
 * 
 * This component presents a web form for creating a group. Only signed in users can create a group.
 * 
 * @returns {JSX.Element}
 */
const CreateGroup = () => {
    const [username, setUsername] = useState("");
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");

    const [error, setError] = useState("");
    const errorRef = useRef(null);

    const navigate = useNavigate();

    // Retrieves the token from session storage to ensure the user is allowed to create a group
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const userDetails = retrieveUserDetails();

        if (token) {
            setUsername(userDetails.username);
        }

    }, []);

    // Waits for an error message to appear
    // If an error message appears, the div element will come into view and explain what is wrong
    useEffect(() => {
        if (errorRef.current) {
            if (error) {
                errorRef.current.style.display = "block";
            } else {
                errorRef.current.style.display = "none";
            }
        }

    }, [error]);

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return "";
    }

    function handleGroupName(e) {
        setGroupName(e.target.value);
    }

    function handleDescription(e) {
        setGroupDescription(e.target.value);
    }

    // Extracts details such as user ID, group name, description to be sent to the server
    // There are extra fields added in advance, admins and collaborators, which are required for later change
    function handleCreateGroup(event) {
        event.preventDefault();

        const userDetails = retrieveUserDetails();

        const data = {
            user_id: userDetails.id,
            group_name: groupName,
            group_description: groupDescription,
            admins: [],
            collaborators: []
        };

        fetch("http://localhost:9000/api/groups/create", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then((res) => {
            if (res.error) {
                setError(res.error);
            } else {
                navigate("/groups");
            }
        })
        .catch(error => console.log(error));   
    }

    return (
        <>
            <div className="create-group">
                <div className="top-grid">
                    <h1 className="title">Create a new group</h1>
                </div>
                {username ?
                    <form className="forms" onSubmit={(event) => handleCreateGroup(event)}>
                        <label htmlFor="group-name">Group name:</label>
                        <input
                            id="group-name"
                            type="text"
                            name="group-name"
                            required={true}
                            minLength={4}
                            onChange={handleGroupName}
                        />
                        <label htmlFor="group-description">Group description (optional):</label>
                        <textarea
                            id="group-description"
                            rows={4}
                            cols={30}
                            name="group-description"
                            onChange={handleDescription}
                        />
                        <div ref={errorRef} style={{ display: "none", color: "red" }}>
                            <p>{error}</p>
                        </div>
                        <button style={{ margin: "1rem 0 0 0" }}>Create</button>
                        <button style={{ margin: "1rem 0 0 0" }} type="button" onClick={() => navigate(-1)}>Cancel</button>
                    </form>    
                : <p>Please login before creating a group</p>}
            </div>
            <Footer />
        </>
    )

};

export default CreateGroup;