import "../loading.css";

/**
 * LoadingSpinner component
 * 
 * This is a re-usable component to show a loding screen.
 * 
 * @returns {JSX.Element}
 */
const LoadingSpinner = () => (
    <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Cooking up some recipes</p>
    </div>
);

export default LoadingSpinner;