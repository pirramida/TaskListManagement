import React, { useState } from "react";
import {
  Autocomplete,
  TextField,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";

export default function EditableTestSelect({ testList, selectedTestId, setSelectedTestId, saveTestName, deleteTest }) {
  const [editTestId, setEditTestId] = useState(null);
  const [editTestName, setEditTestName] = useState("");

  const startEdit = (test) => {
    setEditTestId(test.id);
    setEditTestName(test.name || "");
  };

  const cancelEdit = () => {
    setEditTestId(null);
    setEditTestName("");
  };

  const onSave = () => {
    if (editTestName.trim()) {
      saveTestName(editTestId, editTestName.trim());
      setEditTestId(null);
      setEditTestName("");
    }
  };

  return (
    <Autocomplete
      options={testList}
      getOptionLabel={(option) => option.name || `Тест #${option.id}`}
      value={testList.find((t) => t.id === selectedTestId) || null}
      onChange={(_, newValue) => {
        if (newValue) setSelectedTestId(newValue.id);
      }}
      renderOption={(props, option) => {
        const isEditing = editTestId === option.id;
        return (
          <li {...props} key={option.id}>
            {isEditing ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: '100%' }}>
                <TextField
                  value={editTestName}
                  onChange={(e) => setEditTestName(e.target.value)}
                  size="small"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onSave();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  sx={{ flexGrow: 1 }}
                  placeholder="Введите название"
                />
                <Tooltip title="Сохранить">
                  <IconButton size="small" onClick={onSave} color="primary">
                    <CheckIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Отмена">
                  <IconButton size="small" onClick={cancelEdit} color="inherit">
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Box sx={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {option.name || `Тест #${option.id}`}
                </Box>
                <Box>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => startEdit(option)} color="primary" sx={{ mr: 1 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" onClick={() => deleteTest(option.id)} color="error">
                      {/* Тут можно иконку удаления */}
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            )}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label="Выбрать тест" variant="outlined" fullWidth />
      )}
      disableClearable
      sx={{ maxWidth: 400 }}
    />
  );
}
