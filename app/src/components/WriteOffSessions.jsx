import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Rating,
  Chip,
  Typography,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Avatar
} from '@mui/material';
import {
  CheckCircleOutline,
  CancelOutlined,
  FitnessCenter,
  Done,
  Close,
  SentimentVerySatisfied,
  SentimentSatisfied,
  SentimentDissatisfied,
  SentimentVeryDissatisfied
} from '@mui/icons-material';
import { fetchWithRetry } from '../utils/refreshToken';
import { addToast } from '../utils/addToast';
import dayjs from 'dayjs';

const absenceReasons = ['Заболел', 'Забыл', 'Личные дела', 'Отпуск', 'Предупредил заранее', 'Не предупредил заранее', 'Заболел ребенок', 'Неизвестно'];
const conditionOptions = [
  { value: 'Отлично', icon: <SentimentVerySatisfied color="success" /> },
  { value: 'Хорошо', icon: <SentimentSatisfied color="success" /> },
  { value: 'Устал', icon: <SentimentDissatisfied color="warning" /> },
  { value: 'Очень устал', icon: <SentimentVeryDissatisfied color="error" /> },
  { value: 'Плохо', icon: <SentimentVeryDissatisfied color="error" /> }
];
const intensityOptions = ['Лёгкая', 'Средняя', 'Тяжёлая', 'До отказа', 'Интервальная'];

