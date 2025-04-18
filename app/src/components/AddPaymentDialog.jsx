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
    IconButton,
    useTheme,
    useMediaQuery,
    Avatar,
    Slide,
    Menu,
    Stack,
    FormControl,
    InputLabel,
    Select,
    Checkbox,
    ListItemText,
  } from '@mui/material';
  import { 
    Add, 
    DateRange, 
    FilterList,
    Print,
    FileDownload
  } from '@mui/icons-material';
    import { Close, Search, AttachMoney } from '@mui/icons-material';
    import { useState, useEffect } from 'react';
    import { fetchWithRetry } from '../utils/refreshToken';
    import { DatePicker } from '@mui/x-date-pickers/DatePicker';
    import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
    import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
    import ruLocale from 'date-fns/locale/ru';
    import { addToast } from '../utils/addToast';

  export default function AddPaymentDialog({
    open, onClose, clients, setClient, client, presetAmounts = [2400, 22000, 40000], fetchDataPayList
  }) {
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('Разовая');
    const [notes, setNotes] = useState('');
    const [expiryDate, setExpiryDate] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() + 6);
        return date;
      });
    const [isExpiryDateManuallySet, setIsExpiryDateManuallySet] = useState(false);
    const [customPaymentType, setCustomPaymentType] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date());
    const [payments, setPayments] = useState([]);

    const handleCloseDialog = () => {
      onClose(false);
      setClient(null);
      setAmount('');
      setPaymentType('Разовая');
      setNotes('');
      setCustomPaymentType('');
      setIsExpiryDateManuallySet(false);
      setPaymentDate(new Date());
    
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 6);
      setExpiryDate(resetDate);
    };

    const handleAddPayment = async () => {
        if (client && amount && paymentDate) {
          const newPayment = {
            id: generateReadableId(),
            date: paymentDate.toISOString().split('T')[0],
            client: client.name,
            amount: parseInt(amount),
            type: paymentType,
            status: 'Активен',
            dateTo: expiryDate.toISOString().split('T')[0],
            customPaymentType: customPaymentType,
            isExpiryDateManuallySet: isExpiryDateManuallySet,
            notes: notes,
            phone: client.phone,
            method: 'card',
          };
          try {
            const response = await fetchWithRetry('/payment_history', 'POST', { fromData: newPayment });
            console.log(response);
            
            if (!response.data.success) {
              addToast('error', 'error', 'Ошибка принятия данных с сервер!', 1000);
              return;
            } 
    
    
            fetchDataPayList();
          } catch (error) {
            addToast('error', 'error', 'Ошибка принятия данных на сервер!', 1000);
          }
          console.log('newPaymentnewPanewPaymentyment',newPayment);
          setPayments([newPayment, ...payments]);
          handleCloseDialog(); // очищает всё после сохранения
        }
      };

      const generateReadableId = () => {
        const date = new Date();
        const dateString = date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
        const randomPart = Math.random().toString(36).substring(2, 10); // Генерирует случайную строку
        return `pay_${dateString}_${randomPart}`;
      };

  
    return (
        <Dialog 
        open={open} 
        onClose={onClose}
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
            
            {paymentType === "Другое" && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Укажите тип оплаты"
                  fullWidth
                  value={customPaymentType}
                  onChange={(e) => setCustomPaymentType(e.target.value)}
                  placeholder="Например: Абонемент на месяц, Корпоративный пакет и т.д."
                />
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Дата оплаты *
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
              <DatePicker
                value={paymentDate}
                onChange={(newValue) => {
                  setPaymentDate(newValue);
                  // При изменении даты оплаты обновляем дату окончания (если она не была изменена вручную)
                  if (!isExpiryDateManuallySet && newValue) {
                    const expiryDate = new Date(newValue);
                    expiryDate.setMonth(expiryDate.getMonth() + 6);
                    setExpiryDate(expiryDate);
                  }
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
                inputFormat="dd.MM.yyyy"
                components={{
                  OpenPickerIcon: DateRange
                }}
              />
            </LocalizationProvider>
          </Box>

          {(paymentType.includes("тренировок") || paymentType === "Другое") && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Действителен до
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns} locale={ruLocale}>
                <DatePicker
                  value={expiryDate}
                  onChange={(newValue) => {
                    setExpiryDate(newValue);
                    setIsExpiryDateManuallySet(true);
                  }}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth
                      helperText={!isExpiryDateManuallySet ? "По умолчанию: 6 месяцев с даты оплаты" : ""}
                    />
                  )}
                  inputFormat="dd.MM.yyyy"
                  minDate={paymentDate}
                />
              </LocalizationProvider>
            </Box>
          )}

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
    );
  }
  