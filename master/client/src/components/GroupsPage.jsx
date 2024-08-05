import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SearchIcon from "../assets/search-icon.png";
import Footer from "./Footer";

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [lastName, setLastName] = useState("");
    const [searchGroup, setSearchGroup] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const userDetails = retrieveUserDetails();

        if (token) {
            setLastName(userDetails.last_name);
        }

        fetchGroups();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function fetchGroups() {
        const userDetails = retrieveUserDetails();
        
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

    function handleFindGroup(e) {
        setSearchGroup(e.target.value);

        if (e.target.value === "") {
            fetchGroups();
        }
    }

    async function findGroup(searchGroup) {
        if (searchGroup.trim() !== "") {
            let data = {};

            const userDetails = retrieveUserDetails();

            if (userDetails) {
                data = {
                    username: userDetails.username
                };
            }

            const response = await fetch(`http://localhost:9000/api/groups/search/${searchGroup}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const res = await response.json();

                setGroups(res);
            }
        }
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
                    {lastName !== "undefined" && lastName ?
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search for a group"
                                onChange={handleFindGroup}
                            />
                            <img src={SearchIcon} onClick={() => findGroup(searchGroup)} />
                        </div>
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