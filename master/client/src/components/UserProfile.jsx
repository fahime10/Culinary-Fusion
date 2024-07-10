import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "./Dialog";

const UserProfile = () => {
    const [nameTitle, setNameTitle] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [preference, setPreference] = useState("");

    const [isNotEnabled, setIsNotEnabled] = useState(true);
    const [dialog, setDialog] = useState(false);

    const [message, setMessage] = useState("");
    const messageRef = useRef(null);
    const [error, setError] = useState("");
    const errorRef = useRef(null);

    const userUsername = sessionStorage.getItem("username");

    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:9000/api/users/${userUsername}`, {
            method: "POST"
        })
        .then((res) => res.json())
        .then((res) => {
            setNameTitle(res.name_title);
            setFirstName(res.first_name);
            setLastName(res.last_name);
            setUsername(res.username);
            setPreference(res.dietary_preferences);
        })
        .catch(err => console.log(err));

    }, [userUsername]);

    useEffect(() => {
        if (message) {
            messageRef.current.style.display = "block";
        } else {
            messageRef.current.style.display = "none";
        }

        if (error) {
            errorRef.current.style.display = "block";
        } else {
            errorRef.current.style.display = "none";
        }

    }, [message, error]);

    function handleNameTitle(e) {
        setNameTitle(e.target.value);
    }

    function handleFirstName(e) {
        setFirstName(e.target.value);
    }

    function handleLastName(e) {
        setLastName(e.target.value);
    }

    function handleUsername(e) {
        setUsername(e.target.value);
    }

    function handlePreference(e) {
        setPreference(e.target.value);
    }

    function toggleEnabled(e) {
        setIsNotEnabled(!isNotEnabled);

        if (!isNotEnabled) {
            e.target.textContent = "Edit: Off";
            e.target.style.backgroundColor = "red";
        } else {
            e.target.textContent = "Edit: On";
            e.target.style.backgroundColor = "green";
        }
    }

    function handleEdit(event) {
        event.preventDefault();

        const data = {
            name_title: nameTitle,
            first_name: firstName,
            last_name: lastName,
            username: username,
            dietary_preferences: preference
        }

        fetch(`http://localhost:9000/api/users/edit-user/${userUsername}`, {
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
                setMessage("");
                setError(res.error);
            } else {
                setError("");
                setMessage(res.message);
                sessionStorage.setItem("name_title", res.name_title);
                sessionStorage.setItem("last_name", res.last_name);
                sessionStorage.setItem("username", res.username);
            }
        })
        .catch(err => console.log(err));
    }

    function toggleDialog() {
        setDialog(!dialog);
    }

    function handleDelete() {
        fetch(`http://localhost:9000/api/users/delete-user/${userUsername}`, {
            method: "DELETE"
        })
        .then((res) => res.json())
        .then((res) => {
            console.log(res.ok);
            console.log(res.status);
            if (res.status === 200) {
                navigate("/");
                sessionStorage.removeItem("username");
                sessionStorage.removeItem("last_name");
                sessionStorage.removeItem("name_title");
            }
        })
        .catch(err => console.log(err));
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">User Profile</h1>
            </div>
            <div className="edit-user">
                <button type="button" id="toggleButton" className="edit-button" onClick={(e) => toggleEnabled(e)}>Edit: Off</button>
                <form className="forms" onSubmit={(event) => handleEdit(event)}>
                    <div ref={messageRef} style={{ display: "none", color: "green" }}>
                        <p>{message}</p>
                    </div>
                    <select value={nameTitle} onChange={handleNameTitle} required={true} disabled={isNotEnabled}>
                        <option value="" disabled>Please select an option</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Miss">Miss</option>
                        <option value="Dr">Dr</option>
                        <option value="Chef">Chef</option>
                    </select>
                    <label>First name:
                        <input
                            type="text"
                            name="first-name"
                            required={true}
                            value={firstName}
                            minLength={1}
                            maxLength={50}
                            onChange={handleFirstName}
                            disabled={isNotEnabled}
                        />
                    </label>
                    <label>Last name:
                        <input
                            type="text"
                            name="last-name"
                            required={true}
                            value={lastName}
                            minLength={1}
                            maxLength={50}
                            onChange={handleLastName}
                            disabled={isNotEnabled}
                        />
                    </label>
                    <div ref={errorRef} style={{ display: "none", color: "red" }}>
                        <p>{error}</p>
                    </div>
                    <label>Username:
                        <input
                            type="text"
                            name="username"
                            required={true}
                            value={username}
                            minLength={3}
                            maxLength={20}
                            onChange={handleUsername}
                            disabled={isNotEnabled}
                        />
                    </label>
                    <label htmlFor="dietary-preference">Dietary preferences:</label>
                    <textarea
                        id="dietary-preference"
                        name="dietary-preference"
                        value={preference}
                        rows={10}
                        cols={30}
                        onChange={handlePreference}
                        disabled={isNotEnabled}
                    />
                    <button disabled={isNotEnabled}>Save</button>
                    <button type="button" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="button" onClick={toggleDialog}>Delete account</button>
                    <Dialog
                        isOpen={dialog} 
                        onClose={toggleDialog} 
                        title="Attention" 
                        content="Are you sure you want to delete your account?"
                        funct={handleDelete}
                    >
                    </Dialog>
                </form>
            </div>
        </>
    );
};

export default UserProfile;