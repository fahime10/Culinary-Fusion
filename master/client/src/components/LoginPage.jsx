import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    function handleUsername(e) {
        setUsername(e.target.value);
    }

    function handlePassword(e) {
        setPassword(e.target.value);
    }

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
        .then((res) => {
            if (res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        })
        .then((res) => {
            if (res.username) {
                sessionStorage.setItem("username", res.username);
                sessionStorage.setItem("name_title", res.name_title);
                sessionStorage.setItem("last_name", res.last_name);
                navigate("/");
            } else {
                setError(res.error);
            }
        })
        .catch(err => console.log(err));
    }

    function redirectToHomepage() {
        navigate("/");
    }

    return (
        <>
            <div className="login-page">
                <h1>Login</h1>
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
                    <p className="error-credentials">{error}</p>
                    <button>Login</button>
                    <button type="button" onClick={redirectToHomepage}>Cancel</button>
                </form>
            </div>
        </>
    );
}

export default LoginPage;