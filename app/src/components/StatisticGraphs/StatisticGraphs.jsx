import React, { useState } from "react";
import {
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { fetchWithRetry } from "../../utils/refreshToken";
import dayjs from "dayjs";
import GanttChart from './graphGanta';

const axisGroups = {
  bodyMeasurements: [
    "Вес",
    "Объем груди",
    "Объем талии",
    "Объем ягодиц",
    "Объем бедра",
    "Объем голени",
    "Объем плеча",
    "Объем плеча в напряженном состоянии",
  ],
  trainingStates: [
    "Оценка тренировки",
    "Интенсивность тренировки",
    "Состояние до тренировки",
    "Состояние после тренировки",
  ],
  showGantt: [
    "Разовое",
    "Пакет 10",
    "Пакет 20",
    "Другое",
  ],
};

const conditionMap = {
  "Отлично": 5,
  "Хорошо": 4,
  "Средне": 3,
  "Плохо": 2,
  "Устал": 1,
  "": 0,
};

const intensityMap = {
  "Тяжёлая": 3,
  "Средняя": 2,
  "Лёгкая": 1,
  "": 0,
};

// Обратные мапы для текста по числу
const reverseConditionMap = Object.fromEntries(
  Object.entries(conditionMap).map(([k, v]) => [v, k])
);

const reverseIntensityMap = Object.fromEntries(
  Object.entries(intensityMap).map(([k, v]) => [v, k])
);

const transformMeasurements = (parameters, sessions) => {
  const measurements = {};
  const primaryDate = parameters.primary.find(p => p.param === "Дата")?.primary;

  parameters.primary.forEach(p => {
    if (p.param !== "Дата" && p.primary) {
      measurements[p.param] = [{
        date: primaryDate,
        value: parseFloat(p.primary),
        isPrimary: true
      }];
    }
  });

  parameters.corrections.forEach(entry => {
    const date = entry.find(p => p.param === "Дата")?.corr;
    if (!date) return;

    entry.forEach(p => {
      if (p.param !== "Дата" && p.corr) {
        if (!measurements[p.param]) measurements[p.param] = [];
        measurements[p.param].push({
          date,
          value: parseFloat(p.corr),
          isPrimary: false
        });
      }
    });
  });

  measurements["Оценка тренировки"] = sessions
    .filter(s => s.type === "completed" && s.rating > 0)
    .map(s => ({
      date: s.trainingTime,
      value: s.rating,
      isPrimary: false,
    }));

  measurements["Интенсивность тренировки"] = sessions
    .filter(s => s.type === "completed")
    .map(s => ({
      date: s.trainingTime,
      value: intensityMap[s.intensity] ?? 0,
      isPrimary: false,
    }));

  measurements["Состояние до тренировки"] = sessions
    .filter(s => s.type === "completed")
    .map(s => ({
      date: s.trainingTime,
      value: conditionMap[s.conditionBefore] ?? 0,
      isPrimary: false,
    }));

  measurements["Состояние после тренировки"] = sessions
    .filter(s => s.type === "completed")
    .map(s => ({
      date: s.trainingTime,
      value: conditionMap[s.conditionAfter] ?? 0,
      isPrimary: false,
    }));

  return measurements;
};

const mergeToChartData = (measurements, selectedParams) => {
  const dateMap = {};

  selectedParams.forEach(param => {
    const entries = measurements[param] || [];
    entries.forEach(({ date, value, isPrimary }) => {
      if (!dateMap[date]) dateMap[date] = { date, _raw: {} };
      if (!dateMap[date]._raw[param]) dateMap[date]._raw[param] = [];
      dateMap[date]._raw[param].push({ value, isPrimary });
    });
  });

  const merged = [];
  Object.values(dateMap).forEach(entry => {
    const { date, _raw } = entry;
    const result = { date };
    Object.entries(_raw).forEach(([param, values]) => {
      const sorted = values.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      result[param] = sorted[0].value;
    });
    merged.push(result);
  });

  return merged
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(entry => ({
      ...entry,
      date: dayjs(entry.date).format("DD.MM.YYYY")
    }));
};

// Кастомный Tooltip для показа текста вместо числа
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <Box sx={{ backgroundColor: "white", padding: 1, border: "1px solid #ccc" }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
      {payload.map(({ name, value }, i) => {
        // Для параметров тренировок и состояния показываем текст вместо числа
        let displayValue = value;
        if (name === "Оценка тренировки") {
          displayValue = value + ' ⭐️';
        } else if (name === "Интенсивность тренировки") {
          displayValue = reverseIntensityMap[value] || value;
        } else if (name === "Состояние до тренировки" || name === "Состояние после тренировки") {
          displayValue = reverseConditionMap[value] || value;
        }

        return (
          <Typography key={i} sx={{ color: payload[i].color }}>
            {name}: {displayValue}
          </Typography>
        );
      })}
    </Box>
  );
};

