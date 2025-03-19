import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

// Примерные данные о клиентах
const clients = [
  {
    id: 1,
    name: "Иван Иванов",
    goal: "Похудение",
    progress: { weight: -5, volume: { chest: -3, waist: -4 }, fatPercentage: -2 }
  },
  {
    id: 2,
    name: "Анна Смирнова",
    goal: "Набор массы",
    progress: { weight: 2, volume: { chest: 3, waist: 1 }, fatPercentage: 1 }
  },
  {
    id: 2,
    name: "Анна Смирнова2",
    goal: "Набор массы",
    progress: { weight: 2, volume: { chest: 3, waist: 1 }, fatPercentage: 1 }
  },
  {
    id: 2,
    name: "Анна Смирнова3",
    goal: "Набор массы",
    progress: { weight: 2, volume: { chest: 3, waist: 1 }, fatPercentage: 1 }
  }
];

// Пример данных о предстоящих тренировках
const upcomingWorkouts = [
  {
    clientId: 1,
    date: "2025-03-05",
    workoutType: "Кардионагрузка",
    time: "18:00"
  },
  {
    clientId: 2,
    date: "2025-03-06",
    workoutType: "Силовая тренировка",
    time: "19:00"
  },
  {
    clientId: 2,
    date: "2025-03-06",
    workoutType: "Жопа",
    time: "19:00"
  }
];

// Статистика
const stats = {
  totalClients: clients.length,
  totalWorkouts: upcomingWorkouts.length,
  goalAchievementRate: ((clients.filter(client => client.progress.weight > 0).length / clients.length) * 100).toFixed(2)
};

// Функция для вычисления прогресса
const calculateProgress = (clientId) => {
  const client = clients.find(c => c.id === clientId);
  if (client) {
    const { weight, volume, fatPercentage } = client.progress;
    return {
      weightChange: weight,
      volumeChange: volume,
      fatPercentageChange: fatPercentage
    };
  }
  return null;
};

const MainPage = () => {
  return (
    <Box sx={{ padding: '20px' }}>
      {/* Важная информация */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', marginBottom: '16px' }}>
          Важная информация
        </Typography>
        <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="body1">

          </Typography>
        </Paper>
      </Box>

      {/* Статистика */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', marginBottom: '16px' }}>
          Статистика
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6">Количество клиентов</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{stats.totalClients}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6">Тренировок в неделю</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{stats.totalWorkouts}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
              <Typography variant="h6">Достижение целей</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{stats.goalAchievementRate}%</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Подсказки и рекомендации */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', marginBottom: '16px' }}>
          Горящие задачи
        </Typography>
        <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="body1">
            1.
          </Typography>
          <Typography variant="body1">
            2.
          </Typography>
          <Typography variant="body1">
            3.
          </Typography>
        </Paper>
      </Box>

      {/* Блок с клиентами */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', marginBottom: '16px' }}>
          Наши клиенты
        </Typography>
        <Grid container spacing={3}>
          {clients.map(client => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6">{client.name}</Typography>
                <Typography variant="body1">Цель: {client.goal}</Typography>
                <Typography variant="body2" sx={{ color: 'gray' }}>
                  Прогресс: {client.progress.weight} кг
                </Typography>
                <Button component={Link} to={`/client/${client.id}`} sx={{ marginTop: '16px' }} variant="contained" color="primary">
                  Подробнее
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Блок с предстоящими тренировками */}
      <Box sx={{ marginBottom: '40px' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', marginBottom: '16px' }}>
          Предстоящие тренировки
          <Button >Разослать вопрос о тренировке</Button>
        </Typography>
        <Grid container spacing={3}>
          {upcomingWorkouts.map(workout => (
            <Grid item xs={12} sm={6} md={4} key={workout.clientId}>
              <Paper sx={{ padding: '20px', backgroundColor: '#f5f5f5', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6">Тренировка с {clients.find(client => client.id === workout.clientId)?.name}</Typography>
                <Typography variant="body1">Дата: {workout.date}</Typography>
                <Typography variant="body2" sx={{ color: 'gray' }}>
                  Время: {workout.time}
                </Typography>
                <Button component={Link} to={`/training/${workout.clientId}`} sx={{ marginTop: '16px' }} variant="contained" color="primary">
                  Подробнее
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default MainPage;
