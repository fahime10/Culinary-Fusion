/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

const HomePage = (props) => {
    return (
        <>
            <div className="top-bar">
                <h1>Culinary Fusion</h1>
                <h3>{props.response}</h3>
                <Link to="/add-recipe">
                    <button>Add new recipe</button>
                </Link>
            </div>
        </>
    );
};

export default HomePage;