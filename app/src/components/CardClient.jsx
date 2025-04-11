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
    IconButton,
    TextField,
    Grid
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
    Edit,
    Save
  } from '@mui/icons-material';
  import { useState } from 'react';
  
  const CardClient = ({ open, onClose, client }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedClient, setEditedClient] = useState(client);
  
    // Обработчик изменений полей
    const handleFieldChange = (field, value) => {
      setEditedClient(prev => ({ ...prev, [field]: value }));
    };
  
    // Сохранение изменений
    const handleSave = () => {
      // Здесь должна быть логика сохранения на сервер
      setIsEditing(false);
      onClose(); // Закрываем после сохранения
    };
  
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        PaperProps={{
          sx: {
            background: 'linear-gradient(to bottom, #f5f7fa 0%, #e4e8eb 100%)'
          }
        }}
      >
        {/* Шапка диалога */}
        <DialogTitle sx={{
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}>
          <Box display="flex" alignItems="center">
            <Person sx={{ mr: 1 }} />
            {isEditing ? 'Редактирование клиента' : 'Профиль клиента'}
          </Box>
          <Box>
            {isEditing ? (
              <IconButton onClick={handleSave} color="inherit" sx={{ mr: 1 }}>
                <Save />
              </IconButton>
            ) : (
              <IconButton 
                onClick={() => setIsEditing(true)} 
                color="inherit"
                sx={{ mr: 1 }}
              >
                <Edit />
              </IconButton>
            )}
            <IconButton onClick={onClose} color="inherit">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
  
        <DialogContent dividers sx={{ p: 0 }}>
          {/* Основная информация */}
          <Box sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar sx={{
                width: 80,
                height: 80,
                mr: 3,
                bgcolor: client.gender === 'Male' ? 'primary.main' : 'secondary.main',
                fontSize: '2rem'
              }}>
                {client.name.charAt(0)}
              </Avatar>
  
              {isEditing ? (
                <Box flexGrow={1}>
                  <TextField
                    fullWidth
                    label="ФИО"
                    value={editedClient.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box display="flex" gap={2}>
                    <TextField
                      label="Возраст"
                      type="number"
                      value={editedClient.age}
                      onChange={(e) => handleFieldChange('age', e.target.value)}
                      sx={{ width: 120 }}
                    />
                    <TextField
                      label="Телефон"
                      value={editedClient.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      sx={{ flexGrow: 1 }}
                    />
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {client.name}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={1} mb={1} gap={1}>
                    <Chip
                      icon={<Cake />}
                      label={`${client.age} лет`}
                      size="small"
                    />
                    <Chip
                      icon={client.gender === 'Male' ? <Male /> : <Female />}
                      label={client.gender === 'Male' ? 'Мужской' : 'Женский'}
                      color={client.gender === 'Male' ? 'primary' : 'secondary'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body1">
                    <Phone fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {client.phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')}
                  </Typography>
                </Box>
              )}
            </Box>
  
            {/* Табы */}
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{
                mb: 3,
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
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Физические параметры
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
  
                    {isEditing ? (
                      <Box>
                        <Box display="flex" gap={2} mb={2}>
                          <TextField
                            label="Рост (см)"
                            type="number"
                            value={editedClient.height}
                            onChange={(e) => handleFieldChange('height', e.target.value)}
                            fullWidth
                          />
                          <TextField
                            label="Вес (кг)"
                            type="number"
                            value={editedClient.weight}
                            onChange={(e) => handleFieldChange('weight', e.target.value)}
                            fullWidth
                          />
                        </Box>
                        <TextField
                          label="Цель"
                          value={editedClient.goal}
                          onChange={(e) => handleFieldChange('goal', e.target.value)}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Уровень активности"
                          select
                          value={editedClient.activityLevel}
                          onChange={(e) => handleFieldChange('activityLevel', e.target.value)}
                          fullWidth
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="Низкий">Низкий</option>
                          <option value="Средний">Средний</option>
                          <option value="Высокий">Высокий</option>
                        </TextField>
                      </Box>
                    ) : (
                      <Box>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Straighten sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography><strong>Рост:</strong> {client.height} см</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={2}>
                          <MonitorWeight sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography><strong>Вес:</strong> {client.weight} кг</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" mb={2}>
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
                    )}
                  </Paper>
                </Grid>
  
                <Grid item xs={12} md={6}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Дополнительная информация
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
  
                    {isEditing ? (
                      <Box>
                        <TextField
                          label="Травмы/ограничения"
                          value={editedClient.injuries}
                          onChange={(e) => handleFieldChange('injuries', e.target.value)}
                          multiline
                          rows={3}
                          fullWidth
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="История тренировок"
                          value={Array.isArray(editedClient.trainingHistory) 
                            ? editedClient.trainingHistory.join(', ') 
                            : editedClient.trainingHistory}
                          onChange={(e) => handleFieldChange('trainingHistory', e.target.value)}
                          fullWidth
                        />
                      </Box>
                    ) : (
                      <Box>
                        <Box mb={2}>
                          <Typography gutterBottom>
                            <strong>Травмы/ограничения:</strong> {client.injuries || 'Нет'}
                          </Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography>
                            <strong>История тренировок:</strong> {client.trainingHistory ? JSON.parse(client.trainingHistory).join(', ') : 'Нет данных'}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography>
                            <strong>Дата регистрации:</strong> {new Date(client.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            )}
  
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Динамика веса
                </Typography>
                <Paper elevation={0} sx={{ p: 2, mb: 3, height: 300, borderRadius: 2 }}>
                  {/* Здесь будет график динамики веса */}
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <Typography color="text.secondary">График динамики веса</Typography>
                  </Box>
                </Paper>
  
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Изменения тела
                </Typography>
                <Grid container spacing={2} mb={3}>
                  {['chest', 'waist', 'hips'].map((part) => (
                    <Grid item xs={4} key={part}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {part === 'chest' ? 'Грудь' : part === 'waist' ? 'Талия' : 'Бедра'}
                        </Typography>
                        {isEditing ? (
                          <TextField
                            type="number"
                            value={editedClient[part]}
                            onChange={(e) => handleFieldChange(part, e.target.value)}
                            sx={{ mt: 1 }}
                            size="small"
                          />
                        ) : (
                          <Typography variant="h6">{client[part]} см</Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
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
                    <Typography>12/20</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={60}
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
  
                <Grid container spacing={2}>
                  {[
                    { label: 'Пройдено', value: 12, color: 'primary' },
                    { label: 'Осталось', value: 8 },
                    { label: 'Выполнено', value: '60%', color: 'success.main' },
                    { label: 'Всего', value: 20, color: 'text.secondary' }
                  ].map((item, index) => (
                    <Grid item xs={6} md={3} key={index}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography 
                          variant="h4" 
                          sx={{ color: item.color || 'text.primary' }}
                        >
                          {item.value}
                        </Typography>
                        <Typography variant="body2">{item.label}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
  
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Заметки тренера
                </Typography>
                <Paper elevation={0} sx={{ p: 2, height: 300, borderRadius: 2 }}>
                  {isEditing ? (
                    <TextField
                      multiline
                      rows={10}
                      fullWidth
                      placeholder="Введите заметки о клиенте..."
                      value={editedClient.notes || ''}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                    />
                  ) : (
                    <Typography color={client.notes ? 'text.primary' : 'text.secondary'}>
                      {client.notes || 'Нет заметок'}
                    </Typography>
                  )}
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>
  
        <DialogActions sx={{ bgcolor: 'background.paper', p: 2 }}>
          <Button
            onClick={isEditing ? () => setIsEditing(false) : onClose}
            variant="outlined"
            sx={{ borderRadius: 2, mr: 2 }}
          >
            {isEditing ? 'Отмена' : 'Закрыть'}
          </Button>
          {isEditing && (
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{ borderRadius: 2 }}
              startIcon={<Save />}
            >
              Сохранить
            </Button>
          )}
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