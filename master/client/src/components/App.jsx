import "../main.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./HomePage";
import AddRecipe from "./AddRecipe";
import ViewRecipe from "./ViewRecipe";
import EditRecipe from "./EditRecipe";
import SignUpPage from "./SignUpPage";
import LoginPage from "./LoginPage";


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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