const StatisticGraphs = ({ clientId }) => {
  const [measurements, setMeasurements] = useState({});
  const [selectedParams, setSelectedParams] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("bodyMeasurements");
  const [showGantt, setShowGantt] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    primary: true,
    "10 тренировок": true,
    "20 тренировок": true,
    other: true,
  });
  
  const receive = async () => {
    try {
      const response = await fetchWithRetry(
        "clients/clientStatistic",
        "PATCH",
        { clientId }
      );

      const data = transformMeasurements(response.parameters, response.sessions);
      setMeasurements(data);
      setSelectedParams([]);
      setChartData([]);
      setPayments(Array.isArray(response.payments) ? response.payments : []);
    } catch (error) {
      console.error("Ошибка при запросе статистики", error);
    }
  };

  const handleCheckboxChange = (param) => {
    const updated = selectedParams.includes(param)
      ? selectedParams.filter(p => p !== param)
      : [...selectedParams, param];

    setSelectedParams(updated);
    setChartData(mergeToChartData(measurements, updated));
  };

  const currentParams = axisGroups[selectedGroup];

  return (
    <Box sx={{ p: 2 }}>
      <Button variant="contained" onClick={receive}>
        Получить статистику
      </Button>

      {Object.keys(measurements).length > 0 && (
        <Box sx={{ mt: 3 }}>
          {/* Кнопки групп */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant={selectedGroup === "bodyMeasurements" ? "contained" : "outlined"}
              onClick={() => {
                setSelectedGroup("bodyMeasurements");
                setSelectedParams([]);
                setChartData([]);
                setShowGantt(false);
              }}
              sx={{ mr: 1 }}
            >
              Параметры тела
            </Button>
            <Button
              variant={selectedGroup === "trainingStates" ? "contained" : "outlined"}
              onClick={() => {
                setSelectedGroup("trainingStates");
                setSelectedParams([]);
                setChartData([]);
                setShowGantt(false);
              }}
              sx={{ mr: 1 }}
            >
              Тренировки
            </Button>
            <Button
              variant={selectedGroup === "showGantt" ? "contained" : "outlined"}
              onClick={() => {
                setSelectedGroup("showGantt");
                setSelectedParams([]);
                setChartData([]);
                setShowGantt(true);  // показываем Гантт
              }}
              sx={{ mr: 1 }}
            >
              Реализации пакетов
            </Button>
          </Box>

          <Box sx={{ display: "flex" }}>
            {/* Чекбоксы */}
            <Box sx={{ minWidth: 200, mr: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, fontSize: "0.95rem" }}>
                Параметры ({selectedGroup === "bodyMeasurements" ? "общая шкала" : "тренировок"})
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {currentParams.map(param => (
                  <FormControlLabel
                    key={param}
                    sx={{ fontSize: "0.85rem", ml: 0 }}
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedParams.includes(param)}
                        onChange={() => handleCheckboxChange(param)}
                      />
                    }
                    label={<Typography sx={{ fontSize: "0.85rem" }}>{param}</Typography>}
                  />
                ))}
              </Box>
            </Box>

            {/* График */}
            {chartData.length > 0 && (
              <Box sx={{ flexGrow: 1, overflowX: "auto" }}>
                <LineChart
                  width={700}
                  height={400}
                  data={chartData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedParams.map((param, index) => (
                    <Line
                      key={param}
                      type="monotone"
                      dataKey={param}
                      stroke={["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00c49f", "#ff0000", "#0088FE", "#00C49F"][index % 8]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {!showGantt && chartData.length > 0 && (
        <Box sx={{ flexGrow: 1, overflowX: "auto" }}>
          <LineChart
            width={700}
            height={400}
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            {/* ...твой LineChart с линиями */}
          </LineChart>
        </Box>
      )}

      {showGantt && payments.length > 0 && (
        <GanttChart payments={payments} />
      )}
    </Box>
  );
};

export default StatisticGraphs;
