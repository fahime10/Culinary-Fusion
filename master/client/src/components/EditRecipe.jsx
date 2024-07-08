import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const EditRecipe = () => {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [chef, setChef] = useState("");
    const [checked, setChecked] = useState(false);
    const [description, setDescription] = useState("");
    const [ingredients, setIngredients] = useState([{ id: uuidv4(), value: ""}]);
    const [steps, setSteps] = useState([{ id: uuidv4(), value: ""}]);

    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:9000/api/recipes/${id}`, {
            method: "GET"
        })
        .then((res) => res.json())
        .then((res) => {
            setTitle(res.title);
            setChef(res.chef);
            setChecked(res.private);
            setDescription(res.description);
            setIngredients(res.ingredients.map(ingredient => ({ id: uuidv4(), value: ingredient })));
            setSteps(res.steps.map(step => ({ id: uuidv4(), value: step})));

            if (res.image) {
                setImage(res.image);
                setImageUrl(`data:image/jpeg;base64,${res.image}`);
            }
        })
        .catch(err => console.log(err));
    }, [id]);

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

    function handleChecked(e) {
        setChecked(e.target.checked);
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

        fetch(`http://localhost:9000/api/recipes/edit-recipe/${id}`, {
            method: "POST",
            body: data
        })
        .catch(err => console.log(err));

        navigate(`/recipe/${id}`);
    }

    function redirectToViewRecipe(id) {
        navigate(`/recipe/${id}`);
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">Edit recipe</h1>
            </div>
            <div className="edit-recipe">
                <form className="forms" onSubmit={(e) => e.preventDefault()}>
                    <label>Title:
                        <input 
                            type="text"
                            name="title"
                            required={true}
                            maxLength={50}
                            value={title}
                            onChange={handleTitle}
                        />
                    </label>
                    <label htmlFor="image-file">Image:</label>
                    {imageUrl && <img src={imageUrl} style={{ width: "200px", height: "200px"}} />}
                    <input
                        id="image-file" 
                        type="file" 
                        onChange={handleImage} 
                    />
                    <label>Chef:
                        <input 
                            type="text"
                            name="chef"
                            value={chef}
                            required={true}
                            onChange={handleChef}
                        />
                    </label>
                    <label>Private recipe: 
                        <input 
                            type="checkbox"
                            checked={checked}
                            onChange={handleChecked}
                        />
                    </label>
                    <label htmlFor="description">Description:</label>
                    <textarea 
                        id="description"
                        name="text" 
                        rows={10}
                        cols={30}
                        value={description}
                        onChange={handleDescription}
                    />
                    <div className="edit-recipe-ingredients">
                        <label htmlFor="ingredients">Ingredients:</label>
                        {ingredients.map((ingredient) => (
                            <input 
                                id="ingredients"
                                type="text"
                                key={ingredient.id}
                                className="ingredient"
                                name="ingredients"
                                value={ingredient.value}
                                required={true}
                                onChange={(event) => handleIngredientsChange(ingredient.id, event)}
                            /> 
                        ))}
                        <button onClick={addIngredient}>Add one more ingredient</button>
                        <button onClick={removeIngredient}>Remove last ingredient</button>
                    </div>
                    <div className="edit-recipe-steps">
                        <label htmlFor="steps">Steps:</label>
                        {steps.map((step) => (
                            <input
                                id="steps" 
                                type="text"
                                key={step.id}
                                className="step"
                                name="steps"
                                value={step.value}
                                required={true}
                                onChange={(event) => handleStepsChange(step.id, event)}
                            /> 
                        ))}
                        <button onClick={addStep}>Add one more step</button>
                        <button onClick={removeStep}>Remove last step</button>
                    </div>
                    <button type="button" onClick={() => {handleSave(); redirectToViewRecipe(id);}}>Save</button>
                    <button type="button" onClick={() => navigate(-1)}>Cancel</button>
                </form>
            </div>
        </>
    );
}

export default EditRecipe;