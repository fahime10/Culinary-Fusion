import "../main.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./HomePage";
import AddRecipe from "./AddRecipe";


function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
