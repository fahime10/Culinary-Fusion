import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <>
            <div className="top-bar">
                <h1>Culinary Fusion</h1>
                <Link to="/add-recipe">
                    <button>Add new recipe</button>
                </Link>
            </div>
        </>
    );
};

export default HomePage;