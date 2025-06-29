import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  MenuItem,
  Collapse,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  FitnessCenter as FitnessCenterIcon,
  DirectionsRun as EnduranceIcon,
  Whatshot as StrengthIcon,
  Balance as BalanceIcon,
  Accessibility as MobilityIcon,
  SportsMartialArts,
} from "@mui/icons-material";
import { fetchWithRetry } from "../../utils/refreshToken";

const feelingOptions = [
  { value: "energetic", label: "Бодро" },
  { value: "tired", label: "Немного устал" },
  { value: "failed", label: "Не смог сделать" },
  { value: "pain", label: "Испытывает боль" },
];

const getFeelingColor = (value) => {
  switch (value) {
    case "pain":
      return "#f44336";
    case "failed":
      return "#ff9800";
    case "tired":
      return "#ffb300";
    case "energetic":
      return "#4caf50";
    default:
      return "inherit";
  }
};

const getSectionColor = (section, alpha = 1) => {
  const colors = {
    endurance: `rgba(76, 175, 80, ${alpha})`,
    strength: `rgba(244, 67, 54, ${alpha})`,
    flexibility: `rgba(33, 150, 243, ${alpha})`,
    balance: `rgba(255, 152, 0, ${alpha})`,
    mobility: `rgba(156, 39, 176, ${alpha})`,
  };
  return colors[section] || `rgba(0,0,0,${alpha})`;
};

const renderSectionIcon = (section) => {
  switch (section) {
    case "endurance":
      return <EnduranceIcon sx={{ color: "#4caf50" }} />;
    case "strength":
      return <StrengthIcon sx={{ color: "#f44336" }} />;
    case "flexibility":
      return <SportsMartialArts sx={{ color: "#2196f3" }} />;
    case "balance":
      return <BalanceIcon sx={{ color: "#ff9800" }} />;
    case "mobility":
      return <MobilityIcon sx={{ color: "#9c27b0" }} />;
    default:
      return <FitnessCenterIcon />;
  }
};

const renderSectionTitle = (section) =>
  ({
    endurance: "Выносливость",
    strength: "Сила",
    flexibility: "Гибкость",
    balance: "Баланс",
    mobility: "Подвижность и координация",
  })[section] || section;

const initialSectionData = [
  { exercise: "", expected: "", actual: "", feeling: "", notes: "" },
];

