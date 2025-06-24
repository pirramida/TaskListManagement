import React, { useEffect, useState, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { fetchWithRetry } from "../../utils/refreshToken";

const TableStepsAndCalories = ({ userId, clientId }) => {
    const [entries, setEntries] = useState([]);
    const [steps, setSteps] = useState("");
    const [calories, setCalories] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [monthOffset, setMonthOffset] = useState(0);
    const [showSteps, setShowSteps] = useState(true);
    const [showCalories, setShowCalories] = useState(true);

    const infoOnlySteps = steps !== "" && calories === "";
    const infoOnlyCalories = calories !== "" && steps === "";

    // 🚀 Загрузка с сервера
    useEffect(() => {
        fetchEntriesFromServer();
    }, []);

    const fetchEntriesFromServer = async () => {
        try {
            const res = await fetchWithRetry(`clients/stepsAndCalories?userId=${userId}&clientId=${clientId}`, 'GET');
            setEntries(res || []);
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
    };

    const saveEntryToServer = async (entry) => {
        try {
            console.log('entryentryentryentryentry', entry);
            const response = await fetchWithRetry('clients/stepsAndCalories', 'PATCH', entry);
            console.log(response);


            fetchEntriesFromServer();
        } catch (error) {
            console.error("Ошибка сохранения:", error);
        }
    };

    const displayedDays = useMemo(() => {
        const start = new Date();
        start.setDate(1);
        start.setMonth(start.getMonth() + monthOffset);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        const days = [];
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d).toLocaleDateString("ru-RU"));
        }
        return days;
    }, [monthOffset]);

    const chartData = useMemo(() => displayedDays.map(date => {
        const entry = entries.find(e => e.date === date);
        return {
            date: date.split(".")[0],
            steps: entry?.steps || 0,
            calories: entry?.calories || 0,
        };
    }), [displayedDays, entries]);

    const getColor = (value, max, hue = 120) => {
        const intensity = Math.min(1, value / max);
        return `hsl(${hue}, 80%, ${80 - intensity * 40}%)`;
    };

    const handleSave = () => {
        if (!selectedDate) return;

        const payload = { date: selectedDate };

        if (steps !== "") payload.steps = +steps;
        if (calories !== "") payload.calories = +calories;

        if (!payload.steps && !payload.calories) return;

        payload.userId = userId;
        payload.clientId = clientId;

        saveEntryToServer(payload);

        setSelectedDate(null);
        setSteps("");
        setCalories("");
    };

    return (
        <div style={{
            fontFamily: "'Segoe UI', sans-serif",
            maxWidth: 900,
            margin: "0 auto",
            padding: 8,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)"
        }}>
            <div style={{ display: "flex", gap: 24 }}>
                {/* Левая колонка */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 12
                    }}>
                        <h3 style={{ margin: 0, color: "#333" }}>
                            {new Date(new Date().setMonth(new Date().getMonth() + monthOffset))
                                .toLocaleString("ru-RU", { month: "long", year: "numeric" })}
                        </h3>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setMonthOffset(p => p - 1)} style={buttonStyle}>←</button>
                            <button onClick={() => setMonthOffset(p => p + 1)} style={buttonStyle}>→</button>
                        </div>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 4,
                        marginBottom: 16
                    }}>
                        {displayedDays.map(date => {
                            const entry = entries.find(e => e.date === date);
                            const day = new Date(date).getDay();
                            const isWeekend = day === 0 || day === 6;
                            const isSelected = date === selectedDate;

                            return (
                                <div
                                    key={date}
                                    onClick={() => {
                                        setSelectedDate(date);
                                        setSteps(entry?.steps !== undefined ? entry.steps.toString() : "");
                                        setCalories(entry?.calories !== undefined ? entry.calories.toString() : "");
                                    }}
                                    style={{
                                        position: "relative",
                                        height: 24,
                                        background: entry
                                            ? `linear-gradient(135deg, 
                    ${getColor(entry.steps, 20000, 120)}, 
                    ${getColor(entry.calories, 3000, 0)})`
                                            : isWeekend ? "#f0f0f0" : "#fafafa",
                                        borderRadius: 4,
                                        cursor: "pointer",
                                        border: isSelected ? "2px solid #2196f3" : "1px solid #ddd",
                                        boxShadow: isSelected ? "0 0 4px rgba(33, 150, 243, 0.4)" : "none",
                                        transition: "transform 0.15s",
                                        transform: isSelected ? "scale(1.1)" : "none"
                                    }}
                                    title={entry
                                        ? `${date}\nШаги: ${entry.steps}\nКалории: ${entry.calories}`
                                        : date}
                                >
                                    {/* 🔵🟥 Метки шагов/калорий */}
                                    {entry && (
                                        <>
                                            {entry.steps !== undefined && entry.calories === undefined && (
                                                <div style={dotStyle("#4285f4")} />
                                            )}
                                            {entry.calories !== undefined && entry.steps === undefined && (
                                                <div style={dotStyle("#ea4335")} />
                                            )}
                                        </>
                                    )}
                                </div>
                            );

                        })}
                    </div>

                    {selectedDate && (
                        <div style={{
                            background: "#f8f9fa",
                            padding: 1,
                            borderRadius: 10,
                            border: "1px solid #e0e0e0"
                        }}>
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 4
                            }}>
                                <span style={{ fontWeight: 500 }}>{selectedDate}</span>
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: 20,
                                        color: "#888"
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                <input
                                    type="number"
                                    placeholder="Шаги"
                                    value={steps}
                                    onChange={e => setSteps(e.target.value)}
                                    style={inputStyle}
                                />
                                <input
                                    type="number"
                                    placeholder="Калории"
                                    value={calories}
                                    onChange={e => setCalories(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                style={{
                                    width: "100%",
                                    padding: "8px",
                                    background: "#4285f4",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    fontWeight: 500
                                }}
                            >
                                Сохранить
                            </button>
                        </div>
                    )}
                </div>

                {/* Правая колонка - график */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 6 }}>
                        <label>
                            <input
                                type="checkbox"
                                checked={showSteps}
                                onChange={e => setShowSteps(e.target.checked)}
                            /> Шаги
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={showCalories}
                                onChange={e => setShowCalories(e.target.checked)}
                            /> Калории
                        </label>
                    </div>
                    <div style={{
                        height: 260,
                        background: "#f9fafb",
                        borderRadius: 10,
                        padding: 12,
                        boxShadow: "inset 0 0 4px rgba(0,0,0,0.03)"
                    }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.floor(chartData.length / 5)} />
                                <YAxis yAxisId="steps" orientation="left" tick={{ fontSize: 10 }} />
                                <YAxis yAxisId="calories" orientation="right" tick={{ fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: 8, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />
                                <Legend />
                                {showSteps && (
                                    <Line yAxisId="steps" dataKey="steps" stroke="#34a853" strokeWidth={2} dot={false} />
                                )}
                                {showCalories && (
                                    <Line yAxisId="calories" dataKey="calories" stroke="#ea4335" strokeWidth={2} dot={false} />
                                )}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const buttonStyle = {
    background: "#f1f3f4",
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    cursor: "pointer",
    color: "#333",
    fontWeight: 500,
    fontSize: 16
};

const inputStyle = {
    flex: 1,
    padding: "2px 4px",
    border: "1px solid #dfe1e5",
    borderRadius: 6,
    fontSize: 15
};

const dotStyle = (color) => ({
    position: "absolute",
    top: 2,
    right: 2,
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: color
});

export default TableStepsAndCalories;
