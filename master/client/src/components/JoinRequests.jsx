import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "../joinRequest.css";
import { jwtDecode } from "jwt-decode";

/**
 * JoinRequest component
 * 
 * This component presents a list of join requests for the current user.
 * 
 * @param {boolean} props.isOpen - If true, then show the dialog
 * @param {function}  props.onClose - It closes the dialog, with the click of a button
 * @param {array} props.notifications - List of notifications for the user
 * @param {function} props.setNotifications - Function to set the state for notifications
 * @returns {JSX.Element}
 */
const JoinRequest = ({ isOpen, onClose, notifications, setNotifications }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (isOpen) {
            ref.current.showModal();
        } else {
            ref.current.close();
        }

    }, [isOpen, notifications]);

    function joinRequestOpen(isOpen) {
        if (isOpen) {
            return "join-request active";
        }
        return "join-request";
    }

    function retrieveUserDetails() {
        if (sessionStorage.getItem("token")) {
            const token = sessionStorage.getItem("token");

            const decodedToken = jwtDecode(token);

            return decodedToken;
        }
        return "";
    }

    async function handleAccept(notification) {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            try {
                const data = {
                    user_id: notification.user_id,
                    group_id: notification.group_id,
                    username: userDetails.username
                };

                const response = await fetch(`http://localhost:9000/api/join-requests/accept-request/${notification._id}`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const res = await response.json();
                    const message = res.message;

                    setNotifications(prevNotifications => 
                        prevNotifications.map(n => n._id === notification._id ? { ...n, message, responded: true } : n)
                    );
                }

            } catch (error) {
                console.log(error);
            }
        }
    }

    async function handleDelete(notification) {
        const userDetails = retrieveUserDetails();

        if (userDetails) {
            try {
                const data = {
                    group_id: notification.group_id,
                    user_id: notification.user_id,
                    username: userDetails.username
                };

                const response = await fetch(`http://localhost:9000/api/join-requests/delete-request/${notification._id}`, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const res = await response.json();
                    const message = res.message;

                    setNotifications(prevNotifications => 
                        prevNotifications.map(n => n._id === notification._id ? { ...n, message, responded: true } : n)
                    );
                }

            } catch (error) {
                console.log(error);
            }
        }
    }

    return (
        <>
            <dialog className={joinRequestOpen(isOpen)} ref={ref}>
                <h2>Notifications</h2>
                <button type="button" onClick={onClose}>Close</button>
                {notifications.length > 0 ? 
                    notifications.map((notification) => (
                        <div key={notification._id} id={notification._id} className="notification">
                            {notification.responded ? (
                                <p>{notification.message}</p>
                            ) : (
                                <>
                                    <p>Username <u>{notification.user_id.username}</u> has invited you to their group <u>{notification.group_id.group_name}</u></p>
                                    <button type="button" className="accept" onClick={() => handleAccept(notification)}>Accept</button>
                                    <button type="button" className="refuse" onClick={() => handleDelete(notification)}>Refuse</button>
                                </>
                            )}
                        </div>
                    ))
                :
                    <h2>No notifications</h2>
                }
            </dialog>
        </>
    )
}

JoinRequest.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    notifications: PropTypes.array.isRequired,
    setNotifications: PropTypes.func.isRequired
};

export default JoinRequest;