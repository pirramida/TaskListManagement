import React from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import HPStyles from './HeaderPages.module.css'

const HeaderPages = () => {
  return (
    <AppBar 
      position="sticky" 
      sx={{
        backgroundColor: 'black',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)', // Тень для более современного вида
        transition: 'background-color 0.3s', // Плавный переход для фона
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
          Персональный фитнес-тренер
        </Typography>
        <Button
          component={Link}
          to="/main"
          className={HPStyles.customButton}
        >
          Главная страница
        </Button>
        <Button
          component={Link}
          to="/allClients"
          className={HPStyles.customButton}

        >
          Юлькина клиентура
        </Button>
        <Button
          component={Link}
          to="/trainingCalendar"
          className={HPStyles.customButton}

        >
          Календарь Тренировок
        </Button>
        <Button
          component={Link}
          to="/calculators"
          className={HPStyles.customButton}

        >
          Калькуляторы
        </Button>
        <Button
          component={Link}
          to="/calories"
          sx={{
            color: 'white',
            backgroundColor: '#ff4081',
            padding: '8px 16px',
            borderRadius: '30px',
            '&:hover': {
              backgroundColor: '#f50057',
            },
            transition: 'background-color 0.3s', 
          }}
        >
          Проверка колорий
        </Button>
        <Button
          component={Link}
          to="/addClient"
          sx={{
            color: 'white',
            backgroundColor: '#ff4081',
            padding: '8px 16px',
            borderRadius: '30px',
            '&:hover': {
              backgroundColor: '#f50057',
            },
            transition: 'background-color 0.3s', 
          }}
        >
          Добавление челика
        </Button>
        
      </Toolbar>
    </AppBar>
  );
};

export default HeaderPages;
