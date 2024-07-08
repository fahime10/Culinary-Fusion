import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const AddRecipe = () => {
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [chef, setChef] = useState("");
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState([{ id: uuidv4(), value: ""}]);
    const [steps, setSteps] = useState([{ id: uuidv4(), value: ""}]);

    const navigate = useNavigate();

    function handleTitle(e) {
        setTitle(e.target.value);
    }

    function handleImage(e) {
        const file = e.target.files[0];
        setImage(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result);
        };

        if (file) {
            reader.readAsDataURL(file);
        }
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

    function handleSave(event) {
        event.preventDefault();
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
        })
        .then(navigate("/"));
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">Add new recipe</h1>
            </div>
            <div className="add-recipe">
                <form className="forms" onSubmit={(event) => handleSave(event)}>
                    <label>Title:
                        <input 
                            type="text"
                            name="title"
                            required={true}
                            maxLength={50}
                            onChange={handleTitle}
                        />
                    </label>
                    <label htmlFor="image-file">Image:</label>
                    {imageUrl && <img src={imageUrl} style={{ width: "200px", height: "200px" }} className="image-file" />}
                    <input
                        id="image-file"
                        type="file" 
                        onChange={handleImage} 
                    />
                    <label>Chef:
                        <input 
                            type="text"
                            name="chef"
                            required={true}
                            onChange={handleChef}
                        />
                    </label>
                    <label htmlFor="description">Description:</label>
                    <textarea 
                        id="description"
                        name="text" 
                        rows={10}
                        cols={30}
                        onChange={handleDescription}
                    />
                    <div className="add-recipe-ingredients">
                        <label htmlFor="ingredients">Ingredients:</label>
                        {ingredients.map((ingredient) => (
                            <input 
                                id="ingredients"
                                type="text"
                                key={ingredient.id}
                                className="ingredient"
                                name="ingredients"
                                required={true}
                                onChange={(event) => handleIngredientsChange(ingredient.id, event)}
                            /> 
                        ))}
                        <button onClick={addIngredient}>Add one more ingredient</button>
                        <button onClick={removeIngredient}>Remove last ingredient</button>
                    </div>
                    <div className="add-recipe-steps">
                        <label htmlFor="steps">Steps:</label>
                        {steps.map((step) => (
                            <input 
                                id="steps"
                                type="text"
                                key={step.id}
                                className="step"
                                name="steps"
                                required={true}
                                onChange={(event) => handleStepsChange(step.id, event)}
                            /> 
                        ))}
                        <button onClick={addStep}>Add one more step</button>
                        <button onClick={removeStep}>Remove last step</button>
                    </div>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => navigate(-1)}>Cancel</button>
                </form>
            </div>
        </>
    );
};

export default AddRecipe;