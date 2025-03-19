import React from "react";
import { Routes, Route, Link } from "react-router-dom"; // Импортируем необходимые компоненты
import AddClientPage from "./Pages/AddClientPage/AddClientPage";
import HeaderPages from "./Pages/HeaderPages/HeaderPages";
import MainPage from "./Pages/MainPage/MainPage";
const App: React.FC = () => {
  return (
    <div >
      <HeaderPages />

      <Routes>
        <Route path="/addClient" element={<AddClientPage />} /> 
        <Route path="/main" element={<MainPage />} /> 
      </Routes>
    </div>
  );
};


export default App;
