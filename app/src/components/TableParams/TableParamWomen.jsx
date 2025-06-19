import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputBase,
  IconButton,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { fetchWithRetry } from "../../utils/refreshToken";
import { addToast } from "../../utils/addToast";

const parameterListDefault = [
  "Дата",
  "Вес",
  "Объем груди",
  "Объем талии",
  "Объем ягодиц",
  "Объем бедра",
  "Объем голени",
  "Объем плеча",
  "Объем плеча в напряженном состоянии",
];

const inputBaseStyles = {
  padding: "0px !important",
  paddingTop: "0px !important",
  paddingLeft: "0px !important",
  paddingBottom: "0px !important",
  fontSize: "13px",
  "& .MuiInputBase-input": {
    textAlign: "center",
  },
};

function StyledInputBase(props) {
  return <InputBase sx={inputBaseStyles} {...props} />;
}

const MAX_VISIBLE_CORRECTIONS = 5;

export default function TableParamWoman({ clientId }) {
  const parameters = parameterListDefault;
  const [data, setData] = useState(parameterListDefault.map(() => ["", ...[]]));
  const [editedColumn, setEditedColumn] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [correctionOffset, setCorrectionOffset] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const submitData = async (data) => {
    try {
      const response = await fetchWithRetry(
        "/clients/changeParametrs",
        "PATCH",
        { data, clientId }
      );
      if (!response) {
        addToast(
          "errorNewDataCorrect",
          "error",
          "Произошла ошибка при обновлении данных в таблице!",
          1500
        );
      }
      addToast("GoodChange", "success", "Изменения применены!", 1500);
      fetchData();
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  };

  const fetchData = async () => {
    try {
      const res = await fetchWithRetry(
        `/clients/customGet?clientId=${clientId}&nameColoumn=parametrs`
      );
      const { primary, corrections } = res;

      if (!primary || !corrections) return;

      const newData = parameterListDefault.map((paramName, rowIndex) => {
        const primaryValue = primary[rowIndex]?.primary ?? "";
        const correctionValues = corrections.map(
          (col) => col[rowIndex]?.corr ?? ""
        );
        return [primaryValue, ...correctionValues];
      });

      setData(newData);
      const totalCorrections = newData[0].length - 1;
      const newOffset = Math.max(0, totalCorrections - MAX_VISIBLE_CORRECTIONS);
      setCorrectionOffset(newOffset);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  };

  const handleCellChange = (value, rowIndex, colIndex) => {
    setData(prev => {
      if (prev[rowIndex][colIndex] === value) return prev;
      const newData = [...prev.map(row => [...row])];
      newData[rowIndex][colIndex] = value;
      return newData;
    });
    setIsEdited(true);
  };

  const handleColumnEdit = (colIndex) => {
    setEditedColumn(colIndex);

    setData((prevData) => {
      const newData = [...prevData.map((row) => [...row])];

      const dateRowIndex = parameters.findIndex((p) => p === "Дата");

      if (newData[dateRowIndex][colIndex] === "") {
        newData[dateRowIndex][colIndex] = getToday();
      }

      return newData;
    });
  };

  const handleColumnSave = () => {
    setEditedColumn(null);
    if (isEdited) {
      handleSave();
    }
  };
  const handleAddCorrection = () => {
    setData((prev) => prev.map((row) => [...row, ""]));
    setIsEdited(true);
  };

  const handleDeleteCorrection = (colIndex) => {
    setData((prev) =>
      prev.map((row) => {
        const newRow = [...row];
        newRow.splice(colIndex, 1);
        return newRow;
      })
    );
    setIsEdited(true);
    setEditedColumn(null);
  };

  const handleSave = () => {
    const columns = {
      parameters,
      primary: data.map((row) => row[0]),
      corrections:
        data[0].length > 1
          ? Array.from({ length: data[0].length - 1 }, (_, i) =>
            data.map((row) => row[i + 1])
          )
          : [],
    };
    setIsEdited(false);

    submitData(columns);
  };

  const getToday = () => {
    return new Date().toISOString().split("T")[0];
  };

  const DateInputCell = ({ value, onChange }) => {
    return (
      <InputBase
        type="date"
        value={value ? value : getToday()}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          width: "100%",
          "& .MuiInputBase-input": {
            textAlign: "center",
            py: "6px",
            px: "8px",
            border: "1px solid",
            borderColor: "primary.main",
            borderRadius: "4px",
            bgcolor: "background.paper",
            padding: "0px 0px 0px 0px !important",
            paddingTop: "0px !important",
            paddingLeft: "0px !important",
            paddingBottom: "0px !important",
            paddingTop: "0px !important",
            fontSize: "15px",
          },
        }}
      />
    );
  };

  const formatDateToDisplay = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}.${month}.${year}`;
  };

  const totalCorrections = data[0].length - 1;
  const maxOffset = Math.max(0, totalCorrections - MAX_VISIBLE_CORRECTIONS);
  const safeOffset = Math.min(correctionOffset, maxOffset);
  const startCorrection = Math.max(0, safeOffset);
  const visibleCorrections = data[0].slice(
    1 + startCorrection,
    1 + startCorrection + MAX_VISIBLE_CORRECTIONS
  );

  const CorrectionCell = React.memo(({ primaryValue, correctionValue, isEditing, onChange }) => {

    const parseFloatSafe = (val) => {
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    const primary = parseFloatSafe(primaryValue);
    const correction = parseFloatSafe(correctionValue);
    const diff =
      primary !== null && correction !== null ? correction - primary : null;
    const diffColor = diff > 0 ? "red" : diff < 0 ? "green" : "inherit";

    return (
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        {isEditing ? (
          <StyledInputBase
            value={correctionValue}
            onChange={(e) => onChange(e.target.value)}
            sx={{ width: "100%" }} // если нужно добавить что-то дополнительное
          />
        ) : (
          <Box>
            <span>{correctionValue}</span>
            {diff !== null && diff !== 0 && (
              <span style={{ color: diffColor, marginLeft: 4 }}>
                ({diff > 0 ? "+" : ""}
                {diff.toFixed(1)})
              </span>
            )}
          </Box>
        )}
      </Box>
    );
  });

  return (
    <Box
      sx={{
        mt: 0,
        p: 0,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <IconButton
            onClick={() => setCorrectionOffset((prev) => Math.max(0, prev - 1))}
            disabled={correctionOffset === 0}
            sx={{
              color:
                correctionOffset === 0 ? "action.disabled" : "primary.main",
              mr: 1,
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() =>
              setCorrectionOffset((prev) => Math.min(maxOffset, prev + 1))
            }
            disabled={correctionOffset >= maxOffset}
            sx={{
              color:
                correctionOffset >= maxOffset
                  ? "action.disabled"
                  : "primary.main",
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>

        <Button
          variant="contained"
          onClick={handleAddCorrection}
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "success.main",
            "&:hover": {
              bgcolor: "success.dark",
            },
          }}
        >
          Добавить корректировку
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          overflowX: "auto",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          boxShadow: "none",
          width: "85vh", // ограничение по высоте
        }}
      >
        <Table
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            margin: 0,
            padding: 0,
            width: "auto",
            minWidth: "800px", // ← Добавь вот эту строку
            tableLayout: "fixed",

            "& .MuiTableCell-root": {
              border: "1px solid #d0d7de",
              padding: "8px 10px",
              backgroundColor: "inherit",
              color: "#1c1c1e",
              fontSize: "0.85rem",
              boxSizing: "border-box",
              width: "12vh",
              minWidth: "12vh",
              maxWidth: "10vh",
              textAlign: "center",
              verticalAlign: "middle",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            },

            "& .MuiTableHead-root .MuiTableCell-root": {
              fontWeight: 600,
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: "#f4f6f8 !important",
              color: "#111827",
            },

            "& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root:first-of-type":
            {
              borderTopLeftRadius: "12px",
            },
            "& .MuiTableCell-root:first-of-type": {
              paddingLeft: "8px !important",
            },
            "& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root:last-of-type":
            {
              borderTopRightRadius: "12px",
            },

            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root":
            {
              backgroundColor: "#ffffff",
            },
            "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root":
            {
              backgroundColor: "rgba(232, 206, 241, 0.51)",
            },
            "& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root": {
              backgroundColor: "#e0f2fe",
            },
            "& .MuiInputBase-input": {
              padding: "0px !important",

            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: "150px",
                  borderTopLeftRadius: "8px",
                }}
                rowSpan={2}
              >
                Параметры
              </TableCell>
              <TableCell
                sx={{
                  width: "150px",
                }}
                rowSpan={2}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  Первичные
                  {editedColumn === 0 ? (
                    <IconButton
                      size="small"
                      onClick={handleColumnSave}
                      sx={{
                        color: "primary.main",
                        "&:hover": {
                          bgcolor: "primary.light",
                        },
                      }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleColumnEdit(0)}
                      sx={{
                        color: "primary.main",
                        "&:hover": {
                          bgcolor: "primary.light",
                        },
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </TableCell>
              <TableCell
                colSpan={visibleCorrections.length}
                sx={{
                  borderTopRightRadius: "8px",
                }}
              >
                Корректировка
              </TableCell>
            </TableRow>
            <TableRow>
              {visibleCorrections.map((_, i) => {
                const correctionIndex = startCorrection + i + 1;
                return (
                  <TableCell key={correctionIndex}>
                    <Box display="flex" alignItems="center">
                      №{correctionIndex}
                      <Box>
                        {editedColumn === correctionIndex ? (
                          <IconButton
                            size="small"
                            onClick={handleColumnSave}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                bgcolor: "primary.light",
                              },
                            }}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => handleColumnEdit(correctionIndex)}
                            sx={{
                              color: "primary.main",
                              "&:hover": {
                                bgcolor: "primary.light",
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteCorrection(correctionIndex)
                          }
                          sx={{
                            color: "error.main",
                            "&:hover": {
                              bgcolor: "error.light",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {parameters.map((param, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                <TableCell key={`label-${rowIndex}`} title={`${param}`}>{param}</TableCell>

                <TableCell>
                  {editedColumn === 0 ? (
                    rowIndex === 0 ? (
                      <DateInputCell
                        value={data[rowIndex][0]}
                        onChange={(val) => handleCellChange(val, rowIndex, 0)}
                      />
                    ) : (
                      <InputBase
                        sx={{
                          padding: "0px 0px 0px 0px !important",
                          paddingTop: "0px !important",
                          paddingLeft: "0px !important",
                          paddingBottom: "0px !important",
                          paddingTop: "0px !important",
                          fontSize: "15px",
                        }}
                        value={data[rowIndex][0]}
                        onChange={(e) =>
                          handleCellChange(e.target.value, rowIndex, 0)
                        }
                      />
                    )
                  ) : rowIndex === 0 ? (
                    formatDateToDisplay(data[rowIndex][0])
                  ) : (
                    data[rowIndex][0]
                  )}
                </TableCell>

                {visibleCorrections.map((_, i) => {
                  const colIndex = startCorrection + i + 1;
                  const primaryValue = data[rowIndex][0];
                  const correctionValue = data[rowIndex][colIndex];
                  const isEditing = editedColumn === colIndex;
                  return (
                    <TableCell key={colIndex}>
                      {rowIndex === 0 && editedColumn === colIndex ? (
                        // Если это первая строка — отображаем ячейку с вводом даты
                        <DateInputCell
                          value={data[0][colIndex]}
                          onChange={(val) => handleCellChange(val, 0, colIndex)}
                        />
                      ) : editedColumn === colIndex ? (
                        // Редактируемая ячейка
                        <StyledInputBase
                          value={data[rowIndex][colIndex] || ""}
                          onChange={(e) => handleCellChange(e.target.value, rowIndex, colIndex)}
                        />
                      ) : rowIndex === 0 ? (
                        // Обычное отображение значения
                        formatDateToDisplay(data[rowIndex][colIndex] || "")
                      ) : (
                        <CorrectionCell
                          primaryValue={primaryValue}
                          correctionValue={correctionValue}
                          isEditing={isEditing}
                          onChange={(value) =>
                            handleCellChange(value, rowIndex, colIndex)
                          }
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
