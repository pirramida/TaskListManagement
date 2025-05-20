import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

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

export default function MeasurementTable() {
  const [parameters] = useState(parameterListDefault);
  const [data, setData] = useState(
    parameterListDefault.map(() => ['', ...[]])
  );
  const [editedColumn, setEditedColumn] = useState(null);
  const [isEdited, setIsEdited] = useState(false);

  const handleCellChange = (rowIndex, colIndex, value) => {
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

  const totalCorrections = data[0].length - 1;
  const startCorrection = Math.max(0, totalCorrections - MAX_VISIBLE_CORRECTIONS);
  const visibleCorrections = data[0].slice(1).slice(startCorrection);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Измерения тела
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, gap: 1 }}>
        <Button variant="outlined" onClick={handleAddCorrection} startIcon={<AddIcon />}>
          Добавить корректировку
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  width: '200px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: '1px solid rgba(224, 224, 224, 1)',
                  padding: '4px',
                }}
                rowSpan={2}
              >
                Параметры
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  width: '150px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: '1px solid rgba(224, 224, 224, 1)',
                  padding: '4px',
                }}
                rowSpan={2}
              >
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  Первичные
                  {editedColumn === 0 ? (
                    <IconButton size="small" onClick={handleColumnSave} sx={{ color: 'white' }}>
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton size="small" onClick={() => handleColumnEdit(0)} sx={{ color: 'white' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: '1px solid rgba(224, 224, 224, 1)',
                  padding: '4px',
                }}
                colSpan={visibleCorrections.length}
              >
                Корректировка
              </TableCell>
            </TableRow>
            <TableRow>
              {visibleCorrections.map((_, i) => {
                const correctionIndex = startCorrection + i + 1;
                return (
                  <TableCell
                    key={correctionIndex}
                    sx={{
                      fontWeight: 'bold',
                      textAlign: 'center',
                      backgroundColor: '#42a5f5',
                      color: 'white',
                      border: '1px solid rgba(224, 224, 224, 1)',
                      padding: '4px',
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      Корр. #{correctionIndex}
                      <Box>
                        {editedColumn === correctionIndex ? (
                          <IconButton size="small" onClick={handleColumnSave} sx={{ color: 'white' }}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton size="small" onClick={() => handleColumnEdit(correctionIndex)} sx={{ color: 'white' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" onClick={() => handleDeleteCorrection(correctionIndex)} sx={{ color: 'white' }}>
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
                    backgroundColor: '#fafafa',
                    border: '1px solid rgba(224, 224, 224, 1)',
                    padding: '4px',
                  }}
                >
                  {param}
                </TableCell>

                {/* Первичный столбец */}
                <TableCell sx={{ textAlign: 'center', border: '1px solid rgba(224, 224, 224, 1)', padding: '4px' }}>
                  {editedColumn === 0 ? (
                    <InputBase
                      value={data[rowIndex][0]}
                      onChange={(e) => handleCellChange(rowIndex, 0, e.target.value)}
                      sx={{ fontSize: '0.875rem', width: '100%' }}
                    />
                  ) : (
                    data[rowIndex][0]
                  )}
                </TableCell>

                {/* Корректировки */}
                {visibleCorrections.map((_, i) => {
                  const actualCol = startCorrection + i + 1;
                  return (
                    <TableCell key={actualCol} sx={{ textAlign: 'center', border: '1px solid rgba(224, 224, 224, 1)', padding: '4px' }}>
                      {editedColumn === actualCol ? (
                        <InputBase
                          value={data[rowIndex][actualCol]}
                          onChange={(e) => handleCellChange(rowIndex, actualCol, e.target.value)}
                          sx={{ fontSize: '0.875rem', width: '100%' }}
                        />
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

      {isEdited && (
        <Button variant="contained" onClick={handleSave} sx={{ mt: 2 }} startIcon={<CheckIcon />}>
          Сохранить
        </Button>
      )}
    </Box>
  );
}
