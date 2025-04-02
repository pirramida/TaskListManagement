import React, { useState } from "react";
import { Box, TextField, MenuItem, Slider, Typography, Button, Grid, Paper } from "@mui/material";

const CalcBZU = () => {
  const liseStile = [
    { label: 'Сидячий образ жизни', value: 1.2, minValue: 0.8, maxValue: 1.2, carbsMin: 3, carbsMax: 4},
    { label: 'Занимаюсь спортом 1-3 раза в неделю', value: 1.375, minValue: 1.2, maxValue: 1.8, carbsMin: 4, carbsMax: 5},
    { label: 'Тренировки 4-5 раз в неделю', value: 1.55, minValue: 1.5, maxValue: 2.2, carbsMin: 6, carbsMax: 7 },
    { label: 'Тренировки 6-7 раз в неделю', value: 1.725, minValue: 1.5, maxValue: 2.2, carbsMin: 8, carbsMax: 9 },
    { label: 'Тренировки дважды в день', value: 1.9, minValue: 1.5, maxValue: 2.2, carbsMin: 9, carbsMax: 10 },
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
    weightWant: '',
  });

  const [sliderValue, setSliderValue] = useState(0);
  const [calories, setCalories] = useState(0);
  const [macros, setMacros] = useState({
    proteins: 0,
    fatsMin: 0,
    fatsMax: 0,
    carbsMin: 0,
    carbsMax: 0,
    proteinNeedMin: 0,
    proteinNeedMax: 0,
    countSubtract3: 0,
    countSubtract2: 0,
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
    const { gender, age, height, weight, lifeStyle, weightWant } = formData;

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

    const lifeStyleFactor1 = liseStile.find((item) => item.label === lifeStyle)?.minValue || 1;
    const lifeStyleFactor2 = liseStile.find((item) => item.label === lifeStyle)?.maxValue || 1;

    const lifeStyleFactorCarbsMin = liseStile.find((item) => item.label === lifeStyle)?.carbsMin || 1;
    const lifeStyleFactorCarbsMax = liseStile.find((item) => item.label === lifeStyle)?.carbsMax || 1;

    const proteinNeedMin = Number(weight) * lifeStyleFactor1;
    const proteinNeedMax = Number(weight) * lifeStyleFactor2;


    const totalCalories = bmr * lifeStyleFactor;

    // Учитываем дефицит калорий по ползунку
    const adjustedCalories = totalCalories * (1 + sliderValue / 100); // Дефицит/профицит калорий

    setCalories(adjustedCalories);

    // Рассчитываем макронутриенты
    const proteins = adjustedCalories * 0.3 / 4; // 30% на белки (1 г белка = 4 ккал)
    const fatsMin = adjustedCalories * 0.2 / 9; // 30% на жиры (1 г жира = 9 ккал)
    const fatsMax = adjustedCalories * 0.35 / 9; // 30% на жиры (1 г жира = 9 ккал)

    const carbsMin = Number(weightWant) * lifeStyleFactorCarbsMin; // 40% на углеводы (1 г углеводов = 4 ккал)
    const carbsMax = Number(weightWant) * lifeStyleFactorCarbsMax; // 40% на углеводы (1 г углеводов = 4 ккал)


    const weightDifference = Number(weight) - Number(weightWant) >= 0 ? Number(weight) - Number(weightWant) : Number(weightWant) - Number(weight);
    // const weightDifference = Number(weight) - Number(weightWant);

    let countSubtract3 = 0; // Счётчик для вычитания 3
    let countSubtract2 = 0; // Счётчик для вычитания 2
    let currentDifference1 = weightDifference;
    let currentDifference2 = weightDifference;

    // Цикл вычитания 3
    while (currentDifference1 > 0) {
      currentDifference1 -= 3;
        countSubtract3++;
    }

    // Цикл вычитания 2
    while (currentDifference2 > 0) {
      currentDifference2 -= 2;
        countSubtract2++;
    }

    console.log(`Количество вычитаний 3: ${countSubtract3}`);
    console.log(`Количество вычитаний 2: ${countSubtract2}`);
    // console.log(`Остаток: ${currentDifference}`);

    setMacros({
      proteins: Number(proteins.toFixed(2)),
      fatsMin: Number(fatsMin.toFixed(2)),
      fatsMax: Number(fatsMax.toFixed(2)),
      carbsMin: Number(carbsMin.toFixed(2)),
      carbsMax: Number(carbsMax.toFixed(2)),

      proteinNeedMin: Number(proteinNeedMin.toFixed(2)),
      proteinNeedMax: Number(proteinNeedMax.toFixed(2)),
      countSubtract3: Number(countSubtract3.toFixed(2)),
      countSubtract2: Number(countSubtract2.toFixed(2))
    });
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 3,
      maxWidth: 800,
      mx: 'auto',
      p: 3
    }}>
      {/* Заголовок формы */}
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, marginBottom: '2px'}}>
        Калькулятор питания и веса
      </Typography>
  
      {/* Блок выбора пола и образа жизни */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2,
        width: '100%'
      }}>
        <TextField
          select
          label="Пол"
          fullWidth
          value={formData.gender}
          onChange={(e) => handleMulti('gender', e.target.value)}
          sx={{ flex: 1 }}
        >
          {genderList.map((humen) => (
            <MenuItem key={humen.label} value={humen.value}>
              {humen.label}
            </MenuItem>
          ))}
        </TextField>
        
        <TextField
          select
          label="Образ жизни"
          fullWidth
          value={formData.lifeStyle}
          onChange={(e) => handleMulti('lifeStyle', e.target.value)}
          sx={{ flex: 1 }}
        >
          {liseStile.map((life) => (
            <MenuItem key={life.label} value={life.label}>
              {life.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
  
      {/* Блок числовых параметров */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        width: '100%'
      }}>
        <TextField
          label="Возраст"
          type="number"
          fullWidth
          value={formData.age}
          onChange={(e) => handleMulti('age', e.target.value)}
        />
        <TextField
          label="Рост (см)"
          type="number"
          fullWidth
          value={formData.height}
          onChange={(e) => handleMulti('height', e.target.value)}
        />
        <TextField
          label="Вес (кг)"
          type="number"
          fullWidth
          value={formData.weight}
          onChange={(e) => handleMulti('weight', e.target.value)}
        />
        <TextField
          label="Желаемый вес (кг)"
          type="number"
          fullWidth
          value={formData.weightWant}
          onChange={(e) => handleMulti('weightWant', e.target.value)}
        />
      </Box>
  
      {/* Ползунок дефицита калорий */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Дефицит калорий
        </Typography>
        <Slider
          value={sliderValue}
          min={-25}
          max={25}
          step={5}
          onChange={handleChangeSlider}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `${value}%`}
          sx={{ width: '90%', mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          Текущее значение: {sliderValue}%
        </Typography>
      </Box>
  
      {/* Кнопка расчета */}
      <Button 
        variant="contained" 
        size="large" 
        onClick={calculateBMR}
        sx={{
          width: { xs: '100%', sm: 'auto' },
          px: 4,
          py: 1.5,
          fontSize: 16,
          fontWeight: 'bold'
        }}
      >
        Рассчитать
      </Button>
  
      {/* Блок результатов */}
      {calories > 0 && (
        <Box sx={{ 
          width: '100%',
          p: 3,
          padding: '0px',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1,
          mt: 2
        }}>
          {/* Заголовок с декоративным акцентом */}
          <Box sx={{ 
            textAlign: 'center',
            mb: 3,
            padding: '0px important!',
            position: 'relative',
            '&:after': {
              content: '""',
              display: 'block',
              width: 60,
              height: 4,
              backgroundColor: 'primary.main',
              mx: 'auto',
              mt: 1,
              borderRadius: 2
            }
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              color: 'text.primary',
              letterSpacing: 0.5
            }}>
              Ваши результаты
            </Typography>
          </Box>
        
          {/* Список результатов в карточках */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 2
          }}>
            {/* Карточка калорий */}
            <Paper elevation={0} sx={{ 
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(63, 81, 181, 0.05)'
            }}>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                fontSize: 12
              }}>
                Калории
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {calories.toFixed(0)} <span style={{ fontSize: 14, fontWeight: 400 }}>ккал</span>
              </Typography>
            </Paper>
        
            {/* Карточка белков */}
            <Paper elevation={0} sx={{ 
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(76, 175, 80, 0.05)'
            }}>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                fontSize: 12
              }}>
                Белки
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {macros.proteinNeedMin}-{macros.proteinNeedMax} <span style={{ fontSize: 14, fontWeight: 400 }}>г</span>
              </Typography>
            </Paper>
        
            {/* Карточка жиров */}
            <Paper elevation={0} sx={{ 
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 193, 7, 0.05)'
            }}>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                fontSize: 12
              }}>
                Жиры
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {macros.fatsMin}-{macros.fatsMax} <span style={{ fontSize: 14, fontWeight: 400 }}>г</span>
              </Typography>
            </Paper>
        
            {/* Карточка углеводов */}
            <Paper elevation={0} sx={{ 
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(233, 30, 99, 0.05)'
            }}>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                mb: 0.5,
                fontSize: 12
              }}>
                Углеводы
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {macros.carbsMin}-{macros.carbsMax} <span style={{ fontSize: 14, fontWeight: 400 }}>г</span>
              </Typography>
            </Paper>
          </Box>
        
          {/* Блок времени с иконкой */}
          <Paper elevation={0} sx={{ 
            p: 2,
            borderRadius: 2,
            backgroundColor: 'rgba(158, 158, 158, 0.05)',
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box>
              <Typography variant="subtitle2" sx={{ 
                color: 'text.secondary',
                fontSize: 12
              }}>
                До желаемого веса
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {formData.weightWant} кг · {macros.countSubtract3}-{macros.countSubtract2} месяцев
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default CalcBZU;
