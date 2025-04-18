import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box
} from '@mui/material';

type Payment = {
  id: number | string;
  date: string;
  client: string;
  amount: number;
  type: string;
  status: string;
};

type PaymentsTableProps = {
  payments: Payment[];
  filteredPayments?: Payment[];
  handleOpen: (payment: Payment) => void;
};

const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments, filteredPayments, handleOpen }) => {
  const rows = filteredPayments ?? payments;

  return (
    <Paper sx={{ 
      p: 2, 
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
    }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ background: 'linear-gradient(90deg, #f6f6f6 0%, #f9f9f9 100%)' }}>
              <TableCell sx={{ fontWeight: 700 }}>Дата</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Клиент</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Сумма</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Тип</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...rows].reverse().map((payment, index) => (
              <TableRow key={index} hover>
                <TableCell>{new Date(payment?.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</TableCell>
                <TableCell>{payment?.client}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      fontWeight: 600,
                      color: '#2e7d32',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {payment?.amount.toLocaleString('ru-RU')} ₽
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment?.type}
                    size="small"
                    sx={{
                      background:
                        payment?.type === 'Разовая'
                          ? '#e3f2fd'
                          : payment?.type === '10 тренировок'
                          ? '#e8f5e9'
                          : '#fff8e1',
                      color:
                        payment?.type === 'Разовая'
                          ? '#1565c0'
                          : payment?.type === '10 тренировок'
                          ? '#2e7d32'
                          : '#ff8f00'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={payment?.status}
                    size="small"
                    sx={{
                      background:
                        payment?.status === 'Активен' ? '#e8f5e9' : '#ffebee',
                      color:
                        payment?.status === 'Активен' ? '#2e7d32' : '#c62828'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={() => handleOpen(payment)}
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
                    Подробнее
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PaymentsTable;
