import React, { useState, useEffect, memo } from "react";
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

const SectionTable = ({
  section,
  data,
  expanded,
  toggleExpanded,
  addRow,
  handleTestDataChange,
  removeRow,
  saveRow,
}) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: getSectionColor(section, 0.1),
          p: 1,
          borderRadius: 1,
          cursor: "pointer",
        }}
        onClick={() => toggleExpanded(section)}
      >
        <Box display="flex" alignItems="center" flexGrow={1}>
          {renderSectionIcon(section)}
          <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 600 }}>
            {renderSectionTitle(section)}
          </Typography>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); addRow(section); }} sx={{ ml: 1 }}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
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
              {data.map((row, index) => (
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Box>
  );
};

export default SectionTable;