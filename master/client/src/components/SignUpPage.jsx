import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
    const [nameTitle, setNameTitle] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [preference, setPreference] = useState("");

    const [error, setError] = useState("");
    const errorRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            errorRef.current.style.display = "block";
        } else {
            errorRef.current.style.display = "none";
        }

    }, [error]);

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

    function handlePassword(e) {
        setPassword(e.target.value);
    }

    function handlePreference(e) {
        setPreference(e.target.value);
    }

    function handleSave(event) {
        event.preventDefault();

        const data = {
            name_title: nameTitle,
            first_name: firstName,
            last_name: lastName,
            username: username,
            password: password,
            dietary_preferences: preference
        }

        fetch("http://localhost:9000/api/users/add-user", {
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
                sessionStorage.setItem("username", res.username);
                sessionStorage.setItem("name_title", res.name_title);
                sessionStorage.setItem("last_name", res.last_name);
                navigate("/");
            }
        })
        .catch(err => console.log(err));
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">Sign up page</h1>
            </div>
            <div className="sign-up">
                <form className="forms" onSubmit={(event) => handleSave(event)}>
                    <select value={nameTitle} onChange={handleNameTitle} required={true}>
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
                            minLength={1}
                            maxLength={50}
                            onChange={handleFirstName}
                        />
                    </label>
                    <label>Last name:
                        <input
                            type="text"
                            name="last-name"
                            required={true}
                            minLength={1}
                            maxLength={50}
                            onChange={handleLastName}
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
                            minLength={3}
                            maxLength={20}
                            onChange={handleUsername}
                        />
                    </label>
                    <label>Password:
                        <input
                            type="password"
                            name="password"
                            required={true}
                            minLength={4}
                            onChange={handlePassword}
                        />
                    </label>
                    <label htmlFor="dietary-preference">Dietary preferences:</label>
                    <textarea
                        id="dietary-preference"
                        name="dietary-preference"
                        rows={10}
                        cols={30}
                        onChange={handlePreference}
                    />
                    <button>Save</button>
                    <button type="button" onClick={() => navigate(-1)}>Cancel</button>
                </form>
            </div>
        </>
    );
}

export default SignUpPage;