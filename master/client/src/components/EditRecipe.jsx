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
    const [quantities, setQuantities] = useState([""]);
    const [ingredients, setIngredients] = useState([{ id: uuidv4(), value: ""}]);
    const [steps, setSteps] = useState([{ id: uuidv4(), value: ""}]);

    const [categories, setCategories] = useState({
       "Appetizer": false,
       "Salad": false,
       "Soup": false,
       "Main Course": false,
       "Side dish": false,
       "Dessert": false,
       "Beverage": false, 
       "Breads": false,
       "Snack": false,
       "Sandwich": false,
       "Pasta and Noodles": false,
       "Rice and Grains": false,
       "Vegetarian and Vegan": false,
       "Gluten-free": false,
       "Dairy-free": false,
       "Low carb": false,
       "High protein": false,
       "Quick and Easy": false,
       "One Pot Meal": false,
       "Barbecue": false
    });

    const [cuisineTypes, setCuisineTypes] = useState({
        "Italian": false,
        "Mexican": false,
        "Chinese": false,
        "Indian": false,
        "Japanese": false,
        "French": false,
        "English": false,
        "Thai": false,
        "Greek": false,
        "Spanish": false,
        "Mediterranean": false,
        "Korean": false,
        "Vietnamese": false,
        "Lebanese": false,
        "Moroccan": false,
        "Caribbean": false
    });

    const [allergens, setAllergens] = useState({
        "Celery": false,
        "Cereals containing gluten": false,
        "Crustaceans (prawns, crabs, lobster)": false,
        "Eggs": false,
        "Milk": false,
        "Fish": false,
        "Lupin": false,
        "Molluscs": false,
        "Mustard": false,
        "Peanuts": false,
        "Sesame": false,
        "Soybeans": false,
        "Sulphur dioxide": false,
        "Tree nuts (almonds, hazelnuts, walnuts, ...)": false
    });

    const navigate = useNavigate();

    useEffect(() => {
        const data = {
            username: sessionStorage.getItem("username")
        };

        fetch(`http://localhost:9000/api/recipes/recipe/${id}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then((res) => res.json())
        .then((res) => {
            setTitle(res.recipe.title);
            setChef(res.recipe.chef);
            setChecked(res.recipe.private);
            setDescription(res.recipe.description);
            setQuantities(res.recipe.quantities);
            setIngredients(res.recipe.ingredients.map(ingredient => ({ id: uuidv4(), value: ingredient })));
            setSteps(res.recipe.steps.map(step => ({ id: uuidv4(), value: step})));
            
            const categoryCheckedBoxes = { ...categories };
            res.recipe.categories.forEach(category => {
                if (Object.prototype.hasOwnProperty.call(categoryCheckedBoxes, category)) {
                    categoryCheckedBoxes[category] = true;
                }
            });
            setCategories(categoryCheckedBoxes);

            const cuisineCheckboxes = { ...cuisineTypes };
            res.recipe.cuisine_types.forEach(cuisineType => {
                if (Object.prototype.hasOwnProperty.call(cuisineCheckboxes, cuisineType)) {
                    cuisineCheckboxes[cuisineType] = true;
                }
            });
            setCuisineTypes(cuisineCheckboxes);
            
            const allergensCheckboxes = { ...allergens };
            res.recipe.allergens.forEach(allergen => {
                if (Object.prototype.hasOwnProperty.call(allergensCheckboxes, allergen)) {
                    allergensCheckboxes[allergen] = true;
                }
            });
            setAllergens(allergensCheckboxes);

            if (res.recipe.image) {
                setImage(res.recipe.image);
                setImageUrl(`data:image/jpeg;base64,${res.recipe.image}`);
            }
        })
        .catch(err => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    function handleQuantityChange(index, event) {
        const newQuantities = [...quantities];
        newQuantities[index] = event.target.value;
        setQuantities(newQuantities);
    }

    function addIngredient() {
        setIngredients([...ingredients, { id: uuidv4(), value: ""}]);
        setQuantities([...quantities, ""]);
    }

    function removeIngredient(index) {
        if (ingredients.length > 1) {
            setIngredients(ingredients.filter((_, i) => i !== index));
            setQuantities(quantities.filter((_, i) => i !== index));
        } else {
            setIngredients([{ ...ingredients[0], value: "" }]);
            setQuantities([""]);
        }
    }

    function handleIngredientsChange(index, event) {
        const newIngredients = [...ingredients];
        newIngredients[index].value = event.target.value;
        setIngredients(newIngredients);
    }

    function addStep() {
        setSteps([...steps, { id: uuidv4(), value: ""}]);
    }

    function removeStep(id) {
        if (steps.length > 1) {
            setSteps(steps.filter(step => step.id !== id));
        } else {
            setSteps([{ ...steps[0], value: "" }]);
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

    function handleCheckboxChange(group, name) {
        switch(group) {
            case "categories":
                setCategories(prevState => ({
                    ...prevState,
                    [name]: !prevState[name]
                }));
                break;
            case "cuisineTypes":
                setCuisineTypes(prevState => ({
                    ...prevState,
                    [name]: !prevState[name]
                }));
                break;
            case "allergens":
                setAllergens(prevState => ({
                    ...prevState,
                    [name]: !prevState[name]
                }));
                break;
            default:
                break;
        }
    }

    function handleSave(event) {
        event.preventDefault();

        const selectedCategories = Object.keys(categories).filter(key => categories[key]);
        const selectedCuisineTypes = Object.keys(cuisineTypes).filter(key => cuisineTypes[key]);
        const selectedAllergens = Object.keys(allergens).filter(key => allergens[key]);
        
        const data = new FormData();
        data.append("title", title);
        data.append("image", image);
        data.append("chef", chef);
        data.append("description", description);
        data.append("username", sessionStorage.getItem("username"));
        data.append("isPrivate", checked);
        data.append("quantities", JSON.stringify(quantities));
        data.append("ingredients", JSON.stringify(ingredients.map(ingredient => ingredient.value)));
        data.append("steps", JSON.stringify(steps.map(step => step.value)));
        data.append("categories", JSON.stringify(selectedCategories));
        data.append("cuisine_types", JSON.stringify(selectedCuisineTypes));
        data.append("allergens", JSON.stringify(selectedAllergens));

        fetch(`http://localhost:9000/api/recipes/edit-recipe/${id}`, {
            method: "POST",
            body: data
        })
        .catch(err => console.log(err));

        navigate(`/recipe/${id}`);
    }

    function redirectToViewRecipe() {
        navigate(`/recipe/${id}`);
    }

    return (
        <>
            <div className="top-bar">
                <h1 className="title">Edit recipe</h1>
            </div>
            <div className="edit-recipe">
            <form className="forms" onSubmit={(event) => handleSave(event)}>
                    <label htmlFor="edit-title">Title:</label>
                    <textarea
                        id="edit-title"
                        name="title"
                        required={true}
                        value={title}
                        rows={2}
                        cols={30}
                        maxLength={50}
                        onChange={handleTitle}
                    />
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
                        {ingredients.map((ingredient, index) => (
                            <div key={ingredient.id} className="ingredients">
                                <input 
                                    type="text" 
                                    name="quantity"
                                    className="ingredient"
                                    value={quantities[index]}
                                    onChange={(event) => handleQuantityChange(index, event)}
                                    placeholder="Quantity"
                                />
                                <textarea 
                                    id="ingredients"
                                    className="ingredient"
                                    name="ingredients"
                                    cols={20}
                                    value={ingredient.value}
                                    required={true}
                                    placeholder="Ingredient name"
                                    onChange={(event) => handleIngredientsChange(index, event)}
                                />
                                <button type="button" onClick={() => removeIngredient(index)}>Delete</button>
                            </div>
                        ))}
                        <button type="button" className="add" onClick={addIngredient}>Add one more ingredient</button>
                    </div>
                    <div className="edit-recipe-steps">
                        <label htmlFor="steps">Steps:</label>
                        {steps.map((step) => (
                            <div key={step.id} htmlFor="steps" className="steps">
                                <textarea 
                                    id="steps"
                                    className="step"
                                    name="steps"
                                    rows={5}
                                    cols={30}
                                    value={step.value}
                                    required={true}
                                    onChange={(event) => handleStepsChange(step.id, event)}
                                />
                                <button type="button" onClick={() => removeStep(step.id)}>Delete</button>
                            </div> 
                        ))}
                        <button type="button" className="add" onClick={addStep}>Add one more step</button>
                    </div>
                    <div className="box">
                        <div className="box-title">Categories:</div>
                        <div className="checkboxes">
                            {Object.keys(categories).map(category => (
                                <label key={category}>
                                    <input  
                                        type="checkbox"
                                        checked={categories[category]}
                                        onChange={() => handleCheckboxChange("categories", category)}
                                    />
                                    {category}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="box">
                        <div className="box-title">Cuisine types:</div>
                        <div className="checkboxes">
                            {Object.keys(cuisineTypes).map(cuisineType => (
                                <label key={cuisineType}>
                                    <input  
                                        type="checkbox"
                                        checked={cuisineTypes[cuisineType]}
                                        onChange={() => handleCheckboxChange("cuisineTypes", cuisineType)}
                                    />
                                    {cuisineType}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="box">
                        <div className="box-title">Allergens:</div>
                        <div className="checkboxes">
                            {Object.keys(allergens).map(allergen => (
                                <label key={allergen}>
                                    <input  
                                        type="checkbox"
                                        checked={allergens[allergen]}
                                        onChange={() => handleCheckboxChange("allergens", allergen)}
                                    />
                                    {allergen}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button type="submit">Save</button>
                    <button type="button" className="cancel" onClick={redirectToViewRecipe}>Cancel</button>
                </form>
            </div>
        </>
    );
}

export default EditRecipe;