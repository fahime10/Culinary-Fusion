import { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "../dialog.css";

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