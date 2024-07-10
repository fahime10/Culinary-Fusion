import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../menuContainer.css";
import AccountIcon from "../assets/account-icon.png";

const MenuContainer = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();

    function toggleMenu() {
        setIsOpen(!isOpen);
    }

    function closeMenu() {
        setIsOpen(false);
    }

    return (
        <>
            <div className="menu-container">
                <img src={AccountIcon} className="account" onClick={toggleMenu} />
                {isOpen && <div className="overlay" onClick={closeMenu}></div>}
                    <div className={`menu ${isOpen ? "open" : "closed"}`}>
                        <img src={AccountIcon} className="account-icon" />
                        <button className="menu-button" onClick={() => navigate("/user-profile")}>User profile</button>
                        <button className="menu-button" onClick={() => navigate("/personal-collection")}>Personal collection</button>
                        <button type="button" onClick={toggleMenu}>Close</button>
                    </div>
            </div>
        </>
    );
};

export default MenuContainer;