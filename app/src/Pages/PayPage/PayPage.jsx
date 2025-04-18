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
import PaymentsTable from '../../components/PaymentsTable';
import AddPaymentDialog from '../../components/AddPaymentDialog';



const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PayPage = () => {
  // Состояние для диалога добавления оплаты
  const [openDialog, setOpenDialog] = useState(false);
  const [client, setClient] = useState(null);
  const [clients, setClients] = useState();
  const [openDetils, setOpenDetils] = useState(false);
  const [filteredPayments, setFilteredPayments] = useState();

  // История платежей
  const [payment, setPayment] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [payments, setPayments] = useState([]);
  const [openFilter, setOpenFilter] = useState(false);

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

  useEffect(() => {
    setFilteredPayments(payments);
  }, [payments]);

  const fetchDataPayList = async () => {
    try {
      const response = await fetchWithRetry('/payment_history', 'GET');
      setPayments(response)
    } catch (error) {
      addToast('error', 'error', 'Ошибка добычи данных с сервера!', 1000);
    }
  };

  const handleOpen = (client) => {
    console.log(client);
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

  // Пример использования:
  // В вашем основном компоненте:

  const handleApplyFilters = (filters) => {
    let result = [...payments];
    
    // Фильтрация по дате
    if (filters.dateFrom) {
      result = result.filter(p => new Date(p.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      result = result.filter(p => new Date(p.date) <= new Date(filters.dateTo));
    }
    
    // Фильтрация по имени
    if (filters.clientName) {
      result = result.filter(p => 
        p.client.toLowerCase().includes(filters.clientName.toLowerCase())
      );
    }
    
    // Фильтрация по сумме
    if (filters.amountType && filters.amountType !== 'custom') {
      const [min, max] = filters.amountType.split('-').map(Number);
      result = result.filter(p => p.amount >= min && p.amount <= max);
    } else if (filters.customAmount) {
      const amount = Number(filters.customAmount);
      result = result.filter(p => p.amount >= amount);
    }
    
    // Фильтрация по статусу
    if (filters.statuses?.length > 0) {
      result = result.filter(p => filters.statuses.includes(p.status));
    }
    
    // Фильтрация по типу
    if (filters.types?.length > 0) {
      result = result.filter(p => filters.types.includes(p.type));
    }
    
    setFilteredPayments(result);
  };

// В рендере:

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
          <FilterModal
            open={openFilter}
            onClose={() => setOpenFilter(false)}
            payments={payments}
            clients={clients}
            onApplyFilters={(filters) => {
              handleApplyFilters(filters);
              setOpenFilter(false);
            }}
          />
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

      <PaymentsTable 
        payments={payments}
        filteredPayments={filteredPayments}
        handleOpen={handleOpen}
      />

      {/* Диалог добавления оплаты */}
      <AddPaymentDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        clients={clients}
        fetchDataPayList={() => fetchDataPayList()}
        setClient={setClient}
        client={client}
      />

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


const FilterModal = ({ clients, payments, onApplyFilters }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    clientName: '',
    amountType: '',
    customAmount: '',
    statuses: [],
    types: []
  });

  // Уникальные значения для фильтров
  const allStatuses = [...new Set(payments.map(p => p.status))];
  const allTypes = [...new Set(payments.map(p => p.type))];
  const amountOptions = [
    { label: "До 1 000 ₽", value: "0-1000" },
    { label: "1 000 - 3 000 ₽", value: "1000-3000" },
    { label: "3 000 - 5 000 ₽", value: "3000-5000" },
    { label: "Более 5 000 ₽", value: "5000-100000" }
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name) => (event) => {
    const value = event.target.value;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name) => (event) => {
    const value = event.target.value;
    setFilters(prev => ({ ...prev, [name]: typeof value === 'string' ? value.split(',') : value }));
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    handleClose();
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      clientName: '',
      amountType: '',
      customAmount: '',
      statuses: [],
      types: []
    });
    onApplyFilters({});
  };

  return (
    <>
      <Button 
        variant="contained" 
        startIcon={<FilterList />}
        sx={{ mr: 2 }}
        onClick={handleClick}
      >
        Фильтры
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: 400,
            maxWidth: '100%',
            p: 2,
            borderRadius: 2,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Фильтры</Typography>
          <Close onClick={handleClose} sx={{ cursor: 'pointer', color: 'text.secondary' }} />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Период */}
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: 500 }}>Период</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            type="date"
            label="От"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            type="date"
            label="До"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>

        {/* Имя клиента */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Клиент
          </Typography>
          <Autocomplete
            options={clients || []}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Начните вводить имя"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <Search sx={{ mr: 1, color: 'action.active' }} />
                      {params.InputProps.startAdornment}
                    </>
                  )
                }}
              />
            )}
            value={filters.client || null}
            onChange={(event, newValue) =>
              setFilters((prev) => ({
                ...prev,
                clientName: newValue?.name || '',
                client: newValue || null,
              }))
            }
            fullWidth
          />
        </Box>

        {/* Сумма */}
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: 500 }}>Сумма оплаты</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Диапазон суммы</InputLabel>
          <Select
            label="Диапазон суммы"
            value={filters.amountType}
            onChange={handleSelectChange('amountType')}
          >
            {amountOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
            <MenuItem value="custom">Своя сумма</MenuItem>
          </Select>
        </FormControl>

        {filters.amountType === 'custom' && (
          <TextField
            fullWidth
            label="Введите сумму"
            name="customAmount"
            type="number"
            value={filters.customAmount}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <AttachMoney fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        )}

        {/* Статус */}
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: 500 }}>Статус</Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Выберите статусы</InputLabel>
          <Select
            multiple
            label="Выберите статусы"
            value={filters.statuses}
            onChange={handleMultiSelectChange('statuses')}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {allStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                <Checkbox checked={filters.statuses.indexOf(status) > -1} />
                <ListItemText primary={status} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Тип тренировки */}
        <Typography variant="subtitle2" sx={{ mt: 1, mb: 1, fontWeight: 500 }}>Тип тренировки</Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Выберите типы</InputLabel>
          <Select
            multiple
            label="Выберите типы"
            value={filters.types}
            onChange={handleMultiSelectChange('types')}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {allTypes.map((type) => (
              <MenuItem key={type} value={type}>
                <Checkbox checked={filters.types.indexOf(type) > -1} />
                <ListItemText primary={type} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={resetFilters}
            sx={{ borderRadius: 2 }}
          >
            Сбросить
          </Button>
          <Button 
            variant="contained" 
            onClick={applyFilters}
            sx={{ borderRadius: 2 }}
          >
            Применить
          </Button>
        </Box>
      </Menu>
    </>
  );
};

