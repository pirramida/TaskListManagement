import React, { useState } from 'react';
import { Routes, Route, Link } from "react-router-dom"; // Импортируем необходимые компоненты
import AddClientPage from "./Pages/AddClientPage/AddClientPage";
import HeaderPages from "./Pages/HeaderPages/HeaderPages";
import MainPage from "./Pages/MainPage/MainPage";
import TrainingCalendar from "./Pages/TrainingCalendar/TrainingCalendar";
import CalculationPage from "./Pages/CalculationsPage/CalculationsPage";
import CalorieСheckPage from "./Pages/CalorieСheckPage/CalorieСheckPage";
import AllClientsPage from "./Pages/AllClientsPage/AllClientsPage";
import PayPage from "./Pages/PayPage/PayPage";
import { ToastContainer } from 'react-toastify';
import LoginPage from "./Pages/LoginPage/LoginPage.jsx";

const App: React.FC = () => {
  const [onLogin, setOnLogin] = useState();
  return (
    <div >
      
      <HeaderPages />
      
      <Routes>
        <Route path="/" element={<LoginPage onLogin={onLogin} />} />
        <Route path="/addClient" element={<AddClientPage />} /> 
        <Route path="/MainPage" element={<MainPage />} /> 
        <Route path="/trainingCalendar" element={<TrainingCalendar />} /> 
        <Route path="/calculators" element={<CalculationPage />} /> 
        <Route path="/calories" element={<CalorieСheckPage />} /> 
        <Route path="/allClients" element={<AllClientsPage />} /> 
        <Route path="/payPage" element={<PayPage />} />

      </Routes>
      <ToastContainer />
    </div>
  );
};


export default App;
