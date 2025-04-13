import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Autocomplete,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import { 
  Add, 
  Search, 
  DateRange, 
  AttachMoney, 
  Close,
  FilterList,
  Print,
  FileDownload
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ruLocale from 'date-fns/locale/ru';

const PayPage = () => {
  // Состояние для диалога добавления оплаты
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [client, setClient] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Разовая');
  const [notes, setNotes] = useState('');

  // Список клиентов для поиска
  const clients = [
    { id: 1, name: 'Иванов Алексей' },
    { id: 2, name: 'Петрова Мария' },
    { id: 3, name: 'Сидоров Дмитрий' },
    { id: 4, name: 'Кузнецова Анна' },
    { id: 5, name: 'Смирнов Владимир' },
  ];

  // История платежей
  const [payments, setPayments] = useState([
    { id: 1, date: '2023-05-15', client: 'Иванов Алексей', amount: 5000, type: '10 тренировок', status: 'Завершено' },
    { id: 2, date: '2023-06-01', client: 'Петрова Мария', amount: 3000, type: 'Разовая', status: 'Завершено' },
    { id: 3, date: '2023-06-10', client: 'Сидоров Дмитрий', amount: 8000, type: '20 тренировок', status: 'Активен' },
    { id: 4, date: '2023-06-18', client: 'Кузнецова Анна', amount: 3500, type: 'Разовая', status: 'Завершено' },
  ]);

  // Стандартные суммы оплаты
  const presetAmounts = [3000, 5000, 8000];

  // Добавление новой оплаты
  const handleAddPayment = () => {
    if (client && amount && paymentDate) {
      const newPayment = {
        id: payments.length + 1,
        date: paymentDate.toISOString().split('T')[0],
        client: client.name,
        amount: parseInt(amount),
        type: paymentType,
        status: 'Активен'
      };
      setPayments([newPayment, ...payments]);
      handleCloseDialog();
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setClient(null);
    setAmount('');
    setPaymentType('Разовая');
    setNotes('');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      {/* Заголовок и кнопки */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Финансы ЮлькоФит
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<FilterList />}
            sx={{ mr: 2 }}
          >
            Фильтры
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Print />}
            sx={{ mr: 2 }}
          >
            Печать
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<FileDownload />}
          >
            Экспорт
          </Button>
        </Box>
      </Box>

      {/* Статистика */}
      <Box sx={{ 
        display: 'flex', 
        gap: 3, 
        mb: 4,
        flexWrap: 'wrap'
      }}>
        <Paper sx={{ 
          p: 3, 
          flexGrow: 1, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white'
        }}>
          <Typography variant="h6">Общий доход</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>24,500 ₽</Typography>
          <Typography variant="body2">за последние 30 дней</Typography>
        </Paper>
        <Paper sx={{ 
          p: 3, 
          flexGrow: 1, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white'
        }}>
          <Typography variant="h6">Активные абонементы</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>8</Typography>
          <Typography variant="body2">из 24 клиентов</Typography>
        </Paper>
        <Paper sx={{ 
          p: 3, 
          flexGrow: 1, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)',
          color: 'white'
        }}>
          <Typography variant="h6">Средний чек</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>4,900 ₽</Typography>
          <Typography variant="body2">за последние 30 дней</Typography>
        </Paper>
      </Box>

      {/* Кнопка добавления и таблица */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(106, 17, 203, 0.4)'
            }
          }}
        >
          Добавить оплату
        </Button>
      </Box>

      <Paper sx={{ 
        p: 2, 
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(90deg, #f6f6f6 0%, #f9f9f9 100%)'
              }}>
                <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Клиент</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Сумма</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Тип</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} hover>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>{payment.client}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      fontWeight: 600, 
                      color: '#2e7d32',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <AttachMoney fontSize="small" sx={{ mr: 0.5 }} />
                      {payment.amount.toLocaleString('ru-RU')} ₽
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.type} 
                      size="small"
                      sx={{ 
                        background: payment.type === 'Разовая' ? '#e3f2fd' : 
                                  payment.type === '10 тренировок' ? '#e8f5e9' : '#fff8e1',
                        color: payment.type === 'Разовая' ? '#1565c0' : 
                               payment.type === '10 тренировок' ? '#2e7d32' : '#ff8f00'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.status} 
                      size="small"
                      sx={{ 
                        background: payment.status === 'Активен' ? '#e8f5e9' : '#ffebee',
                        color: payment.status === 'Активен' ? '#2e7d32' : '#c62828'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small">Подробнее</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог добавления оплаты */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Новая оплата
          </Typography>
          <IconButton onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Клиент *
            </Typography>
            <Autocomplete
              options={clients}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder="Начните вводить имя"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                  }}
                />
              )}
              value={client}
              onChange={(event, newValue) => {
                setClient(newValue);
              }}
              fullWidth
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Сумма оплаты *
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              {presetAmounts.map((sum) => (
                <Button
                  key={sum}
                  variant={amount === sum.toString() ? 'contained' : 'outlined'}
                  onClick={() => setAmount(sum.toString())}
                  startIcon={<AttachMoney />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    minWidth: 100
                  }}
                >
                  {sum.toLocaleString('ru-RU')} ₽
                </Button>
              ))}
            </Box>
            <TextField
              label="Или введите свою сумму"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: <AttachMoney sx={{ mr: 1, color: 'action.active' }} />,
                endAdornment: '₽'
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Тип оплаты *
            </Typography>
            <TextField
              select
              fullWidth
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <MenuItem value="Разовая">Разовая тренировка</MenuItem>
              <MenuItem value="10 тренировок">Пакет 10 тренировок</MenuItem>
              <MenuItem value="20 тренировок">Пакет 20 тренировок</MenuItem>
              <MenuItem value="Другое">Другое</MenuItem>
            </TextField>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Дата оплаты *
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
              <DatePicker
                value={paymentDate}
                onChange={(newValue) => setPaymentDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
                inputFormat="dd.MM.yyyy"
                components={{
                  OpenPickerIcon: DateRange
                }}
              />
            </LocalizationProvider>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Примечание
            </Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder="Например: оплата за июнь, скидка 10% и т.д."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: 'text.secondary',
              mr: 2
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleAddPayment}
            variant="contained"
            disabled={!client || !amount}
            sx={{
              background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
              borderRadius: 2,
              px: 4,
              py: 1
            }}
          >
            Сохранить оплату
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayPage;