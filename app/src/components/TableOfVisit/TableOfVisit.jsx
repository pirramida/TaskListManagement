import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Modal,
    Paper,
    IconButton,
    Tooltip
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { fetchWithRetry } from '../../utils/refreshToken';

const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Пустые ячейки перед началом месяца (чтобы понедельник был первым)
    const weekDayOffset = (firstDay.getDay() + 6) % 7; // 0 - Пн
    for (let i = 0; i < weekDayOffset; i++) {
        days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
        days.push(new Date(year, month, d));
    }

    return days;
};

const formatDate = (date) => date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
const formatHeader = (year, month) => new Date(year, month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

const TableOfVisit = ({ client, addToast }) => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [visitData, setVisitData] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);

    const days = getMonthDays(year, month);

    const fetchData = async () => {
        try {
            const response = await fetchWithRetry(`/session_history/customGet?clientId=${client.id}`, 'GET');
            const parsed = {};

            response.forEach(item => {
                const report = item.report ? JSON.parse(item.report) : {};

                // Правильная дата: trainingTime > date
                const rawDate = item.trainingTime || item.date;
                if (!rawDate) return;

                const date = new Date(rawDate).toISOString().split('T')[0]; // "2025-06-09"

                const isMissed = report?.action === 'writeoff';
                const status = isMissed ? 'missed' : 'completed';
                const rating = report?.rating || 0;

                const info = `Тип: ${status === 'missed' ? 'Списана' : 'Проведена'}
Оценка: ${report?.rating || '-'}
Интенсивность: ${report?.intensity || '-'}
Комментарий: ${report?.writeoffComment || report?.comment || '-'}`;

                // если на эту дату уже есть запись — сравним
                const existing = parsed[date];
                if (!existing) {
                    parsed[date] = { status, info, rating };
                } else {
                    const existingPriority = (existing.status === 'completed' ? 1 : 0) * 10 + (existing.rating || 0);
                    const currentPriority = (status === 'completed' ? 1 : 0) * 10 + rating;
                    if (currentPriority > existingPriority) {
                        parsed[date] = { status, info, rating };
                    }
                }
            });

            // Очищаем от рейтинга перед отображением
            const cleaned = {};
            Object.entries(parsed).forEach(([date, { status, info }]) => {
                cleaned[date] = { status, info };
            });

            setVisitData(cleaned);
        } catch (err) {
            console.error('Ошибка при получении посещений:', err);
            addToast('errorToast', 'Ошибка при получении посещений');
        }
    };




    useEffect(() => {
        fetchData();
    }, []);

    const handlePrevMonth = () => {
        setMonth(prev => {
            if (prev === 0) {
                setYear(y => y - 1);
                return 11;
            }
            return prev - 1;
        });
    };

    const handleNextMonth = () => {
        setMonth(prev => {
            if (prev === 11) {
                setYear(y => y + 1);
                return 0;
            }
            return prev + 1;
        });
    };

    return (
        <Box>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <IconButton onClick={handlePrevMonth}><ChevronLeft /></IconButton>
                <Typography variant="h5">{formatHeader(year, month)}</Typography>
                <IconButton onClick={handleNextMonth}><ChevronRight /></IconButton>
            </Box>

            {/* Grid */}
            <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={1}>
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                    <Typography key={d} variant="subtitle2" align="center">{d}</Typography>
                ))}

                {days.map((day, idx) => {
                    if (!day) return <Box key={idx} />;

                    const dateStr = formatDate(day);
                    const visit = visitData[dateStr];

                    const bgColor = visit
                        ? visit.status === 'completed'
                            ? 'lightgreen'
                            : '#ffb3b3'
                        : '#f5f5f5';

                    return (
                        <Tooltip key={dateStr} title={visit?.info || ''} arrow disableInteractive>
                            <Box
                                onClick={() => visit && setSelectedDate({ date: dateStr, ...visit })}
                                sx={{
                                    cursor: visit ? 'pointer' : 'default',
                                    textAlign: 'center',
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: bgColor,
                                    border: '1px solid #ccc',
                                }}
                            >
                                <Typography variant="body2">{day.getDate()}</Typography>
                            </Box>
                        </Tooltip>
                    );
                })}
            </Box>

            {/* Modal */}
            <Modal open={!!selectedDate} onClose={() => setSelectedDate(null)}>
                <Paper
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        p: 4,
                        maxWidth: 400,
                        width: '100%',
                    }}
                >
                    <Typography variant="h6" gutterBottom>{selectedDate?.date}</Typography>
                    <Typography>{selectedDate?.info}</Typography>
                </Paper>
            </Modal>
        </Box>
    );
};

export default TableOfVisit;
