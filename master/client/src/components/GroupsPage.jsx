import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Footer from "./Footer";

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [lastName, setLastName] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const userDetails = retrieveUserDetails();

        if (token) {
            setLastName(userDetails.last_name);
        }

        async function findGroups() {
            const data = {
                username: userDetails.username
            };

            const response = await fetch("http://localhost:9000/api/groups", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const res = await response.json();

            if (response.ok) {
                setGroups(res);
            }
        }

        findGroups();
    }, []);

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return "";
    }

    function viewGroup(id) {
        navigate(`/groups/${id}`);
    }

    return (
        <>
            <div className="groups-page">
                <div className="top-bar">
                    <h1 className="title">Groups page</h1>
                    <button className="first" type="button" onClick={() => navigate(-1)}>Back</button>
                    {lastName !== "undefined" && lastName ? 
                        <button className="second" onClick={() => navigate("/create-group")}>Create a group</button>
                    : null}
                </div>
                <div className="groups">
                    {groups.length > 0 ? groups.map((group) => (
                        <div key={group._id} id={group._id} className="group" onClick={() => viewGroup(group._id)}>
                            <h3>{group.group_name}</h3>
                            <p>{group.group_description}</p>
                        </div>
                    )) : <p>No groups found</p>}
                </div>
            </div>
            <Footer />
        </>
    )
};

export default GroupsPage;