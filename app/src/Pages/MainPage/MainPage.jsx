import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Avatar, Card, CardContent, Chip, Divider,
  Button, IconButton, Modal, Menu, MenuItem, Autocomplete, TextField
} from '@mui/material';

import {
  AttachMoney as AttachMoneyIcon,
  DoneAll as DoneAllIcon,
  Receipt as ReceiptIcon,
  PeopleAlt as PeopleAltIcon,
  FitnessCenter as FitnessCenterIcon,
  EmojiEvents as EmojiEventsIcon,
  ChevronLeft, ChevronRight,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Straighten,
  MonitorWeight,
  Male,
  Female,
  Phone, Search,
  EventAvailable as EventAvailableIcon,
  AccessTime as AccessTimeIcon

} from '@mui/icons-material';
import { fetchWithRetry } from '../../utils/refreshToken';
import FitnessCenter from '@mui/icons-material/FitnessCenter';
import CardClient from '../../components/CardClient';
import { addToast } from '../../utils/addToast';

import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import WriteOffSessions from '../../components/WriteOffSessions';

const getActivityColor = (level) => {
  switch (level) {
    case 'Высокая': return 'success';
    case 'Средняя': return 'warning';
    case 'Низкая': return 'error';
    default: return 'default';
  }
};

const MainPage = ({ user }) => {
  const [workouts, setWorkouts] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completedScrollLeft, setCompletedScrollLeft] = useState(0);
  const [upcomingScrollLeft, setUpcomingScrollLeft] = useState(0);
  const [todayClients, setTodayClients] = useState([]);
  const [tomorrowClients, setTomorrowClients] = useState([]);
  const [dialogOpenAddSession, setDialogOpenAddSession] = useState(false);
  const [statistic, setStatistic] = useState({
    cashInMonth: 0,
    sessionsInMonth: 0,
    averageReceipt: 0,
    totalClients: 0,
    activeClients: 0,
    newClients: 0
  });
  const [workoutStats, setWorkoutStats] = useState({
    completed: 0,
    remaining: 0,
    total: 0,
    lastPayment: 0,
    progress: 0
  });
  const [clients, setClients] = useState();
  const [client, setClient] = useState();
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [openModalWindow, setOpenModalWindow] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchData();
    // fetchStatistics();
  }, []);

  useEffect(() => {
    if (!openModalWindow) {
      fetchEvents();
    }
  }, [openModalWindow]);

  const fetchData = async () => {
    const response = await fetchWithRetry('/clients', 'GET');
    setClients(response);
  }

  const fetchEvents = async () => {
    try {
      const data = await fetchWithRetry('/users/googleEvents', 'GET');
      if (!data.message) {
        throw new Error('Failed to fetch events');
      }
      setTodayClients(data.events.todayClients);
      setTomorrowClients(data.events.tomorrowClients);

      // Формируем данные для тренировок
      const completed = data.events.todayClients?.map(client => ({
        ...client,
        clientId: client.id,
        date: formatDate(client.start),
        workoutType: "Тренировка",
        time: formatTime(client.start),
        status: null
      }));
      setWorkouts(completed);
    } catch (error) {
      console.error('Ошибка при получении событий:', error);
    }
  };

  // const fetchStatistics = async () => {
  //   try {
  //     const stats = await fetchWithRetry('/users/statistics', 'GET');
  //     setStatistic(stats);
  //   } catch (error) {
  //     console.error('Ошибка при получении статистики:', error);
  //   }
  // };

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };



  const handleStatusChange = (workout, status) => {
    setOpenModalWindow(true);
    setClient(workout)
  };

  const handleCloseModal = () => {
    setDialogOpenAddSession(false);
  };


  const handleScroll = (direction, type) => {
    const container = document.getElementById(`${type}-workouts-container`);
    if (container) {
      const scrollAmount = 300;
      if (direction === 'left') {
        container.scrollLeft -= scrollAmount;
      } else {
        container.scrollLeft += scrollAmount;
      }
      if (type === 'completed') {
        setCompletedScrollLeft(container.scrollLeft);
      } else {
        setUpcomingScrollLeft(container.scrollLeft);
      }
    }
  };

  // Формируем upcomingWorkouts из todayClients
  const upcomingWorkouts = tomorrowClients?.map(client => ({
    clientId: client.id,
    date: formatDate(client.start),
    workoutType: "Тренировка",
    time: formatTime(client.start)
  }));


  const handleOpenCardClient = (client) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleAddSession = async () => {
    if (!selectedClient || !selectedTime) return;

    const now = new Date(); // или передаваемая дата, если есть

    // Если ты хочешь использовать сегодняшнюю дату:
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(selectedTime.getHours()).padStart(2, '0');
    const minutes = String(selectedTime.getMinutes()).padStart(2, '0');

    const combined = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);

    const isoUtcString = combined.toISOString(); // ← результат в нужном формате

    const newWorkout = {
      summary: selectedClient.name,
      start: isoUtcString,
      marked: false,
      status: true,
    };

    try {
      const response = await fetchWithRetry('/users/newSessions', 'PATCH', { newWorkout: newWorkout })
      if (!response) {
        throw new Error('Failed to fetch newSessions');
      }
      addToast('successAdd', 'success', `Успешно добвлена прошедшая тренировка ${selectedClient.name}`, 1000);
    } catch (error) {
      console.error('НЕ добавилась новая сессия почему то!');
      addToast('errorAdd', 'error', `НЕ добавилась новая сессия почему то у: ${selectedClient.name}`, 1000);
    }
    setDialogOpenAddSession(false);
    fetchEvents();
  };

  return (
    <Box sx={{ padding: '24px', maxWidth: '1500px', margin: '0 auto' }}>
      {/* Компактная статистика */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' }, gap: 2, mb: 4 }}>
        <Paper sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <AttachMoneyIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Доход</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.cashInMonth.toLocaleString()}₽</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>в этом месяце</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <DoneAllIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Тренировки</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.sessionsInMonth}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>проведено</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <ReceiptIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Средний чек</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.averageReceipt.toLocaleString()}₽</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>за тренировку</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <PeopleAltIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Клиенты</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.totalClients}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>в базе</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <FitnessCenterIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Активные</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.activeClients}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>регулярные</Typography>
          </Box>
        </Paper>

        <Paper sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)', color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <EmojiEventsIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Новые</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.newClients}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>в этом месяце</Typography>
          </Box>
        </Paper>
      </Box>

      {/* Проведенные тренировки */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FitnessCenterIcon fontSize="large" /> Проведенные тренировки
        </Typography>
        <Box sx={{ position: 'relative' }}>
          {completedScrollLeft > 0 && (
            <IconButton
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                backgroundColor: 'background.paper',
                boxShadow: 2,
                '&:hover': { backgroundColor: 'background.paper' }
              }}
              onClick={() => handleScroll('left', 'completed')}
            >
              <ChevronLeft />
            </IconButton>
          )}

          <Box
            id="completed-workouts-container"
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 3,
              py: 2,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            {workouts.map((workout) => {
              const client = todayClients.find(c => c.id === workout.clientId);
              if (!client) return null;

              return (
                <Card
                  key={`${workout.clientId}-${workout.date}`}
                  sx={{
                    minWidth: 300,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      cursor: 'pointer',
                      transform: 'translateY(-8px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => handleOpenCardClient(client)}
                >
                  <Box sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    background: client.gender === 'Male' ?
                      'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)' :
                      'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)'
                  }}>
                    <Avatar sx={{
                      width: 56,
                      height: 56,
                      mr: 2,
                      bgcolor: 'background.paper',
                      color: client.gender === 'Male' ? 'primary.dark' : 'secondary.dark',
                      fontWeight: 700,
                      fontSize: '1.5rem'
                    }}>
                      {client?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'common.white' }}>
                        {client.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'common.white', opacity: 0.9 }}>
                        {client.age} лет
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        icon={<Straighten fontSize="small" />}
                        label={`${client.height || 0} см`}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        icon={<MonitorWeight fontSize="small" />}
                        label={`${client.weight || 0} кг`}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        icon={client.gender === 'Male' ? <Male fontSize="small" /> : <Female fontSize="small" />}
                        label={client.gender === 'Male' ? 'Муж' : 'Жен'}
                        color={client.gender === 'Male' ? 'primary' : 'secondary'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 500 }}>
                        <FitnessCenter sx={{ mr: 1, fontSize: 18 }} />
                        <strong>Тренировка:</strong> {workout.workoutType}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 500 }}>
                        <EventAvailableIcon sx={{ mr: 1, fontSize: 18 }} />
                        <strong>Время:</strong> {workout.time}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', gap: '12px', mt: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(workout, 'attended');
                        }}
                        sx={{
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          textTransform: 'none'
                        }}
                      >
                        Отметить
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}

            <Card
              sx={{
                minWidth: 300,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 3,
                boxShadow: 3,
                border: '2px dashed',
                borderColor: 'divider',
                background: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                  cursor: 'pointer',
                  transform: 'translateY(-8px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                  backgroundColor: 'action.hover'
                }
              }}
              onClick={() => setDialogOpenAddSession(true)}
            >
              <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <AddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  Добавить тренировку
                </Typography>
              </Box>
            </Card>
          </Box>

          <IconButton
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'background.paper',
              boxShadow: 2,
              '&:hover': { backgroundColor: 'background.paper' }
            }}
            onClick={() => handleScroll('right', 'completed')}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Предстоящие тренировки */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <EventAvailableIcon fontSize="large" /> Предстоящие тренировки
        </Typography>
        <Box sx={{ position: 'relative' }}>
          {upcomingScrollLeft > 0 && (
            <IconButton
              sx={{
                position: 'absolute',
                left: -20,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
                backgroundColor: 'background.paper',
                boxShadow: 2,
                '&:hover': { backgroundColor: 'background.paper' }
              }}
              onClick={() => handleScroll('left', 'upcoming')}
            >
              <ChevronLeft />
            </IconButton>
          )}

          <Box
            id="upcoming-workouts-container"
            sx={{
              display: 'flex',
              overflowX: 'auto',
              gap: 3,
              py: 2,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            {upcomingWorkouts.map(workout => {
              const client = tomorrowClients.find(c => c.id === workout.clientId);
              if (!client) return null;

              return (
                <Card
                  key={`${workout.clientId}-${workout.date}`}
                  sx={{
                    minWidth: 300,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      cursor: 'pointer',
                      transform: 'translateY(-8px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
                    }
                  }}
                  onClick={() => {
                    setSelectedClient(client);
                    setIsDialogOpen(true);
                  }}
                >
                  <Box sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    background: client.gender === 'Male' ?
                      'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)' :
                      'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)'
                  }}>
                    <Avatar sx={{
                      width: 56,
                      height: 56,
                      mr: 2,
                      bgcolor: 'background.paper',
                      color: client.gender === 'Male' ? 'primary.dark' : 'secondary.dark',
                      fontWeight: 700,
                      fontSize: '1.5rem'
                    }}>
                      {client.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'common.white' }}>
                        {client.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'common.white', opacity: 0.9 }}>
                        {client.age} лет
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        icon={<Straighten fontSize="small" />}
                        label={`${client.height || 0} см`}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        icon={<MonitorWeight fontSize="small" />}
                        label={`${client.weight || 0} кг`}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip
                        icon={client.gender === 'Male' ? <Male fontSize="small" /> : <Female fontSize="small" />}
                        label={client.gender === 'Male' ? 'Муж' : 'Жен'}
                        color={client.gender === 'Male' ? 'primary' : 'secondary'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 500 }}>
                        <FitnessCenter sx={{ mr: 1, fontSize: 18 }} />
                        <strong>Тренировка:</strong> {workout.workoutType}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 500 }}>
                        <EventAvailableIcon sx={{ mr: 1, fontSize: 18 }} />
                        <strong>Дата:</strong> {workout.date} в {workout.time}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1, fontWeight: 500 }}>
                      <Phone sx={{ mr: 1, fontSize: 18 }} />
                      {client.phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1($2)$3-$4')}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          <IconButton
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
              backgroundColor: 'background.paper',
              boxShadow: 2,
              '&:hover': { backgroundColor: 'background.paper' }
            }}
            onClick={() => handleScroll('right', 'upcoming')}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {isDialogOpen && selectedClient && (
        <CardClient
          client={selectedClient}
          setSelectedClient={setSelectedClient}
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          fetchWithRetry={fetchWithRetry}
          addToast={addToast}
          fetchData={fetchEvents}
        />
      )}

      {/* Диалог списания тренировки */}

      {/* Окно для заполнения статистики о списании тренировки с клиента */}
      {openModalWindow && (
        <WriteOffSessions
          open={openModalWindow}
          onClose={setOpenModalWindow}
          client={client}
          fetchDataQuantity={fetchDataQuantity}
        />
      )}

      {/* Добавиление новой тренировки пропущенной из GoogleCalendarя */}
      <Modal
        open={dialogOpenAddSession}
        onClose={handleCloseModal}
        aria-labelledby="modal-add-session"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: '16px',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography variant="h6" component="h2" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
            Добавить тренировку
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Клиент *
            </Typography>
            <Autocomplete
              options={clients}
              getOptionLabel={(option) => option?.name || ''}
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
              value={selectedClient}
              onChange={(event, newValue) => {
                setSelectedClient(newValue);
              }}
              fullWidth
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Время тренировки *
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
              <TimePicker
                value={selectedTime}
                onChange={(newTime) => setSelectedTime(newTime)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'action.active' }} />
                    }}
                  />
                )}
                ampm={false}
                minutesStep={5}
              />
            </LocalizationProvider>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                borderRadius: '12px',
                fontWeight: 'bold',
                textTransform: 'none',
                px: 3
              }}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={handleAddSession}
              disabled={!selectedClient}
              sx={{
                borderRadius: '12px',
                fontWeight: 'bold',
                textTransform: 'none',
                px: 3,
                backgroundColor: '#6a1b9a',
                '&:hover': { backgroundColor: '#4a148c' }
              }}
            >
              Добавить
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MainPage;