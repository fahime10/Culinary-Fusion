import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Footer from "./Footer";

const EditGroup = () => {
    const { id } = useParams();
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
        const token = sessionStorage.getItem("token");

        async function fetchGroup() {
            try {
                const userDetails = token && token !== "undefined" ? retrieveUserDetails() : null;

                const data = userDetails ? { user_id: userDetails.id } : null;

                if (data) {
                    const response = await fetch(`http://localhost:9000/api/groups/${id}`, {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });

                    const res = await response.json();

                    if (response.ok) {
                        setGroupName(res.group.group_name);
                        setGroupDescription(res.group.group_description);
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }

        fetchGroup();

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    function handleEditGroup(event) {
        event.preventDefault();

        const userDetails = retrieveUserDetails();

        const data = {
            user_id: userDetails.id,
            group_name: groupName,
            group_description: groupDescription,
            admins: [],
            collaborators: []
        };

        fetch(`http://localhost:9000/api/groups/edit/${id}`, {
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
                navigate(-1);
            }
        })
        .catch(error => console.log(error));   
    }

    return (
        <>
            <div className="edit-group">
                <div className="top-bar">
                    <h1 className="title">Create a new group</h1>
                    <button className="first" type="button" onClick={() => navigate(-1)}>Back</button>
                </div>
                {username ?
                    <form className="forms" onSubmit={(event) => handleEditGroup(event)}>
                        <label htmlFor="group-name">Group name:</label>
                        <input
                            id="group-name"
                            type="text"
                            name="group-name"
                            required={true}
                            minLength={4}
                            value={groupName}
                            onChange={handleGroupName}
                        />
                        <label htmlFor="group-description">Group description (optional):</label>
                        <textarea
                            id="group-description"
                            rows={4}
                            cols={30}
                            name="group-description"
                            value={groupDescription}
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

export default EditGroup;