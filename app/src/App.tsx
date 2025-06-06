// App.tsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import AddClientPage from "./Pages/AddClientPage/AddClientPage";
import HeaderPages from "./Pages/HeaderPages/HeaderPages";
import MainPage from "./Pages/MainPage/MainPage";
import TrainingCalendar from "./Pages/TrainingCalendar/TrainingCalendar";
import CalculationPage from "./Pages/CalculationsPage/CalculationsPage";
import CalorieСheckPage from "./Pages/CalorieСheckPage/CalorieСheckPage";
import AllClientsPage from "./Pages/AllClientsPage/AllClientsPage";
import PayPage from "./Pages/PayPage/PayPage";
import { ToastContainer } from 'react-toastify';
import LoginPage from "./Pages/LoginPage/LoginPage";

const App: React.FC = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  return (
    <div>
      {user && <HeaderPages user={user} />}

      <Routes>
        <Route path="/" element={<LoginPage setUser={setUser}/>} />
        <Route path="/addClient" element={user ? <AddClientPage user={user} /> : <Navigate to="/" />} />
        <Route path="/MainPage" element={user ? <MainPage user={user} /> : <Navigate to="/" />} />
        <Route path="/trainingCalendar" element={user ? <TrainingCalendar user={user} /> : <Navigate to="/" />} />
        <Route path="/calculators" element={user ? <CalculationPage user={user} /> : <Navigate to="/" />} />
        <Route path="/calories" element={user ? <CalorieСheckPage user={user} /> : <Navigate to="/" />} />
        <Route path="/allClients" element={user ? <AllClientsPage user={user} /> : <Navigate to="/" />} />
        <Route path="/payPage" element={user ? <PayPage user={user} /> : <Navigate to="/" />} />
      </Routes>

      <ToastContainer />
    </div>
  );
};

export default App;
