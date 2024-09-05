import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

/**
 * LoginPage component
 * 
 * This component presents a web form for logging in.
 * 
 * @returns {JSX.Element}
 */
const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const errorRef = useRef(null);

    const navigate = useNavigate();

    function handleUsername(e) {
        setUsername(e.target.value);
    }

    function handlePassword(e) {
        setPassword(e.target.value);
    }

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

    // Extracts details such as username and password and packages it into a JSON object to be sent to the server.
    // If the credentials are not valid, the function sets the error message to explain that credentials are incorrect
    function handleLogin(event) {
        event.preventDefault();

        const data = {
            username: username,
            password: password
        }

        fetch("http://localhost:9000/api/users/login", {
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
                sessionStorage.setItem("token", res.token);
                sessionStorage.setItem("pageCount", 1);
                navigate("/");
            }
        })
        .catch(err => console.log(err));
    }

    function redirectToHomepage() {
        navigate("/");
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">Login</h1>
            </div>
            <div className="login-page">
                <form className="forms" onSubmit={(event) => handleLogin(event)}>
                    <label htmlFor="username">Username:</label>
                    <input 
                        id="username"
                        name="username"
                        type="text"
                        required={true}
                        onChange={handleUsername}
                    />
                    <label htmlFor="password">Password:</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required={true}
                        onChange={handlePassword}
                    />
                    <div ref={errorRef} style={{ display: "none", color: "red" }}>
                        <p>{error}</p>
                    </div>
                    <button type="button" style={{margin: "1rem 0 0 0"}} onClick={() => navigate("/forgotten-password")}>Forgotten password?</button>
                    <button style={{margin: "1rem 0"}}>Login</button>
                    <button type="button" onClick={redirectToHomepage}>Cancel</button>
                </form>
            </div>
            <Footer />
        </>
    );
}

export default LoginPage;