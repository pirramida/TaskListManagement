import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
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
  DialogTitle,
  DialogContent,
  Dialog,
  Button,
  DialogActions,
  Tooltip,
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

import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";

import { fetchWithRetry } from "../../utils/refreshToken";
import { addToast } from "../../utils/addToast";

// ====== CONSTS ======
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
    endurance: `rgba(76,175,80,${alpha})`,
    strength: `rgba(244,67,54,${alpha})`,
    flexibility: `rgba(33,150,243,${alpha})`,
    balance: `rgba(255,152,0,${alpha})`,
    mobility: `rgba(156,39,176,${alpha})`,
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

// Локальный шаблон новой строки
const newRowTemplate = {
  exercise: "",
  expected: "",
  actual: "",
  feeling: "",
  notes: "",
  isDirty: true,
  saveStatus: "idle",
};

// ====== ROW COMPONENT ======
const TestRow = memo(
  ({ row, index, section, onFieldChange, onDelete, onSave }) => {
    const handleChange = (field, value) =>
      onFieldChange(section, index, field, value);
    const rowBgColor = row.isDirty ? "rgba(255,244,229,0.7)" : "inherit";

    return (
      <TableRow hover sx={{ backgroundColor: rowBgColor }}>
        {["exercise", "expected", "actual", "notes"].map((field) => (
          <TableCell key={field}>
            <TextField
              fullWidth
              variant="standard"
              size="small"
              value={row[field] || ""}
              InputProps={{ sx: { fontSize: 11, py: 0.5 } }}
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
            value={row.feeling || ""}
            InputProps={{
              sx: {
                fontSize: 11,
                py: 0.5,
                color: getFeelingColor(row.feeling),
                fontWeight: 600,
              },
            }}
            onChange={(e) => handleChange("feeling", e.target.value)}
          >
            {feelingOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ color: getFeelingColor(option.value), fontWeight: 500 }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </TableCell>

        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
          <IconButton
            size="small"
            onClick={() => onDelete(section, index)}
            color="error"
            title="Удалить"
            sx={{ mr: 0.5 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>

          {row.isDirty ? (
            <IconButton
              size="small"
              color="primary"
              onClick={() => onSave(section, index)}
              disabled={row.saveStatus === "saving"}
              title="Сохранить"
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          ) : row.saveStatus === "saved" ? (
            <CheckIcon
              sx={{ color: "green", fontSize: 24, verticalAlign: "middle" }}
              titleAccess="Сохранено"
            />
          ) : null}
        </TableCell>
      </TableRow>
    );
  }
);

// ====== MAIN COMPONENT ======
export default function FitnessTesting({ editedClient }) {
  const [expandedSections, setExpandedSections] = useState({
    endurance: false,
    strength: false,
    flexibility: false,
    balance: false,
    mobility: false,
  });

  const [endurance, setEndurance] = useState([]);
  const [strength, setStrength] = useState([]);
  const [flexibility, setFlexibility] = useState([]);
  const [balance, setBalance] = useState([]);
  const [mobility, setMobility] = useState([]);

  const [testList, setTestList] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(null);

  const [createDialog, setCreateDialog] = useState(false);
  const [nameNewTest, setNameNewTest] = useState("");

  const [loading, setLoading] = useState(true);
  const [noTests, setNoTests] = useState(false);

  const sectionStates = useMemo(
    () => ({
      endurance: [endurance, setEndurance],
      strength: [strength, setStrength],
      flexibility: [flexibility, setFlexibility],
      balance: [balance, setBalance],
      mobility: [mobility, setMobility],
    }),
    [endurance, strength, flexibility, balance, mobility]
  );

  // ===== LOADERS =====
  const refreshTestList = useCallback(async () => {
    try {
      const res = await fetchWithRetry(
        `/fitness_test/?clientId=${editedClient}&table=fitness_tests`,
        "GET"
      );
      if (Array.isArray(res.data) && res.data.length > 0) {
        setTestList(res.data);
        setSelectedTestId((prev) => {
          if (!prev) return res.data[res.data.length - 1].id;
          return res.data.some((t) => t.id === prev)
            ? prev
            : res.data[res.data.length - 1].id;
        });
        setNoTests(false);
      } else {
        setTestList([]);
        setSelectedTestId(null);
        setNoTests(true);
      }
    } catch (err) {
      console.error("Ошибка при загрузке списка тестов:", err);
      setNoTests(true);
    } finally {
      setLoading(false);
    }
  }, [editedClient]);

  const refreshTestData = useCallback(
    async (testId = selectedTestId) => {
      if (!testId) return;
      try {
        const response = await fetchWithRetry(
          `/fitness_test/fitness_test_exercises?testId=${testId}&table=fitness_test_exercises`,
          "GET"
        );
        if (response && Array.isArray(response.data)) {
          setEndurance(
            response.data
              .filter((i) => i.section === "endurance")
              .map((r) => ({ ...r, isDirty: false, saveStatus: "idle" }))
          );
          setStrength(
            response.data
              .filter((i) => i.section === "strength")
              .map((r) => ({ ...r, isDirty: false, saveStatus: "idle" }))
          );
          setFlexibility(
            response.data
              .filter((i) => i.section === "flexibility")
              .map((r) => ({ ...r, isDirty: false, saveStatus: "idle" }))
          );
          setBalance(
            response.data
              .filter((i) => i.section === "balance")
              .map((r) => ({ ...r, isDirty: false, saveStatus: "idle" }))
          );
          setMobility(
            response.data
              .filter((i) => i.section === "mobility")
              .map((r) => ({ ...r, isDirty: false, saveStatus: "idle" }))
          );
        }
      } catch (err) {
        console.error("Ошибка при загрузке данных теста:", err);
        setEndurance([]);
        setStrength([]);
        setFlexibility([]);
        setBalance([]);
        setMobility([]);
      }
    },
    [selectedTestId]
  );

  // ===== EFFECTS =====
  useEffect(() => {
    refreshTestList();
  }, [refreshTestList]);

  useEffect(() => {
    refreshTestData(selectedTestId);
  }, [selectedTestId, refreshTestData]);

  // ===== HANDLERS =====
  const handleTestDataChange = useCallback(
    (section, index, field, value) => {
      const [data, setData] = sectionStates[section];
      setData((prev) => {
        const newData = [...prev];
        newData[index] = {
          ...newData[index],
          [field]: value,
          isDirty: true,
          saveStatus: "idle",
        };
        return newData;
      });
    },
    [sectionStates]
  );

  // --- ADD ---
  const addRow = useCallback(
    async (section) => {
      // UI: добавим временно
      const [data, setData] = sectionStates[section];
      const tempRow = { ...newRowTemplate };
      setData((prev) => [...prev, tempRow]);

      // Сервер: создаём сразу
      try {
        const payload = {
          testId: selectedTestId,
          section,
          exercise: "",
          expected: "",
          actual: "",
          feeling: "",
          notes: "",
        };
        const res = await fetchWithRetry(
          "/fitness_test/exercise",
          "POST",
          payload
        );
        if (res.success && res.exercise) {
          addToast("success", "success", "Упражнение добавлено", 1500);
          // Обновим секцию с сервера, чтобы получить настоящий id
          await refreshTestData();
        } else {
          addToast("error", "error", "Ошибка при добавлении", 1500);
          await refreshTestData(); // синхронизация
        }
      } catch (err) {
        console.error("Ошибка при добавлении:", err);
        addToast("error", "error", "Ошибка при добавлении", 1500);
        await refreshTestData();
      }
    },
    [sectionStates, selectedTestId, refreshTestData]
  );

  // --- DELETE ---
  const removeRow = useCallback(
    async (section, index) => {
      const [data, setData] = sectionStates[section];
      const rowToDelete = data[index];

      // UI: оптимистично
      setData((prev) => prev.filter((_, i) => i !== index));

      // Если ещё не сохранено в БД
      if (!rowToDelete?.id) {
        addToast("success", "success", "Упражнение удалено", 1500);
        return;
      }

      try {
        const res = await fetchWithRetry(
          `/fitness_test/${rowToDelete.id}`,
          "DELETE"
        );
        if (res.success) {
          addToast("success", "success", "Упражнение удалено", 1500);
        } else {
          addToast("error", "error", "Ошибка при удалении (сервер)", 1500);
        }
      } catch (err) {
        console.error("Ошибка при удалении:", err);
        addToast("error", "error", "Ошибка при удалении", 1500);
      } finally {
        await refreshTestData();
      }
    },
    [sectionStates, refreshTestData]
  );

  const handleCreateNewTest = async () => {
    if (!nameNewTest.trim()) {
      addToast("warning", "Предупреждение", "Введите название теста", 2000);
      return;
    }
    try {
      const payload = { clientId: editedClient, name: nameNewTest.trim() };
      const res = await fetchWithRetry(
        "/fitness_test/newTest",
        "POST",
        payload
      );

      if (res.success && res.newTest) {
        addToast("success", "Успех", "Фитнес-тест создан", 1500);
        setCreateDialog(false);
        setNameNewTest("");
        await refreshTestList(); // обновляем список тестов
        setSelectedTestId(res.newTest.id); // открываем новый тест
      } else {
        addToast("error", "Ошибка", "Не удалось создать тест", 1500);
      }
    } catch (err) {
      console.error("Ошибка при создании теста:", err);
      addToast("error", "Ошибка", "Ошибка при создании теста", 1500);
    }
  };

  // --- SAVE SINGLE ROW ---
  const saveRow = useCallback(
    async (section, index) => {
      const [data, setData] = sectionStates[section];
      const row = data[index];
      if (!row) return;

      // Если строки нет в БД → создадим
      if (!row.id) {
        try {
          const payload = {
            testId: selectedTestId,
            section,
            exercise: row.exercise || "",
            expected: row.expected || "",
            actual: row.actual || "",
            feeling: row.feeling || "",
            notes: row.notes || "",
          };
          const res = await fetchWithRetry(
            "/fitness_test/exercise",
            "POST",
            payload
          );
          if (res.success) {
            addToast("success", "success", "Упражнение сохранено", 1500);
          } else {
            addToast("error", "error", "Ошибка при сохранении", 1500);
          }
        } catch (err) {
          console.error("Ошибка при сохранении строки:", err);
          addToast("error", "error", "Ошибка при сохранении", 1500);
        } finally {
          await refreshTestData();
        }
        return;
      }

      // Иначе обновляем
      try {
        const payload = {
          exercise: row.exercise,
          expected: row.expected,
          actual: row.actual,
          feeling: row.feeling,
          notes: row.notes,
        };
        const res = await fetchWithRetry(
          `/fitness_test/exercise/${row.id}`,
          "PATCH",
          payload
        );
        if (res.success) {
          addToast("success", "success", "Изменения сохранены", 1500);
        } else {
          addToast("error", "error", "Ошибка при сохранении", 1500);
        }
      } catch (err) {
        console.error("Ошибка при обновлении строки:", err);
        addToast("error", "error", "Ошибка при сохранении", 1500);
      } finally {
        await refreshTestData();
      }
    },
    [sectionStates, selectedTestId, refreshTestData]
  );

  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // ===== RENDER STATES =====
  if (loading) {
    return (
      <Typography sx={{ mt: 4, textAlign: "center" }}>Загрузка...</Typography>
    );
  }

  if (noTests) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Фитнес-тесты ещё не созданы
        </Typography>
        <Button variant="contained" onClick={() => setCreateDialog(true)}>
          Создать первый тест
        </Button>
        {createDialog && (
          <CreateFitnessTestDialog
            open={createDialog}
            value={nameNewTest}
            onChange={(e) => setNameNewTest(e.target.value)}
            onClose={() => setCreateDialog(false)}
            onSubmit={() => {
              handleCreateNewTest();
            }}
          />
        )}
      </Box>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 24,
        maxWidth: 1600,
        margin: "24px auto",
        padding: 8,
      }}
    >
      {/* Left: Test selector */}
      <Paper
        elevation={4}
        sx={{
          p: 3,
          minWidth: 320,
          maxWidth: "45%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary">
          Фитнес-тесты
        </Typography>

        <TextField
          select
          size="medium"
          value={selectedTestId || ""}
          onChange={(e) => setSelectedTestId(e.target.value)}
          fullWidth
        >
          {testList.map((test) => (
            <MenuItem key={test.id} value={test.id}>
              {test.name || `Тест #${test.id}`}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialog(true)}
        >
          Создать новый тест
        </Button>

        {createDialog && (
          <CreateFitnessTestDialog
            open={createDialog}
            value={nameNewTest}
            onChange={(e) => setNameNewTest(e.target.value)}
            onClose={() => setCreateDialog(false)}
            onSubmit={handleCreateNewTest}
          />
        )}
      </Paper>

      {/* Right: Sections */}
      <Paper sx={{ p: 3, maxWidth: "50%", maxHeight: 630, overflowY: "auto" }}>
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
                sx={{ cursor: "pointer", flexGrow: 1 }} // flexGrow растягивает зону
                onClick={() => toggleSection(section)}
              >
                {renderSectionIcon(section)}
                <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600 }}>
                  {renderSectionTitle(section)}
                </Typography>
                {expandedSections[section] ? (
                  <ExpandLessIcon />
                ) : (
                  <ExpandMoreIcon />
                )}
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // чтобы клик по кнопке НЕ переключал коллапс
                  addRow(section);
                }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
            <Collapse in={expandedSections[section]}>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mt: 1 }}
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
                    {data.map((row, index) => (
                      <TestRow
                        key={row.id || `row-${index}`}
                        row={row}
                        index={index}
                        section={section}
                        onFieldChange={handleTestDataChange}
                        onDelete={removeRow}
                        onSave={saveRow}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
          </Box>
        ))}
      </Paper>
    </div>
  );
}

// ===== DIALOG COMPONENT =====
const CreateFitnessTestDialog = memo(
  ({ open, value, onChange, onClose, onSubmit }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Создание фитнес-теста</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          value={value}
          onChange={onChange}
          label="Введите название или дату"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отменить</Button>
        <Button onClick={onSubmit}>Создать</Button>
      </DialogActions>
    </Dialog>
  )
);
