import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";

/**
 * ForgottenPassword component
 * 
 * This component presents a web form for restoring a forgotten password.
 * The user must provide their username and wait for the server to generate a passcode.
 * The user will receive an email with the passcode. Sometimes, the email can be found in the spam folder.
 * The user then inputs the passcode, and the new password, which must follow the provided pattern.
 * 
 * @returns {JSX.Element}
 */
const ForgottenPassword = () => {
    const [username, setUsername] = useState("");
    const [sent, setSent] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const errorRef = useRef(null);

    const navigate = useNavigate();

    // Waits for an error message to appear
    // If an error message appears, the div element will come into view and explain what is wrong
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

    // Extracts information such as user ID, passcode, and password. Before packaging it into a JSON object,
    // the data is validated, checking if passcode matches and if password is the same as the confirm password
    function handleChange(event) {
        event.preventDefault();

        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;

        if (!passwordPattern.test(newPassword)) {
            setError("Password must be at least 4 characters, contain at least 1 letter, 1 symbol and 1 number");
        } else if (newPassword === confirmPassword) {
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

    // Sends the username and checks if it exists
    // If it exists, user will receive an email with the passcoce
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