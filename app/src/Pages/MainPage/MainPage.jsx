import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Paper, Button, Modal, Avatar, 
  Card, CardContent, Chip, Divider, IconButton, Menu, 
  MenuItem, Container, Badge
} from '@mui/material';
import { 
  FitnessCenter, Phone, AccessTime, Straighten, 
  MonitorWeight, Male, Female, MoreVert as MoreVertIcon,
  FitnessCenter as FitnessCenterIcon, 
  EventAvailable as EventAvailableIcon,
  PeopleAlt as PeopleAltIcon,
  EmojiEvents as EmojiEventsIcon,
  AttachMoney as AttachMoneyIcon,
  DoneAll as DoneAllIcon,
  Receipt as ReceiptIcon,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { styled } from '@mui/system';

// Стилизованные компоненты
const StatCard = styled(Paper)(({ theme }) => ({
  padding: '20px',
  borderRadius: '16px',
  color: 'white',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  height: '100%'
}));

// Примерные данные о клиентах
const clients = [
  {
    id: 1,
    name: "Иван Иванов",
    gender: "Male",
    age: 28,
    height: 180,
    weight: 85,
    goal: "Похудение",
    activityLevel: "Высокая",
    phone: "79123456789",
    createdAt: "2025-01-15",
    progress: { weight: -5, volume: { chest: -3, waist: -4 }, fatPercentage: -2 }
  },
  {
    id: 2,
    name: "Анна Смирнова",
    gender: "Female",
    age: 25,
    height: 165,
    weight: 58,
    goal: "Набор массы",
    activityLevel: "Средняя",
    phone: "79234567890",
    createdAt: "2025-02-20",
    progress: { weight: 2, volume: { chest: 3, waist: 1 }, fatPercentage: 1 }
  },
  {
    id: 3,
    name: "Мария Сидорова",
    gender: "Female",
    age: 30,
    height: 170,
    weight: 60,
    goal: "Поддержание формы",
    activityLevel: "Высокая",
    phone: "79345678901",
    createdAt: "2025-03-10",
    progress: { weight: 0, volume: { chest: 0, waist: 0 }, fatPercentage: -1 }
  },
  {
    id: 4,
    name: "Алексей Козлов",
    gender: "Male",
    age: 35,
    height: 182,
    weight: 80,
    goal: "Набор мышечной массы",
    activityLevel: "Средняя",
    phone: "79456789012",
    createdAt: "2025-04-05",
    progress: { weight: 3, volume: { chest: 5, waist: -2 }, fatPercentage: -1 }
  }
];

// Пример данных о проведенных тренировках
const completedWorkouts = [
  {
    clientId: 1,
    date: "2025-05-01",
    workoutType: "Кардионагрузка",
    time: "18:00",
    status: null
  },
  {
    clientId: 2,
    date: "2025-05-01",
    workoutType: "Силовая тренировка",
    time: "19:00",
    status: null
  },
  {
    clientId: 3,
    date: "2025-05-02",
    workoutType: "Йога",
    time: "09:00",
    status: null
  },
  {
    clientId: 4,
    date: "2025-05-02",
    workoutType: "Кроссфит",
    time: "20:00",
    status: null
  },
  {
    clientId: 1,
    date: "2025-05-03",
    workoutType: "Функциональный тренинг",
    time: "18:00",
    status: null
  },
  {
    clientId: 2,
    date: "2025-05-04",
    workoutType: "Кроссфит",
    time: "19:00",
    status: null
  },
  {
    clientId: 3,
    date: "2025-05-05",
    workoutType: "Пилатес",
    time: "09:00",
    status: null
  },
  {
    clientId: 4,
    date: "2025-05-06",
    workoutType: "Силовая тренировка",
    time: "20:00",
    status: null
  }
];

// Пример данных о предстоящих тренировках
const upcomingWorkouts = [
  {
    clientId: 1,
    date: "2025-05-03",
    workoutType: "Функциональный тренинг",
    time: "18:00"
  },
  {
    clientId: 2,
    date: "2025-05-04",
    workoutType: "Кроссфит",
    time: "19:00"
  },
  {
    clientId: 3,
    date: "2025-05-05",
    workoutType: "Пилатес",
    time: "09:00"
  },
  {
    clientId: 4,
    date: "2025-05-06",
    workoutType: "Силовая тренировка",
    time: "20:00"
  },
  {
    clientId: 1,
    date: "2025-05-07",
    workoutType: "Кардио",
    time: "18:00"
  },
  {
    clientId: 2,
    date: "2025-05-08",
    workoutType: "Йога",
    time: "19:00"
  },
  {
    clientId: 3,
    date: "2025-05-09",
    workoutType: "Кроссфит",
    time: "09:00"
  },
  {
    clientId: 4,
    date: "2025-05-10",
    workoutType: "Силовая",
    time: "20:00"
  }
];

// Статистика
const statistic = {
  cashInMonth: 125000,
  sessionsInMonth: 48,
  averageReceipt: 2604,
  totalClients: 24,
  activeClients: 18,
  newClients: 3
};

const getActivityColor = (level) => {
  switch(level) {
    case 'Высокая': return 'success';
    case 'Средняя': return 'warning';
    case 'Низкая': return 'error';
    default: return 'default';
  }
};

const MainPage = () => {
  const [workouts, setWorkouts] = useState(completedWorkouts);
  const [openModal, setOpenModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuClientId, setMenuClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completedScrollLeft, setCompletedScrollLeft] = useState(0);
  const [upcomingScrollLeft, setUpcomingScrollLeft] = useState(0);

  const handleMenuOpen = (event, clientId) => {
    setAnchorEl(event.currentTarget);
    setMenuClientId(clientId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuClientId(null);
  };

  const handleStatusChange = (workoutId, status) => {
    const updatedWorkouts = workouts.map(workout => 
      workout.clientId === workoutId ? { ...workout, status } : workout
    );
    setWorkouts(updatedWorkouts);
    
    const client = clients.find(c => c.id === workoutId);
    if (status === 'attended') {
      setModalContent({
        title: `Тренировка проведена с ${client.name}`,
        message: 'Отлично! Тренировка успешно завершена. Хотите добавить заметки?',
        emoji: '🎉'
      });
    } else {
      setModalContent({
        title: `Тренировка отменена с ${client.name}`,
        message: 'Клиент не явился на тренировку. Укажите причину?',
        emoji: '😕'
      });
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleScroll = (direction, type) => {
    const container = document.getElementById(`${type}-workouts-container`);
    if (container) {
      const scrollAmount = 300; // Количество пикселей для прокрутки
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

  return (
    <Box sx={{ padding: '24px', maxWidth: '1500px', margin: '0 auto' }}>

      {/* Компактная статистика */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(6, 1fr)' },
        gap: 2,
        mb: 4
      }}>
        {/* Доход */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <AttachMoneyIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Доход</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.cashInMonth.toLocaleString()} ₽</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>в этом месяце</Typography>
          </Box>
        </Paper>

        {/* Тренировки */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <DoneAllIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Тренировки</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.sessionsInMonth}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>проведено</Typography>
          </Box>
        </Paper>

        {/* Средний чек */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <ReceiptIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Средний чек</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.averageReceipt.toLocaleString()} ₽</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>за тренировку</Typography>
          </Box>
        </Paper>

        {/* Клиенты */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <PeopleAltIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Клиенты</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.totalClients}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>в базе</Typography>
          </Box>
        </Paper>

        {/* Активные */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <FitnessCenterIcon fontSize="medium" />
          <Box>
            <Typography variant="subtitle2">Активные</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{statistic.activeClients}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>регулярные</Typography>
          </Box>
        </Paper>

        {/* Новые */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          background: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
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
        <Typography variant="h5" component="h2" sx={{ 
          fontWeight: 'bold', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
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
                '&:hover': {
                  backgroundColor: 'background.paper'
                }
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
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
          >
            {workouts.map(workout => {
              const client = clients.find(c => c.id === workout.clientId);
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
                >
                  {/* Шапка карточки */}
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      background: client.gender === 'Male' 
                        ? 'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)' 
                        : 'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)' 
                    }}
                  >
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
                      <Typography variant="h6" component="div" sx={{ 
                        fontWeight: 'bold',
                        color: 'common.white'
                      }}>
                        {client.name.split(' ')[0]} {client.name.split(' ')[1]}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'common.white',
                        opacity: 0.9
                      }}>
                        {client.age} лет
                      </Typography>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Основные метрики */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mb: 2,
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
                      <Chip 
                        icon={<Straighten fontSize="small" />}
                        label={`${client.height} см`}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip 
                        icon={<MonitorWeight fontSize="small" />}
                        label={`${client.weight} кг`}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip 
                        icon={client.gender === 'Male' ? 
                          <Male fontSize="small" /> : 
                          <Female fontSize="small" />}
                        label={client.gender === 'Male' ? 'Муж' : 'Жен'}
                        color={client.gender === 'Male' ? 'primary' : 'secondary'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    
                    {/* Тип тренировки и время */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1,
                        fontWeight: 500
                      }}>
                        <FitnessCenter sx={{ mr: 1, fontSize: 18 }} />
                        <strong>Тренировка:</strong> {workout.workoutType}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1,
                        fontWeight: 500
                      }}>
                        <EventAvailableIcon sx={{ mr: 1, fontSize: 18 }} />
                        <strong>Время:</strong> {workout.time}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    {/* Кнопки статуса */}
                    <Box sx={{ display: 'flex', gap: '12px', mt: 2 }}>
                      <Button 
                        variant="contained" 
                        color="success" 
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(workout.clientId, 'attended');
                        }}
                        sx={{ 
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          textTransform: 'none'
                        }}
                      >
                        Была
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error" 
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(workout.clientId, 'missed');
                        }}
                        sx={{ 
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          textTransform: 'none'
                        }}
                      >
                        Не была
                      </Button>
                    </Box>
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
              '&:hover': {
                backgroundColor: 'background.paper'
              }
            }}
            onClick={() => handleScroll('right', 'completed')}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Предстоящие тренировки */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography variant="h5" component="h2" sx={{ 
          fontWeight: 'bold', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
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
                '&:hover': {
                  backgroundColor: 'background.paper'
                }
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
              '&::-webkit-scrollbar': {
                display: 'none'
              }
            }}
          >
            {upcomingWorkouts.map(workout => {
              const client = clients.find(c => c.id === workout.clientId);
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
                  {/* Шапка карточки */}
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      background: client.gender === 'Male' 
                        ? 'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)'  
                        : 'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)' 
                    }}
                  >
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
                      <Typography variant="h6" component="div" sx={{ 
                        fontWeight: 'bold',
                        color: 'common.white'
                      }}>
                        {client.name.split(' ')[0]} {client.name.split(' ')[1]}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'common.white',
                        opacity: 0.9
                      }}>
                        {client.age} лет
                      </Typography>
                    </Box>
                    <Box sx={{ marginLeft: 'auto' }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, client.id);
                        }}
                        sx={{ color: 'white' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1 }}>
                    {/* Основные метрики */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      mb: 2,
                      flexWrap: 'wrap',
                      gap: 1
                    }}>
                      <Chip 
                        icon={<Straighten fontSize="small" />}
                        label={`${client.height} см`}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip 
                        icon={<MonitorWeight fontSize="small" />}
                        label={`${client.weight} кг`}
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip 
                        icon={client.gender === 'Male' ? 
                          <Male fontSize="small" /> : 
                          <Female fontSize="small" />}
                        label={client.gender === 'Male' ? 'Муж' : 'Жен'}
                        color={client.gender === 'Male' ? 'primary' : 'secondary'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    
                    {/* Тип тренировки и время */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1,
                        fontWeight: 500
                      }}>
                        <FitnessCenter sx={{ mr: 1, fontSize: 18 }} />
                        <strong>Тренировка:</strong> {workout.workoutType}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 1,
                        fontWeight: 500
                      }}>
                        <EventAvailableIcon sx={{ mr: 1, fontSize: 18 }} />
                        <strong>Дата:</strong> {workout.date} в {workout.time}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    {/* Контакты */}
                    <Typography variant="body2" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 1,
                      fontWeight: 500
                    }}>
                      <Phone sx={{ mr: 1, fontSize: 18 }} />
                      {client.phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')}
                    </Typography>
                    
                    {/* Кнопка подробнее */}
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      sx={{ 
                        mt: 2,
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        textTransform: 'none'
                      }}
                    >
                      Подробнее
                    </Button>
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
              '&:hover': {
                backgroundColor: 'background.paper'
              }
            }}
            onClick={() => handleScroll('right', 'upcoming')}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>

      {/* Модальное окно */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
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
          textAlign: 'center'
        }}>
          <Typography id="modal-title" variant="h6" component="h2" sx={{ fontWeight: 'bold', marginBottom: '16px' }}>
            {modalContent?.title}
          </Typography>
          <Typography variant="h2" sx={{ margin: '20px 0' }}>
            {modalContent?.emoji}
          </Typography>
          <Typography id="modal-description" sx={{ mb: 3 }}>
            {modalContent?.message}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Button 
              variant="contained" 
              onClick={handleCloseModal}
              sx={{ 
                borderRadius: '12px',
                fontWeight: 'bold',
                textTransform: 'none',
                backgroundColor: '#d81b60',
                '&:hover': { backgroundColor: '#b0003a' }
              }}
            >
              Сохранить
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleCloseModal}
              sx={{ 
                borderRadius: '12px',
                fontWeight: 'bold',
                textTransform: 'none',
                borderColor: '#d81b60',
                color: '#d81b60',
                '&:hover': { borderColor: '#b0003a' }
              }}
            >
              Отмена
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Меню для карточек */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          // Добавить логику для добавления оплаты
        }}>Добавить оплату</MenuItem>
        
        <MenuItem onClick={() => {
          handleMenuClose();
          // Добавить логику для списания тренировки
        }}>Списать тренировку</MenuItem>

        <MenuItem onClick={() => {
          handleMenuClose();
          // Добавить логику для удаления
        }} sx={{ color: 'error.main' }}>Удалить</MenuItem>
      </Menu>
    </Box>
  );
};

export default MainPage;