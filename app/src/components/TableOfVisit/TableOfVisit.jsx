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

// Форматируем дату в 'YYYY-MM-DD'
const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

// Заголовок с месяцем и годом на русском
const formatHeader = (year, month) => new Date(year, month).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

// Добавляем часы к дате
function addHours(date, hours) {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

const TableOfVisit = ({ sessionsHistoryClient, client, addToast }) => {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [visitData, setVisitData] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);

    const days = getMonthDays(year, month);

    // Парсим дату с учётом разных форматов и таймзон
    const parseDate = (rawDate, isTrainingTime) => {
        if (!rawDate) return null;

        const dateObj = new Date(rawDate);

        // Если дата из поля `date` (в UTC), то добавляем 3 часа
        if (!isTrainingTime) {
            return addHours(dateObj, 3);
        }
        // trainingTime уже с +3, оставляем как есть
        return dateObj;
    };

    const fetchData = async () => {
        try {
            const groupedByDate = {};

            sessionsHistoryClient.forEach(item => {
                const report = item.report ? JSON.parse(item.report) : {};

                const isTrainingTimePresent = !!item.trainingTime;
                const rawDate = isTrainingTimePresent ? item.trainingTime : item.date;
                const dateObj = parseDate(rawDate, isTrainingTimePresent);

                if (!dateObj) return;

                const dateStr = formatDate(dateObj);

                const status = report.action === "Перенесенная тренировка" ||
                    item.action === "Перенесенная тренировка" ||
                    report.type === "missed"
                    ? 'missed'
                    : 'completed';

                const info = `Тип: ${status === 'missed' ? 'Перенесена' : 'Проведена'}
                                Оценка: ${report.rating || '-'}
                                Интенсивность: ${report.intensity || '-'}
                                Комментарий: ${report.writeoffComment || report.comment || '-'}
                                Причина: ${report.reason || '-'}`;

                if (!groupedByDate[dateStr]) groupedByDate[dateStr] = [];
                groupedByDate[dateStr].push({ status, info, action: item.action || report.action || '' });
            });


            setVisitData(groupedByDate);
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
                    const visits = visitData[dateStr] || [];

                    // Массив actions всех тренировок за день
                    const actions = visits.map(v => v.action);

                    // Проверяем условия
                    let bgColor = '#f5f5f5'; // по умолчанию
                    if (actions.length > 0) {
                        const allWriteOff = actions.every(a => a === 'Списание тренировки');
                        const allMissed = actions.every(a => a === 'Перенесенная тренировка без списания' || a === 'Перенесенная тренировка со списанием');

                        if (allWriteOff) {
                            bgColor = 'lightgreen';  // зеленый
                        } else if (allMissed) {
                            bgColor = '#ffb3b3';     // красный
                        } else {
                            bgColor = 'yellow';      // желтый, если есть смешанные
                        }
                    }


                    const tooltipText = visits.map((v, i) => `#${i + 1}\n${v.info}`).join('\n\n');

                    return (
                        <Tooltip key={dateStr} title={tooltipText} arrow disableInteractive>
                            <Box
                                onClick={() => setSelectedDate({ date: dateStr, visits })}
                                sx={{
                                    cursor: visits.length ? 'pointer' : 'default',
                                    textAlign: 'center',
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: bgColor,
                                    border: '1px solid #ccc',
                                }}
                            >
                                <Typography variant="body2">{day.getDate()}</Typography>
                                {visits.length > 1 && (
                                    <Typography variant="caption" color="text.secondary">
                                        {visits.length}×
                                    </Typography>
                                )}
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
                    {selectedDate?.visits?.map((v, idx) => (
                        <Box key={idx} mb={2}>
                            <Typography variant="subtitle2">Тренировка #{idx + 1}</Typography>
                            <Typography variant="body2" whiteSpace="pre-line">{v.info}</Typography>
                        </Box>
                    ))}
                </Paper>
            </Modal>
        </Box>
    );
};

export default TableOfVisit;
