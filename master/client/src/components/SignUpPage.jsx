import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUpPage = () => {
    const [nameTitle, setNameTitle] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [preference, setPreference] = useState("");

    const navigate = useNavigate();

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

    function handleSave() {
        const data = new FormData();
        data.append("name_title", nameTitle);
        data.append("first_name", firstName);
        data.append("last_name", lastName);
        data.append("username", username);
        data.append("password", password);
        data.append("dietary_preference", preference);

        fetch("http://localhost:9000/api/users/add-user", {
            method: "POST",
            body: data
        })
        .then((res) => {
            if (res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        })
        .then(navigate("/"));
    }

    return (
        <>
            <div>
                <h1>Sign up page</h1>
                <div className="sign-up">
                    <form className="forms" onSubmit={handleSave}>
                        <select value={nameTitle} onChange={handleNameTitle}>
                            <option value="" disabled>Please select an option</option>
                            <option value="Mr">Mr</option>
                            <option value="Mrs">Mrs</option>
                            <option value="Miss">Miss</option>
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
                        <button onClick={() => navigate(-1)}>Save</button>
                        <button onClick={() => navigate(-1)}>Cancel</button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default SignUpPage;