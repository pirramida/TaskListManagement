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
} from "@mui/material";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { motion, AnimatePresence } from "framer-motion";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { v4 as uuidv4 } from "uuid";
import "./DaysProgramm.css";

const DraggableCard = ({ ITEM_TYPE, card, index, moveCard, onContextMenu }) => {
  const ref = useRef(null);
  const theme = useTheme();

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveCard(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      onContextMenu={onContextMenu}
      layout
      initial={{ scale: 1 }}
      animate={{
        scale: isDragging ? 1.03 : 1,
        boxShadow: isDragging ? theme.shadows[6] : theme.shadows[1],
        opacity: isDragging ? 0.9 : 1,
        backgroundColor: isDragging
          ? theme.palette.action.hover
          : theme.palette.background.paper,
      }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`draggable-card ${isDragging ? "dragging" : ""}`}
    >
      <DragIndicatorIcon className="drag-icon" />
      <Box className="card-info">
        <Typography
          className="card-exercise"
          variant="subtitle1"
          fontWeight="medium"
        >
          {card.exercise}
        </Typography>
        <Box className="card-chips">
          <Chip
            label={`${card.reps} повт`}
            size="small"
            className="chip-reps"
          />
          <Chip
            label={`${card.weight} кг`}
            size="small"
            className="chip-weight"
          />
        </Box>
      </Box>
    </motion.div>
  );
};

const DaysProgramm = ({ onChange, initialData = [], dayNames, ITEM_TYPE }) => {
  const theme = useTheme();
  const [columns, setColumns] = useState(() =>
    Array(7)
      .fill(null)
      .map(() => [])
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [exercise, setExercise] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [contextCardInfo, setContextCardInfo] = useState(null);

  useEffect(() => {
    if (initialData && initialData.length === 7) {
      setColumns(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (onChange) {
      onChange(columns);
    }
  }, [columns, onChange]);

  const openDialog = (colIndex, card = null) => {
    if (card) {
      setExercise(card.exercise);
      setReps(card.reps);
      setWeight(card.weight);
      setEditingCard({ ...card, colIndex });
    } else {
      setExercise("");
      setReps("");
      setWeight("");
      setEditingCard({ colIndex });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setExercise("");
    setReps("");
    setWeight("");
    setEditingCard(null);
  };

  const handleAddOrEditCard = () => {
    setColumns((prev) => {
      const newCols = [...prev];
      const cards = newCols[editingCard.colIndex];

      if (editingCard.id) {
        newCols[editingCard.colIndex] = cards.map((c) =>
          c.id === editingCard.id ? { ...c, exercise, reps, weight } : c
        );
      } else {
        if (cards.length < 10) {
          newCols[editingCard.colIndex] = [
            ...cards,
            { id: uuidv4(), exercise, reps, weight },
          ];
        }
      }
      return newCols;
    });
    closeDialog();
  };

  const handleRightClick = (colIndex, cardId, event) => {
    event.preventDefault();
    setContextCardInfo({ colIndex, cardId });
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setContextCardInfo(null);
  };

  const handleEdit = () => {
    const { colIndex, cardId } = contextCardInfo;
    const card = columns[colIndex].find((c) => c.id === cardId);
    if (card) openDialog(colIndex, card);
    handleCloseMenu();
  };

  const handleDelete = () => {
    const { colIndex, cardId } = contextCardInfo;
    setColumns((prev) => {
      const newCols = [...prev];
      newCols[colIndex] = newCols[colIndex].filter((c) => c.id !== cardId);
      return newCols;
    });
    handleCloseMenu();
  };

  const moveCard = useCallback((colIndex, dragIndex, hoverIndex) => {
    setColumns((prev) => {
      const newCols = [...prev];
      const colCards = [...newCols[colIndex]];
      const [dragged] = colCards.splice(dragIndex, 1);
      colCards.splice(hoverIndex, 0, dragged);
      newCols[colIndex] = colCards;
      return newCols;
    });
  }, []);
  

  // CSS variables for light/dark mode to match MUI theme
  React.useEffect(() => {
    const root = document.documentElement;
    const isDark = theme.palette.mode === "dark";

    root.style.setProperty(
      "--background-default",
      isDark ? theme.palette.background.default : theme.palette.grey[100]
    );
    root.style.setProperty(
      "--background-paper",
      theme.palette.background.paper
    );
    root.style.setProperty("--primary-main", theme.palette.primary.main);
    root.style.setProperty(
      "--primary-contrastText",
      theme.palette.primary.contrastText
    );
    root.style.setProperty("--secondary-light", theme.palette.secondary.light);
    root.style.setProperty(
      "--secondary-contrastText",
      theme.palette.secondary.contrastText
    );
    root.style.setProperty("--primary-light", theme.palette.primary.light);
    root.style.setProperty("--text-secondary", theme.palette.text.secondary);
    root.style.setProperty("--divider", theme.palette.divider);
    root.style.setProperty("--action-hover", theme.palette.action.hover);
    root.style.setProperty("--shadow-elevation-1", theme.shadows[1]);
    root.style.setProperty("--shadow-elevation-3", theme.shadows[3]);
    root.style.setProperty("--shadow-elevation-6", theme.shadows[6]);
  }, [theme]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Box className="generate-programm-page">
        <Box className="columns-container">
          {columns.map((cards, colIndex) => (
            <Paper
              key={colIndex}
              className={`day-column ${cards.length === 0 ? "empty" : ""}`}
              elevation={3}
            >
              {" "}
              <Box className="day-column-header">
                <Typography variant="h6" fontWeight="600">
                  {dayNames[colIndex]}
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => openDialog(colIndex)}
                    disabled={cards.length >= 10}
                    title="Добавить упражнение"
                  >
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setColumns((prev) => {
                        const newCols = [...prev];
                        newCols[colIndex] = [];
                        return newCols;
                      })
                    }
                    title="Очистить день"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
              <Box className="cards-container">
                <AnimatePresence>
                  {cards.length === 0 ? (
                    <Box className="no-exercises">
                      <Typography variant="body2">Нет упражнений</Typography>
                    </Box>
                  ) : (
                    cards.map((card, index) => (
                      <DraggableCard
                        ITEM_TYPE={ITEM_TYPE}
                        key={card.id}
                        card={card}
                        index={index}
                        moveCard={(dragIndex, hoverIndex) =>
                          moveCard(colIndex, dragIndex, hoverIndex)
                        }
                        onContextMenu={(e) =>
                          handleRightClick(colIndex, card.id, e)
                        }
                      />
                    ))
                  )}
                </AnimatePresence>
              </Box>
              <Box className="cards-footer">
                <Typography variant="caption" color="textSecondary">
                  {cards.length} упражнений
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Dialog open={dialogOpen} onClose={closeDialog}>
          <DialogTitle>
            {editingCard && editingCard.id
              ? "Редактировать упражнение"
              : "Добавить упражнение"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Упражнение"
              type="text"
              fullWidth
              variant="standard"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Повторения"
              type="number"
              fullWidth
              variant="standard"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Вес (кг)"
              type="number"
              fullWidth
              variant="standard"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Отмена</Button>
            <Button
              onClick={handleAddOrEditCard}
              disabled={!exercise || !reps || !weight}
            >
              {editingCard && editingCard.id ? "Сохранить" : "Добавить"}
            </Button>
          </DialogActions>
        </Dialog>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Редактировать
          </MenuItem>
          <MenuItem onClick={handleDelete}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Удалить
          </MenuItem>
        </Menu>
      </Box>
    </DndProvider>
  );
};

export default DaysProgramm;
