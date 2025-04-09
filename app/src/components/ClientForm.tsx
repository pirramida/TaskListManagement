import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Divider,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PhotoCamera,
  FitnessCenter,
  Person,
  Phone,
  Cake,
  Scale,
  Height,
  Edit,
  Save,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { fetchWithRetry } from '../utils/refreshToken';
import { addToast } from "../utils/addToast";

// Стилизованные компоненты
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}));

const ColorButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #1976d2 30%, #2196f3 90%)",
  color: "white",
  fontWeight: "bold",
  padding: "10px 24px",
  borderRadius: "8px",
}));

const ClientForm: React.FC = () => {
  // Состояние для одного клиента
  const [client, setClient] = useState({
    name: "",
    age: 0,
    gender: "Male",
    phone: "",
    photo: null,
    goal: "",
    activityLevel: "",
    injuries: "",
    trainingHistory: [],
    weight: 0,
    height: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    bodyFat: 0,
  });

  const [clientReset, setClientReset] = useState({
    name: "",
    age: 0,
    gender: "Male",
    phone: "",
    photo: null,
    goal: "",
    activityLevel: "",
    injuries: "",
    trainingHistory: [],
    weight: 0,
    height: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    bodyFat: 0,
  });
  

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editMode, setEditMode] = useState(true);

  const calculateBodyFat = (weight: number, age: number, gender: string): number => {
    if (gender === "Male") {
      return 0.415 * weight + 0.1 * age - 10.8 * 1 - 6.8;
    } else {
      return 0.515 * weight + 0.16 * age - 9.4 * 0 - 4.7;
    }
  };
  
  useEffect(() => {
    if (client.weight > 0 && client.age > 0) {
      const calculatedBodyFat = calculateBodyFat(client.weight, client.age, client.gender);
      setClient(prev => ({ ...prev, bodyFat: calculatedBodyFat }));
    }
  }, [client.weight, client.age, client.gender]);

  const handleInputChange = (field: any, value: any) => {
    setClient(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const photoUrl = URL.createObjectURL(e.target.files[0]);
      handleInputChange("photo", photoUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetchWithRetry('/clients', 'POST', { form: client } );
      if (response.message === 'Клиент добавлен') {
        addToast('acceptedNewClientAdd', 'success', `${client.name} успешно добавлен!`, 1000);
      } else {
        addToast('connectionLost', 'error', 'Ошибка соединения с сервером...!', 1000 );
      }
      // setEditMode(false);
    } catch (error) {
      console.error("Ошибка при отправке:", error);
    } finally {
      setIsSubmitting(false); 
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <StyledPaper elevation={0}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {editMode ? "Редактирование клиента" : "Профиль клиента"}
          </Typography>
          {!editMode && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleEdit}
              sx={{ borderRadius: "8px" }}
            >
              Редактировать
            </Button>
          )}
        </Box>

        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Данные клиента успешно сохранены!
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Основная информация */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
                Основная информация
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Имя"
                value={client.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                disabled={!editMode}
                variant="outlined"
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="Возраст"
                type="number"
                value={client.age}
                onChange={(e) => handleInputChange("age", Number(e.target.value))}
                required
                disabled={!editMode}
                InputProps={{
                  endAdornment: <Cake color="action" />,
                }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Пол</InputLabel>
                <Select
                  value={client.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  label="Пол"
                  disabled={!editMode}
                >
                  <MenuItem value="Male">Мужской</MenuItem>
                  <MenuItem value="Female">Женский</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="client-photo"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={!editMode}
                  />
                  <label htmlFor="client-photo">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      disabled={!editMode}
                      sx={{ borderRadius: "8px" }}
                    >
                      {client.photo ? "Изменить фото" : "Загрузить фото"}
                    </Button>
                  </label>
                </Box>
                <Avatar
                  src={client.photo || undefined}
                  sx={{ width: 56, height: 56 }}
                />
              </Box>
            </Grid>

            {/* Контактная информация */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
                Контактная информация
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Телефон"
                value={client.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                required
                disabled={!editMode}
                size="small"
                InputProps={{
                  startAdornment: <Phone color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>

            {/* Фитнес информация */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
                Фитнес информация
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Цель клиента"
                value={client.goal}
                onChange={(e) => handleInputChange("goal", e.target.value)}
                required
                disabled={!editMode}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Уровень активности"
                value={client.activityLevel}
                onChange={(e) => handleInputChange("activityLevel", e.target.value)}
                required
                disabled={!editMode}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Травмы/ограничения"
                multiline
                rows={2}
                value={client.injuries}
                onChange={(e) => handleInputChange("injuries", e.target.value)}
                disabled={!editMode}
                size="small"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="История тренировок"
                multiline
                rows={2}
                value={client.trainingHistory.join(", ")}
                onChange={(e) =>
                  handleInputChange(
                    "trainingHistory",
                    e.target.value.split(",").map((item) => item.trim())
                  )
                }
                disabled={!editMode}
                size="small"
                helperText="Вводите через запятую"
              />
            </Grid>

            {/* Физические параметры */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: "text.secondary" }}>
                Физические параметры
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Вес (кг)"
                type="number"
                value={client.weight}
                onChange={(e) => handleInputChange("weight", Number(e.target.value))}
                required
                disabled={!editMode}
                size="small"
                InputProps={{
                  endAdornment: <Scale color="action" />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Рост (см)"
                type="number"
                value={client.height}
                onChange={(e) => handleInputChange("height", Number(e.target.value))}
                required
                disabled={!editMode}
                size="small"
                InputProps={{
                  endAdornment: <Height color="action" />,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <TextField
                fullWidth
                label="Грудь (см)"
                type="number"
                value={client.chest}
                onChange={(e) => handleInputChange("chest", Number(e.target.value))}
                disabled={!editMode}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <TextField
                fullWidth
                label="Талия (см)"
                type="number"
                value={client.waist}
                onChange={(e) => handleInputChange("waist", Number(e.target.value))}
                disabled={!editMode}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <TextField
                fullWidth
                label="Бедра (см)"
                type="number"
                value={client.hips}
                onChange={(e) => handleInputChange("hips", Number(e.target.value))}
                disabled={!editMode}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Процент жира"
                type="number"
                value={client.bodyFat.toFixed(2)}
                disabled
                size="small"
                InputProps={{
                  endAdornment: "%",
                }}
              />
            </Grid>

            
              <Grid item xs={12} sx={{ mt: 2 }}>
                <ColorButton
                  type="submit"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
                >
                  {isSubmitting ? "Сохранение..." : "Сохранить данные"}
                </ColorButton>
              </Grid>
            
          </Grid>
        </form>
      </StyledPaper>

      {/* Карточка клиента (превью) */}
      
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            Профиль клиента
          </Typography>

          <StyledCard>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  src={client.photo || undefined}
                  sx={{ width: 80, height: 80, mr: 3 }}
                />
                <Box>
                  <Typography variant="h4" component="div">
                    {client.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={`${client.age} лет`}
                      size="small"
                      icon={<Cake fontSize="small" />}
                    />
                    <Chip
                      label={client.gender === "Male" ? "Мужской" : "Женский"}
                      size="small"
                    />
                    <Chip
                      label={`${client.weight} кг / ${client.height} см`}
                      size="small"
                      color="primary"
                      icon={<Scale fontSize="small" />}
                    />
                  </Stack>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Контактная информация
                  </Typography>
                  <Typography>
                    <Phone fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
                    {client.phone}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Фитнес данные
                  </Typography>
                  <Typography>
                    <strong>Цель:</strong> {client.goal}
                  </Typography>
                  <Typography>
                    <strong>Активность:</strong> {client.activityLevel}
                  </Typography>
                  <Typography>
                    <strong>Процент жира:</strong> {client.bodyFat.toFixed(2)}%
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
                    Антропометрия
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      mt: 1,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption">Грудь</Typography>
                      <Typography variant="h6">{client.chest} см</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption">Талия</Typography>
                      <Typography variant="h6">{client.waist} см</Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="caption">Бедра</Typography>
                      <Typography variant="h6">{client.hips} см</Typography>
                    </Box>
                  </Box>
                </Grid>

                {client.injuries && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="text.secondary">
                      Ограничения
                    </Typography>
                    <Typography>{client.injuries}</Typography>
                  </Grid>
                )}

                {client.trainingHistory.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" color="text.secondary">
                      История тренировок
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {client.trainingHistory.map((item, index) => (
                        <Chip key={index} label={item} size="small" />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </StyledCard>
        </Box>
      
    </Box>
  );
};

export default ClientForm;