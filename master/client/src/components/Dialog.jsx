import "../dialog.css";
import { useRef, useEffect } from "react";

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

export default Dialog;