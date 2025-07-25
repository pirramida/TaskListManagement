import React, { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';
import { TextField, Button, Typography, Paper, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { fetchWithRetry } from '../../utils/refreshToken';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ setUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const login = async () => {
        try {
            const response = await fetchWithRetry('/auth/login', 'POST', {
                username,
                password,
            });
            response.user.googleCalendar = '';
            response.user.phone = '';

            if (response.user) {
                setUser(response.user);
                localStorage.setItem('user', JSON.stringify(response.user));
                navigate('/MainPage');
            }
            localStorage.setItem('refresh_token', response.user.refresh_token);
            navigate('/MainPage');

        } catch (err) {
            alert('Ошибка входа');
        }
    };

    const register = async () => {
        try {
            await fetchWithRetry('/auth/register', 'POST', {
                username,
                password,
            });
            alert('Регистрация успешна! Теперь войдите.');
            setIsLogin(true);
        } catch (err) {
            alert('Ошибка регистрации');
        }
    };

    return (
        <div className="login-container">
            <div className="left-panel">
                <div className="circle top-right"></div>
                <div className="circle bottom-left"></div>
                <div className="left-content">
                    <h1 className="title">YouFit</h1>
                    <h2 className="subtitle">
                    </h2>
                    <div className="icon-wrapper">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                            <path d="M19.4 15...Z" />
                            <path d="M4.6 15...Z" />
                        </svg>
                    </div>
                    <p className="quote">"Здоровье - это главное богатство!"</p>
                </div>
            </div>

            <div className="right-panel">
                <Paper elevation={6} className="form-paper">
                    <ToggleButtonGroup
                        value={isLogin ? 'login' : 'register'}
                        exclusive
                        onChange={(e, value) => {
                            if (value !== null) setIsLogin(value === 'login');
                        }}
                        className="toggle-buttons"
                        fullWidth
                    >
                        <ToggleButton value="login">Вход</ToggleButton>
                        <ToggleButton value="register">Регистрация</ToggleButton>
                    </ToggleButtonGroup>

                    <Typography variant="h4" className="form-title">
                        {isLogin ? 'Вход' : 'Регистрация'}
                    </Typography>

                    <TextField
                        label="Имя пользователя"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Пароль"
                        type="password"
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        fullWidth
                        className="submit-button"
                        onClick={isLogin ? login : register}
                    >
                        {isLogin ? 'Войти' : 'Зарегистрироваться'}
                    </Button>
                </Paper>
            </div>
        </div>
    );
};

export default LoginPage;
