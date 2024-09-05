import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "../dialog.css";

/**
 * Dialog component
 * 
 * This is a re-usable component for displaying an important message in front of all the elements.
 * For this project, it is used to ask the user if they want to delete the item selected.
 * 
 * @param {boolean} props.isOpen - If true, then show the dialog
 * @param {function}  props.onClose - It closes the dialog, with the click of a button
 * @param {string} props.title - Title of the dialog
 * @param {string} props.content - Content of the dialog
 * @param {function} props.funct - The action depends on the component it is integrated in
 * 
 * @returns {JSX.Element}
 */
const Dialog = ({ isOpen, onClose, title, content, funct }) => {
    const ref = useRef(null);

    useEffect(() => {
        if (isOpen) {
            ref.current.showModal();
        } else {
            ref.current.close();
        }
    }, [isOpen]);

    function dialogOpen(isOpen) {
        if (isOpen) {
            return "dialog active";
        }
        return "dialog";
    }

    return (
        <>
            <dialog className={dialogOpen(isOpen)} ref={ref}>
                <h1>{title}</h1>
                <p>{content}</p>
                <button type="button" onClick={funct}>Yes</button>
                <button type="button" onClick={onClose}>No</button>
            </dialog>
        </>
    );
}

Dialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    funct: PropTypes.func.isRequired
};

export default Dialog;