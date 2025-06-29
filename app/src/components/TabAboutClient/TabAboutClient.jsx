import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Tooltip,
  IconButton,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  LocalFireDepartment,
  MoodBad,
  FitnessCenter,
  Warning,
  History,
} from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Close";
import { fetchWithRetry } from "../../utils/refreshToken";
import { addToast } from "../../utils/addToast";

const activityLevels = [
  { value: 1, label: "Минимальная" },
  { value: 2, label: "Низкая" },
  { value: 3, label: "Умеренная" },
  { value: 4, label: "Высокая" },
  { value: 5, label: "Очень высокая" },
];

const stressLevels = [
  { value: 1, label: "Нет стресса" },
  { value: 2, label: "Слабый" },
  { value: 3, label: "Умеренный" },
  { value: 4, label: "Высокий" },
  { value: 5, label: "Очень высокий" },
];

const TabAboutClient = ({ editedClient, client }) => {
  const theme = useTheme();

  // Основные данные клиента
  const [clientData, setClientData] = useState(null);

  // Отдельные стейты редактирования — локальные копии данных по блокам
  const [localGoals, setLocalGoals] = useState(null);
  const [localProblems, setLocalProblems] = useState(null);
  const [localActivity, setLocalActivity] = useState(null);
  const [localLimits, setLocalLimits] = useState(null);

  // Режимы редактирования блоков
  const [editGoals, setEditGoals] = useState(false);
  const [editProblems, setEditProblems] = useState(false);
  const [editActivity, setEditActivity] = useState(false);
  const [editLimits, setEditLimits] = useState(false);

  // Загрузка данных с сервера
  useEffect(() => {
    async function fetchClientData() {
      try {
        const response = await fetchWithRetry(
          `/clients/customGet?clientId=${editedClient.id}&nameColoumn=clientInfo`,
          "GET"
        );
        if (!response) throw new Error("Ошибка загрузки данных");

        const blocks = response;

        // Сначала найди каждый блок по имени
        const goals = blocks.find((b) => b.blockName === "goals")?.data || {};
        const problems =
          blocks.find((b) => b.blockName === "problems")?.data || {};
        const activity =
          blocks.find((b) => b.blockName === "activity")?.data || {};
        const limits = blocks.find((b) => b.blockName === "limits")?.data || {};

        // Потом установи локальные стейты
        setLocalGoals({
          basicGoal: goals.basicGoal || "",
          weightGoal: goals.weightGoal || "",
          nonWeightGoal: goals.nonWeightGoal || "",
          goalDate: goals.goalDate || "",
          idealPicture: goals.idealPicture || "",
        });

        setLocalProblems({
          currentDislikes: problems.currentDislikes || "",
          topChallenges: problems.topChallenges || "",
          pastAttempts: problems.pastAttempts || "",
        });

        setLocalActivity({
          activityLevel: activity.activityLevel ?? 3,
          stressLevel: activity.stressLevel ?? 3,
          sleepHours: activity.sleepHours || "",
          sleepQuality: activity.sleepQuality || "",
          eatingHabits: activity.eatingHabits || "",
          badHabits: activity.badHabits || "",
        });

        setLocalLimits({
          injuries: limits.injuries || "",
          trainingExperience: limits.trainingExperience || "",
          potentialObstacles: limits.potentialObstacles || "",
        });

        // После этого можешь сплющить и сохранить для использования при reset
        setClientData(flattenClientInfo(blocks));
      } catch (err) {
        console.error(err);
        setClientData({});
        setLocalGoals({});
        setLocalProblems({});
        setLocalActivity({});
        setLocalLimits({});
      }
    }

    fetchClientData();
  }, []);

  function flattenClientInfo(blocksArray) {
    const result = {};
    for (const block of blocksArray) {
      if (block?.blockName && block?.data && typeof block.data === "object") {
        Object.assign(result, block.data);
      }
    }
    return result;
  }

  if (clientData === null) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  // Универсальный рендер текстового поля или текста, зависит от режима редактирования
  const renderField = (
    editMode,
    fieldName,
    localState,
    setLocalState,
    multiline = false,
    type = "text",
    options = null
  ) => {
    if (editMode) {
      if (options) {
        // select
        return (
          <TextField
            select
            variant="standard"
            fullWidth
            value={localState[fieldName]}
            onChange={(e) =>
              setLocalState((prev) => ({
                ...prev,
                [fieldName]: options.find(
                  (o) =>
                    o.value ===
                    (type === "number"
                      ? Number(e.target.value)
                      : e.target.value)
                ).value,
              }))
            }
          >
            {options.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {value} - {label}
              </MenuItem>
            ))}
          </TextField>
        );
      } else {
        return (
          <TextField
            variant="standard"
            fullWidth
            multiline={multiline}
            type={type}
            value={localState[fieldName]}
            onChange={(e) =>
              setLocalState((prev) => ({
                ...prev,
                [fieldName]: e.target.value,
              }))
            }
          />
        );
      }
    } else {
      // Отображение текста (или спец. формат)
      const value = localState[fieldName];
      if (fieldName === "weightGoal" && value) {
        return (
          <Chip
            label={`${value} кг`}
            size="small"
            color="primary"
            sx={{ mt: 0.5 }}
          />
        );
      }
      if (fieldName === "goalDate" && value) {
        const daysLeft = Math.max(
          0,
          Math.ceil((new Date(value) - new Date()) / (1000 * 60 * 60 * 24))
        );
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">{value}</Typography>
            <Tooltip title="Осталось дней до цели">
              <Chip label={`${daysLeft} дн.`} size="small" color="info" />
            </Tooltip>
          </Box>
        );
      }
      if (value) {
        return (
          <Typography
            variant="body2"
            sx={{ whiteSpace: multiline ? "normal" : "nowrap", mt: 0.5 }}
          >
            {value}
          </Typography>
        );
      } else {
        return (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ whiteSpace: multiline ? "normal" : "nowrap", mt: 0.5 }}
          >
            Не указано
          </Typography>
        );
      }
    }
  };

  // Рейтинг 1-5 звезд (или иконок)
  const renderRating = (
    editMode,
    localState,
    setLocalState,
    fieldName,
    IconComponent
  ) => {
    if (editMode) {
      return (
        <TextField
          select
          variant="standard"
          fullWidth
          value={localState[fieldName]}
          onChange={(e) =>
            setLocalState((prev) => ({
              ...prev,
              [fieldName]: Number(e.target.value),
            }))
          }
        >
          {[1, 2, 3, 4, 5].map((val) => (
            <MenuItem key={val} value={val}>
              {val}
            </MenuItem>
          ))}
        </TextField>
      );
    } else {
      const value = localState[fieldName] ?? 3;
      return (
        <Box display="flex" alignItems="center" mt={0.5}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                color:
                  i < value
                    ? theme.palette.warning.main
                    : theme.palette.action.disabled,
                mr: 0.5,
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconComponent fontSize="small" />
            </Box>
          ))}
        </Box>
      );
    }
  };

  // Отмена редактирования блока: сбрасываем локальный стейт блока из clientData и выключаем edit
  const cancelEdit = (setter, resetLocalState) => {
    resetLocalState();
    setter(false);
  };

  // Сбрасывает локальный стейт Goals из clientData
  const resetLocalGoals = () => {
    setLocalGoals({
      basicGoal: clientData.basicGoal || "",
      weightGoal: clientData.weightGoal || "",
      nonWeightGoal: clientData.nonWeightGoal || "",
      goalDate: clientData.goalDate || "",
      idealPicture: clientData.idealPicture || "",
    });
  };
  const resetLocalProblems = () => {
    setLocalProblems({
      currentDislikes: clientData.currentDislikes || "",
      topChallenges: clientData.topChallenges || "",
      pastAttempts: clientData.pastAttempts || "",
    });
  };
  const resetLocalActivity = () => {
    setLocalActivity({
      activityLevel: clientData.activityLevel ?? 3,
      stressLevel: clientData.stressLevel ?? 3,
      sleepHours: clientData.sleepHours || "",
      sleepQuality: clientData.sleepQuality || "",
      eatingHabits: clientData.eatingHabits || "",
      badHabits: clientData.badHabits || "",
    });
  };
  const resetLocalLimits = () => {
    setLocalLimits({
      injuries: clientData.injuries || "",
      trainingExperience: clientData.trainingExperience || "",
      potentialObstacles: clientData.potentialObstacles || "",
    });
  };

  // Отправка части данных на сервер (обновление блока)
  const saveBlock = async (blockName, blockData, setEdit) => {
    try {
      // Формируем объект с обновлениями, например { basicGoal: "...", weightGoal: "...", ... }
      // Обычно на сервер отправляем только изменённые поля блока
      // Можно отправлять весь блок как объект, зависит от API — здесь отправим как { blockName: blockData }
      const payload = {
        clientId: editedClient.id, // добавляем clientId сюда
        data: blockData,
        blockName: blockName,
      };

      const response = await fetchWithRetry(
        "clients/saveClientBlock",
        "PATCH",
        payload
      );
      if (!response.success) throw new Error("Ошибка сохранения");

      setClientData((prev) => ({ ...prev, ...blockData }));

      setEdit(false);
      addToast(
        "successsuccess",
        "success",
        `Блок "${blockName}" успешно сохранён`,
        1500
      );
    } catch (err) {
      addToast(
        "errorerror",
        "error",
        `Ошибка при сохранении: ${err.message}`,
        1500
      );
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      <Grid container spacing={1}>
        {/* Блок Цели */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 3, borderRadius: 2, boxShadow: 3, position: "relative" }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <FitnessCenter color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                Цели клиента
              </Typography>
              {!editGoals ? (
                <IconButton size="small" onClick={() => setEditGoals(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => saveBlock("goals", localGoals, setEditGoals)}
                    sx={{ mr: 1 }}
                  >
                    Сохранить
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => cancelEdit(setEditGoals, resetLocalGoals)}
                  >
                    Отмена
                  </Button>
                </>
              )}
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                rowGap: 1,
                columnGap: 2,
                alignItems: "start",
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Цель базовая:
              </Typography>
              <>
                {renderField(
                  editGoals,
                  "basicGoal",
                  localGoals,
                  setLocalGoals,
                  true
                )}
              </>

              <Typography variant="subtitle2" color="text.secondary">
                Цель в кг:
              </Typography>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                {renderField(
                  editGoals,
                  "weightGoal",
                  localGoals,
                  setLocalGoals,
                  false,
                  "number"
                )}
              </Box>

              <Typography variant="subtitle2" color="text.secondary">
                Цель не в кг:
              </Typography>
              <>
                {renderField(
                  editGoals,
                  "nonWeightGoal",
                  localGoals,
                  setLocalGoals
                )}
              </>

              <Typography variant="subtitle2" color="text.secondary">
                Дата цели:
              </Typography>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                {renderField(
                  editGoals,
                  "goalDate",
                  localGoals,
                  setLocalGoals,
                  false,
                  "date"
                )}
              </Box>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ pt: 1 }}
              >
                Идеальная картинка:
              </Typography>
              <>
                {renderField(
                  editGoals,
                  "idealPicture",
                  localGoals,
                  setLocalGoals,
                  true
                )}
              </>
            </Box>
          </Paper>
        </Grid>

        {/* Блок Проблемы */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 3, borderRadius: 2, boxShadow: 3, position: "relative" }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <Warning color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                Проблемы и трудности
              </Typography>
              {!editProblems ? (
                <IconButton size="small" onClick={() => setEditProblems(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      saveBlock("problems", localProblems, setEditProblems)
                    }
                    sx={{ mr: 1 }}
                  >
                    Сохранить
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() =>
                      cancelEdit(setEditProblems, resetLocalProblems)
                    }
                  >
                    Отмена
                  </Button>
                </>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Что не нравится сейчас:
                </Typography>
                {renderField(
                  editProblems,
                  "currentDislikes",
                  localProblems,
                  setLocalProblems,
                  true
                )}
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Топ-3 трудности:
                </Typography>
                {renderField(
                  editProblems,
                  "topChallenges",
                  localProblems,
                  setLocalProblems,
                  true
                )}
              </Box>

              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Прошлые попытки:
                </Typography>
                {renderField(
                  editProblems,
                  "pastAttempts",
                  localProblems,
                  setLocalProblems,
                  true
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Блок Активность */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 3, borderRadius: 2, boxShadow: 3, position: "relative" }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <LocalFireDepartment color="error" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                Активность и привычки
              </Typography>
              {!editActivity ? (
                <IconButton size="small" onClick={() => setEditActivity(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      saveBlock("activity", localActivity, setEditActivity)
                    }
                    sx={{ mr: 1 }}
                  >
                    Сохранить
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() =>
                      cancelEdit(setEditActivity, resetLocalActivity)
                    }
                  >
                    Отмена
                  </Button>
                </>
              )}
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Уровень активности (1-5):
                </Typography>
                {renderRating(
                  editActivity,
                  localActivity,
                  setLocalActivity,
                  "activityLevel",
                  LocalFireDepartment
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Уровень стресса (1-5):
                </Typography>
                {renderRating(
                  editActivity,
                  localActivity,
                  setLocalActivity,
                  "stressLevel",
                  MoodBad
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Сон (часов в сутки):
                </Typography>
                {renderField(
                  editActivity,
                  "sleepHours",
                  localActivity,
                  setLocalActivity,
                  false,
                  "number"
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Качество сна:
                </Typography>
                {renderField(
                  editActivity,
                  "sleepQuality",
                  localActivity,
                  setLocalActivity
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Пищевые привычки:
                </Typography>
                {renderField(
                  editActivity,
                  "eatingHabits",
                  localActivity,
                  setLocalActivity,
                  true
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Вредные привычки:
                </Typography>
                {renderField(
                  editActivity,
                  "badHabits",
                  localActivity,
                  setLocalActivity,
                  true
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Блок Ограничения */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{ p: 3, borderRadius: 2, boxShadow: 3, position: "relative" }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <History color="action" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
                Ограничения и опыт
              </Typography>
              {!editLimits ? (
                <IconButton size="small" onClick={() => setEditLimits(true)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      saveBlock("limits", localLimits, setEditLimits)
                    }
                    sx={{ mr: 1 }}
                  >
                    Сохранить
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => cancelEdit(setEditLimits, resetLocalLimits)}
                  >
                    Отмена
                  </Button>
                </>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Травмы/ограничения:
                </Typography>
                {renderField(
                  editLimits,
                  "injuries",
                  localLimits,
                  setLocalLimits,
                  true
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Опыт тренировок:
                </Typography>
                {renderField(
                  editLimits,
                  "trainingExperience",
                  localLimits,
                  setLocalLimits,
                  true
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Потенциальные препятствия:
                </Typography>
                {renderField(
                  editLimits,
                  "potentialObstacles",
                  localLimits,
                  setLocalLimits,
                  true
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TabAboutClient;
