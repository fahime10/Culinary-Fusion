import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const AddRecipe = () => {
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [chef, setChef] = useState("");
    const [ingredients, setIngredients] = useState([{ id: uuidv4(), value: ""}]);
    const [steps, setSteps] = useState([{ id: uuidv4(), value: ""}]);

    function handleTitle(e) {
        setTitle(e.target.value);
    }

    function handleImage(e) {
        setImage(e.target.files[0]);
    }

    function handleChef(e) {
        setChef(e.target.value);
    }

    function addIngredient() {
        setIngredients([...ingredients, { id: uuidv4(), value: ""}]);
    }

    function removeIngredient() {
        if (ingredients.length > 1) {
            setIngredients(ingredients.slice(0, -1));
        }
    }

    function handleIngredientsChange(id, event) {
        const newIngredients = ingredients.map((ingredient) => {
            if (ingredient.id === id) {
                return { ...ingredients, value: event.target.value };
            } else {
                return ingredient;
            }
        });
        setIngredients(newIngredients);
    }

    function addStep() {
        setSteps([...steps, { id: uuidv4(), value: ""}]);
    }

    function removeStep() {
        if (steps.length > 1) {
            setSteps(steps.slice(0, -1));
        }
    }

    function handleStepsChange(id, event) {
        const newSteps = steps.map((step) => {
            if (step.id === id) {
                return { ...steps, value: event.target.value }
            } else {
                return step;
            }
        });
        setSteps(newSteps);
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
                                onChange={handleChef}
                            />
                        </label>
                        <div className="ingredients">
                            <label>Ingredients:
                                {ingredients.map((ingredient) => (
                                    <input type="text"
                                    key={ingredient.id}
                                    className="ingredient"
                                    name="ingredients"
                                    required={true}
                                    onChange={(event) => handleIngredientsChange(event)}
                                    /> 
                                ))}
                            </label>
                            <button onClick={addIngredient}>Add one more ingredient</button>
                            <button onClick={removeIngredient}>Remove last ingredient</button>
                        </div>
                        <div className="steps">
                            <label>Steps:
                                {steps.map((step) => (
                                    <input type="text"
                                    key={step.id}
                                    className="step"
                                    name="steps"
                                    required={true}
                                    onChange={(event) => handleStepsChange(event)}
                                    /> 
                                ))}
                            </label>
                            <button onClick={addStep}>Add one more step</button>
                            <button onClick={removeStep}>Remove last step</button>
                        </div>
                        <button>Save</button>
                        <Link to="/">
                            <button type="button">Cancel</button>
                        </Link>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddRecipe;