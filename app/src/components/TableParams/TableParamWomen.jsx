import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const parameterListDefault = [
  'Дата',
  'Вес',
  'Объем груди',
  'Объем талии',
  'Объем ягодиц',
  'Объем бедра',
  'Объем голени',
  'Объем плеча',
  'Объем плеча в напряженном состоянии',
];

const MAX_VISIBLE_CORRECTIONS = 5;

export default function TableParamWoman() {
  const [parameters] = useState(parameterListDefault);
  const [data, setData] = useState(
    parameterListDefault.map(() => ['', ...[]])
  );
  const [editedColumn, setEditedColumn] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [correctionOffset, setCorrectionOffset] = useState(0);

  useEffect(() => {


    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // const response = await axios.get('/api/params'); // Замените на ваш URL
      // const { parameters, primary, corrections } = response.data;

      // const mergedData = parameters.map((param, i) => [
      //   primary[i] || '',
      //   ...(corrections?.map(col => col[i]) || []),
      // ]);

      // setData(mergedData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };



  const handleCellChange = (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
    setIsEdited(true);
  };

  const handleCellChangeData = (rowIndex, colIndex, value) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = value;
    setData(newData);
    setIsEdited(true);
  };

  const handleColumnEdit = (colIndex) => setEditedColumn(colIndex);
  const handleColumnSave = () => setEditedColumn(null);

  const handleAddCorrection = () => {
    setData(prev =>
      prev.map(row => [...row, ''])
    );
    setIsEdited(true);
  };

  const handleDeleteCorrection = (colIndex) => {
    setData(prev =>
      prev.map(row => {
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
      primary: data.map(row => row[0]),
      corrections: data[0].length > 1
        ? Array.from({ length: data[0].length - 1 }, (_, i) =>
          data.map(row => row[i + 1])
        )
        : [],
    };
    console.log('Готово к отправке на сервер:', columns);
    setIsEdited(false);
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0]
  }

  const DateInputCell = ({ value, onChange }) => {
    useEffect(() => {
      if (!value) {
        onChange(getToday());
      }
    }, [value]);

    return (
      <InputBase
        type="date"
        value={value || getToday()}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          width: '100%',
          '& .MuiInputBase-input': {
            textAlign: 'center',
            py: '6px',
            px: '8px',
            border: '1px solid',
            borderColor: 'primary.main',
            borderRadius: '4px',
            bgcolor: 'background.paper',
          },
        }}
      />
    );
  };

  const totalCorrections = data[0].length - 1;
  const maxOffset = Math.max(0, totalCorrections - MAX_VISIBLE_CORRECTIONS);
  const safeOffset = Math.min(correctionOffset, maxOffset);
  const startCorrection = Math.max(0, safeOffset);
  const visibleCorrections = data[0].slice(1).slice(startCorrection, startCorrection + MAX_VISIBLE_CORRECTIONS);

  return (
    <Box sx={{
      mt: 3,
      p: 3,
      borderRadius: 2,
      bgcolor: 'background.paper',
      boxShadow: 1
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Box>
          <IconButton
            onClick={() => setCorrectionOffset(prev => Math.max(0, prev - 1))}
            disabled={correctionOffset === 0}
            sx={{
              color: correctionOffset === 0 ? 'action.disabled' : 'primary.main',
              mr: 1
            }}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() => setCorrectionOffset(prev => Math.min(maxOffset, prev + 1))}
            disabled={correctionOffset >= maxOffset}
            sx={{
              color: correctionOffset >= maxOffset ? 'action.disabled' : 'primary.main'
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
            bgcolor: 'success.main',
            '&:hover': {
              bgcolor: 'success.dark'
            }
          }}
        >
          Добавить корректировку
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 'none'
        }}
      >
        <Table sx={{
          borderCollapse: 'separate',
          borderSpacing: 0,
          width: '100%',

          '& .MuiTableCell-root': {
            border: '1px solid #d0d7de',
            padding: '8px 16px',
            backgroundColor: 'inherit',
            color: '#1c1c1e',
            fontSize: '0.9rem',
          },

          '& .MuiTableHead-root .MuiTableCell-root': {
            fontWeight: 600,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            backgroundColor: '#f4f6f8 !important',
            color: '#111827',
          },

          '& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root:first-of-type': {
            borderTopLeftRadius: '12px',
          },
          '& .MuiTableCell-root:first-of-type': {
            paddingLeft: '2vh !important',
          },
          '& .MuiTableHead-root .MuiTableRow-root .MuiTableCell-root:last-of-type': {
            borderTopRightRadius: '12px',
          },

          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root': {
            backgroundColor: '#ffffff',
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root': {
            backgroundColor: '#f9fafb',
          },

          '& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root': {
            backgroundColor: '#e0f2fe',
          }
        }}>

          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: '150px',
                  borderTopLeftRadius: '8px'
                }}
                rowSpan={2}
              >
                Параметры
              </TableCell>
              <TableCell
                sx={{
                  width: '150px'
                }}
                rowSpan={2}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Первичные
                  {editedColumn === 0 ? (
                    <IconButton
                      size="small"
                      onClick={handleColumnSave}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light'
                        }
                      }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton
                      size="small"
                      onClick={() => handleColumnEdit(0)}
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light'
                        }
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
                  borderTopRightRadius: '8px'
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
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      Корр. №{correctionIndex}
                      <Box>
                        {editedColumn === correctionIndex ? (
                          <IconButton
                            size="small"
                            onClick={handleSave}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.light'
                              }
                            }}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => handleColumnEdit(correctionIndex)}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.light'
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteCorrection(correctionIndex)}
                          sx={{
                            color: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.light'
                            }
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
              <TableRow key={rowIndex}>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    paddingLeft: '24px'
                  }}
                >
                  {param}
                </TableCell>

                {/* Первичный столбец */}
                <TableCell>
                  {editedColumn === 0 ? (
                    param === 'Дата' ? (
                      <Box sx={{ maxWidth: 120, mx: 'auto' }}>
                        <DateInputCell
                          value={data[rowIndex][0]}
                          onChange={(val) => handleCellChangeData(rowIndex, data[rowIndex][0], val)}
                        />
                      </Box>


                    ) : (
                      <InputBase
                        value={data[rowIndex][0]}
                        onChange={(e) => handleCellChange(rowIndex, data[rowIndex][0], e.target.value)}
                        sx={{
                          width: '100%',
                          maxWidth: 100,
                          minWidth: 60,
                          mx: 'auto',
                          '& .MuiInputBase-input': {
                            textAlign: 'center',
                            py: '4px',
                            px: '6px',
                            border: '1px solid',
                            borderColor: 'primary.main',
                            borderRadius: '4px',
                            bgcolor: 'background.paper',
                            fontSize: '0.875rem',
                          },
                        }}
                      />

                    )
                  ) : (
                    data[rowIndex][0]
                  )}
                </TableCell>

                {/* Корректировки */}
                {visibleCorrections.map((_, i) => {
                  const actualCol = startCorrection + i + 1;
                  return (
                    <TableCell key={actualCol}>
                      {editedColumn === actualCol ? (
                        param === 'Дата' ? (
                          <DateInputCell
                            value={data[rowIndex][0]}
                            onChange={(val) => handleCellChangeData(rowIndex, 0, val)}
                          />
                        ) : (
                          <InputBase
                            value={data[rowIndex][actualCol]}
                            onChange={(e) => handleCellChange(rowIndex, actualCol, e.target.value)}
                            sx={{
                              width: '100%',
                              maxWidth: 100,
                              minWidth: 60,
                              mx: 'auto',
                              '& .MuiInputBase-input': {
                                textAlign: 'center',
                                py: '4px',
                                px: '6px',
                                border: '1px solid',
                                borderColor: 'primary.main',
                                borderRadius: '4px',
                                bgcolor: 'background.paper',
                                fontSize: '0.875rem',
                              },
                            }}
                          />

                        )
                      ) : (
                        data[rowIndex][actualCol]
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