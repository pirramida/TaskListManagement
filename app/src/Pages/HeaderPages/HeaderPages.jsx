import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip
} from "@mui/material";
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { styled } from '@mui/material/styles';
import { fetchWithRetry } from "../../utils/refreshToken";

// Стильная цветовая палитра
const colors = {
  primary: '#6a1b9a',       // Фиолетовый
  secondary: '#00acc1',     // Бирюзовый
  accent: '#ffab00',        // Желтый акцент
  light: '#ffffff',         // Белый
  dark: '#1a237e'           // Темно-синий
};

const CoolAppBar = styled(AppBar)({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
});

const MainButton = styled(Button)({
  color: colors.light,
  fontWeight: 600,
  padding: '8px 20px',
  borderRadius: '20px',
  margin: '0 4px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
});

const ActionButton = styled(Button)({
  color: colors.dark,
  fontWeight: 700,
  padding: '10px 24px',
  borderRadius: '20px',
  background: colors.accent,
  boxShadow: '0 2px 10px rgba(255, 171, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 15px rgba(255, 171, 0, 0.4)',
    background: '#ff8f00'
  },
});

const HeaderPages = () => {
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [moreMenuAnchor, setMoreMenuAnchor] = useState(null);

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = async () => {
    const response = await fetchWithRetry('/users/refresh-events', 'GET');
    console.log('responseresponseresponseresponse', response);
    setMobileMenuAnchor(null);
    setMoreMenuAnchor(null);
  };

  return (
    <CoolAppBar position="sticky">
      <Toolbar sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '80px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        px: { xs: 2, sm: 4 }
      }}>
        {/* Лого и название */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              mr: 2,
              bgcolor: colors.accent,
              color: colors.dark,
              width: 44,
              height: 44
            }}
          >
            <FitnessCenterIcon />
          </Avatar>

          <Typography
            variant="h5"
            component="div"
            sx={{
              color: colors.light,
              fontWeight: 800,
              letterSpacing: '1px',
              fontFamily: '"Bangers", cursive',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            ЮлькоФит
          </Typography>
        </Box>

        {/* Основные кнопки (видно на десктопе) */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center'
        }}>
          <MainButton component={Link} to="/MainPage">
            Главная
          </MainButton>
          <MainButton component={Link} to="/allClients">
            БандЮли
            <Chip
              label="24"
              size="small"
              sx={{
                ml: 1,
                color: colors.light,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '0.75rem'
              }}
            />
          </MainButton>
          <MainButton component={Link} to="/trainingCalendar">
            Настройки
          </MainButton>
          <MainButton component={Link} to="/payPage">
            Оплата
          </MainButton>
        </Box>

        {/* Кнопки действий и меню */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ActionButton
            component={Link}
            to="/addClient"
            sx={{
              display: { xs: 'none', sm: 'flex' },
              mr: 2
            }}
          >
            + Новый
          </ActionButton>

          {/* Кнопка дополнительного меню */}
          <IconButton
            color="inherit"
            onClick={handleMoreMenuOpen}
            sx={{
              display: { xs: 'none', md: 'flex' },
              ml: 1
            }}
          >
            <MoreVertIcon />
          </IconButton>

          {/* Кнопка мобильного меню */}
          <IconButton
            color="inherit"
            edge="end"
            onClick={handleMobileMenuOpen}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <ActionButton
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/';
            }}
            sx={{
              display: { xs: 'none', sm: 'flex' },
              ml: 2,
              backgroundColor: '#ef5350',
              color: 'white',
              '&:hover': {
                backgroundColor: '#d32f2f'
              }
            }}
          >
            Выйти
          </ActionButton>
        </Box>

        {/* Мобильное меню */}
        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 5,
              minWidth: 200,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
              color: colors.light
            }
          }}
        >
          <MenuItem
            component={Link}
            to="/MainPage"
            onClick={handleMenuClose}
            sx={{ fontWeight: 600 }}
          >
            Главная
          </MenuItem>
          <MenuItem
            component={Link}
            to="/allClients"
            onClick={handleMenuClose}
            sx={{ fontWeight: 600 }}
          >
            БандЮли
            <Chip
              label="24"
              size="small"
              sx={{
                ml: 1,
                color: colors.light,
                bgcolor: 'rgba(255,255,255,0.2)'
              }}
            />
          </MenuItem>
          <MenuItem
            component={Link}
            to="/trainingCalendar"
            onClick={handleMenuClose}
            sx={{ fontWeight: 600 }}
          >
            График тренировок
          </MenuItem>
          <MenuItem
            component={Link}
            to="/calculators"
            onClick={handleMenuClose}
            sx={{ fontWeight: 600 }}
          >
            Калькуляторы
          </MenuItem>
          <MenuItem
            component={Link}
            to="/calories"
            onClick={handleMenuClose}
            sx={{ fontWeight: 600 }}
          >
            Калории
          </MenuItem>
          <MenuItem
            component={Link}
            to="/addClient"
            onClick={handleMenuClose}
            sx={{
              fontWeight: 700,
              color: colors.dark,
              background: colors.accent,
              mt: 1,
              borderRadius: '8px',
              '&:hover': {
                background: '#ff8f00'
              }
            }}
          >
            + Новый клиент
          </MenuItem>
        </Menu>

        {/* Дополнительное меню */}
        <Menu
          anchorEl={moreMenuAnchor}
          open={Boolean(moreMenuAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              mt: 5,
              minWidth: 180,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
              color: colors.light
            }
          }}
        >
          <MenuItem
            component={Link}
            to="/calculators"
            onClick={handleMenuClose}
          >
            Калькуляторы
          </MenuItem>
          <MenuItem
            component={Link}
            to="/calories"
            onClick={handleMenuClose}
          >
            Калории
          </MenuItem>
          <MenuItem
            component={Link}
            to="/settings"
            onClick={handleMenuClose}
          >
            Настройки
          </MenuItem>
        </Menu>
      </Toolbar>
    </CoolAppBar>
  );
};

export default HeaderPages;