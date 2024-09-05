import { useState } from "react";
import PropTypes from "prop-types";
import "../dropdown.css";

/**
 * DropDownMenu component
 * 
 * This is a re-usable component for producing drop down menus.
 * In this project, it is used for categories and cuisine types.
 * 
 * @param {string} props.title - Title of the drop down menu
 * @param {Object} props.options - An object where each key is a string and value is boolean
 * @param {boolean} props.options.<key> - Each key is a boolean value
 * @param {function} props.setOptions - Function to set the state in options
 * 
 * @returns {JSX.Element}
 */
const DropDownMenu = ({ title, options, setOptions }) => {
    const [isOpen, setIsOpen] = useState(false);

    function toogleDropdown() {
        setIsOpen(!isOpen);
    }

    function handleCheckboxChange(option) {
        setOptions((prevOptions) => ({
            ...prevOptions,
            [option]: !prevOptions[option],
        }));
    }

    return (
        <>
            <div className="dropdown">
                <button className="dropdown-button" onClick={toogleDropdown}>{title}</button>
                {isOpen && (
                    <ul className="dropdown-menu">
                        {Object.keys(options).map((option) => (
                            <li key={option} className="dropdown-item">
                                <label key={option}>
                                    <input 
                                        type="checkbox"
                                        checked={options[option]}
                                        onChange={() => handleCheckboxChange(option)}
                                    />
                                    {option}
                                </label>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    )
};

DropDownMenu.propTypes = {
    title: PropTypes.string.isRequired,
    options: PropTypes.objectOf(PropTypes.bool).isRequired,
    setOptions: PropTypes.func.isRequired
};

export default DropDownMenu;