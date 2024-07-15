import { useState } from "react";
import PropTypes from "prop-types";
import "../dropdown.css";

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