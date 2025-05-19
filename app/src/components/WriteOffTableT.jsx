import React, { useState, useEffect } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button,
    Box, Tooltip, Dialog, DialogTitle, DialogContent, Typography, Stack, DialogActions
} from '@mui/material';
import { fetchWithRetry } from '../utils/refreshToken';

const WriteOffTable = ({ filters }) => {
    const [writeOff, setWriteOff] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [clientId, setClientId] = useState(null);

    // Загружаем списания при монтировании
    useEffect(() => {
        fetchData();
    }, []);

    // При изменении фильтра — ищем клиента
    useEffect(() => {
        if (filters.clientName) {
            fetchClientIdByName(filters.clientName);
        } else {
            setClientId(null);
        }
    }, [filters.clientName]);

    const fetchClientIdByName = async (name) => {
        try {
            const response = await fetchWithRetry('/clients', 'GET');
            const client = response.find(c => c.name === name);
            if (client) {
                setClientId(client.id);
            } else {
                setClientId(null);
                console.warn('Клиент с таким именем не найден');
            }
        } catch (error) {
            console.error('Ошибка при загрузке клиентов:', error);
        }
    };

    const fetchData = async () => {
        try {
            const response = await fetchWithRetry('/session_history', 'GET');
            setWriteOff(response.reverse());
        } catch (error) {
            console.error('Произошла ошибка при получении списаний');
        }
    };

    const handleOpenDialog = (event) => {
        try {
            const parsedReport = JSON.parse(event.report);
            setSelectedReport(parsedReport);
            setOpenDialog(true);
        } catch (err) {
            console.error('Ошибка парсинга отчета:', err.message);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedReport(null);
    };

    return (
        <>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ background: 'linear-gradient(90deg, #f6f6f6 0%, #f9f9f9 100%)' }}>
                                <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Имя</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Событие</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Отчет</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {writeOff
                                .filter(event => !clientId || event.clientId === clientId)
                                .map((event, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>
                                            <Tooltip title={event.time}>
                                                <span>{event.date}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{event.name}</TableCell>
                                        <TableCell>{event.action}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(event)}
                                                sx={{
                                                    textTransform: 'none',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    '&:hover': {
                                                        backgroundColor: '#f0f7ff',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                                                    }
                                                }}
                                            >
                                                Отчет
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{
                    bgcolor: '#f5f5f5',
                    borderBottom: '1px solid #e0e0e0',
                    fontWeight: 600
                }}>
                    Отчет о списании
                </DialogTitle>

                <DialogContent dividers sx={{ py: 2 }}>
                    {selectedReport ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {selectedReport.type === 'simple' && (
                                <>
                                    <InfoItem label="Списание без отчета" highlight />
                                    <InfoItem label="Клиент" value={selectedReport.clientName} />
                                    <InfoItem label="Комментарий" value={selectedReport.writeoffComment || 'не указан'} />
                                </>
                            )}

                            {selectedReport.type === 'completed' && (
                                <>
                                    <InfoItem label="Списание по причине проведения тренировки" highlight />
                                    <InfoItem label="Клиент" value={selectedReport.clientName} />
                                    <InfoItem label="Состояние до" value={selectedReport.conditionBefore || '—'} />
                                    <InfoItem label="Состояние после" value={selectedReport.conditionAfter || '—'} />
                                    <InfoItem label="Интенсивность" value={selectedReport.intensity || '—'} />
                                    <InfoItem label="Оценка" value={selectedReport.rating || '—'} />
                                    <InfoItem label="Комментарий" value={selectedReport.comment || '—'} />
                                </>
                            )}

                            {selectedReport.type === 'missed' && (
                                <>
                                    <InfoItem label="Списание по причине пропуска" highlight />
                                    <InfoItem label="Клиент" value={selectedReport.clientName} />
                                    <InfoItem label="Причина" value={selectedReport.reason || '—'} />
                                    <InfoItem
                                        label="Тренировка списана"
                                        value={selectedReport.action === 'writeoff' ? 'Да' : 'Нет'}
                                        color={selectedReport.action === 'writeoff' ? 'green' : 'red'}
                                    />
                                </>
                            )}
                        </Box>
                    ) : (
                        <Typography color="text.secondary" textAlign="center" py={2}>
                            Данные не загружены
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 2, py: 1.5 }}>
                    <Button onClick={handleCloseDialog} variant="outlined" size="small">
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default WriteOffTable;

const InfoItem = ({ label, value, color, highlight }) => (
    <Box sx={{ display: 'flex' }}>
        <Typography sx={{ fontWeight: 500, minWidth: 140, color: '#555' }}>
            {label}:
        </Typography>
        <Typography sx={{ fontWeight: highlight ? 600 : 400, color: color || 'inherit' }}>
            {value}
        </Typography>
    </Box>
);
