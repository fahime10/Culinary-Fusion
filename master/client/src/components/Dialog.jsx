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
            document.body.style.overflow = "hidden";
            return "dialog active";

        } else {
            document.body.style.overflow = "";
        }
        return "dialog";
    }

    return (
        <>
            <dialog className={dialogOpen(isOpen)} ref={ref}>
                <h1>{title}</h1>
                <p>{content}</p>
                <button onClick={funct}>Yes</button>
                <button onClick={onClose}>No</button>
            </dialog>
        </>
    );
}

export default Dialog;