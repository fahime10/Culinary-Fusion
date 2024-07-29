import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

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

    useEffect(() => {
        if (error) {
            errorRef.current.style.display = "block";
        } else {
            errorRef.current.style.display = "none";
        }

    }, [error]);

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
                <Footer />
            </div>
        </>
    );
}

export default LoginPage;