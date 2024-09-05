import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Footer from "./Footer";

/**
 * EditGroup component
 * 
 * This component presents a web form for editing group details.
 * In this component, details such as group name and description can be edited.
 * 
 * If the current user is an admin, the user can also promote, demote or remove members.
 * 
 * @returns {JSX.Element}
 */
const EditGroup = () => {
    const { group_name } = useParams();
    const [isMainAdmin, setIsMainAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCollaborator, setIsCollaborator] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");

    const [mainAdmin, setMainAdmin] = useState("");
    const [admins, setAdmins] = useState([""]);
    const [collaborators, setCollaborators] = useState([""]);

    const [error, setError] = useState("");
    const errorRef = useRef(null);

    const navigate = useNavigate();

    // Retrieves group details
    useEffect(() => {
        const token = sessionStorage.getItem("token");

        async function fetchGroup() {
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

                    const res = await response.json();

                    if (response.ok) {
                        setGroupName(res.group.group_name);
                        setGroupDescription(res.group.group_description);
                        setMainAdmin(res.group.user_id.username);
                        setAdmins(res.group.admins);
                        setCollaborators(res.group.collaborators);

                        if (res.is_main_admin) {
                            setIsMainAdmin(true);
                        }

                        if (res.is_admin) {
                            setIsAdmin(true);
                        }

                        if (res.is_collaborator) {
                            setIsCollaborator(true);
                        }
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }

        fetchGroup();

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Extracts details such as user ID, group name, description and packages it into a JSON object to be sent to the server
    function handleEditGroup(event) {
        event.preventDefault();

        const userDetails = retrieveUserDetails();

        const data = {
            user_id: userDetails.id,
            new_group_name: groupName,
            group_description: groupDescription
        };

        fetch(`http://localhost:9000/api/groups/edit/${group_name}`, {
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

    async function promote(username) {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            try {
                const data = {
                    user_id: userDetails.id,
                    username: username
                };

                const response = await fetch(`http://localhost:9000/api/groups/promote/${group_name}`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const res = await response.json();

                    setCollaborators(res.collaborators);
                    setAdmins(res.admins);
                }

            } catch (error) {
                console.log(error);
            }
        }
    }

    async function demote(username) {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            try {
                const data = {
                    user_id: userDetails.id,
                    username: username
                };

                const response = await fetch(`http://localhost:9000/api/groups/demote/${group_name}`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const res = await response.json();

                    setCollaborators(res.collaborators);
                    setAdmins(res.admins);
                }
                
            } catch (error) {
                console.log(error);
            }
        }
    }

    async function removeMember(username) {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            try {
                const data = {
                    user_id: userDetails.id,
                    username: username
                };

                const response = await fetch(`http://localhost:9000/api/groups/remove/${group_name}`, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const res = await response.json();

                    setCollaborators(res.collaborators);
                    setAdmins(res.admins);
                }
                
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <>
            <div className="edit-group">
                <div className="top-bar">
                    <h1 className="title">{groupName}</h1>
                    <button className="first" type="button" style={{ margin: "0 0 1rem 0"}} onClick={() => navigate(-1)}>Back</button>
                </div>
                {isMainAdmin || isAdmin ?
                    <div className="edit-group">
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
                            <label htmlFor="group-description" style={{ margin: "1rem 0 0 0 " }}>Group description (optional):</label>
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
                            <button style={{ margin: "1rem 0" }}>Edit</button>
                            <button type="button" onClick={() => navigate(-1)}>Cancel</button>
                        </form>
                        <div className="boxed">
                            <p>Main admin: {mainAdmin}</p>
                        </div>
                        <div className="boxed">
                            <p>Admins of this group:</p>
                            {admins.length > 0 ?
                                admins.map((admin) => (
                                    <div key={admin} id={admin} className="admins">
                                        <p>{admin}</p>
                                        <button type="button" onClick={() => demote(admin)}>Demote</button>
                                        <button type="button" onClick={() => removeMember(admin)}>Remove</button>
                                    </div>
                                )) 
                            : <p>Currently no admins</p>}
                        </div>
                        <div className="boxed">
                            <p>Collaborators of this group:</p>
                            {collaborators.length > 0 ?
                                collaborators.map((collaborator) => (
                                    <div key={collaborator} id={collaborator} className="collaborators">
                                        <p>{collaborator}</p>
                                        <button type="button" onClick={() => promote(collaborator)}>Promote</button>
                                        <button type="button" onClick={() => removeMember(collaborator)}>Remove</button>
                                    </div>
                                )) 
                            : <p>Currently no collaborators</p>}
                        </div>
                    </div>
                : 
                isCollaborator ? 
                    <div className="edit-group">
                        <div className="forms">
                            <label htmlFor="group-name">Group name:</label>
                            <input
                                id="group-name"
                                type="text"
                                name="group-name"
                                value={groupName}
                                disabled={true}
                            />
                            <label htmlFor="group-description" style={{ margin: "1rem 0 0 0" }}>Group description:</label>
                            <textarea
                                id="group-description"
                                rows={4}
                                cols={30}
                                name="group-description"
                                value={groupDescription}
                                disabled={true}
                            />
                        </div>
                        <div className="boxed">
                            <p>Main admin: {mainAdmin}</p>
                        </div>
                        <div className="boxed">
                            <p>Admins of this group:</p>
                            {admins.length > 0 ?
                                admins.map((admin) => (
                                    <div key={admin} id={admin}>
                                        <p>{admin}</p>
                                    </div>
                                )) 
                            : <p>Currently no admins</p>}
                        </div>
                        <div className="boxed">
                            <p>Collaborators of this group:</p>
                            {collaborators.length > 0 ?
                                collaborators.map((collaborator) => (
                                    <div key={collaborator} id={collaborator}>
                                        <p>{collaborator}</p>
                                    </div>
                                )) 
                            : <p>Currently no collaborators</p>}
                        </div>
                    </div>
                    :
                    <p>Please login first</p>}
            </div>
            <Footer />
        </>
    )
};

export default EditGroup;