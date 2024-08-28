import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

const ForgottenPassword = () => {
    const [username, setUsername] = useState("");
    const [sent, setSent] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

    function handleUsername(e) {
        setUsername(e.target.value);
    }

    function handlePasscode(e) {
        setPasscode(e.target.value);
    }

    function handleNewPassword(e) {
        setNewPassword(e.target.value);
    }

    function handleConfirmPassword(e) {
        setConfirmPassword(e.target.value);
    }

    function handleChange(event) {
        event.preventDefault();

        if (newPassword === confirmPassword) {
            const data = {
                username: username,
                passcode: passcode,
                new_password: newPassword
            };

            fetch("http://localhost:9000/api/users/forgotten-password/change", {
                method: "POST",
                headers : {
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
                    navigate("/login-page");
                }
            })
            .catch(err => console.log(err));

        } else {
            setError("The new password and confirm password do not match");
        }
    }

    function handleSent() {
        const data = {
            username: username
        };

        fetch("http://localhost:9000/api/users/forgotten-password/request", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then((res) => {
            console.log(res.sent);
            setSent(res.sent);
        })
        .catch(error => console.log(error));
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">Forgotten password</h1>
            </div>
            <form className="forms" onSubmit={(event) => handleChange(event)}>
                {!sent ?
                    <div>
                        <h2>Please enter your username to generate a passcode</h2>
                        <label>Username:
                            <input
                                type="text"
                                required={true}
                                minLength={3}
                                onChange={handleUsername}
                            />
                        </label>
                        <button type="button" onClick={handleSent} style={{ width: "8rem" }}>Send username</button>
                    </div>
                : 
                    <div className="flex-column">
                        <p>Please check the spam folder for emails from culinaryfusionmail@gmail.com</p>
                        <p>It may take a few minutes</p>
                        <label>Passcode:
                            <input
                                type="text"
                                required={true}
                                onChange={handlePasscode}
                            />
                        </label>
                        <label>New password:
                            <input
                                type="password"
                                required={true}
                                minLength={4}
                                placeholder="Minimum 4 characters"
                                onChange={handleNewPassword}
                            />
                        </label>
                        <label>Confirm password:
                            <input
                                type="password"
                                required={true}
                                onChange={handleConfirmPassword}
                            />
                        </label>
                        <button style={{ margin: "1rem 0" }}>Change</button>
                    </div>
                }
                <div ref={errorRef} style={{ display: "none", color: "red" }}>
                    <p>{error}</p>
                </div>
                <button type="button" onClick={() => navigate(-1)}>Cancel</button>
            </form>
            <Footer />
        </>
    );
};

export default ForgottenPassword;