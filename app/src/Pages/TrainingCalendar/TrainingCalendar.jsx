import React, { useState, useEffect } from "react";
import GoogleCalendar from "../../components/GoogleCalendar";
import { fetchWithRetry } from "../../utils/refreshToken";
import { addToast } from "../../utils/addToast";

const TrainingCalendar = ({ user }) => {
  const [statNumber, setStatNumber] = useState("");
  const [status, setStatus] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetchWithRetry(
        `/users`,
        "GET"
      );

      setStatNumber(response[0].dateUpdate);

    } catch (error) {
      console.error("Ошибка при получении данных:", error);
      setStatus("Ошибка загрузки");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const number = parseInt(statNumber, 10);
    if (isNaN(number) || number < 1 || number > 32) {
      setStatus("Введите число от 1 до 32");
      return;
    }

    try {
      const response = await fetchWithRetry("/users/dateUpdate", "PATCH", {
        dateUpdate: number,
        id: 1,
      }); //изменть надо будет с Юлю!

      if (response.ok) {
        setStatus("");
        addToast("Обновление успешно отправлено", "success");
      } else {
        setStatus("Ошибка при отправке");
        addToast("Ошибка при отправке", "error");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      setStatus("Ошибка сети");
    }
  };

  return (
    <>
      <GoogleCalendar />

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <label htmlFor="dateInput">Обновление статистики (1–32): </label>
        <input
          id="dateInput"
          type="number"
          value={statNumber}
          onChange={(e) => setStatNumber(e.target.value)}
          min="1"
          max="32"
          style={{ width: "60px", marginLeft: "10px" }}
        />
        <button type="submit" style={{ marginLeft: "10px" }}>
          Отправить
        </button>
        {status && (
          <div style={{ marginTop: "10px", color: "green" }}>{status}</div>
        )}
      </form>
    </>
  );
};

export default TrainingCalendar;
