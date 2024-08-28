import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Footer from "./Footer";

const DirectMessage = () => {
    const [username, setUsername] = useState("");
    const [nameTitle, setNameTitle] = useState("");
    const [lastName, setLastName] = useState("");
    const [recipientUsername, setRecipientUsername] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [result, setResult] = useState("");

    const [error, setError] = useState("");
    const errorRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const userDetails = retrieveUserDetails();

        setUsername(userDetails.username);
        setNameTitle(userDetails.name_title);
        setLastName(userDetails.last_name);

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

    function handleRecipientUsername(e) {
        setRecipientUsername(e.target.value);
    }

    function handleSubject(e) {
        setSubject(e.target.value);
    }

    function handleMessage(e) {
        setMessage(e.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const data = {
            username: username,
            recipient_username: recipientUsername,
            subject: subject,
            message: message
        };

        const response = await fetch("http://localhost:9000/api/direct-message", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const res = await response.json();

            setResult(res.message);
            setError("");
            
        } else {
            const res = await response.json();

            setError(res.error);
        }
    }

    return (
        <>
            {username ?
                <div className="direct-message">
                    <div className="top-bar">
                        <h1 className="title">Direct message</h1>
                        <button type="button" className="first" onClick={() => navigate(-1)}>Back</button>
                        <button type="button" className="second" onClick={() => navigate("/")}>Home</button>
                    </div>
                    <form className="forms" onSubmit={(event) => handleSubmit(event)}>
                        <p>Please note the message will be sent on your behalf from Culinary Fusion</p>
                        <label htmlFor="username">Enter the recipient username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required={true}
                            onChange={handleRecipientUsername}
                        />
                        <label htmlFor="subject">Email subject (optional)</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            onChange={handleSubject}
                        />
                        <label htmlFor="message">Please enter the message</label>
                        <textarea
                            id="message"
                            name="message"
                            rows={5}
                            cols={35}
                            required={true}
                            onChange={handleMessage}
                        />
                        <p>We will provide the recipient with your email address, so that they may reply using your email address.</p>
                        <p>This is what the email will look like:</p>
                        <div className="email-to-be-sent">
                            <p>Subject: {subject}</p>
                            <p>Hello Mr/Mrs/Miss/Dr/Chef {recipientUsername}</p>
                            <p>This email is from {username}</p>
                            <p>{message}</p>
                            <p>Regards,</p>
                            <p>{nameTitle} {lastName}</p>
                        </div>
                        <div ref={errorRef} style={{ display: "none", color: "red" }}>
                            <p>{error}</p>
                        </div>
                        <p style={{ color: "green" }}>{result}</p>
                        <button onClick={(event) => handleSubmit(event)}>Send</button>
                        <button type="button" onClick={() => navigate(-1)} style={{ margin: "1rem 0 0 0" }}>Back</button>
                    </form>
                </div>
            : 
            <div>
                <p>Please login first</p>
                <button onClick={() => navigate("/login")}>Login</button>
            </div>}
            <Footer />
        </>
    );
};

export default DirectMessage;