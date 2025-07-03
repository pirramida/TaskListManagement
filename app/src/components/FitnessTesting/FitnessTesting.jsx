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
  DialogTitle,
  DialogContent,
  Dialog,
  Button,
  DialogActions,
  Divider,

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
import { addToast } from "../../utils/addToast";
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import Tooltip from '@mui/material/Tooltip';
import { v4 as uuidv4 } from 'uuid';
import TestSelector from "./TestSelector";

function ensureIdForRows(rows) {
  return rows.map((row) => ({
    id: row.id || uuidv4(),
    ...row,
    isDirty: false,
    saveStatus: 'idle',
  }));
}

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

const TestRow = memo(({ row, index, section, onFieldChange, onDelete, onSave }) => {
  const [localRow, setLocalRow] = useState(row);

  // Обновляем локальный стейт при изменении пропса row (если изменился из вне)
  useEffect(() => {
    setLocalRow(row);
  }, [row]);

  const handleLocalChange = (field, value) => {
    setLocalRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    if (localRow[field] !== row[field]) {
      onFieldChange(section, index, field, localRow[field]);
    }
  };

  const rowBgColor = row.isDirty ? "rgba(255, 244, 229, 0.7)" : "inherit";

  return (
    <TableRow hover sx={{ backgroundColor: rowBgColor }}>
      {["exercise", "expected", "actual", "notes"].map((field) => (
        <TableCell key={field}>
          <TextField
            fullWidth
            variant="standard"
            size="small"
            value={localRow[field]}
            InputProps={{ sx: { fontSize: 11, py: 0.5 } }}
            onChange={(e) => handleLocalChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
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
              fontSize: 11,
              py: 0.5,
              color: getFeelingColor(localRow.feeling),
              fontWeight: 600,
            },
          }}
          onChange={(e) => handleLocalChange("feeling", e.target.value)}
          onBlur={() => handleBlur("feeling")}
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
});

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
  const [loading, setLoading] = useState(true);
  const [noTests, setNoTests] = useState(false);

  const sectionStates = React.useMemo(() => ({
    endurance: [endurance, setEndurance],
    strength: [strength, setStrength],
    flexibility: [flexibility, setFlexibility],
    balance: [balance, setBalance],
    mobility: [mobility, setMobility],
  }), [endurance, strength, flexibility, balance, mobility]);

  const [nameNewTest, setNameNewTest] = useState('');
  const [editTestName, setEditTestName] = useState('');
  const [editTestId, setEditTestId] = useState(null);

  useEffect(() => {
    const fetchTestList = async () => {
      try {
        const res = await fetchWithRetry(`/fitness_test/?clientId=${editedClient}&table=fitness_tests`, 'GET');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTestList(res.data);
          const lastTest = res.data[res.data.length - 1];
          setSelectedTestId(lastTest.id);
          setNoTests(false);
        } else {
          setTestList([]);
          setSelectedTestId(null);
          setNoTests(true);  // <-- вот именно так, чтобы показывать сообщение о пустом списке
        }

      } catch (err) {
        console.error('Ошибка при загрузке списка тестов:', err);
        setNoTests(true);
      } finally {
        setLoading(false);
      }
    };
    fetchTestList();
  }, [editedClient]);


  useEffect(() => {
    if (!selectedTestId) return;

    const fetchTestData = async () => {
      setLoading(true);
      try {
        const response = await fetchWithRetry(
          `/fitness_test/fitness_test_exercises?testId=${selectedTestId}&table=fitness_test_exercises`,
          'GET'
        );

        if (response && Array.isArray(response.data)) {
          // Фильтрация и добавление id и статусов
          setEndurance(ensureIdForRows(response.data.filter(item => item.section === 'endurance')));
          setStrength(ensureIdForRows(response.data.filter(item => item.section === 'strength')));
          setFlexibility(ensureIdForRows(response.data.filter(item => item.section === 'flexibility')));
          setBalance(ensureIdForRows(response.data.filter(item => item.section === 'balance')));
          setMobility(ensureIdForRows(response.data.filter(item => item.section === 'mobility')));
        } else {
          setEndurance([]);
          setStrength([]);
          setFlexibility([]);
          setBalance([]);
          setMobility([]);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных теста:', err);
        setEndurance([]);
        setStrength([]);
        setFlexibility([]);
        setBalance([]);
        setMobility([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [selectedTestId]);

  // Изменение поля строки
  const handleTestDataChange = useCallback((section, index, field, value) => {
    const [data, setData] = sectionStates[section];
    setData((prevData) => {
      const oldRow = prevData[index];
      if (oldRow[field] === value) return prevData; // без изменений, не триггерим ререндер
      const newRow = { ...oldRow, [field]: value, isDirty: true, saveStatus: 'idle' };
      const newData = [...prevData];
      newData[index] = newRow;
      return newData;
    });
  }, [sectionStates]);



  // Удаление строки
  const removeRow = useCallback(async (section, index) => {
    const [data, setData] = sectionStates[section];
    const rowToDelete = data[index];

    if (!rowToDelete || !rowToDelete.id) {
      // Нет id — просто удаляем локально
      setData(data.filter((_, i) => i !== index));
      return;
    }

    try {
      const res = await fetchWithRetry(`/fitness_test/${rowToDelete.id}`, 'DELETE');
      if (res.success) {
        setData((prevData) => prevData.filter((_, i) => i !== index));
        addToast('success', 'success', 'Упражнение удалено', 1500);
      } else {
        addToast('error', 'error', 'Ошибка при удалении упражнения', 1500);
      }
    } catch (err) {
      console.error("Ошибка при удалении упражнения:", err);
      addToast('error', 'error', 'Ошибка при удалении упражнения', 1500);
    }
  }, [sectionStates]);



  const startEditTestName = (test) => {
    setEditTestId(test.id);
    setEditTestName(test.name || '');
  };

  // Отмена редактирования
  const cancelEditTestName = () => {
    setEditTestId(null);
    setEditTestName('');
  };

  // Сохранить новое имя на сервер
  const saveTestName = async () => {
    if (!editTestName.trim() || !editTestId) return;

    try {
      // Отправляем PATCH на сервер
      console.log(editTestId);
      console.log(editTestName);
      console.log(editTestName.trim());

      const res = await fetchWithRetry(
        `/fitness_test/changeNameTest/${editTestId}`,
        'PATCH',
        { name: editTestName.trim() }
      );
      if (res.success) {
        // Обновляем локальный список тестов
        setTestList(prev => prev.map(t => t.id === editTestId ? { ...t, name: editTestName.trim() } : t));
        setEditTestId(null);
        setEditTestName("");
        addToast('success', 'success', 'Название теста сохранено', 1500);
      } else {
        addToast('error', 'error', 'Ошибка при сохранении названия', 1500);
      }
    } catch (err) {
      console.error('Ошибка при сохранении названия теста:', err);
      addToast('error', 'error', 'Ошибка при сохранении названия', 1500);
    }
  };

  // Удалить тест
  const deleteTest = async (id) => {
    try {
      const res = await fetchWithRetry(`/fitness_test/deleteTest/${id}`, 'DELETE');
      if (res.success) {
        setTestList((prev) => {
          const newList = prev.filter((t) => t.id !== id);

          // Проверяем, остались ли тесты после удаления
          if (newList.length === 0) {
            // Нет тестов - показать "нет тестов"
            setNoTests(true);
            setSelectedTestId(null);
          } else {
            // Если удалён был выбранный тест, выбираем последний из оставшихся
            if (selectedTestId === id) {
              setSelectedTestId(newList[newList.length - 1].id);
            }
          }
          return newList;
        });

        addToast('success', 'success', 'Тест удалён', 1500);
      } else {
        addToast('error', 'error', 'Ошибка при удалении', 1500);
      }
    } catch (err) {
      console.error('Ошибка при удалении теста:', err);
      addToast('error', 'error', 'Ошибка при удалении', 1500);
    }
  };


  // Добавление строки
  const addRow = useCallback(
    (section) => {
      const [data, setData] = sectionStates[section];
      setData([...data, ...initialSectionData]);
    },
    [sectionStates]
  );

  // Сохранение конкретной строки на сервер
  const saveRow = useCallback(async (section, index) => {
    const [data, setData] = sectionStates[section];
    const row = data[index];
    if (!row) return;

    // Можно отправлять конкретную строку или всю секцию, в зависимости от API
    setData((prevData) => {
      const copy = [...prevData];
      copy[index] = { ...copy[index], saveStatus: 'saving' };
      return copy;
    });

    try {
      const payload = {
        clientId: editedClient,
        fitnessTests: data, // либо [row] если API принимает одну строку
        testId: selectedTestId,
        section,
      };

      await fetchWithRetry('/fitness_test', 'PATCH', payload);

      setData((prevData) => {
        const copy = [...prevData];
        copy[index] = { ...copy[index], saveStatus: 'saved', isDirty: false };
        return copy;
      });

      setTimeout(() => {
        setData((prevData) => {
          const copy = [...prevData];
          copy[index] = { ...copy[index], saveStatus: 'idle' };
          return copy;
        });
      }, 2000);

    } catch (err) {
      console.error('Ошибка при сохранении строки', err);
      setData((prevData) => {
        const copy = [...prevData];
        copy[index] = { ...copy[index], saveStatus: 'idle' };
        return copy;
      });
    }
  }, [sectionStates, editedClient, selectedTestId]);


  const createFitnessTest = async () => {
    try {
      const payload = {
        clientId: editedClient,
        name: nameNewTest,
      };
      const response = await fetchWithRetry(`/fitness_test/newTest`, 'POST', payload);

      // Если сервер вернул созданный тест — можно обновить список:
      if (!response.success) {
        addToast('errorCreateTest', 'error', 'Произошла ошибка при создании нового теста!', 1500);
      }

      if (response && response.newTest) {
        setTestList((prev) => [...prev, response.newTest]);
        setSelectedTestId(response.newTest.id);
        setNoTests(false);
        setCreateDialog(false);
        setNameNewTest('');
        addToast('successCreateTest', 'success', 'Новый фитнесс тест создан!', 1500);

      }
    } catch (err) {
      console.error("Произошла ошибка при создании фитнес-теста: ", err);
    }
  };


  const toggleSection = useCallback((section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }, []);

  if (loading) {
    return <Typography sx={{ mt: 4, textAlign: "center" }}>Загрузка...</Typography>;
  }

  if (noTests) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h6" gutterBottom>
          Фитнес-тесты ещё не созданы
        </Typography>
        <Button variant="contained" onClick={() => setCreateDialog(true)}>
          Создать первый фитнес-тест
        </Button>
        {createDialog && (
          <CreateFitnessTestDialog
            open={createDialog}
            value={nameNewTest}
            onChange={(e) => setNameNewTest(e.target.value)}
            onClose={() => setCreateDialog(false)}
            onSubmit={createFitnessTest}
          />
        )}
      </Box>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',  // горизонтальное расположение
        flexWrap: 'nowrap',    // запрещаем перенос
        gap: 24,               // отступ между блоками
        maxWidth: 1600,
        margin: '24px auto',
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 3,
          minWidth: 320,
          maxWidth: "45%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRadius: 3,
          backgroundColor: "#fff",
        }}
      >
        <Typography variant="h6" fontWeight={700} color="primary">
          Выбрать тест
        </Typography>

        <TextField
          select
          size="medium"
          value={selectedTestId || ""}
          onChange={(e) => setSelectedTestId(e.target.value)}
          fullWidth
          SelectProps={{
            sx: {
              maxHeight: 300,
              overflowY: "auto",
            },
          }}
          sx={{
            mb: 1,
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              gap: 1,
            },
          }}
          variant="outlined"
        >
          {testList.map((test) => {
            const isEditing = editTestId === test.id;
            return (
              <MenuItem
                key={test.id}
                value={test.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  "&:hover": { backgroundColor: "#f0f0f0" },
                }}
                onClick={(e) => {
                  if (editTestId === test.id) e.stopPropagation();
                }}
              >
                {isEditing ? (
                  <>
                    <TextField
                      value={editTestName}
                      onChange={(e) => setEditTestName(e.target.value)}
                      size="small"
                      variant="standard"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveTestName();
                        if (e.key === "Escape") cancelEditTestName();
                      }}
                      sx={{ flexGrow: 1 }}
                      placeholder="Введите название"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Tooltip title="Сохранить">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveTestName();
                        }}
                        color="primary"
                        sx={{ ml: 0.5 }}
                      >
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Отмена">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEditTestName();
                        }}
                        color="inherit"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      flexGrow: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      {test.name ||
                        (test.date
                          ? new Date(test.date).toLocaleDateString()
                          : `Тест #${test.id}`)}
                    </Box>

                    <Tooltip title="Редактировать название">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditTestName(test);
                        }}
                        color="primary"
                        sx={{ ml: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить тест">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTest(test.id);
                        }}
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </MenuItem>
            );
          })}
        </TextField>

        <Divider sx={{ my: 1 }} />

        <Button
          variant="contained"
          color="primary"
          onClick={() => setCreateDialog(true)}
          sx={{ alignSelf: "flex-start" }}
        >
          Создать новую программу!
        </Button>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: '50%', maxHeight: 630, overflowY: 'auto' }}>

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
                    <TableRow >
                      <TableCell style={{ fontSize: "12px" }}>Упражнение</TableCell>
                      <TableCell style={{ fontSize: "12px" }}>Ожидаемый результат</TableCell>
                      <TableCell style={{ fontSize: "12px" }}>Фактический результат</TableCell>
                      <TableCell style={{ fontSize: "12px" }}>Выводы</TableCell>
                      <TableCell style={{ fontSize: "12px" }}>Чувство</TableCell>
                      <TableCell style={{ fontSize: "12px" }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row, index) => {
                      return (
                        <TestRow

                          key={row.id}
                          row={row}
                          index={index}
                          section={section}
                          onFieldChange={handleTestDataChange}
                          onDelete={removeRow}
                          onSave={saveRow}
                          isDirty={row.isDirty}
                          saveStatus={row.saveStatus}
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

      {createDialog && <CreateFitnessTestDialog
        open={createDialog}
        value={nameNewTest}
        onChange={(e) => setNameNewTest(e.target.value)}
        onClose={() => setCreateDialog(false)}
        onSubmit={createFitnessTest}
      />}


    </div>
  );
}

// ВНЕ компонента FitnessTesting
const CreateFitnessTestDialog = memo(({ open, value, onChange, onClose, onSubmit }) => (
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
));

