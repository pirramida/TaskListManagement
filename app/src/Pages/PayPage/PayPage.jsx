import React, { useEffect, useState } from 'react';
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
import { fetchWithRetry } from '../../utils/refreshToken';
import { addToast } from '../../utils/addToast';
import dayjs from 'dayjs';
import PaymentDetailsPage from '../../components/MoreDataPayPage';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PaidIcon from '@mui/icons-material/Paid';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import PhoneIcon from '@mui/icons-material/Phone';
import NotesIcon from '@mui/icons-material/Notes';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PayPage = () => {
  // Состояние для диалога добавления оплаты
  const [openDialog, setOpenDialog] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [client, setClient] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Разовая');
  const [notes, setNotes] = useState('');
  const [clients, setClients] = useState();
  const [expiryDate, setExpiryDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });
  const [isExpiryDateManuallySet, setIsExpiryDateManuallySet] = useState(false);
  const [customPaymentType, setCustomPaymentType] = useState("");

  const [openDetils, setOpenDetils] = useState(false);

  // История платежей
  const [payment, setPayment] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [payments, setPayments] = useState([]);

  // Стандартные суммы оплаты
  const presetAmounts = [2400, 22000, 40000];

  useEffect(() => {
    try {
      const fetchData = async() => {
        const response = await fetchWithRetry('/clients', 'GET');
        setClients(response);
      }
      fetchData();
    } catch (error) {
      console.error('Произошла ошибка в получении клиентов!');
    } 
  }, [openDialog]);

  useEffect(() => {
    fetchDataPayList();
  }, []);

  const generateReadableId = () => {
    const date = new Date();
    const dateString = date.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
    const randomPart = Math.random().toString(36).substring(2, 10); // Генерирует случайную строку
    return `pay_${dateString}_${randomPart}`;
  };

  const fetchDataPayList = async () => {
    try {
      const response = await fetchWithRetry('/payment_history', 'GET');
      setPayments(response)
    } catch (error) {
      addToast('error', 'error', 'Ошибка добычи данных с сервера!', 1000);
    }
  };

  // Добавление новой оплаты
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
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

  const handleOpen = (client) => {
    setPayment(client);
    setOpenDetils(true);
  };


  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Здесь можно добавить логику сохранения изменений
    console.log('Данные сохранены:', payment);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
  };

  const getFieldIcon = (name) => {
    switch(name) {
      case 'amount': return <PaidIcon fontSize="small" />;
      case 'client': return <PersonIcon fontSize="small" />;
      case 'date':
      case 'dateTo': return <EventIcon fontSize="small" />;
      case 'phone': return <PhoneIcon fontSize="small" />;
      case 'notes': return <NotesIcon fontSize="small" />;
      case 'method': return <CreditCardIcon fontSize="small" />;
      case 'type': return <FitnessCenterIcon fontSize="small" />;
      case 'status': return <CheckCircleIcon fontSize="small" />;
      default: return null;
    }
  };

  const renderStatusChip = (status) => {
    let color = 'default';
    if (status === 'Активен') color = 'success';
    if (status === 'Просрочен') color = 'error';
    if (status === 'Ожидает') color = 'warning';

    return (
      <Chip
        label={status}
        color={color}
        size="small"
        icon={<CheckCircleIcon fontSize="small" />}
        sx={{ borderRadius: '6px', fontWeight: 500 }}
      />
    );
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
                <TableRow key={payment?.id} hover>
                  <TableCell>{payment?.date}</TableCell>
                  <TableCell>{payment?.client}</TableCell>
                  <TableCell>
                    <Box sx={{ 
                      fontWeight: 600, 
                      color: '#2e7d32',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <AttachMoney fontSize="small" sx={{ mr: 0.5 }} />
                      {payment?.amount.toLocaleString('ru-RU')} ₽
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment?.type} 
                      size="small"
                      sx={{ 
                        background: payment?.type === 'Разовая' ? '#e3f2fd' : 
                                  payment?.type === '10 тренировок' ? '#e8f5e9' : '#fff8e1',
                        color: payment?.type === 'Разовая' ? '#1565c0' : 
                               payment?.type === '10 тренировок' ? '#2e7d32' : '#ff8f00'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment?.status} 
                      size="small"
                      sx={{ 
                        background: payment?.status === 'Активен' ? '#e8f5e9' : '#ffebee',
                        color: payment?.status === 'Активен' ? '#2e7d32' : '#c62828'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpen(payment.client)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        '&:hover': {
                          backgroundColor: '#f0f7ff',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      Подробнее
                    </Button>
                    {/* <PaymentDetailsPage open={openDetils} close={setOpenDetils} client={client} /> */}

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
      <Dialog
      open={openDetils}
      fullWidth
      maxWidth="md"
      onClose={() => setOpenDetils(false)}
      TransitionComponent={Transition}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '12px',
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ 
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        py: 2,
        position: 'relative'
      }}>
        <Box display="flex" alignItems="center">
          {isMobile && (
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={() => setOpenDetils(false)}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Детали платежа
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton 
            onClick={() => setOpenDetils(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 12,
              color: theme.palette.primary.contrastText
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent dividers sx={{ background: theme.palette.grey[50] }}>
        <Paper elevation={0} sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'transparent'
        }}>
          <Box display="flex" justifyContent="flex-end" mb={3}>
            {isEditing ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ 
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: theme.shadows[2]
                  }
                }}
              >
                Сохранить изменения
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ 
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px'
                  }
                }}
              >
                Редактировать
              </Button>
            )}
          </Box>

          <Box 
            display="grid" 
            gridTemplateColumns={isMobile ? '1fr' : 'repeat(2, 1fr)'} 
            gap={3}
          >
            <Field 
              label="Сумма" 
              name="amount" 
              value={payment?.amount} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('amount')}
              suffix="₽"
            />
            <Field 
              label="Клиент" 
              name="client" 
              value={payment?.client} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('client')}
            />
            <Field 
              label="Тип платежа" 
              name="customPaymentType" 
              value={payment?.customPaymentType} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('customPaymentType')}
            />
            <Field 
              label="Дата" 
              name="date" 
              value={payment?.date} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('date')}
              type={isEditing ? 'date' : 'text'}
            />
            <Field 
              label="Дата окончания" 
              name="dateTo" 
              value={payment?.dateTo} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('dateTo')}
              type={isEditing ? 'date' : 'text'}
            />
            <Field 
              label="Метод оплаты" 
              name="method" 
              value={payment?.method} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('method')}
            />
            <Field 
              label="Примечания" 
              name="notes" 
              value={payment?.notes} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('notes')}
              multiline
              rows={3}
            />
            <Field 
              label="Телефон" 
              name="phone" 
              value={payment?.phone} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('phone')}
            />
            <Field 
              label="Статус" 
              name="status" 
              value={payment?.status} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('status')}
              customDisplay={!isEditing && renderStatusChip(payment?.status)}
            />
            <Field 
              label="Тип" 
              name="type" 
              value={payment?.type} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('type')}
            />
          </Box>
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ 
        background: theme.palette.grey[100],
        px: 3,
        py: 2
      }}>
        <Button 
          onClick={() => setOpenDetils(false)} 
          sx={{ 
            borderRadius: '8px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
    </Box>
    
  );
  
};

const Field = ({ label, name, value, editing, onChange, icon, suffix, customDisplay, ...props }) => {
  return (
    <Box sx={{
      background: 'white',
      borderRadius: '8px',
      p: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }
    }}>
      <Box display="flex" alignItems="center" mb={1}>
        {icon && (
          <Avatar sx={{ 
            width: 24, 
            height: 24, 
            mr: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}>
            {icon}
          </Avatar>
        )}
        <Typography variant="subtitle2" color="textSecondary">
          {label}
        </Typography>
      </Box>
      
      {editing ? (
        <TextField
          name={name}
          value={value || ''}
          onChange={onChange}
          fullWidth
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px'
            }
          }}
          InputProps={{
            endAdornment: suffix && (
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                {suffix}
              </Typography>
            )
          }}
          {...props}
        />
      ) : (
        customDisplay || (
          <Typography variant="body1" sx={{ 
            fontWeight: 500,
            color: value ? 'text.primary' : 'text.disabled'
          }}>
            {value || '—'} {suffix}
          </Typography>
        )
      )}
    </Box>
  );
};
export default PayPage;
