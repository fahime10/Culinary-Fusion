import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Footer from "./Footer";

const CreateGroup = () => {
    const [username, setUsername] = useState("");
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");

    const [error, setError] = useState("");
    const errorRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const userDetails = retrieveUserDetails();

        if (token) {
            setUsername(userDetails.username);
        }

    }, []);

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

    function handleCreateGroup(event) {
        event.preventDefault();

        const userDetails = retrieveUserDetails();

        const data = {
            user_id: userDetails.id,
            group_name: groupName,
            group_description: groupDescription,
            role: "admin"
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
                <div className="top-bar">
                    <h1 className="title">Create a new group</h1>
                    <button className="first" type="button" onClick={() => navigate(-1)}>Back</button>
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
                        <button>Create</button>
                        <button type="button" onClick={() => navigate(-1)}>Cancel</button>
                    </form>    
                : <p>Please login before creating a group</p>}
            </div>
            <Footer />
        </>
    )

};

export default CreateGroup;