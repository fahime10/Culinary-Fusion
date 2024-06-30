import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const AddRecipe = () => {
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [chef, setChef] = useState("");
    const [ingredients, setIngredients] = useState("");
    const [steps, setSteps] = useState("");

    function handleTitle(e) {
        setTitle(e.target.value);
    }

    function handleImage(e) {
        setImage(e.target.files[0]);
    }

    function handleChef(e) {
        setChef(e.target.value);
    }

    function handleIngredients(e) {
        setIngredients(e.target.value);
    }

    function handleSteps(e) {
        setSteps(e.target.value);
    }

    return (
        <>
            <div>
                <h1>Add new recipe</h1>
                <div className="add-recipe">
                    <form className="forms">
                        <label>Title:
                            <input type="text"
                                name="title"
                                required={true}
                                maxLength={50}
                                onChange={handleTitle}
                            />
                        </label>
                        <label>Image:
                            <input type="file" 
                                onChange={handleImage} 
                            />
                        </label>
                        <label>Chef:
                            <input type="text"
                                name="chef"
                                required={true}
                            />
                        </label>
                        <div className="ingredients">
                            <label>Ingredients:
                                <input type="text"
                                    name="ingredients"
                                    required={true}
                                />
                            </label>
                            <button>Add one more ingredient</button>
                            <button>Remove last ingredient</button>
                        </div>
                        <div className="steps">
                            <label>Steps:
                                <input type="text"
                                    name="steps"
                                    required={true}
                                />
                            </label>
                            <button>Add one more step</button>
                            <button>Remove last step</button>
                        </div>
                        <button>Save</button>
                        <button>Cancel</button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddRecipe;