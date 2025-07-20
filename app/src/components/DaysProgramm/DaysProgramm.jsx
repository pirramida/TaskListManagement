import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Menu,
  MenuItem,
  Paper,
  Chip,
  useTheme,
  Autocomplete,
  Divider,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormControlLabel,
  Switch,
  Checkbox
} from "@mui/material";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { motion, AnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import RefreshIcon from "@mui/icons-material/Refresh";
import { v4 as uuidv4 } from "uuid";

// ======= Заглушки API =======
const api = {
  async fetchClients() {
    // имитация
    return [
      { id: null, name: "Без клиента" },
      { id: "c1", name: "Иван Петров" },
      { id: "c2", name: "Анна Смирнова" }
    ];
  },
  async fetchExerciseLibrary(clientId) {
    // Заглушка – вернём часть библиотечных
    return [
      "Жим лежа",
      "Присед со штангой",
      "Тяга горизонтальная",
      "Становая тяга",
      "Планка",
      "Отжимания",
      "Тяга верхнего блока",
      "Сгибание рук со штангой"
    ];
  },
  async fetchProgram(programId) {
    // Заглушка – пусто
    return null;
  },
  async saveProgram(program) {
    console.log("MOCK SAVE PROGRAM:", program);
    // имитация ID
    return { id: program.id ?? uuidv4() };
  }
};

// ======= Утилиты =======
const createEmptyWeek = (num) => ({
  weekNumber: num,
  days: Array(7)
    .fill(null)
    .map(() => ({ exercises: [] })),
  periodizationNote: ""
});

const dayNamesDefault = [
  "Пн",
  "Вт",
  "Ср",
  "Чт",
  "Пт",
  "Сб",
  "Вс"
];

const ITEM_TYPE = "EXERCISE_CARD";

// ======= Draggable / Droppable Card =======
const DraggableCard = ({
  card,
  index,
  sourceCol,
  onContextMenu,
  onCopy,
  onQuickEdit,
  openEditDialog
}) => {
  const ref = useRef(null);
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index, sourceCol, cardId: card.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  drag(ref);

  // Краткое описание сетов
  const setsSummary = (() => {
    if (!card.sets || card.sets.length === 0) return "нет подходов";
    const workSets = card.sets.filter((s) => !s.isWarmup);
    const warmSets = card.sets.filter((s) => s.isWarmup);
    const group = {};
    workSets.forEach((s) => {
      const key = `${s.reps}@${s.weight}`;
      group[key] = (group[key] || 0) + 1;
    });
    const workStr = Object.entries(group)
      .map(([k, c]) => `${c}×${k.replace("@", "кг × ")}`)
      .join(", ");
    const warmStr = warmSets.length
      ? `Разминка: ${warmSets
          .map((w) => `${w.reps}×${w.weight}кг`)
          .join(", ")}`
      : "";
    return [warmStr, workStr].filter(Boolean).join(" | ");
  })();

  return (
    <motion.div
      ref={ref}
      onContextMenu={(e) => onContextMenu(e, sourceCol, card.id)}
      layout
      initial={{ scale: 1, opacity: 1 }}
      animate={{
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? theme.shadows[6] : theme.shadows[1],
        opacity: isDragging ? 0.85 : 1,
        backgroundColor: theme.palette.background.paper
      }}
      whileHover={{ boxShadow: theme.shadows[4] }}
      transition={{ type: "spring", stiffness: 480, damping: 30 }}
      style={{
        borderRadius: 12,
        padding: "10px 12px 12px",
        marginBottom: 10,
        position: "relative",
        cursor: "grab"
      }}
    >
      <Box
        sx={{
          position: "absolute",
            top: 4,
            left: 4,
            display: "flex",
            gap: 0.5,
            alignItems: "center"
        }}
      >
        <DragIndicatorIcon
          fontSize="small"
          sx={{ color: "text.disabled", cursor: "grab" }}
        />
        {card.sets.some((s) => s.isWarmup) && (
          <Chip size="small" label="W" color="warning" />
        )}
      </Box>

      <Box sx={{ pl: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
          {card.exercise}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            lineHeight: 1.2,
            mb: 0.7
          }}
        >
          {setsSummary}
        </Typography>
        {card.comment && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontStyle: "italic" }}
          >
            “{card.comment}”
          </Typography>
        )}

        <Box
          sx={{
            mt: 1,
            display: "flex",
            gap: 0.5,
            flexWrap: "wrap"
          }}
        >
          {card.sets
            .filter((s) => !s.isWarmup)
            .slice(0, 4)
            .map((s) => (
              <Chip
                key={s.id}
                size="small"
                label={`${s.reps}×${s.weight}кг`}
              />
            ))}
          {card.sets.filter((s) => !s.isWarmup).length > 4 && (
            <Chip
              size="small"
              variant="outlined"
              label={`+${
                card.sets.filter((s) => !s.isWarmup).length - 4
              }`}
            />
          )}
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          display: "flex",
          gap: 0.5
        }}
      >
        <Tooltip title="Быстро скопировать в этот день">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(sourceCol, card.id);
            }}
          >
            <ContentCopyIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Редактировать">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(sourceCol, card.id);
            }}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
    </motion.div>
  );
};

// ======= Основной компонент =======
const ProgramBuilder = () => {
  const theme = useTheme();

  // --- Общая мета программы ---
  const [programId, setProgramId] = useState(null);
  const [programName, setProgramName] = useState("Новая программа");
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(null);

  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [weeksCount, setWeeksCount] = useState(1);
  const [weeks, setWeeks] = useState([createEmptyWeek(1)]);
  const [currentWeek, setCurrentWeek] = useState(0); // индекс 0..weeksCount-1

  // --- Диалог упражнения ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContext, setEditingContext] = useState(null); // {weekIndex, dayIndex, exerciseId?}
  // поля формы
  const [exercise, setExercise] = useState("");
  const [sets, setSets] = useState([]);
  const [comment, setComment] = useState("");
  const [addWarmup, setAddWarmup] = useState(false);
  const [warmupSets, setWarmupSets] = useState([
    { id: uuidv4(), reps: "", weight: "" }
  ]);
  const [workSetsCount, setWorkSetsCount] = useState(3);
  const [templateReps, setTemplateReps] = useState("10");
  const [templateWeight, setTemplateWeight] = useState("");

  // Меню (контекст)
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuInfo, setMenuInfo] = useState(null); // {weekIndex, dayIndex, exerciseId}

  // --- Периодизация настройки ---
  const [periodizationMode, setPeriodizationMode] = useState("linear"); // linear / undulating / custom
  const [weightFactors, setWeightFactors] = useState([1.0, 1.025, 1.05, 1.075]);
  const [repsAdjust, setRepsAdjust] = useState([0, -1, -2, -3]);

  // Фильтр по неделям (выбор)
  const handleWeeksCountChange = (e) => {
    const val = Number(e.target.value);
    setWeeksCount(val);
    setWeeks((prev) => {
      const copy = [...prev];
      while (copy.length < val) {
        copy.push(createEmptyWeek(copy.length + 1));
      }
      if (copy.length > val) copy.length = val;
      return copy;
    });
    if (currentWeek >= val) setCurrentWeek(val - 1);
  };

  // ==== Загрузка данных ====
  useEffect(() => {
    (async () => {
      const cls = await api.fetchClients();
      setClients(cls);
      setClientId(cls[0]?.id ?? null);
      const lib = await api.fetchExerciseLibrary(cls[0]?.id ?? null);
      setExerciseLibrary(lib);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const lib = await api.fetchExerciseLibrary(clientId);
      // Объединяем без дублей
      setExerciseLibrary((prev) => {
        const set = new Set([...prev, ...lib]);
        return Array.from(set).sort();
      });
    })();
  }, [clientId]);

  // ==== Drag & Drop между днями и внутри ====
  const [, dropRoot] = useDrop({
    accept: ITEM_TYPE
    // Колонкам отдельно обработка
  });

  const moveCardWithinDay = useCallback(
    (weekIndex, dayIndex, fromIdx, toIdx) => {
      setWeeks((prev) => {
        const clone = [...prev];
        const day = { ...clone[weekIndex].days[dayIndex] };
        const exs = [...day.exercises];
        const [moved] = exs.splice(fromIdx, 1);
        exs.splice(toIdx, 0, moved);
        day.exercises = exs;
        clone[weekIndex] = {
          ...clone[weekIndex],
          days: clone[weekIndex].days.map((d, i) =>
            i === dayIndex ? day : d
          )
        };
        return clone;
      });
    },
    []
  );

  const moveCardToAnotherDay = useCallback(
    (sourceWeek, sourceDay, targetWeek, targetDay, exerciseId, hoverIndex) => {
      setWeeks((prev) => {
        const clone = [...prev];
        const srcDayObj = { ...clone[sourceWeek].days[sourceDay] };
        const tgtDayObj = { ...clone[targetWeek].days[targetDay] };
        const srcList = [...srcDayObj.exercises];
        const idx = srcList.findIndex((e) => e.id === exerciseId);
        if (idx === -1) return prev;
        const [moved] = srcList.splice(idx, 1);

        const tgtList = [...tgtDayObj.exercises];
        if (hoverIndex == null || hoverIndex < 0 || hoverIndex > tgtList.length)
          tgtList.push(moved);
        else tgtList.splice(hoverIndex, 0, moved);

        srcDayObj.exercises = srcList;
        tgtDayObj.exercises = tgtList;

        clone[sourceWeek] = {
          ...clone[sourceWeek],
          days: clone[sourceWeek].days.map((d, i) =>
            i === sourceDay ? srcDayObj : i === targetDay ? tgtDayObj : d
          )
        };
        return clone;
      });
    },
    []
  );

  // ====== Открытие диалога добавления / редактирования ======
  const openAddDialog = (weekIndex, dayIndex) => {
    setEditingContext({ weekIndex, dayIndex, exerciseId: null });
    resetExerciseForm();
    setDialogOpen(true);
  };

  const openEditDialog = (weekIndex, dayIndex, exerciseId) => {
    const ex = weeks[weekIndex].days[dayIndex].exercises.find(
      (e) => e.id === exerciseId
    );
    if (!ex) return;
    setEditingContext({ weekIndex, dayIndex, exerciseId });
    setExercise(ex.exercise);
    setComment(ex.comment || "");
    const warm = ex.sets.filter((s) => s.isWarmup);
    const work = ex.sets.filter((s) => !s.isWarmup);
    setAddWarmup(warm.length > 0);
    setWarmupSets(
      warm.length
        ? warm.map((w) => ({ id: uuidv4(), reps: String(w.reps), weight: String(w.weight) }))
        : [{ id: uuidv4(), reps: "", weight: "" }]
    );
    setSets(work.map((w) => ({ ...w })));
    setWorkSetsCount(work.length || 3);
    if (work.length) {
      setTemplateReps(String(work[0].reps));
      setTemplateWeight(String(work[0].weight));
    }
    setDialogOpen(true);
  };

  const resetExerciseForm = () => {
    setExercise("");
    setComment("");
    setAddWarmup(false);
    setWarmupSets([{ id: uuidv4(), reps: "", weight: "" }]);
    setWorkSetsCount(3);
    setTemplateReps("10");
    setTemplateWeight("");
    setSets([]);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingContext(null);
    resetExerciseForm();
  };

  // ====== Формирование сетов по шаблону при изменении workSetsCount / templateReps / templateWeight ======
  useEffect(() => {
    // Только если мы в режиме добавления или редактирования (диалог открыт)
    if (!dialogOpen) return;
    setSets((prev) => {
      // если редактирование существующего — не трогаем пользовательские ручные изменения,
      // но если prev пустой — создаём шаблон
      if (prev.length === 0 || prev._generatedTemplate) {
        const arr = Array(workSetsCount)
          .fill(null)
          .map((_, i) => ({
            id: uuidv4(),
            order: i + 1,
            reps: templateReps ? Number(templateReps) : "",
            weight: templateWeight ? Number(templateWeight) : "",
            isWarmup: false
          }));
        arr._generatedTemplate = true;
        return arr;
      }
      return prev;
    });
  }, [workSetsCount, templateReps, templateWeight, dialogOpen]);

  // ====== Добавить / удалить warmup set ======
  const addWarmupSet = () => {
    setWarmupSets((prev) => [
      ...prev,
      { id: uuidv4(), reps: "", weight: "" }
    ]);
  };

  const removeWarmupSet = (id) => {
    setWarmupSets((prev) => prev.filter((w) => w.id !== id));
  };

  // ====== Сохранение упражнения ======
  const handleSaveExercise = () => {
    if (!editingContext) return;
    const { weekIndex, dayIndex, exerciseId } = editingContext;
    const warm = addWarmup
      ? warmupSets
          .filter((w) => w.reps && w.weight)
          .map((w, i) => ({
            id: uuidv4(),
            order: i + 1,
            reps: Number(w.reps),
            weight: Number(w.weight),
            isWarmup: true
          }))
      : [];

    const work = sets
      .filter((s) => s.reps && s.weight)
      .map((s, i) => ({
        id: s.id || uuidv4(),
        order: i + 1,
        reps: Number(s.reps),
        weight: Number(s.weight),
        isWarmup: false
      }));

    const fullSets = [...warm, ...work];

    setWeeks((prev) => {
      const clone = [...prev];
      const day = { ...clone[weekIndex].days[dayIndex] };
      let newExercises;
      if (exerciseId) {
        newExercises = day.exercises.map((e) =>
          e.id === exerciseId
            ? { ...e, exercise, comment, sets: fullSets }
            : e
        );
      } else {
        const newEx = {
          id: uuidv4(),
            exercise,
            comment,
            sets: fullSets,
            createdAt: new Date().toISOString()
        };
        newExercises = [...day.exercises, newEx];
      }
      day.exercises = newExercises;
      clone[weekIndex] = {
        ...clone[weekIndex],
        days: clone[weekIndex].days.map((d, i) =>
          i === dayIndex ? day : d
        )
      };
      return clone;
    });

    // Добавим в библиотеку, если новое
    setExerciseLibrary((prev) => {
      if (exercise && !prev.includes(exercise)) {
        return [...prev, exercise].sort();
      }
      return prev;
    });

    closeDialog();
  };

  // ====== Контекстное меню (правый клик) ======
  const handleRightClick = (e, dayIndex, exerciseId) => {
    e.preventDefault();
    setMenuInfo({
      weekIndex: currentWeek,
      dayIndex,
      exerciseId
    });
    setMenuAnchor(e.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuInfo(null);
  };

  const handleMenuEdit = () => {
    if (menuInfo) {
      openEditDialog(menuInfo.weekIndex, menuInfo.dayIndex, menuInfo.exerciseId);
    }
    closeMenu();
  };

  const handleMenuDelete = () => {
    if (menuInfo) {
      setWeeks((prev) => {
        const clone = [...prev];
        const day = { ...clone[menuInfo.weekIndex].days[menuInfo.dayIndex] };
        day.exercises = day.exercises.filter(
          (e) => e.id !== menuInfo.exerciseId
        );
        clone[menuInfo.weekIndex] = {
          ...clone[menuInfo.weekIndex],
          days: clone[menuInfo.weekIndex].days.map((d, i) =>
            i === menuInfo.dayIndex ? day : d
          )
        };
        return clone;
      });
    }
    closeMenu();
  };

  const handleCopyExercise = (dayIndex, exerciseId) => {
    const ex = weeks[currentWeek].days[dayIndex].exercises.find(
      (e) => e.id === exerciseId
    );
    if (!ex) return;
    setWeeks((prev) => {
      const clone = [...prev];
      const day = { ...clone[currentWeek].days[dayIndex] };
      const copyEx = {
        ...ex,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      };
      day.exercises = [...day.exercises, copyEx];
      clone[currentWeek] = {
        ...clone[currentWeek],
        days: clone[currentWeek].days.map((d, i) =>
          i === dayIndex ? day : d
        )
      };
      return clone;
    });
  };

  // ====== Генерация периодизации (2..N недель) ======
  const generateNextWeeks = () => {
    // Берём первую неделю как базу
    const base = weeks[0];
    setWeeks((prev) => {
      const clone = [...prev];
      for (let w = 1; w < weeksCount; w++) {
        clone[w] = transformWeek(base, w);
      }
      return clone;
    });
  };

  const transformWeek = (baseWeek, weekIndex) => {
    const factor = weightFactors[weekIndex] ?? 1;
    const repsAdj = repsAdjust[weekIndex] ?? 0;
    return {
      weekNumber: weekIndex + 1,
      periodizationNote: `Автогенерация: x${factor}, reps ${repsAdj >= 0 ? "+" : ""}${repsAdj}`,
      days: baseWeek.days.map((day) => ({
        exercises: day.exercises.map((ex) => ({
          ...ex,
          id: uuidv4(),
          sets: ex.sets.map((s) => {
            if (s.isWarmup) return { ...s }; // разминку не трогаем
            let newWeight =
              typeof s.weight === "number"
                ? +(s.weight * factor).toFixed(1)
                : s.weight;
            let newReps =
              typeof s.reps === "number" ? s.reps + repsAdj : s.reps;
            if (newReps < 1) newReps = 1;
            return {
              ...s,
              id: uuidv4(),
              weight: newWeight,
              reps: newReps
            };
          })
        }))
      }))
    };
  };

  // ====== Сохранить программу (заглушка) ======
  const handleSaveProgram = async () => {
    const programPayload = {
      id: programId,
      name: programName,
      clientId,
      weeks,
      weeksCount,
      meta: {
        periodizationMode,
        weightFactors,
        repsAdjust
      },
      updatedAt: new Date().toISOString()
    };
    const res = await api.saveProgram(programPayload);
    setProgramId(res.id);
  };

  // ====== Авто‑генерация карточки GPT (пока заглушка) ======
  const handleAiPrompt = () => {
    alert("Заглушка: здесь будет вызов AI генерации по промпту.");
  };

  // ====== Рендер ======
  return (
      <Box
        ref={dropRoot}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 2,
          height: "100%",
          boxSizing: "border-box"
        }}
      >
        {/* Верхняя панель */}
        <Paper
            elevation={3}
            sx={{
              p: 2,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center"
            }}
        >
          <TextField
            label="Название программы"
            size="small"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            sx={{ minWidth: 220 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="client-label">Клиент</InputLabel>
            <Select
              labelId="client-label"
              label="Клиент"
              value={clientId ?? ""}
              onChange={(e) =>
                setClientId(e.target.value === "" ? null : e.target.value)
              }
              input={<OutlinedInput label="Клиент" />}
            >
              {clients.map((c) => (
                <MenuItem key={c.id ?? "none"} value={c.id ?? ""}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 110 }}>
            <InputLabel id="weeks-label">Недели</InputLabel>
            <Select
              labelId="weeks-label"
              label="Недели"
              value={weeksCount}
              onChange={handleWeeksCountChange}
            >
              {[1, 2, 3, 4].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ width: 140 }}>
            <InputLabel id="current-week-label">Текущ. неделя</InputLabel>
            <Select
              labelId="current-week-label"
              label="Текущ. неделя"
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
            >
              {weeks.map((w, i) => (
                <MenuItem key={i} value={i}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="periodization-label">Периодизация</InputLabel>
            <Select
              labelId="periodization-label"
              label="Периодизация"
              value={periodizationMode}
              onChange={(e) => setPeriodizationMode(e.target.value)}
            >
              <MenuItem value="linear">Линейная</MenuItem>
              <MenuItem value="undulating">Волнообразная</MenuItem>
              <MenuItem value="custom">Своя</MenuItem>
            </Select>
          </FormControl>

          <Tooltip title="Сгенерировать недели 2..N">
            <span>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                disabled={weeksCount <= 1}
                onClick={generateNextWeeks}
              >
                Генерация
              </Button>
            </span>
          </Tooltip>

          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoFixHighIcon />}
            onClick={handleAiPrompt}
          >
            AI (скоро)
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={handleSaveProgram}
          >
            Сохранить
          </Button>
        </Paper>

        {/* Отладка периодизационных коэффициентов, если custom */}
        {periodizationMode === "custom" && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Кастомные коэффициенты веса / изменение повторов
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {weeks.map((w, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                    width: 120
                  }}
                >
                  <Typography variant="caption">
                    Неделя {i + 1}
                  </Typography>
                  <TextField
                    size="small"
                    label="×Вес"
                    value={weightFactors[i]}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setWeightFactors((prev) => {
                        const copy = [...prev];
                        copy[i] = val;
                        return copy;
                      });
                    }}
                  />
                  <TextField
                    size="small"
                    label="Δ Повт"
                    value={repsAdjust[i]}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setRepsAdjust((prev) => {
                        const copy = [...prev];
                        copy[i] = val;
                        return copy;
                      });
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Блок недели (дни) */}
        <Typography variant="h6">
          Неделя {currentWeek + 1}{" "}
          <Typography
            variant="caption"
            component="span"
            sx={{ color: "text.secondary" }}
          >
            {weeks[currentWeek].periodizationNote}
          </Typography>
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 2,
            alignItems: "flex-start"
          }}
        >
          {weeks[currentWeek].days.map((day, dayIndex) => (
            <DayColumn
              key={dayIndex}
              dayIndex={dayIndex}
              dayName={dayNamesDefault[dayIndex]}
              exercises={day.exercises}
              onAdd={() => openAddDialog(currentWeek, dayIndex)}
              onClear={() => {
                setWeeks((prev) => {
                  const clone = [...prev];
                  const wk = clone[currentWeek];
                  const newDay = { exercises: [] };
                  wk.days = wk.days.map((d, i) =>
                    i === dayIndex ? newDay : d
                  );
                  clone[currentWeek] = { ...wk };
                  return clone;
                });
              }}
              onContextMenu={handleRightClick}
              openEditDialog={openEditDialog}
              onCopy={handleCopyExercise}
              moveCardWithin={(from, to) =>
                moveCardWithinDay(currentWeek, dayIndex, from, to)
              }
              moveFromAnotherDay={(sourceCol, exerciseId, hoverIndex) =>
                moveCardToAnotherDay(
                  currentWeek,
                  sourceCol,
                  currentWeek,
                  dayIndex,
                  exerciseId,
                  hoverIndex
                )
              }
            />
          ))}
        </Box>

        {/* Контекстное меню */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
        >
          <MenuItem onClick={handleMenuEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Редактировать
          </MenuItem>
            <MenuItem onClick={handleMenuDelete}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Удалить
            </MenuItem>
        </Menu>

        {/* Диалог упражнения */}
        <Dialog
          open={dialogOpen}
          onClose={closeDialog}
          maxWidth="md"
          fullWidth
          keepMounted
        >
          <DialogTitle sx={{ pb: 1 }}>
            {editingContext?.exerciseId
              ? "Редактирование упражнения"
              : "Добавление упражнения"}
          </DialogTitle>
          <DialogContent dividers>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}
            >
              <Autocomplete
                freeSolo
                options={exerciseLibrary}
                value={exercise}
                onChange={(e, val) => setExercise(val || "")}
                onInputChange={(e, val) => setExercise(val)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Упражнение"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />

              <TextField
                label="Комментарий"
                multiline
                minRows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={addWarmup}
                    onChange={(e) => setAddWarmup(e.target.checked)}
                  />
                }
                label="Добавить разминку"
              />

              {addWarmup && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5
                  }}
                >
                  {warmupSets.map((w, i) => (
                    <Box
                      key={w.id}
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "center"
                      }}
                    >
                      <TextField
                        label={`Разминка ${i + 1} повт`}
                        size="small"
                        value={w.reps}
                        onChange={(e) =>
                          setWarmupSets((prev) =>
                            prev.map((x) =>
                              x.id === w.id ? { ...x, reps: e.target.value } : x
                            )
                          )
                        }
                        sx={{ width: 120 }}
                      />
                      <TextField
                        label="Вес"
                        size="small"
                        value={w.weight}
                        onChange={(e) =>
                          setWarmupSets((prev) =>
                            prev.map((x) =>
                              x.id === w.id
                                ? { ...x, weight: e.target.value }
                                : x
                            )
                          )
                        }
                        sx={{ width: 120 }}
                      />
                      {warmupSets.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => removeWarmupSet(w.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={addWarmupSet}
                  >
                    + разминка
                  </Button>
                </Box>
              )}

              <Divider />

              <Typography variant="subtitle2">
                Рабочие подходы (шаблон)
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  alignItems: "center"
                }}
              >
                <TextField
                  label="Кол-во подходов"
                  size="small"
                  type="number"
                  value={workSetsCount}
                  onChange={(e) =>
                    setWorkSetsCount(
                      Math.min(50, Math.max(1, Number(e.target.value) || 1))
                    )
                  }
                  sx={{ width: 160 }}
                />
                <TextField
                  label="Повт (шаблон)"
                  size="small"
                  value={templateReps}
                  onChange={(e) => setTemplateReps(e.target.value)}
                  sx={{ width: 160 }}
                />
                <TextField
                  label="Вес (шаблон)"
                  size="small"
                  value={templateWeight}
                  onChange={(e) => setTemplateWeight(e.target.value)}
                  sx={{ width: 160 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(sets._generatedTemplate)}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          // “отрываемся” от автошаблона
                          const copy = [...sets];
                          delete copy._generatedTemplate;
                          setSets(copy);
                        } else {
                          setSets([]); // пересоздастся эффектом
                        }
                      }}
                    />
                  }
                  label="Авто-обновл. шаблона"
                />
              </Box>

              {/* Ручная правка рабочих подходов */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mt: 1
                }}
              >
                {sets.map((s, i) => (
                  <Box
                    key={s.id}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "center"
                    }}
                  >
                    <TextField
                      size="small"
                      label={`Подход ${i + 1} повт`}
                      value={s.reps}
                      onChange={(e) =>
                        setSets((prev) =>
                          prev.map((x) =>
                            x.id === s.id ? { ...x, reps: e.target.value } : x
                          )
                        )
                      }
                      sx={{ width: 130 }}
                    />
                    <TextField
                      size="small"
                      label="Вес"
                      value={s.weight}
                      onChange={(e) =>
                        setSets((prev) =>
                          prev.map((x) =>
                            x.id === s.id ? { ...x, weight: e.target.value } : x
                          )
                        )
                      }
                      sx={{ width: 130 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        setSets((prev) => prev.filter((x) => x.id !== s.id))
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setSets((prev) => [
                      ...prev,
                      {
                        id: uuidv4(),
                        order: prev.length + 1,
                        reps: templateReps,
                        weight: templateWeight,
                        isWarmup: false
                      }
                    ])
                  }
                >
                  + подход
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Отмена</Button>
            <Button
              onClick={handleSaveExercise}
              disabled={!exercise || sets.filter((s) => s.reps && s.weight).length === 0}
              variant="contained"
            >
              Сохранить
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

// ======= Колонка Дня =======
const DayColumn = ({
  dayIndex,
  dayName,
  exercises,
  onAdd,
  onClear,
  onContextMenu,
  moveCardWithin,
  moveFromAnotherDay,
  openEditDialog,
  onCopy
}) => {
  const ref = useRef(null);

  // Drop на всю колонку
  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item, monitor) {
      if (!ref.current) return;
      // если перетаскиваем с другой колонки поверх пустой или нижней части
      if (item.sourceCol !== dayIndex && exercises.length === 0) {
        // просто подсветка можно сделать классом
      }
    },
    drop(item, monitor) {
      // Если поменяли колонку
      if (item.sourceCol !== dayIndex) {
        moveFromAnotherDay(item.sourceCol, item.cardId, null);
        item.sourceCol = dayIndex;
        item.index = exercises.length - 1;
      }
    }
  });

  drop(ref);

  return (
    <Paper
      ref={ref}
      elevation={4}
      sx={{
        flexShrink: 0,
        minWidth: 250,
        maxWidth: 270,
        maxHeight: 650,
        display: "flex",
        flexDirection: "column",
        background:
          exercises.length === 0
            ? "linear-gradient(145deg,#fafafa,#f1f1f4)"
            : "linear-gradient(145deg,#ffffff,#f7f5ff)",
        borderRadius: 3,
        border: "1px solid rgba(120,110,180,.12)",
        backdropFilter: "blur(3px)",
        position: "relative"
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(120,110,180,.15)"
        }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          {dayName}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={onAdd}
            title="Добавить упражнение"
          >
            <AddIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onClear} title="Очистить день">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1.2
        }}
      >
        <AnimatePresence>
          {exercises.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              style={{
                fontSize: 12,
                textAlign: "center",
                color: "#777",
                marginTop: 10
              }}
            >
              Нет упражнений
            </motion.div>
          ) : (
            exercises.map((card, idx) => (
              <DroppableCardWrapper
                key={card.id}
                card={card}
                index={idx}
                dayIndex={dayIndex}
                total={exercises.length}
                moveCardWithin={moveCardWithin}
                moveFromAnotherDay={moveFromAnotherDay}
                onContextMenu={onContextMenu}
                openEditDialog={(d, id) => openEditDialog(/* weekIndex изменится снаружи */ 0, d, id)}
                onCopy={onCopy}
              />
            ))
          )}
        </AnimatePresence>
      </Box>

      <Box
        sx={{
          px: 1.5,
          py: 0.7,
          borderTop: "1px solid rgba(120,110,180,.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "text.secondary"
        }}
      >
        <span>{exercises.length} упражн.</span>
      </Box>
    </Paper>
  );
};

// ====== Обёртка для внутри/межколоночного перестроения (Drop внутри списка) ======
const DroppableCardWrapper = ({
  card,
  index,
  dayIndex,
  total,
  moveCardWithin,
  moveFromAnotherDay,
  onContextMenu,
  openEditDialog,
  onCopy
}) => {
  const ref = useRef(null);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ITEM_TYPE,
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    }),
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const sourceCol = item.sourceCol;
      if (sourceCol === dayIndex) {
        // внутри одной колонки перераспределение
        if (dragIndex === index) return;
        const hoverBoundingRect = ref.current.getBoundingClientRect();
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        const clientOffset = monitor.getClientOffset();
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        if (dragIndex < index && hoverClientY < hoverMiddleY) return;
        if (dragIndex > index && hoverClientY > hoverMiddleY) return;
        moveCardWithin(dragIndex, index);
        item.index = index;
      } else {
        // из другой колонки
        // можно визуально подсвечивать
      }
    },
    drop(item, monitor) {
      if (item.sourceCol !== dayIndex) {
        // вставим туда где hover
        moveFromAnotherDay(item.sourceCol, item.cardId, index);
        item.sourceCol = dayIndex;
        item.index = index;
      }
    }
  });

  drop(ref);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <DraggableCard
        card={card}
        index={index}
        sourceCol={dayIndex}
        onContextMenu={(e, sc, id) => onContextMenu(e, dayIndex, card.id)}
        openEditDialog={(sc, id) =>
          openEditDialog(dayIndex, card.id) /* weekIndex прокинется выше */
        }
        onCopy={(sc, id) => onCopy(dayIndex, card.id)}
      />
      {isOver && canDrop && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            border: "2px dashed #7b2cbf",
            borderRadius: 12,
            pointerEvents: "none"
          }}
        />
      )}
    </div>
  );
};

export default ProgramBuilder;
