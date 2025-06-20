import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Box, Typography, Checkbox, FormControlLabel, Button } from "@mui/material";
import dayjs from "dayjs";

const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

const parseDate = (d) => {
  const date = dayjs(d);
  return date.isValid() ? date : null;
};

const prepareData = (payments, activeTypes) => {
  const types = Array.from(new Set(payments.map((p) => p.type)));
  const filteredPayments = payments.filter((p) => activeTypes.includes(p.type));

  const parsed = filteredPayments
    .map((p, i) => {
      const start = parseDate(p.date);
      const end = parseDate(p.releaseDate);
      return {
        id: i,
        type: p.type,
        startDate: start,
        endDate: end,
      };
    })
    .filter((p) => p.startDate);

  if (!parsed.length) return { data: [], yTicks: [], minDate: null, maxDate: null };

  const minDate = dayjs.min(parsed.map((p) => p.startDate));
  const hasActive = parsed.some((p) => !p.endDate);
  const maxDate = hasActive
    ? dayjs()
    : dayjs.max(parsed.map((p) => p.endDate).filter(Boolean));

  const grouped = {};
  types.forEach((type) => (grouped[type] = []));
  parsed.forEach((p) => grouped[p.type].push(p));

  let currentY = 0;
  const data = [];
  const yTicks = [];

  types.forEach((type) => {
    if (!activeTypes.includes(type)) return; // пропускаем неактивные типы
    const group = grouped[type];
    if (!group.length) return;

    const midIndex = currentY + (group.length - 1) / 2;
    yTicks.push({ value: midIndex, label: type });

    group.forEach((item, idx) => {
      const end = item.endDate ?? dayjs();
      const duration = end.diff(item.startDate, "day");
      data.push({
        id: item.id,
        type: item.type,
        start: item.startDate.diff(minDate, "day"),
        duration,
        startDate: item.startDate,
        endDate: end,
        color: colors[types.indexOf(type) % colors.length],
        y: currentY + idx,
        label: `${type} (${item.startDate.format("DD.MM.YYYY")})`,
      });
    });

    currentY += group.length + 0.5;
  });

  return { data, yTicks, minDate, maxDate };
};

const GanttChart = ({ payments = [] }) => {
  const allTypes = useMemo(() => Array.from(new Set(payments.map((p) => p.type))), [payments]);
  const [activeTypes, setActiveTypes] = useState(allTypes);
  const [hoverY, setHoverY] = useState(null);

  const { data, yTicks, minDate, maxDate } = useMemo(
    () => prepareData(payments, activeTypes),
    [payments, activeTypes]
  );

  const toggleType = (type) => {
    setActiveTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const resetFilter = () => setActiveTypes(allTypes);

  if (!data.length) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <Typography>Нет данных для отображения</Typography>
      </Box>
    );
  }

  // Создаем ReferenceLines на начало каждого месяца между minDate и maxDate
  const refLines = [];
  if (minDate && maxDate) {
    let current = minDate.startOf("month");
    while (current.isBefore(maxDate)) {
      const dayDiff = current.diff(minDate, "day");
      refLines.push(
        <ReferenceLine
          key={current.format()}
          x={dayDiff}
          stroke="#ccc"
          strokeDasharray="3 3"
          label={{ position: "insideTop", value: current.format("MM.YYYY"), fill: "#999", fontSize: 12 }}
        />
      );
      current = current.add(1, "month");
    }
  }

  return (
    <Box sx={{ width: 1000, height: 500, mx: "auto", mt: 4, mb: 4 }}>
      {/* Легенда с чекбоксами */}
      <Box sx={{ display: "flex", gap: 2, mb: 1, flexWrap: "wrap" }}>
        {allTypes.map((type) => (
          <FormControlLabel
            key={type}
            control={
              <Checkbox
                checked={activeTypes.includes(type)}
                onChange={() => toggleType(type)}
                sx={{ color: colors[allTypes.indexOf(type) % colors.length] }}
              />
            }
            label={type}
          />
        ))}
        <Button variant="outlined" size="small" onClick={resetFilter}>
          Сбросить фильтр
        </Button>
      </Box>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 40, bottom: 40, left: 140, right: 20 }}
          onMouseLeave={() => setHoverY(null)}
        >
          <XAxis
            type="number"
            domain={[0, maxDate.diff(minDate, "day")]}
            tickFormatter={(val) => dayjs(minDate).add(val, "day").format("DD.MM.YY")}
          />
          <YAxis
            type="number"
            dataKey="y"
            interval={0}
            width={140}
            ticks={yTicks.map((t) => t.value)}
            tickFormatter={(val) => {
              const tick = yTicks.find((t) => t.value === val);
              return tick ? tick.label : "";
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0].payload;
              return (
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    p: 1.5,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2">
                    <strong>{p.type}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Начало: {dayjs(p.startDate).format("DD.MM.YYYY")}
                  </Typography>
                  <Typography variant="body2">
                    Конец: {dayjs(p.endDate).format("DD.MM.YYYY")}
                  </Typography>
                  <Typography variant="body2">Длительность: {p.duration} дн.</Typography>
                </Box>
              );
            }}
          />
          {refLines}
          <Bar
            dataKey="start"
            stackId="a"
            fill="transparent"
          />
          <Bar
            dataKey="duration"
            stackId="a"
            barSize={12}
            onMouseEnter={(_, index) => setHoverY(data[index].y)}
            onMouseLeave={() => setHoverY(null)}
          >
            {data.map((entry) => (
              <Cell
                key={entry.id}
                fill={entry.color}
                opacity={hoverY === null || hoverY === entry.y ? 1 : 0.3}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default GanttChart;
