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
import AddMembers from "./AddMembers";
import CreateBook from "./CreateBook";
import ViewBook from "./ViewBook";
import EditBook from "./EditBook";

function App() {
  const [response, setResponse] = useState("");
  sessionStorage.setItem("pageCount", 1);

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
          <Route path="/groups/:id" element={<ViewGroup />} />
          <Route path="/groups/edit/:id" element={<EditGroup />} />
          <Route path="/groups/add-members/:id" element={<AddMembers />} />
          <Route path="/books/create/:id" element={<CreateBook />} />
          <Route path="/books/view/:id" element={<ViewBook />} />
          <Route path="/books/edit/:id" element={<EditBook />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
