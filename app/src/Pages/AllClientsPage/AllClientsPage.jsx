import React, { useEffect, useState, useMemo, useCallback } from "react";
import { fetchWithRetry } from "../../utils/refreshToken";
import { addToast, useSnackbarContext } from "../../utils/addToast";
import CardClient from "../../components/CardClient";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconButton, Menu, MenuItem } from '@mui/material';

import {
    Card,
    CardContent,
    Typography,
    Avatar,
    Chip,
    Divider,
    Grid,
    Box,
    TextField,
    InputAdornment,
    Paper,
    Container, Dialog, DialogContent, DialogTitle, Button,
    DialogActions
} from '@mui/material';
import {
    FitnessCenter,
    Phone,
    Person,
    Search,
    Straighten,
    MonitorWeight,
    Male,
    Female,
    AccessTime,
    FilterAlt,
    WarningAmber
} from '@mui/icons-material';

const AllClientsPage = ({ user }) => {
    const [clients, setClients] = useState([]);
    const [filterUser, setFilterUser] = useState('');
    const [filterPhone, setFilterPhone] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { addSnackBar } = useSnackbarContext();
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuClientId, setMenuClientId] = useState(null);
    const [action, setAction] = useState('');

    const handleMenuOpen = useCallback((event, clientId) => {
        setAnchorEl(event.currentTarget);
        setMenuClientId(clientId);
    }, []);

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuClientId(null);

        // 🔽 Уводим фокус на body или любую безопасную зону
        setTimeout(() => {
            if (document.activeElement && document.activeElement.tagName === 'LI') {
                (document.activeElement).blur();
            }
        }, 0);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetchWithRetry('/clients', 'GET');
            setClients(response);
        } catch (error) {
            addToast('allClientsError1', 'error', 'Ошибка в получении данных клиентов с сервера', 1000);
        }
    };

    const getActivityColor = (activity) => {
        switch (activity) {
            case 'Низкий': return 'error';
            case 'Средний': return 'warning';
            case 'Высокий': return 'success';
            default: return 'info';
        }
    };

    const filteredData = useMemo(() => {
        const lowerFilterUser = filterUser.toLowerCase();
        return clients.filter(client =>
            client.name.toLowerCase().includes(lowerFilterUser) &&
            client.phone.includes(filterPhone)
        );
    }, [clients, filterUser, filterPhone]);

    const onAddPayment = useCallback(() => {
        handleMenuClose();
        setAction('payAdd');
    }, [handleMenuClose]);

    const onWriteOff = useCallback(() => {
        handleMenuClose();
        setAction('writeOff');
    }, [handleMenuClose]);

    const onDelete = useCallback(() => {
        handleMenuClose();
        setAction('delete');
    }, [handleMenuClose]);


    const onClientClick = useCallback((client) => {
        setSelectedClient(client);
        setIsDialogOpen(true);
    }, []);

    return (
        <>
            <Container maxWidth="xl" sx={{ py: 4 }}>
                {/* Заголовок и фильтры */}
                <Box sx={{ mb: 4 }}>

                    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    placeholder="Поиск по имени"
                                    value={filterUser}
                                    onChange={(e) => setFilterUser(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    placeholder="Поиск по телефону"
                                    value={filterPhone}
                                    onChange={(e) => setFilterPhone(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FilterAlt color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    variant="outlined"
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Chip
                                    label={`Всего: ${filteredData.length}`}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ width: '100%', fontWeight: 600 }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* Карточки клиентов */}
                {filteredData.length > 0 ? (
                    <Grid container spacing={3}>
                        {filteredData.map((client, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={client.id}>

                                <Card sx={{
                                    position: 'relative',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: 3,
                                    boxShadow: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        cursor: 'pointer',
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 10px 20px rgba(0,0,0,0.15)'
                                    },
                                    border:
                                        (!client.sessionQueue || client.sessionQueue === '[]') && '2px solid rgba(248, 149, 0, 0.76)'

                                }}
                                    onContextMenu={(event) => {
                                        event.preventDefault(); // отменяет стандартное контекстное меню
                                        handleMenuOpen(event, client.id); // открывает наше меню
                                    }}
                                    onClick={() => onClientClick(client)}
                                >
                                    {/* Шапка карточки */}
                                    <Box
                                        sx={{
                                            cursor: 'pointer',
                                            bgcolor: client.gender === 'Male' ? 'primary.light' : 'secondary.light',
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            borderTopLeftRadius: 12,
                                            borderTopRightRadius: 12,
                                            background: client.gender === 'Male'
                                                ? 'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)'
                                                : 'linear-gradient(135deg, #6a1b9a 0%, #6a1b9a 100%)'
                                        }}

                                    >

                                        <Avatar sx={{
                                            width: 56,
                                            height: 56,
                                            mr: 2,
                                            bgcolor: 'background.paper',
                                            color: client.gender === 'Male' ? 'primary.dark' : 'secondary.dark',
                                            fontWeight: 700,
                                            fontSize: '1.5rem'
                                        }}>
                                            {client.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6" component="div" sx={{
                                                fontWeight: 'bold',
                                                color: 'common.white'
                                            }}>
                                                {client.name.split(' ')[0]} {client.name.split(' ')[1]}
                                            </Typography>
                                            <Typography variant="body2" sx={{
                                                color: 'common.white',
                                                opacity: 0.9
                                            }}>
                                                {client.age} лет {' '}
                                                {(!client.sessionQueue || client.sessionQueue === '[]') && (
                                                    <Chip
                                                        color="warning"
                                                        icon={<WarningAmber fontSize="small" style={{ marginLeft: '5px' }} />}
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ marginLeft: 'auto' }}>
                                            <IconButton
                                                size="small"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleMenuOpen(event, client.id);
                                                }}
                                                sx={{ color: 'white' }}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>

                                            <Menu
                                                anchorEl={anchorEl}
                                                open={Boolean(anchorEl) && menuClientId === client.id}
                                                onClose={handleMenuClose}
                                                anchorOrigin={{
                                                    vertical: 'bottom',
                                                    horizontal: 'right',
                                                }}
                                                transformOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'right',
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <MenuItem onClick={() => {
                                                    onAddPayment();
                                                    setSelectedClient(client);
                                                }}>Добавить оплату</MenuItem>

                                                <MenuItem onClick={() => {
                                                    onWriteOff();
                                                    setSelectedClient(client);
                                                }}>Списать тренировку</MenuItem>

                                                <MenuItem onClick={() => {
                                                    onDelete();
                                                    setSelectedClient(client);
                                                }} sx={{ color: 'error.main' }}>Удалить</MenuItem>

                                            </Menu>
                                        </Box>
                                    </Box>

                                    <CardContent sx={{ flexGrow: 1 }}>
                                        {/* Основные метрики */}
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mb: 2,
                                            flexWrap: 'wrap',
                                            gap: 1
                                        }}>
                                            <Chip
                                                icon={<Straighten fontSize="small" />}
                                                label={`${client.height} см`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                            <Chip
                                                icon={<MonitorWeight fontSize="small" />}
                                                label={`${client.weight} кг`}
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                            <Chip
                                                icon={client.gender === 'Male' ?
                                                    <Male fontSize="small" /> :
                                                    <Female fontSize="small" />}
                                                label={client.gender === 'Male' ? 'Муж' : 'Жен'}
                                                color={client.gender === 'Male' ? 'primary' : 'secondary'}
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </Box>

                                        {/* Цель и активность */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                mb: 1,
                                                fontWeight: 500
                                            }}>
                                                <FitnessCenter sx={{ mr: 1, fontSize: 18 }} />
                                                <strong>Цель:</strong> {client.goal}
                                            </Typography>
                                            <Chip
                                                label={`Активность: ${client.activityLevel}`}
                                                color={getActivityColor(client.activityLevel)}
                                                size="small"
                                                sx={{ width: '100%', fontWeight: 600 }}
                                            />
                                        </Box>

                                        <Divider sx={{ my: 1 }} />

                                        {/* Контакты */}
                                        <Typography variant="body2" sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 1,
                                            fontWeight: 500
                                        }}>
                                            <Phone sx={{ mr: 1, fontSize: 18 }} />
                                            {client.phone.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4')}
                                        </Typography>

                                        {/* Дополнительная информация */}
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: '0.75rem'
                                            }}>
                                                <AccessTime sx={{ mr: 1, fontSize: 16 }} />
                                                Зарегистрирован: {new Date(client.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Paper elevation={0} sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        bgcolor: 'background.default'
                    }}>
                        <Typography variant="h6" color="text.secondary">
                            Клиенты не найдены. Измените параметры поиска.
                        </Typography>
                    </Paper>
                )}
            </Container>
            {selectedClient !== null &&
                <>
                    <CardClient setAction={setAction} action={action} client={selectedClient} setSelectedClient={setSelectedClient} open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fetchWithRetry={fetchWithRetry} addToast={addToast} addSnackBar={addSnackBar} fetchData={fetchData} />
                </>
            }
        </>
    );
};

export default AllClientsPage;