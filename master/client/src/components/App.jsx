import "../main.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./HomePage";
import AddRecipe from "./AddRecipe";


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
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
