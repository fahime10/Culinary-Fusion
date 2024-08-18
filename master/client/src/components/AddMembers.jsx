import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { jwtDecode } from "jwt-decode";
import Footer from "./Footer";

const AddMembers = () => {
    const { group_name } = useParams();
    
    const [usernames, setUsernames] = useState([{ id: uuidv4(), value: "" }]);
    const [isLogged, setIsLogged] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            setIsLogged(true);
        }
    }, []);

    function addMember() {
        setUsernames([...usernames, { id: uuidv4(), value: "" }])
    }

    function handleUsernamesChange(id, event) {
        const newUsernames = usernames.map((username) => {
            if (username.id === id) {
                return { ...username, value: event.target.value };
            }
            return username;
        });
        setUsernames(newUsernames);
    }

    function removeMember(id) {
        if (usernames.length > 1) {
            setUsernames(usernames.filter(username => username.id !== id));
        } else {
            setUsernames([{ ...usernames[0], value: "" }]);
        }
    }

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return null;
    }

    async function handleGroupSave(event) {
        event.preventDefault();

        const userDetails = retrieveUserDetails();

        if (userDetails) {
            const data = {
                user_id: userDetails.id,
                usernames: JSON.stringify(usernames)
            };

            try {
                const response = await fetch(`http://localhost:9000/api/join-requests/create/${group_name}`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    navigate(-1);
                }
                
            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <>
            {isLogged ? 
                <div className="add-members-page">
                    <div className="top">
                        <h1 className="title">Add members page</h1>
                        <p>Please add members by inputting their usernames</p>
                        <p>You may find usernames in other people&apos;s recipes</p>
                        <p>You may not add yourself as you are in the group</p>
                    </div>
                    <form className="forms" onSubmit={(event) => handleGroupSave(event)}>
                        <div className="add-members">
                            <label htmlFor="members">Members to add:</label>
                            {usernames.map((username) => (
                                <div key={username.id} id="members" className="usernames">
                                    <input
                                        type="text"
                                        name="username"
                                        value={username.value}
                                        onChange={(event) => handleUsernamesChange(username.id, event)}
                                        required={true}
                                        placeholder="Username"
                                    />
                                    <button type="button" onClick={() => removeMember(username.id)}>Remove this field</button>
                                </div>
                            ))}
                            <button type="button" className="add" onClick={addMember}>Add more members</button>
                        </div>
                        <button type="submit" style={{ margin: "1rem 0 0 0" }}>Send requests</button>
                        <button type="button" className="cancel" onClick={() => navigate(-1)}>Cancel</button>
                    </form>
            </div>
            : 
                <div className="unauthorised">
                    <h1>You are not signed in</h1>
                    <p>Please click below to sign in</p>
                    <button type="button" onClick={() => navigate("/login-page")}>Log in page</button>
                </div>
            }
            <Footer />
        </>
    );
    
};

export default AddMembers;