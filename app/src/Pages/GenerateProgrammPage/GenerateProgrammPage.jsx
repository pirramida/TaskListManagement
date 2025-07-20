import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Stack,
} from "@mui/material";
import DaysProgramm from "../../components/DaysProgramm/DaysProgramm.jsx";

const ITEM_TYPE = "CARD";
const dayNames = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];


// Пример данных клиентов
const mockClients = ["Иван Иванов", "Мария Петрова", "Алексей Смирнов"];

const GenerateProgrammPage = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveClient, setSaveClient] = useState(null);
  const [programName, setProgramName] = useState("");
  const [loadedProgram, setLoadedProgram] = useState(null); // что грузим в DaysProgramm
  const [currentProgram, setCurrentProgram] = useState(null); // что редактируем

  const handleLoad = async () => {
    if (!selectedClient) return;
    try {
      // const res = await fetch(
      //   `/api/programs/client/${encodeURIComponent(selectedClient)}`
      // );
      // const data = await res.json();
      // setLoadedProgram(data.program);
      // setCurrentProgram(data.program); // если надо редактировать
      setIsEditing(true);
    } catch (err) {
      console.error("Ошибка загрузки программы", err);
    }
  };

  const handleCreate = () => {
    // Очистка состояния
    setSelectedClient(null);
    setIsEditing(false);
  };

  const handleSaveProgram = async () => {
    if (!programName || !currentProgram) return;

    const body = {
      name: programName,
      client: saveClient || null,
      program: currentProgram,
    };
    console.log("bodybodybodybodybodybody", body);
    try {
      // const res = await fetch("/api/programs/save", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(body),
      // });

      // if (res.ok) {
      //   console.log("Программа сохранена");
      setIsEditing(false);
      setSaveDialogOpen(false);
      // } else {
      //   console.error("Ошибка при сохранении");
      // }
    } catch (err) {
      console.error("Ошибка при сохранении", err);
    }
  };

  const handlePromptGenerate = () => {
    setPromptDialogOpen(true);
  };

  return (
    <>
      {/* Шапка */}
      <Box display="flex" gap={2} alignItems="center" p={2}>
        <Autocomplete
          value={selectedClient}
          onChange={(e, newValue) => setSelectedClient(newValue)}
          options={mockClients}
          sx={{ width: 250 }}
          renderInput={(params) => <TextField {...params} label="Клиент" />}
          freeSolo
        />
        <Button
          variant="outlined"
          onClick={handleLoad}
          disabled={!selectedClient}
        >
          Загрузить
        </Button>
        <Button variant="outlined" onClick={handleCreate}>
          Создать
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            console.log("Текущая программа:", currentProgram);
            setSaveDialogOpen(true); // если хочешь открыть диалог для сохранения
          }}
        >
          Сохранить
        </Button>
      </Box>

      {/* Программа */}
      <Box px={2}>
        <DaysProgramm
          dayNames={dayNames}
          ITEM_TYPE={ITEM_TYPE}
          initialData={loadedProgram}
          onChange={setCurrentProgram}
        />
      </Box>

      {/* Подвал */}
      <Box display="flex" justifyContent="flex-end" p={2}>
        <Button variant="contained" onClick={handlePromptGenerate}>
          Сгенерировать
        </Button>
      </Box>

      {/* Диалог сохранения */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Сохранить программу</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Autocomplete
              value={saveClient}
              onChange={(e, newValue) => setSaveClient(newValue)}
              options={mockClients}
              renderInput={(params) => (
                <TextField {...params} label="Клиент (необязательно)" />
              )}
              freeSolo
            />
            <TextField
              label="Название программы"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={() => {
              // Логика сохранения
              setSaveDialogOpen(false);
              setIsEditing(false);
            }}
            variant="contained"
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог генерации */}
      <Dialog
        open={promptDialogOpen}
        onClose={() => setPromptDialogOpen(false)}
      >
        <DialogTitle>Введите промпт для генерации</DialogTitle>
        <DialogContent>
          <TextField label="Промпт" fullWidth multiline rows={3} autoFocus />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromptDialogOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={() => setPromptDialogOpen(false)}
          >
            ОК
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GenerateProgrammPage;
