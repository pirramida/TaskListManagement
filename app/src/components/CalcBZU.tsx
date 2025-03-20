import React, { useState } from "react";
import { Box, TextField, MenuItem, Slider, Typography, Button } from "@mui/material";

const CalcBZU = () => {
  const liseStile = [
    { label: 'Сидячий образ жизни', value: 1.2 },
    { label: 'Занимаюсь спортом 1-3 раза в неделю', value: 1.375 },
    { label: 'Тренировки 4-5 раз в неделю', value: 1.55 },
    { label: 'Тренировки 6-7 раз в неделю', value: 1.725 },
    { label: 'Тренировки дважды в день', value: 1.9 },
  ];

  const genderList = [
    { label: 'Женщина', value: 1 },
    { label: 'Мужчина', value: 0 },
  ];

  const [formData, setFormData] = useState({
    gender: 0,
    lifeStyle: '',
    age: '',
    height: '',
    weight: '',
  });

  const [sliderValue, setSliderValue] = useState(0);
  const [calories, setCalories] = useState(0);
  const [macros, setMacros] = useState({
    proteins: 0,
    fats: 0,
    carbs: 0,
  });

  const handleMulti = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChangeSlider = (event: Event, newValue: number | number[]) => {
    setSliderValue(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  const calculateBMR = () => {
    const { gender, age, height, weight, lifeStyle } = formData;

    if (!age || !height || !weight || !lifeStyle) return; // Не вычисляем, если данные неполные

    let bmr = 0;

    // Формула для расчета BMR
    if (gender === 0) { // Мужчина
      bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) + 5;
    } else { // Женщина
      bmr = (10 * Number(weight)) + (6.25 * Number(height)) - (5 * Number(age)) - 161;
    }

    // Учитываем коэффициент образа жизни
    const lifeStyleFactor = liseStile.find((item) => item.label === lifeStyle)?.value || 1;
    const totalCalories = bmr * lifeStyleFactor;

    // Учитываем дефицит калорий по ползунку
    const adjustedCalories = totalCalories * (1 + sliderValue / 100); // Дефицит/профицит калорий

    setCalories(adjustedCalories);

    // Рассчитываем макронутриенты
    const proteins = adjustedCalories * 0.3 / 4; // 30% на белки (1 г белка = 4 ккал)
    const fats = adjustedCalories * 0.3 / 9; // 30% на жиры (1 г жира = 9 ккал)
    const carbs = adjustedCalories * 0.4 / 4; // 40% на углеводы (1 г углеводов = 4 ккал)

    setMacros({
      proteins: Number(proteins.toFixed(2)),
      fats: Number(fats.toFixed(2)),
      carbs: Number(carbs.toFixed(2)),
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Выбор пола и образа жизни */}
      <Box sx={{ display: 'flex' }}>
        <TextField
          sx={{ marginTop: '20px' }}
          select
          label="Выберите пол"
          fullWidth
          value={formData.gender}
          onChange={(e) => handleMulti('gender', e.target.value)}
        >
          {genderList.map((humen) => (
            <MenuItem key={humen.label} value={humen.value}>
              {humen.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          sx={{ marginTop: '20px' }}
          select
          label="Выберите образ жизни"
          fullWidth
          value={formData.lifeStyle}
          onChange={(e) => handleMulti('lifeStyle', e.target.value)}
        >
          {liseStile.map((life) => (
            <MenuItem key={life.label} value={life.label}>
              {life.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Ввод возраста, роста и веса */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <TextField
          label="Ваш возраст"
          type="number"
          fullWidth
          value={formData.age}
          onChange={(e) => handleMulti('age', e.target.value)}
        />
        <TextField
          label="Ваш рост (см)"
          type="number"
          fullWidth
          value={formData.height}
          onChange={(e) => handleMulti('height', e.target.value)}
        />
        <TextField
          label="Ваш вес (кг)"
          type="number"
          fullWidth
          value={formData.weight}
          onChange={(e) => handleMulti('weight', e.target.value)}
        />
      </Box>

      {/* Ползунок */}
      <Box
        sx={{
          width: 250,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: 2,
          alignContent: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '10px' }}>
          Дефицит калорий
        </Typography>
        <Slider
          value={sliderValue}
          min={-10}
          max={25}
          step={5}
          onChange={handleChangeSlider}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => value}
          sx={{ width: '100%', marginBottom: '10px' }}
        />
        <Typography variant="body1" sx={{ fontSize: '14px' }}>
          Значение: {sliderValue}%
        </Typography>
      </Box>

      {/* Кнопка для расчета */}
      <Button variant="contained" color="primary" onClick={calculateBMR}>
        Рассчитать
      </Button>

      {/* Результаты */}
      {calories > 0 && (
        <Box sx={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px', boxShadow: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '15px' }}>
            Результаты расчета
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Калории: <span style={{ fontWeight: 'normal' }}>{calories.toFixed(2)} ккал</span>
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Белки: <span style={{ fontWeight: 'normal' }}>{macros.proteins} г</span>
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Жиры: <span style={{ fontWeight: 'normal' }}>{macros.fats} г</span>
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                Углеводы: <span style={{ fontWeight: 'normal' }}>{macros.carbs} г</span>
            </Typography>
            </Box>
        </Box>
        )}
    </Box>
  );
};

export default CalcBZU;
