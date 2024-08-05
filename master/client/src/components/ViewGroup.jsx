import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import  Dialog from "./Dialog";
import Footer from "./Footer";

const ViewGroup = () => {
    const { id } = useParams();
    const [groupName, setGroupName] = useState("");
    const [groupDescription, setGroupDescription] = useState("");
    const [isMainAdmin, setIsMainAdmin] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCollaborator, setIsCollaborator] = useState(false);
    const [dialog, setDialog] = useState(false);
    // const [books, setBooks] = useState([""]);

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem("token");

        async function fetchGroup() {
            try {
                const userDetails = token && token !== "undefined" ? retrieveUserDetails() : null;

                const data = userDetails ? { user_id: userDetails.id } : null;

                if (data) {
                    const response = await fetch(`http://localhost:9000/api/groups/${id}`, {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(data)
                    });

                    if (response.ok) {
                        const res = await response.json();

                        setGroupName(res.group.group_name);
                        setGroupDescription(res.group.group_description);

                        if (res.is_main_admin) {
                            setIsMainAdmin(true);
                        }

                        if (res.is_admin) {
                            setIsAdmin(true);
                        }

                        if (res.is_collaborator) {
                            setIsCollaborator(true);
                        }
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }

        fetchGroup();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return null;
    }

    function redirectToAddMembers() {
        navigate(`/groups/add-members/${id}`);
    }

    function redirectToEditGroup(id) {
        navigate(`/groups/edit/${id}`);
    }

    function returnToHomepage() {
        navigate("/");
    }

    function toggleDialog() {
        setDialog(!dialog);
    }

    async function deleteGroup(id) {
        try {
            const response = await fetch(`http://localhost:9000/api/groups/delete/${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                navigate(-1);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <div className="group-page">
                <div className="top-grid">
                    <h1 className="title">{groupName}</h1>
                    <h2>{groupDescription}</h2>
                    {isMainAdmin || isAdmin ? (
                        <button type="button" onClick={() => redirectToAddMembers(id)}>Add members</button>
                    ) : null}
                    {isMainAdmin || isAdmin ? (
                        <button onClick={() => redirectToEditGroup(id)}>Edit group details</button>
                    ) : null}
                    {isMainAdmin ? (
                        <button onClick={toggleDialog}>Delete group</button>
                    ) : null}
                    {isCollaborator ? (
                        <button onClick={() => redirectToEditGroup(id)}>View group details</button>
                    ) : null}
                    <button onClick={() => navigate(-1)}>Back</button>
                    <button onClick={(returnToHomepage)}>Home</button>
                    <Dialog
                        isOpen={dialog}
                        onClose={toggleDialog}
                        title="Attention"
                        content="Are you sure you want to delete this group? You will lose all books and recipes"
                        funct={() => deleteGroup(id)}
                    >
                    </Dialog>
                </div>
            </div>
            <Footer />
        </>
    )

};

export default ViewGroup;