export const WriteOffSessions = ({ open, onClose, client, fetchDataQuantity }) => {
  const [view, setView] = useState('completed');
  const [form, setForm] = useState({
    conditionAfter: '',
    conditionBefore: '',
    intensity: '',
    rating: 0,
    comment: '',
    reason: '',
    reschedule: '',
    writeoffComment: '',
    sessionDate: dayjs().format(`YYYY-MM-DDTHH:mm`)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [writeoffAction, setWriteoffAction] = useState('writeoff');
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    if (open) {
      resetForm();
      setView('completed'); // если хочешь, можно тоже сбросить view
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      // Берём дату из client.date или текущую
      const date = client.date ? dayjs(client.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
      // Берём время из client.time или текущее
      const time = client.time ? client.time : dayjs().format('HH:mm');
      // Устанавливаем состояние формы с нужной датой и временем
      setForm({
        conditionAfter: '',
        conditionBefore: '',
        intensity: '',
        rating: 0,
        comment: '',
        reason: '',
        reschedule: '',
        writeoffComment: '',
        sessionDate: `${date}T${time}`
      });
      setWriteoffAction('writeoff');
      setErrors({});
      setView('completed');
    }
  }, [open, client]);

  const validateForm = () => {
    const newErrors = {};

    if (view === 'completed') {
      if (!form.conditionAfter) newErrors.conditionAfter = 'Обязательное поле';
      if (!form.conditionBefore) newErrors.conditionBefore = 'Обязательное поле';
      if (!form.intensity) newErrors.intensity = 'Обязательное поле';
      if (form.rating === 0) newErrors.rating = 'Поставьте оценку';
    } else if (view === 'missed') {
      if (!form.reason) newErrors.reason = 'Укажите причину';
      if (!form.reschedule) newErrors.reschedule = 'Укажите статус переноса';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (view !== 'simple' && view !== 'missed' && !validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        clientId: client.id,
        clientName: client.name,
        type: view,
        ...form
      };

      if (view === 'simple' || view === 'missed') {
        payload.action = writeoffAction;
      }
      console.log('asdasdasdadasd');
      const response = await fetchWithRetry('/payment_history', 'PATCH', { client: client, payload: payload, userId: userId });

      if (!response.status) {
        addToast('errorWriteOffSession', 'error', 'Ошибка списания тренировоки', 1000);
        return
      }
      fetchDataQuantity();
      addToast('successWriteOffSession', 'success', `Тренировки успешно списана у ${client.name}, Осталось: ${response.data[0]?.quantityLeft} / ${response.data[0]?.quantity}`, 1000);
      onClose();
    } catch (error) {
      console.error('Ошибка отправки отчета:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      conditionAfter: '',
      conditionBefore: '',
      intensity: '',
      rating: 0,
      comment: '',
      reason: '',
      reschedule: '',
      writeoffComment: '',
      sessionDate: dayjs().format('YYYY-MM-DDTHH:mm')
    });
    setWriteoffAction('writeoff');
    setErrors({});
  };

  const handleViewChange = (newView) => {
    setView(newView);
    resetForm();
  };

  const onAddPackage = (id) => {
    addToast('errorToastBack', 'error', 'Этот функционал пока что не рабоатет. Нужен? Поцелуйте Диму 3 раза!', 2000);
  }

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth >
      {client.sessionQueue !== null ? (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              {client.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="Проведена"
                onClick={() => handleViewChange('completed')}
                color={view === 'completed' ? 'primary' : 'default'}
                variant={view === 'completed' ? 'filled' : 'outlined'}
                icon={<CheckCircleOutline />}
              />
              <Chip
                label="Пропущена"
                onClick={() => handleViewChange('missed')}
                color={view === 'missed' ? 'primary' : 'default'}
                variant={view === 'missed' ? 'filled' : 'outlined'}
                icon={<CancelOutlined />}
              />
              <Chip
                label="Списать"
                onClick={() => handleViewChange('simple')}
                color={view === 'simple' ? 'primary' : 'default'}
                variant={view === 'simple' ? 'filled' : 'outlined'}
                icon={<FitnessCenter />}
              />
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />
          <TextField
            label="Дата и время тренировки"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.sessionDate}
            onChange={(e) => handleChange('sessionDate', e.target.value)}
            sx={{ mt: 3, mb: 2 }}
          />

          {view === 'simple' ? (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    label="Комментарий (необязательно)"
                    multiline
                    rows={3}
                    fullWidth
                    value={form.writeoffComment}
                    onChange={e => handleChange('writeoffComment', e.target.value)}
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          ) : view === 'missed' ? (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Stack spacing={3}>
                  <FormControl fullWidth error={!!errors.reason}>
                    <FormLabel>Причина отсутствия</FormLabel>
                    <RadioGroup
                      value={form.reason}
                      onChange={e => handleChange('reason', e.target.value)}
                    >
                      {absenceReasons.map(opt => (
                        <FormControlLabel
                          key={opt}
                          value={opt}
                          control={<Radio />}
                          label={opt}
                        />
                      ))}
                    </RadioGroup>
                    {errors.reason && <Typography color="error" variant="caption">{errors.reason}</Typography>}
                  </FormControl>

                  <ToggleButtonGroup
                    fullWidth
                    exclusive
                    value={writeoffAction}
                    onChange={(_, value) => setWriteoffAction(value)}
                  >
                    <ToggleButton value="writeoff" color="success">
                      <Done sx={{ mr: 1 }} />
                      Списать
                    </ToggleButton>
                    <ToggleButton value="no_writeoff" color="error">
                      <Close sx={{ mr: 1 }} />
                      Не списывать
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <TextField
                    label="Комментарий"
                    multiline
                    rows={3}
                    fullWidth
                    value={form.comment}
                    onChange={e => handleChange('comment', e.target.value)}
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Stack spacing={3}>
                    <FormControl fullWidth error={!!errors.conditionBefore}>
                      <FormLabel>Состояние до тренировки</FormLabel>
                      <RadioGroup
                        row
                        value={form.conditionBefore}
                        onChange={e => handleChange('conditionBefore', e.target.value)}
                      >
                        {conditionOptions.map((opt, index) => (
                          <FormControlLabel
                            key={index}
                            value={opt.value}
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {opt.icon}
                                <Box sx={{ ml: 1 }}>{opt.value}</Box>
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                      {errors.conditionBefore && <Typography color="error" variant="caption">{errors.conditionBefore}</Typography>}
                    </FormControl>

                    <FormControl fullWidth error={!!errors.intensity}>
                      <FormLabel>Интенсивность</FormLabel>
                      <RadioGroup
                        row
                        value={form.intensity}
                        onChange={e => handleChange('intensity', e.target.value)}
                      >
                        {intensityOptions.map(opt => (
                          <FormControlLabel
                            key={opt}
                            value={opt}
                            control={<Radio />}
                            label={opt}
                          />
                        ))}
                      </RadioGroup>
                      {errors.intensity && <Typography color="error" variant="caption">{errors.intensity}</Typography>}
                    </FormControl>

                    <FormControl fullWidth error={!!errors.conditionAfter}>
                      <FormLabel>Состояние после тренировки</FormLabel>
                      <RadioGroup
                        row
                        value={form.conditionAfter}
                        onChange={e => handleChange('conditionAfter', e.target.value)}
                      >
                        {conditionOptions.map((opt, index) => (
                          <FormControlLabel
                            key={index}
                            value={opt.value}
                            control={<Radio />}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {opt.icon}
                                <Box sx={{ ml: 1 }}>{opt.value}</Box>
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                      {errors.conditionAfter && <Typography color="error" variant="caption">{errors.conditionAfter}</Typography>}
                    </FormControl>

                    <FormControl fullWidth error={!!errors.rating}>
                      <FormLabel>Оценка тренировки</FormLabel>
                      <Rating
                        value={form.rating}
                        onChange={(_, newValue) => handleChange('rating', newValue)}
                        size="large"
                        sx={{ mt: 1 }}
                      />
                      {errors.rating && <Typography color="error" variant="caption">{errors.rating}</Typography>}
                    </FormControl>
                  </Stack>
                </CardContent>
              </Card>

              <TextField
                label="Дополнительные комментарии"
                multiline
                rows={3}
                fullWidth
                value={form.comment}
                onChange={e => handleChange('comment', e.target.value)}
                variant="outlined"
              />
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button
              onClick={() => onClose()}
              variant="outlined"
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              Списать
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight="bold" color="error" mb={2}>
            Внимание! У этого клиента нет купленного пакета.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                onAddPackage(client.id);
              }}
            >
              Добавить
            </Button>
            <Button
              variant="outlined"
              onClick={() => onClose()}
            >
              Закрыть
            </Button>
          </Box>
        </Box>)}
    </Dialog>
  );
}
export default WriteOffSessions;