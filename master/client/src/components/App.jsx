import "../main.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./HomePage";
import AddRecipe from "./AddRecipe";
import ViewRecipe from "./ViewRecipe";
import EditRecipe from "./EditRecipe";
import SignUpPage from "./SignUpPage";
import LoginPage from "./LoginPage";
import PersonalCollection from "./PersonalCollection";
import UserProfile from "./UserProfile";
import ForgottenPassword from "./ForgottenPassword";
import GroupsPage from "./GroupsPage";
import CreateGroup from "./CreateGroup";
import ViewGroup from "./ViewGroup";
import EditGroup from "./EditGroup";
import OwnGroups from "./OwnGroups";
import AddMembers from "./AddMembers";
import CreateBook from "./CreateBook";
import ViewBook from "./ViewBook";
import EditBook from "./EditBook";
import IncludeRecipe from "./IncludeRecipe";
import EditBookRecipe from "./EditBookRecipe";
import DirectMessage from "./DirectMessage";
import FavouriteRecipes from "./FavouriteRecipes";
import PopularRecipes from "./PopularRecipes";

/**
 * App component
 * 
 * This component is the controller component for the client component.
 * It redirects the user based on user interactions.
 * All the routes are defined in this component.
 * 
 * @returns List of routes
 */
function App() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetch("http://localhost:9000/api")
      .then(res => res.text())
      .then(res => setResponse(res))
      .catch(err => console.log(err));
  }, []);

  console.log(response);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage response={response} />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/recipe/:id" element={<ViewRecipe />} />
          <Route path="/recipe/edit/:id" element={<EditRecipe />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/login-page" element={<LoginPage />} />
          <Route path="/personal-collection" element={<PersonalCollection />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/forgotten-password" element={<ForgottenPassword />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/groups/:group_name" element={<ViewGroup />} />
          <Route path="/groups/edit/:group_name" element={<EditGroup />} />
          <Route path="/own-groups" element={<OwnGroups />} />
          <Route path="/groups/add-members/:group_name" element={<AddMembers />} />
          <Route path="/books/create/:id" element={<CreateBook />} />
          <Route path="/books/view/:id" element={<ViewBook />} />
          <Route path="/books/edit/:id" element={<EditBook />} />
          <Route path="/books/include/:id" element={<IncludeRecipe />} />
          <Route path="/books/recipes/edit/:id/:recipe_id" element={<EditBookRecipe />} />
          <Route path="/direct-message" element={<DirectMessage />} />
          <Route path="/favourite-recipes" element={<FavouriteRecipes />} />
          <Route path="/popular-recipes" element={<PopularRecipes />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
