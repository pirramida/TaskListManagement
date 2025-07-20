// App.tsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AddClientPage from "./Pages/AddClientPage/AddClientPage";
import HeaderPages from "./Pages/HeaderPages/HeaderPages";
import MainPage from "./Pages/MainPage/MainPage";
import TrainingCalendar from "./Pages/TrainingCalendar/TrainingCalendar";
import CalculationPage from "./Pages/CalculationsPage/CalculationsPage";
import CalorieСheckPage from "./Pages/CalorieСheckPage/CalorieСheckPage";
import AllClientsPage from "./Pages/AllClientsPage/AllClientsPage";
import PayPage from "./Pages/PayPage/PayPage";
import { ToastContainer } from "react-toastify";
import LoginPage from "./Pages/LoginPage/LoginPage";
import GenerateProgramm from "./Pages/GenerateProgrammPage/GenerateProgrammPage";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const App: React.FC = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        {user && <HeaderPages user={user} />}

        <Routes>
          <Route
            path="/"
            element={
              user ? <MainPage user={user} /> : <LoginPage setUser={setUser} />
            }
          />
          <Route
            path="/addClient"
            element={user ? <AddClientPage user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/MainPage"
            element={user ? <MainPage user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/trainingCalendar"
            element={
              user ? <TrainingCalendar user={user} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/calculators"
            element={
              user ? <CalculationPage user={user} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/calories"
            element={
              user ? <CalorieСheckPage user={user} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/allClients"
            element={
              user ? <AllClientsPage user={user} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/payPage"
            element={user ? <PayPage user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/generateProgramm"
            element={user ? <GenerateProgramm /> : <Navigate to="/" />}
          />
        </Routes>

        <ToastContainer />
      </DndProvider>
    </div>
  );
};

export default App;
