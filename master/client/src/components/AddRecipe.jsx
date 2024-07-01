import { useState } from "react";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const AddRecipe = () => {
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [chef, setChef] = useState("");
    const [description, setDescription] = useState("");
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

    function handleDescription(e) {
        setDescription(e.target.value);
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
                return { ...ingredient, value: event.target.value };
            }
            return ingredient;
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
                return { ...step, value: event.target.value };
            }
            return step;
        });
        setSteps(newSteps);
    }

    function handleSave() {
        const data = new FormData();
        data.append("title", title);
        data.append("image", image);
        data.append("chef", chef);
        data.append("description", description);
        data.append("ingredients", JSON.stringify(ingredients.map(ingredient => ingredient.value)));
        data.append("steps", JSON.stringify(steps.map(step => step.value)));


        fetch("http://localhost:9000/api/recipes/add-recipe", {
            method: "POST",
            body: data
        })
        .then((res) => {
            if (res.status !== 200) {
                throw new Error(res.statusText);
            }
            return res.json();
        });
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
                        <label>Description:
                            <textarea 
                                name="text" 
                                rows={10}
                                cols={30}
                                onChange={handleDescription}
                            />
                        </label>
                        <div className="ingredients">
                            <label>Ingredients:
                                {ingredients.map((ingredient) => (
                                    <input 
                                        type="text"
                                        key={ingredient.id}
                                        className="ingredient"
                                        name="ingredients"
                                        required={true}
                                        onChange={(event) => handleIngredientsChange(ingredient.id, event)}
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
                                    onChange={(event) => handleStepsChange(step.id, event)}
                                    /> 
                                ))}
                            </label>
                            <button onClick={addStep}>Add one more step</button>
                            <button onClick={removeStep}>Remove last step</button>
                        </div>
                        <Link to="/">
                            <button type="button" onClick={handleSave}>Save</button>
                            <button type="button">Cancel</button>
                        </Link>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddRecipe;