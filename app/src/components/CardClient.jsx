import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Avatar, Box, Tabs, Tab,
  Divider, Chip, LinearProgress, Paper, IconButton,
  TextField, Grid, Menu, MenuItem, ListItemIcon,
  Badge, Tooltip, useTheme, Alert, Snackbar
} from '@mui/material';
import {
  Add, Person, FitnessCenter, Timeline, Assignment,
  Phone, Cake, Straighten, MonitorWeight, Male, Female,
  AccessTime, Close, Edit, Save, Delete, Payment,
  MoreVert, CheckCircle, AttachMoney, Height, Scale,
  Receipt, Warning, History
} from '@mui/icons-material';
import { useState, useRef, useEffect } from 'react';
import PaymentsTable from './PaymentsTable';
import AddPaymentDialog from './AddPaymentDialog';
import PaymentDetailsDialog from './DialogOpenDetails'
import WriteOffSessions from './WriteOffSessions';
import PaidIcon from '@mui/icons-material/Paid';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import PhoneIcon from '@mui/icons-material/Phone';
import NotesIcon from '@mui/icons-material/Notes';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WriteOffTable from '../components/WriteOffTableT';
import TableParamWoman from '../components/TableParams/TableParamWomen.jsx';
import ClientFoto from '../components/ClientFoto/ClientFoto.jsx'
import TableOfVisit from '../components/TableOfVisit/TableOfVisit.jsx'

const CardClient = ({ setAction, action, open, onClose, client, onPayment, fetchWithRetry, addSnackBar, fetchData, addToast, setSelectedClient }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(client);
  const [contextMenu, setContextMenu] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [writeOffDialog, setWriteOffDialog] = useState(false);
  const dialogRef = useRef(null);
  const [openDetils, setOpenDetils] = useState(false);
  const [payment, setPayment] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [clients, setClient] = useState(null);
  const [workoutStats, setWorkoutStats] = useState({
    completed: 0,
    remaining: 0,
    total: 0,
    lastPayment: 0,
    progress: 0
  });
  const [payments, setPayments] = useState([]);
  const [showPayments, setShowPayments] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  
  useEffect(() => {
    setEditedClient(client);
    setIsEditing(false);
  }, [open]);

  useEffect(() => {
    if (editedClient?.name) {
      fetchDataPayList();
      fetchDataQuantity();
    }
  }, [editedClient?.name, openDialog, writeOffDialog]);

  useEffect(() => {
    if (action === 'delete') {
      setConfirmDelete(true);
      setAction('');
      handleCloseContextMenu();
    } else if (action === 'writeOff') {
      setWriteOffDialog(true);
      setAction('');
      handleCloseContextMenu();
    } else if (action === 'payAdd') {
      setOpenDialog(true);
      setAction('');
      handleCloseContextMenu();
    }
  }, [action]);

  const fetchDataQuantity = async () => {
    try {
      const response = await fetchWithRetry('/payment_history/quantity', 'Patch', client);
      if (response) {
        const completed = response[0].quantity - response[0].quantityLeft || 0;
        const remaining = response[0].quantity || 0;

        const total = remaining;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

        setWorkoutStats({
          completed,
          remaining,
          total,
          lastPayment: response[0].dateTo,
          progress
        });
        console.log(workoutStats);
      }
    } catch (error) {
      const completed = 0;
      const remaining = 0;

      const total = remaining;
      const progress = 0;

      setWorkoutStats({
        completed,
        remaining,
        total,
        progress
      });
      // addToast('errorResponseQuantity', 'error', 'НЕполучилось загрузить количество по пакету', 1000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
  };

  const getFieldIcon = (name) => {
    switch (name) {
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

  // Цвета в зависимости от пола
  const genderColors = {
    Male: {
      primary: theme.palette.primary.main,
      dark: theme.palette.primary.dark,
      light: theme.palette.primary.light,
      gradient: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
    },
    Female: {
      primary: theme.palette.secondary.main,
      dark: theme.palette.secondary.dark,
      light: theme.palette.secondary.light,
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`
    }
  };

  const currentColors = genderColors[client.gender] || genderColors.Male;

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

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
  };

  const handleCloseContextMenu = () => setContextMenu(null);

  const handleFieldChange = (field, value) => {
    setEditedClient(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetchWithRetry('/clients', 'PATCH', { phoneNumber: client.phone, form: editedClient });
      if (response.message === 'Данные пользователя обновлены!') {
        fetchData()
        setIsEditing(false);
        setSelectedClient(response.data[0]);
        addSnackBar('DeleteClient1', 'success', 'Изменения сохранены успешно!');
      } else {
        addSnackBar('DeleteClient55', 'error', 'Произошла ошибка при изменении клиента');
      }
    } catch (error) {
      addSnackBar('DeleteClient', 'error', 'Ошибка в получении данных клиентов с сервера');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetchWithRetry('/clients', 'DELETE', { phoneNumber: client.phone });
      if (response.message === 'Клиент удален!') {
        fetchData()
        setConfirmDelete(false);
        addSnackBar('DeleteClient', 'success', 'Клиент успешно удален!');
        onClose();
      } else {
        addSnackBar('DeleteClient3', 'error', 'Произошла ошибка при удалении клиента');
      }
    } catch (error) {
      addSnackBar('DeleteClient4', 'error', 'Ошибка в получении данных клиентов с сервера');
    }

  };

  const fetchDataPayList = async () => {
    try {
      const response = await fetchWithRetry('/payment_history', 'GET');
      const filtered = response.filter(payment => payment.client === editedClient.name);
      setPayments(filtered);

    } catch (error) {
      addToast('error', 'error', 'Ошибка добычи данных с сервера!', 1000);
    }
  };

  // Данные для демонстрации
  const bodyStats = [
    { label: 'Грудь', value: client.chest, unit: 'см', icon: <Straighten /> },
    { label: 'Талия', value: client.waist, unit: 'см', icon: <Straighten /> },
    { label: 'Бедра', value: client.hips, unit: 'см', icon: <Straighten /> },
    { label: '% жира', value: client.bodyFat, unit: '%', icon: <MonitorWeight /> }
  ];

  const paymentHistory = [
    { date: '2023-06-20', amount: '5000', type: 'Абонемент' },
    { date: '2023-05-15', amount: '5000', type: 'Абонемент' },
    { date: '2023-04-10', amount: '3000', type: 'Разовое' }
  ];

  const handleOpen = (client) => {
    console.log(client);
    setPayment(client);
    setOpenDetils(true);
  };

  const toggleHistory = () => {
    setShowPayments((prev) => !prev);
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        maxWidth="xl"
        PaperProps={{
          sx: {
            background: theme.palette.background.default,
            borderRadius: 0,
            overflow: 'hidden'
          },
          ref: dialogRef,
          onContextMenu: handleContextMenu
        }}
      >
        {/* Контекстное меню */}
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={() => { setConfirmDelete(true); handleCloseContextMenu(); }}>
            <ListItemIcon><Delete color="error" fontSize="small" /></ListItemIcon>
            <Typography variant="body2">Удалить клиента</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setOpenDialog(true); handleCloseContextMenu(); }}>
            <ListItemIcon><AttachMoney color="success" fontSize="small" /></ListItemIcon>
            <Typography variant="body2">Зарегистрировать оплату</Typography>
          </MenuItem>
          <MenuItem onClick={() => { setWriteOffDialog(true); handleCloseContextMenu(); }}>
            <Typography variant="body2">Списать тренировку!</Typography>
          </MenuItem>
        </Menu>

        {/* Шапка профиля */}
        <Box sx={{
          background: currentColors.gradient,
          color: 'white',
          p: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%'
          }
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" alignItems="center" gap={3}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    borderRadius: '50%',
                    p: 0.5,
                    display: 'flex'
                  }}>
                    <CheckCircle fontSize="small" />
                  </Box>
                }
              >
                <Avatar sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'background.paper',
                  color: currentColors.dark,
                  fontSize: '2rem',
                  border: '3px solid white'
                }}>
                  {client.name.charAt(0)}
                </Avatar>
              </Badge>

              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  {isEditing ? (
                    <TextField
                      value={editedClient.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      variant="standard"
                      sx={{
                        input: {
                          color: 'white',
                          fontSize: '2rem',
                          fontWeight: 700
                        }
                      }}
                    />
                  ) : client.name}
                </Typography>
                <Box display="flex" gap={1.5} flexWrap="wrap" sx={{ mt: 1.5 }}>
                  {isEditing ? (
                    <>
                      <TextField
                        label="Дата рождения"
                        type="date"
                        value={editedClient.dateOfBirth}
                        onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiInputBase-root': { bgcolor: 'rgba(255,255,255,0.2)', color: 'white' },
                          input: { color: 'white' }
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Chip
                        label={`${client.age} лет`}
                        size="small"
                        icon={<Cake sx={{ color: 'inherit !important' }} />}
                        sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
                      />
                      <Chip
                        label={client.gender === 'Male' ? 'Мужской' : 'Женский'}
                        size="small"
                        icon={client.gender === 'Male' ?
                          <Male sx={{ color: 'inherit !important' }} /> :
                          <Female sx={{ color: 'inherit !important' }} />}
                        sx={{
                          color: 'white',
                          bgcolor: 'rgba(255,255,255,0.2)'
                        }}
                      />
                    </>
                  )}

                  <Chip
                    label={
                      isEditing ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box fontSize="0.9rem">Рост:</Box>
                          <TextField
                            value={editedClient.height}
                            onChange={(e) => handleFieldChange('height', e.target.value)}
                            size="small"
                            type="number"
                            variant="outlined"
                            sx={{ width: 70, backgroundColor: 'white', borderRadius: 1 }}
                            inputProps={{ style: { padding: '4px 8px' } }}
                          />
                          <Box fontSize="0.9rem">см</Box>
                        </Box>
                      ) : (
                        `Рост: ${client.height} см`
                      )
                    }
                    size="small"
                    icon={<Height sx={{ color: 'inherit !important' }} />}
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', height: 32 }}
                  />

                  <Chip
                    label={
                      isEditing ? (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box fontSize="0.9rem">Вес:</Box>
                          <TextField
                            value={editedClient.weight}
                            onChange={(e) => handleFieldChange('weight', e.target.value)}
                            size="small"
                            type="number"
                            variant="outlined"
                            sx={{ width: 70, backgroundColor: 'white', borderRadius: 1 }}
                            inputProps={{ style: { padding: '4px 8px' } }}
                          />
                          <Box fontSize="0.9rem">кг</Box>
                        </Box>
                      ) : (
                        `Вес: ${client.weight} кг`
                      )
                    }
                    size="small"
                    icon={<Scale sx={{ color: 'inherit !important' }} />}
                    sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)', height: 32 }}
                  />
                </Box>
              </Box>
            </Box>

            <Box display="flex" gap={1}>
              {isEditing ? (
                <>
                  <Tooltip title="Сохранить">
                    <IconButton
                      onClick={handleSave}
                      color="inherit"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                    >
                      <Save />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Отменить">
                    <IconButton
                      onClick={() => setIsEditing(false)}
                      color="inherit"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                    >
                      <Close />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Действия">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setContextMenu({ mouseX: e.clientX, mouseY: e.clientY });
                      }}
                      color="inherit"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Редактировать">
                    <IconButton
                      onClick={() => setIsEditing(true)}
                      color="inherit"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    onClick={onClose}
                    color="inherit"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    <Close />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>

          {/* Статус бар */}
          {workoutStats.completed === 0 && workoutStats.total === 0 && workoutStats.progress === 0 ? (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 3,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 2,
              p: 3,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Typography variant="body1" fontWeight={600}>
                Пакет не куплен! Купите пакет тренировок
              </Typography>
            </Box>
          ) : (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 3,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 2,
              p: 1.5,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box flexGrow={1} zIndex={1}>
                <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                  Программа тренировок
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <LinearProgress
                    variant="determinate"
                    value={workoutStats.progress}
                    sx={{
                      height: 8,
                      flexGrow: 1,
                      borderRadius: 4,
                      bgcolor: 'rgba(133, 74, 74, 0.3)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'rgb(0, 255, 242)',
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {workoutStats.completed}/{workoutStats.total} ({workoutStats.progress}%)
                  </Typography>
                </Box>
              </Box>
              <Box zIndex={1} sx={{ ml: 2 }}>
                <Chip
                  label={`Оплата до ${new Date(workoutStats.lastPayment).toLocaleDateString()}`}
                  size="small"
                  icon={<AttachMoney sx={{ color: 'inherit !important' }} />}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.3)',
                    fontWeight: 500
                  }}
                />
              </Box>
              <Box sx={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '40%',
                background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 100%)',
                zIndex: 0
              }} />
            </Box>
          )}
        </Box>
        {/* Основное содержимое */}
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            {/* Табы */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 3,
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: 3,
                  backgroundColor: currentColors.primary
                }
              }}
            >
              <Tab label="Обзор" icon={<Person fontSize="small" />} iconPosition="start" />
              <Tab label="Прогресс" icon={<Timeline fontSize="small" />} iconPosition="start" />
              <Tab label="Тренировки" icon={<FitnessCenter fontSize="small" />} iconPosition="start" />
              <Tab label="Оплаты" icon={<Receipt fontSize="small" />} iconPosition="start" />
              <Tab label="Аналитика" icon={<Assignment fontSize="small" />} iconPosition="start" />
            </Tabs>

            {/* Содержимое табов */}
            <Box>
              {activeTab === 0 && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{
                      p: 3,
                      borderRadius: 3,
                      height: '100%',
                      background: theme.palette.background.paper
                    }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Основная информация
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ '& > div': { mb: 2 } }}>
                        <Box display="flex" alignItems="center">
                          <FitnessCenter sx={{ mr: 1.5, color: 'text.secondary' }} />
                          <Typography>
                            <strong>Цель:</strong> {isEditing ? (
                              <TextField
                                value={editedClient.goal}
                                onChange={(e) => handleFieldChange('goal', e.target.value)}
                                variant="standard"
                                fullWidth
                              />
                            ) : client.goal}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Box width={120} mr={1.5} display="flex" alignItems="center">
                            <LinearProgress
                              variant="determinate"
                              value={client.activityLevel === 'Низкий' ? 30 : client.activityLevel === 'Средний' ? 60 : 90}
                              color={getActivityColor(client.activityLevel)}
                              sx={{
                                height: 6,
                                flexGrow: 1,
                                borderRadius: 3
                              }}
                            />
                          </Box>
                          <Typography>
                            <strong>Активность:</strong> {isEditing ? (
                              <TextField
                                select
                                value={editedClient.activityLevel}
                                onChange={(e) => handleFieldChange('activityLevel', e.target.value)}
                                variant="standard"
                                sx={{ width: 120 }}
                              >
                                <MenuItem value="Низкий">Низкий</MenuItem>
                                <MenuItem value="Средний">Средний</MenuItem>
                                <MenuItem value="Высокий">Высокий</MenuItem>
                              </TextField>
                            ) : client.activityLevel}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Phone sx={{ mr: 1.5, color: 'text.secondary' }} />
                          <Typography>
                            <strong>Телефон:</strong> {isEditing ? (
                              <TextField
                                value={editedClient.phone}
                                onChange={(e) => handleFieldChange('phone', e.target.value)}
                                variant="standard"
                                fullWidth
                              />
                            ) : client.phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <AccessTime sx={{ mr: 1.5, color: 'text.secondary' }} />
                          <Typography>
                            <strong>Дата регистрации:</strong> {new Date(client.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{
                      p: 3,
                      borderRadius: 3,
                      height: '100%',
                      background: theme.palette.background.paper
                    }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Физические параметры
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Grid container spacing={2}>
                        {bodyStats.map((stat, index) => (
                          <Grid item xs={6} sm={3} key={index}>
                            <Paper sx={{
                              p: 2,
                              textAlign: 'center',
                              background: theme.palette.background.default,
                              height: '100%'
                            }}>
                              <Box sx={{
                                width: 40,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: theme.palette.action.selected,
                                borderRadius: '50%',
                                margin: '0 auto 8px'
                              }}>
                                {stat.icon}
                              </Box>
                              <Typography variant="h5" fontWeight={500}>
                                {isEditing ? (
                                  <TextField
                                    value={editedClient[stat.label === 'Грудь' ? 'chest' :
                                      stat.label === 'Талия' ? 'waist' :
                                        stat.label === 'Бедра' ? 'hips' : 'bodyFat']}
                                    onChange={(e) => handleFieldChange(
                                      stat.label === 'Грудь' ? 'chest' :
                                        stat.label === 'Талия' ? 'waist' :
                                          stat.label === 'Бедра' ? 'hips' : 'bodyFat',
                                      e.target.value
                                    )}
                                    size="small"
                                    type="number"
                                    sx={{ width: 80 }}
                                  />
                                ) : stat.value} {stat.unit}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {stat.label}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{
                      p: 3,
                      borderRadius: 3,
                      background: theme.palette.background.paper
                    }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Дополнительная информация
                      </Typography>
                      <Divider sx={{ mb: 2 }} />

                      <Typography paragraph sx={{ mb: 2 }}>
                        <strong>Травмы/ограничения:</strong> {isEditing ? (
                          <TextField
                            value={editedClient.injuries}
                            onChange={(e) => handleFieldChange('injuries', e.target.value)}
                            fullWidth
                            multiline
                            variant="standard"
                          />
                        ) : client.injuries || 'Не указаны'}
                      </Typography>
                      {/* <Typography>
                          <strong>История тренировок:</strong> {isEditing ? (
                            <TextField
                              value={Array.isArray(editedClient.trainingHistory) 
                                ? editedClient.trainingHistory.join(', ') 
                                : editedClient.trainingHistory}
                              onChange={(e) => handleFieldChange('trainingHistory', e.target.value)}
                              fullWidth
                              variant="standard"
                            />
                          ) : client.trainingHistory ? JSON.parse(client.trainingHistory).join(', ') : 'Нет данных'}
                        </Typography> */}
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {activeTab === 1 && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ mr: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <ClientFoto clientId={client.id} />
                    </Typography>
                  </Box>
                  <Box>
                    <TableParamWoman clientId={client.id} />
                  </Box>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Программа тренировок
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: 3,
                        background: theme.palette.background.paper
                      }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                          <Typography variant="subtitle1" color="text.secondary">
                            Текущий прогресс
                          </Typography>
                          <Chip
                            label={`${workoutStats.completed}/${workoutStats.total} тренировок`}
                            size="small"
                            color="primary"
                          />
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={workoutStats.progress}
                          sx={{
                            height: 10,
                            mb: 3,
                            borderRadius: 5,
                            bgcolor: theme.palette.action.selected,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5
                            }
                          }}
                        />

                        <Grid container spacing={2}>
                          {[
                            { value: workoutStats.completed, label: 'Пройдено', color: 'primary' },
                            { value: workoutStats.remaining, label: 'Осталось', color: 'secondary' },
                            { value: `${workoutStats.progress}%`, label: 'Прогресс', color: 'success' }
                          ].map((item, index) => (
                            <Grid item xs={4} key={index}>
                              <Paper sx={{
                                p: 2,
                                textAlign: 'center',
                                background: theme.palette.background.default
                              }}>
                                <Typography variant="h4" color={`${item.color}.main`} fontWeight={600}>
                                  {item.value}
                                </Typography>
                                <Typography variant="body2">
                                  {item.label}
                                </Typography>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: 3,
                        background: theme.palette.background.paper
                      }}>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          Последние тренировки
                        </Typography>

                        <Box sx={{ '& > div': { mb: 1.5 } }}>
                          {[
                            { date: 'Сегодня', type: 'Силовая', duration: '60 мин' },
                            { date: 'Вчера', type: 'Кардио', duration: '45 мин' },
                            { date: '18.06.2023', type: 'Функциональная', duration: '55 мин' }
                          ].map((item, index) => (
                            <Paper key={index} sx={{
                              p: 1.5,
                              background: theme.palette.background.default
                            }}>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" fontWeight={500}>
                                  {item.type}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {item.date}
                                </Typography>
                              </Box>
                              <Typography variant="body2">
                                Длительность: {item.duration}
                              </Typography>
                            </Paper>
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    {/* Левая часть — заголовок */}
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600}>
                        История оплат
                      </Typography>
                    </Box>

                    {/* Центральная часть — переключатель */}
                    <Box flex={1} display="flex" justifyContent="center">
                      <Button
                        variant="outlined"
                        onClick={toggleHistory}
                        startIcon={<History />}
                        sx={{
                          color: '#6a11cb',
                          borderColor: '#6a11cb',
                          borderRadius: 3,
                          px: 4,
                          py: 1.2,
                          fontWeight: 600,
                          textTransform: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                            color: '#fff',
                            borderColor: 'transparent',
                            boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
                          },
                        }}
                      >
                        {showPayments ? 'История списаний' : 'История оплат'}
                      </Button>
                    </Box>

                    {/* Правая часть — кнопка добавления */}
                    <Box flex={1} display="flex" justifyContent="flex-end">
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
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(106, 17, 203, 0.4)',
                            background: 'linear-gradient(135deg, #5e0ec0 0%, #1e63e9 100%)',
                          },
                        }}
                      >
                        Добавить оплату
                      </Button>
                    </Box>
                  </Box>


                  {!showPayments ? (
                    <PaymentsTable
                      payments={payments}
                      handleOpen={handleOpen}
                    />
                  ) : (
                    <WriteOffTable
                      filters={editedClient}
                    />
                  )}
                </Box>
              )}

              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Аналитика и эффективность
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: 3,
                        height: 400,
                        background: theme.palette.background.paper
                      }}>
                        <Box height={300} display="flex" alignItems="center" justifyContent="center">
                          <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary" mt={1}>
                              <TableOfVisit client={client} addToast={addToast} setSelectedClient={setSelectedClient} />
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper elevation={0} sx={{
                        p: 3,
                        borderRadius: 3,
                        height: 400,
                        background: theme.palette.background.paper
                      }}>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          Эффективность тренировок
                        </Typography>

                        <Box sx={{ '& > div': { mb: 2 } }}>
                          {[
                            { label: 'Средняя посещаемость', value: '78%', progress: 78 },
                            { label: 'Прогресс веса', value: '-8 кг', progress: 65 },
                            { label: 'Изменение % жира', value: '-3.5%', progress: 70 }
                          ].map((item, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="body2">{item.label}</Typography>
                                <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={item.progress}
                                sx={{
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: theme.palette.action.selected
                                }}
                              />
                            </Box>
                          ))}
                        </Box>

                        <Box mt={4}>
                          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Рекомендации
                          </Typography>
                          <Paper sx={{
                            p: 2,
                            background: theme.palette.background.default
                          }}>
                            <Typography variant="body2">
                              {client.gender === 'Male' ?
                                "Рекомендуем увеличить количество силовых тренировок для достижения цели." :
                                "Рекомендуем добавить кардио-сессии для лучшего результата."}
                            </Typography>
                          </Paper>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>


      </Dialog>

      {/* Диалог с оплатой */}
      <AddPaymentDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fetchDataPayList={() => fetchDataPayList()}
        client={client}
        clients={client}
        setClient={setClient}
      />

      {/* Диалог с информацией о транзакции */}
      <PaymentDetailsDialog
        open={openDetils}
        onClose={() => setOpenDetils(false)}
        payment={payment}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        handleChange={handleChange}
        handleSave={handleSave}
        getFieldIcon={getFieldIcon}
        renderStatusChip={renderStatusChip}
      />

      {/* Диалог списания тренировки */}
      <WriteOffSessions
        open={writeOffDialog}
        onClose={() => setWriteOffDialog()}
        client={client}
        fetchDataQuantity={fetchDataQuantity}
      />

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning color="error" />
            Подтвердите удаление
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Вы действительно хотите удалить клиента {client.name}? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Отмена</Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<Delete />}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </>

  );
};

function getActivityColor(activity) {
  switch (activity) {
    case 'Низкий': return 'error';
    case 'Средний': return 'warning';
    case 'Высокий': return 'success';
    default: return 'info';
  }
}

export default CardClient;