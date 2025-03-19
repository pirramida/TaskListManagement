import React, { useState, useEffect } from "react";
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Typography, Grid, Paper } from "@mui/material";

// Интерфейс для клиента
interface Client {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  photo: string | null;
  goal: string;
  activityLevel: string;
  injuries: string;
  trainingHistory: string[];
  weight: number;
  height: number;
  chest: number;
  waist: number;
  hips: number;
  bodyFat: number;
  progress: string[];
}

const ClientForm: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState("Male");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [injuries, setInjuries] = useState("");
  const [trainingHistory, setTrainingHistory] = useState<string[]>([]);
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [chest, setChest] = useState(0);
  const [waist, setWaist] = useState(0);
  const [hips, setHips] = useState(0);
  const [bodyFat, setBodyFat] = useState(0);
  const [progress, setProgress] = useState<string[]>([]);

  // Функция для расчета процента жира в теле
  const calculateBodyFat = (weight: number, age: number, gender: string): number => {
    if (gender === "Male") {
      return 0.415 * weight + 0.10 * age - 10.8 * 1 - 6.8;
    } else {
      return 0.515 * weight + 0.16 * age - 9.4 * 0 - 4.7;
    }
  };

  // Используем useEffect для пересчета процента жира при изменении веса, возраста или пола
  useEffect(() => {
    if (weight > 0 && age > 0) {
      const calculatedBodyFat = calculateBodyFat(weight, age, gender);
      setBodyFat(calculatedBodyFat);
    }
  }, [weight, age, gender]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newClient = {
      id: clients.length + 1,
      name,
      age,
      gender,
      phone,
      email,
      photo,
      goal,
      activityLevel,
      injuries,
      trainingHistory,
      weight,
      height,
      chest,
      waist,
      hips,
      bodyFat,
      progress,
    };

    setClients([...clients, newClient]);
    // Очистить форму после добавления клиента
    setName("");
    setAge(0);
    setGender("Male");
    setPhone("");
    setEmail("");
    setPhoto(null);
    setGoal("");
    setActivityLevel("");
    setInjuries("");
    setTrainingHistory([]);
    setWeight(0);
    setHeight(0);
    setChest(0);
    setWaist(0);
    setHips(0);
    setBodyFat(0);
    setProgress([]);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" gutterBottom>
          Добавить нового клиента
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Возраст"
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Пол</InputLabel>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  label="Пол"
                >
                  <MenuItem value="Male">Мужской</MenuItem>
                  <MenuItem value="Female">Женский</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(URL.createObjectURL(e.target.files![0]))}
              />
              {photo && <img src={photo} alt="Client" style={{ width: "100px", marginTop: "10px" }} />}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Цель клиента"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Уровень физической активности"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Желания/ограничения (например, травмы)"
                multiline
                rows={3}
                value={injuries}
                onChange={(e) => setInjuries(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="История тренировок"
                multiline
                rows={3}
                value={trainingHistory.join(", ")}
                onChange={(e) => setTrainingHistory(e.target.value.split(","))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Вес (кг)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Рост (см)"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Объем груди (см)"
                type="number"
                value={chest}
                onChange={(e) => setChest(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Объем талии (см)"
                type="number"
                value={waist}
                onChange={(e) => setWaist(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Объем бедра (см)"
                type="number"
                value={hips}
                onChange={(e) => setHips(Number(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Процент жира в теле"
                type="number"
                value={bodyFat}
                onChange={(e) => setBodyFat(Number(e.target.value))}
                disabled
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                Добавить клиента
              </Button>
            </Grid>
          </Grid>
        </form>

        <Typography variant="h6" gutterBottom sx={{ marginTop: 4 }}>
          Список клиентов
        </Typography>
        <Grid container spacing={2}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} md={4} key={client.id}>
              <Paper sx={{ padding: 2 }}>
                <Typography variant="h6">{client.name} ({client.age} лет)</Typography>
                <Typography>Цель: {client.goal}</Typography>
                <Typography>Уровень активности: {client.activityLevel}</Typography>
                <Typography>Вес: {client.weight} кг | Рост: {client.height} см</Typography>
                <Typography>Объемы: Грудь - {client.chest} см | Талия - {client.waist} см | Бедра - {client.hips} см</Typography>
                <Typography>Процент жира: {client.bodyFat.toFixed(2)}%</Typography>
                <Typography>Прогресс: {client.progress.join(", ")}</Typography>
                <Typography>История тренировок: {client.trainingHistory.join(", ")}</Typography>
                {client.photo && <img src={client.photo} alt="Client" style={{ width: "100px", marginTop: "10px" }} />}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default ClientForm;
