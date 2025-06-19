import React from "react";
import { Button } from "@mui/material";
import { fetchWithRetry } from "../../utils/refreshToken";

const StatisticGraphs = () => {
  const receive = async () => {
    try {
      const clientId = 2; // подставь нужный clientId

      const response = await fetchWithRetry(
        'clients/clientStatistic',
        'PATCH',
        { clientId }
      );

      console.log('Response:', response);
    } catch (error) {
      console.error('Ошибка при запросе статистики', error);
    }
  };

  return (
    <Button variant="contained" onClick={receive}>
      Получить статистику
    </Button>
  );
};

export default StatisticGraphs;