const TestRow = memo(
  ({
    row,
    index,
    section,
    onFieldChange,
    onDelete,
    onSave,
    isDirty,
    saveStatus,
  }) => {
    const [localRow, setLocalRow] = useState(row);

    // Если внешний row обновился, обновим локальный state
    useEffect(() => {
      setLocalRow(row);
    }, [row]);

    const handleChange = (field, value) => {
      setLocalRow((prev) => ({ ...prev, [field]: value }));
      onFieldChange(section, index, field, value);
    };

    // Подсветка строки если есть незасохраненные изменения
    const rowBgColor = isDirty ? "rgba(255, 244, 229, 0.7)" : "inherit";

    return (
      <TableRow hover sx={{ backgroundColor: rowBgColor }}>
        {["exercise", "expected", "actual", "notes"].map((field) => (
          <TableCell key={field}>
            <TextField
              fullWidth
              variant="standard"
              size="small"
              value={localRow[field]}
              InputProps={{ sx: { fontSize: 13, py: 0.5 } }}
              onChange={(e) => handleChange(field, e.target.value)}
            />
          </TableCell>
        ))}
        <TableCell>
          <TextField
            select
            fullWidth
            variant="standard"
            size="small"
            value={localRow.feeling}
            InputProps={{
              sx: {
                fontSize: 13,
                py: 0.5,
                color: getFeelingColor(localRow.feeling),
                fontWeight: 600,
              },
            }}
            onChange={(e) => handleChange("feeling", e.target.value)}
          >
            {feelingOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  color: getFeelingColor(option.value),
                  fontWeight: 500,
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
          {isDirty ? (
            <IconButton
              size="small"
              color="primary"
              onClick={() => onSave(section, index)}
              disabled={saveStatus === "saving"}
              title="Сохранить"
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          ) : saveStatus === "saved" ? (
            <CheckIcon
              sx={{ color: "green", fontSize: 24, verticalAlign: "middle" }}
              titleAccess="Сохранено"
            />
          ) : (
            <IconButton
              size="small"
              onClick={() => onDelete(section, index)}
              color="error"
              title="Удалить"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </TableCell>
      </TableRow>
    );
  }
);

export default function FitnessTesting({ editedClient }) {
  const [expandedSections, setExpandedSections] = useState({
    endurance: false,
    strength: false,
    flexibility: false,
    balance: false,
    mobility: false,
  });

  const [endurance, setEndurance] = useState([
    {
      exercise: "Бег 1 км",
      expected: "4:30 мин",
      actual: "",
      feeling: "",
      notes: "",
    },
    {
      exercise: "Прыжки на скакалке",
      expected: "100 без остановки",
      actual: "",
      feeling: "",
      notes: "",
    },
  ]);
  const [strength, setStrength] = useState([
    {
      exercise: "Приседания",
      expected: "20 раз",
      actual: "",
      feeling: "",
      notes: "",
    },
    {
      exercise: "Отжимания",
      expected: "15 раз",
      actual: "",
      feeling: "",
      notes: "",
    },
  ]);
  const [flexibility, setFlexibility] = useState([
    {
      exercise: "Наклон вперед",
      expected: "Ладонями на пол",
      actual: "",
      feeling: "",
      notes: "",
    },
    {
      exercise: "Мост",
      expected: "Полный мост",
      actual: "",
      feeling: "",
      notes: "",
    },
  ]);
  const [balance, setBalance] = useState([
    {
      exercise: "Стойка на одной ноге",
      expected: "60 сек",
      actual: "",
      feeling: "",
      notes: "",
    },
    {
      exercise: "BOSU баланс",
      expected: "30 сек",
      actual: "",
      feeling: "",
      notes: "",
    },
  ]);
  const [mobility, setMobility] = useState([
    {
      exercise: "Вращение плеч",
      expected: "Полная амплитуда",
      actual: "",
      feeling: "",
      notes: "",
    },
    {
      exercise: "Выпад с поворотом",
      expected: "10 раз",
      actual: "",
      feeling: "",
      notes: "",
    },
  ]);

  const sectionStates = {
    endurance: [endurance, setEndurance],
    strength: [strength, setStrength],
    flexibility: [flexibility, setFlexibility],
    balance: [balance, setBalance],
    mobility: [mobility, setMobility],
  };

  // Отметки изменений по строкам { "endurance-0": true, ... }
  const [dirtyRows, setDirtyRows] = useState({});
  // Статусы сохранения по строкам { "endurance-0": "idle"|"saving"|"saved" }
  const [saveStatuses, setSaveStatuses] = useState({});

  const markRowDirty = useCallback((section, index) => {
    setDirtyRows((prev) => ({ ...prev, [`${section}-${index}`]: true }));
    setSaveStatuses((prev) => ({ ...prev, [`${section}-${index}`]: "idle" }));
  }, []);

  const clearRowDirty = useCallback((section, index) => {
    setDirtyRows((prev) => {
      const copy = { ...prev };
      delete copy[`${section}-${index}`];
      return copy;
    });
  }, []);

  const setRowSaveStatus = useCallback((section, index, status) => {
    setSaveStatuses((prev) => ({
      ...prev,
      [`${section}-${index}`]: status,
    }));
  }, []);

  // Изменение поля строки
  const handleTestDataChange = useCallback(
    (section, index, field, value) => {
      const [data, setData] = sectionStates[section];
      const newData = [...data];
      newData[index] = { ...newData[index], [field]: value };
      setData(newData);
      markRowDirty(section, index);
    },
    [sectionStates, markRowDirty]
  );

  // Удаление строки
  const removeRow = useCallback(
    (section, index) => {
      const [data, setData] = sectionStates[section];
      setData(data.filter((_, i) => i !== index));
      // Удаляем состояния изменения и сохранения для всех следующих строк, смещаем индексы
      setDirtyRows((prev) => {
        const copy = {};
        Object.entries(prev).forEach(([key, val]) => {
          const [s, i] = key.split("-");
          const idx = +i;
          if (s === section) {
            if (idx < index) copy[key] = val;
            else if (idx > index) copy[`${s}-${idx - 1}`] = val;
          } else {
            copy[key] = val;
          }
        });
        return copy;
      });
      setSaveStatuses((prev) => {
        const copy = {};
        Object.entries(prev).forEach(([key, val]) => {
          const [s, i] = key.split("-");
          const idx = +i;
          if (s === section) {
            if (idx < index) copy[key] = val;
            else if (idx > index) copy[`${s}-${idx - 1}`] = val;
          } else {
            copy[key] = val;
          }
        });
        return copy;
      });
    },
    [sectionStates]
  );

  // Добавление строки
  const addRow = useCallback(
    (section) => {
      const [data, setData] = sectionStates[section];
      setData([...data, ...initialSectionData]);
    },
    [sectionStates]
  );

  // Сохранение конкретной строки на сервер
  const saveRow = useCallback(
    async (section, index) => {
      const [data] = sectionStates[section];
      const row = data[index];
      if (!row) return;
      const key = `${section}-${index}`;

      setRowSaveStatus(section, index, "saving");
      try {
        // Для сохранения можно отправлять только изменённую строку,
        // или всю секцию — зависит от API. Предположим, что API принимает всю секцию.
        const [allData] = sectionStates[section];
        const payload = [{ clientId: editedClient }, { fitnessTests: { [section]: allData } }];
        await fetchWithRetry("/clients/save-client-fitness-tests", "PATCH", payload);

        setRowSaveStatus(section, index, "saved");
        clearRowDirty(section, index);

        // После 2 секунд вернуть состояние к idle (чтобы показать кнопку удаления)
        setTimeout(() => {
          setRowSaveStatus(section, index, "idle");
        }, 2000);
      } catch (err) {
        console.error("Ошибка при сохранении строки", err);
        setRowSaveStatus(section, index, "idle");
      }
    },
    [sectionStates, editedClient, clearRowDirty, setRowSaveStatus]
  );

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 3,
        maxWidth: 960,
        mx: "auto",
        maxHeight: 655,
        overflowY: "auto",
      }}
    >
      {Object.entries(sectionStates).map(([section, [data]]) => (
        <Box key={section} sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: getSectionColor(section, 0.1),
              p: 1,
              borderRadius: 1,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: "pointer", flexGrow: 1 }}
              onClick={() => toggleSection(section)}
            >
              {renderSectionIcon(section)}
              <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600 }}>
                {renderSectionTitle(section)}
              </Typography>
              {expandedSections[section] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </Box>
            <IconButton size="small" onClick={() => addRow(section)} sx={{ ml: 1 }}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>

          <Collapse in={expandedSections[section]}>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                mt: 1,
                maxWidth: 900,
                mx: "auto",
                border: `1px solid ${getSectionColor(section, 0.4)}`,
                "& .MuiTableCell-root": { py: 0.5, px: 1 },
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Упражнение</TableCell>
                    <TableCell>Ожидаемый результат</TableCell>
                    <TableCell>Фактический результат</TableCell>
                    <TableCell>Выводы</TableCell>
                    <TableCell>Чувство</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => {
                    const key = `${section}-${index}`;
                    return (
                      <TestRow
                        key={key}
                        row={row}
                        index={index}
                        section={section}
                        onFieldChange={handleTestDataChange}
                        onDelete={removeRow}
                        onSave={saveRow}
                        isDirty={!!dirtyRows[key]}
                        saveStatus={saveStatuses[key] || "idle"}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Collapse>
        </Box>
      ))}
    </Paper>
  );
}
