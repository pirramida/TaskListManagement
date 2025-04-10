import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button,
    Typography,
    Avatar,
    Box,
    Tabs,
    Tab,
    Divider,
    Chip,
    LinearProgress,
    Paper,
    Grid,
    IconButton
  } from '@mui/material';
  import {
    Person,
    FitnessCenter,
    Timeline,
    Assignment,
    Phone,
    Cake,
    Straighten,
    MonitorWeight,
    Male,
    Female,
    AccessTime,
    Close,
  } from '@mui/icons-material';
  import { useState } from 'react';
  
  const CardClient = ({ client, open, onClose }) => {
    const [activeTab, setActiveTab] = useState(0);
    
    // Пример данных для графиков (замените реальными данными)
    const weightHistory = [
      { date: '01.01', weight: 75 },
      { date: '01.02', weight: 73 },
      { date: '01.03', weight: 72 },
      { date: '01.04', weight: 70 }
    ];
    
    const workoutStats = {
      completed: 12,
      remaining: 8,
      total: 20
    };
  
    return (
      <Dialog 
        open={open} 
        onClose={onClose    } 
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8eb 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box display="flex" alignItems="center">
            <Person sx={{ mr: 1 }} />
            Детальная информация
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0 }}>
          {/* Шапка профиля */}
          <Box sx={{ 
            display: 'flex', 
            p: 3,
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(0,0,0,0.1)'
          }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mr: 3,
              bgcolor: client?.gender === 'Male' ? 'primary.main' : 'secondary.main',
              fontSize: '2rem'
            }}>
              {client.name.charAt(0)}
            </Avatar>
            
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {client.name}
              </Typography>
              <Box display="flex" alignItems="center" mt={1} mb={1}>
                <Chip 
                  icon={<Cake />}
                  label={`${client.age} лет`}
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip 
                  icon={client.gender === 'Male' ? <Male /> : <Female />}
                  label={client.gender === 'Male' ? 'Мужской' : 'Женский'}
                  color={client.gender === 'Male' ? 'primary' : 'secondary'}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                <Phone fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                {client.phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')}
              </Typography>
            </Box>
          </Box>
          
          {/* Табы */}
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ 
              bgcolor: 'background.paper',
              px: 2,
              '& .MuiTabs-indicator': {
                height: 3
              }
            }}
          >
            <Tab icon={<Person />} label="Профиль" />
            <Tab icon={<Timeline />} label="Прогресс" />
            <Tab icon={<FitnessCenter />} label="Тренировки" />
            <Tab icon={<Assignment />} label="Заметки" />
          </Tabs>
          
          {/* Содержимое табов */}
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Основные данные
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ '& > div': { mb: 2 } }}>
                      <Box display="flex">
                        <Straighten sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography><strong>Рост:</strong> {client.height} см</Typography>
                      </Box>
                      
                      <Box display="flex">
                        <MonitorWeight sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography><strong>Вес:</strong> {client.weight} кг</Typography>
                      </Box>
                      
                      <Box display="flex">
                        <FitnessCenter sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography><strong>Цель:</strong> {client.goal}</Typography>
                      </Box>
                      
                      <Box display="flex" alignItems="center">
                        <Box sx={{ width: 100, mr: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={client.activityLevel === 'Низкий' ? 30 : client.activityLevel === 'Средний' ? 60 : 90}
                            color={getActivityColor(client.activityLevel)}
                          />
                        </Box>
                        <Typography><strong>Активность:</strong> {client.activityLevel}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Дополнительно
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ '& > div': { mb: 2 } }}>
                      <Box display="flex">
                        <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography>
                          <strong>Дата регистрации:</strong> {new Date(client.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Typography gutterBottom>
                        <strong>Травмы/ограничения:</strong> {client.injuries || 'Нет'}
                      </Typography>
                      
                      <Typography>
                        <strong>История тренировок:</strong> {client.trainingHistory ? JSON.parse(client.trainingHistory).join(', ') : 'Нет данных'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Динамика веса
                </Typography>
                {/* Здесь будет график динамики веса */}
                <Box height={200} bgcolor="background.default" borderRadius={2} p={2}>
                  <Typography color="text.secondary">График веса (пример)</Typography>
                  {/* В реальном приложении подключите библиотеку для графиков */}
                </Box>
                
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Изменения тела
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Грудь</Typography>
                        <Typography variant="h6">{client.chest} см</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Талия</Typography>
                        <Typography variant="h6">{client.waist} см</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={4}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Бедра</Typography>
                        <Typography variant="h6">{client.hips} см</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Статистика тренировок
                </Typography>
                
                <Box mb={3}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Прогресс пакета</Typography>
                    <Typography>{workoutStats.completed}/{workoutStats.total}</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(workoutStats.completed / workoutStats.total) * 100} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">{workoutStats.completed}</Typography>
                      <Typography variant="body2">Пройдено</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4">{workoutStats.remaining}</Typography>
                      <Typography variant="body2">Осталось</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {Math.round((workoutStats.completed / workoutStats.total) * 100)}%
                      </Typography>
                      <Typography variant="body2">Выполнено</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="text.secondary">
                        {workoutStats.total}
                      </Typography>
                      <Typography variant="body2">Всего</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Заметки тренера
                </Typography>
                {/* Здесь будет редактор заметок */}
                <Paper elevation={0} sx={{ 
                  p: 2, 
                  height: 200, 
                  bgcolor: 'background.default',
                  borderRadius: 2
                }}>
                  <Typography color="text.secondary">
                    Здесь можно оставлять заметки по клиенту...
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ bgcolor: 'background.paper', p: 2 }}>
          <Button 
            onClick={onClose} 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default CardClient;
  // Вспомогательная функция для цвета активности
  function getActivityColor(activity) {
    switch(activity) {
      case 'Низкий': return 'error';
      case 'Средний': return 'warning';
      case 'Высокий': return 'success';
      default: return 'info';
    }
  }