import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../menuContainer.css";
import PropTypes from "prop-types";
import AccountIcon from "../assets/account-icon.png";
import JoinRequest from "./JoinRequests";

const MenuContainer = ({ notifications, setNotifications }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [dialog, setDialog] = useState(false);

    const navigate = useNavigate();

    function toggleMenu() {
        setIsOpen(!isOpen);
    }

    function closeMenu() {
        setIsOpen(false);
    }

    function toggleDialog() {
        setDialog(!dialog);
    }

    return (
        <>
            <div className="menu-container">
                <img src={AccountIcon} className="account" onClick={toggleMenu} />
                {notifications.length > 0  && (
                    <p className="notifications">{notifications.length}</p>
                )}
                {isOpen && <div className="overlay" onClick={closeMenu}></div>}
                    <div className={`menu ${isOpen ? "open" : "closed"}`}>
                        <img src={AccountIcon} className="account-icon" />
                        <button className="menu-button" onClick={() => navigate("/user-profile")}>User profile</button>
                        <button className="menu-button" onClick={() => navigate("/personal-collection")}>Personal collection</button>
                        <div className="notifications-flex">
                            <button className="menu-button" onClick={toggleDialog}>Check notifications</button>
                            {notifications.length > 0  && (
                                <p className="notifications">{notifications.length}</p>
                            )}
                        </div>
                        <JoinRequest
                            isOpen={dialog}
                            onClose={toggleDialog}
                            notifications={notifications}
                            setNotifications={setNotifications}
                        >
                        </JoinRequest>
                        <button type="button" className="menu-button" onClick={() => navigate("/direct-message")}>Send a message</button>
                        <button type="button" onClick={toggleMenu}>Close</button>
                    </div>
            </div>
        </>
    );
};

MenuContainer.propTypes = {
    notifications: PropTypes.array.isRequired,
    setNotifications: PropTypes.func.isRequired
};

export default MenuContainer;