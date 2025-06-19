import React, { useCallback, useMemo, useRef } from 'react';
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
import { VariableSizeList as List } from 'react-window';

type Payment = {
  id: number | string;
  date: string;
  client: string;
  amount: number;
  type: string;
  status: string;
  clientId: number;
};

type PaymentsTableProps = {
  payments: Payment[];
  filteredPayments?: Payment[];
  handleOpen: (payment: Payment) => void;
  setOpenCardDialog: any;
  findSelectedClient: any;
};

const ROW_HEIGHT = 50; // высота строки в px (ориентируйся по своему стилю)

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  filteredPayments,
  handleOpen,
  setOpenCardDialog,
  findSelectedClient
}) => {
  const rows = filteredPayments ?? payments;
  const memoizedRows = useMemo(() => [...rows].reverse(), [rows]);

  const handleOpenClientCard = useCallback(
    (id: any) => {
      findSelectedClient(id);
      setOpenCardDialog(true);
    },
    [findSelectedClient, setOpenCardDialog]
  );

  const listRef = useRef<List>(null);

  // Функция рендера каждой строки react-window
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const payment = memoizedRows[index];

    // Обернем строку в стиль от react-window, и стиль для MUI TableRow
    return (
      <TableRow
        key={payment.id}
        hover
        style={{
          ...style,
          display: 'flex',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Каждый TableCell нужно растянуть, чтобы работал flex */}
        <TableCell
          component="div"
          variant="body"
          sx={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
        >
          {new Date(payment?.date).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </TableCell>

        <TableCell
          component="div"
          variant="body"
          sx={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
        >
          {typeof findSelectedClient === 'function' ? (
            <Button
              variant="text"
              disableRipple
              disableElevation
              sx={{
                padding: 0,
                minWidth: 0,
                textTransform: 'none',
                fontWeight: 'normal',
                fontSize: 'inherit',
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
              onClick={() => handleOpenClientCard(payment.clientId)}
            >
              {payment?.client}
            </Button>
          ) : (
            payment?.client
          )}
        </TableCell>

        <TableCell
          component="div"
          variant="body"
          sx={{
            flex: 1,
            fontWeight: 600,
            color: '#2e7d32',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
        >
          {payment?.amount.toLocaleString('ru-RU')} ₽
        </TableCell>

        <TableCell
          component="div"
          variant="body"
          sx={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
        >
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

        <TableCell
          component="div"
          variant="body"
          sx={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
        >
          <Chip
            label={payment?.status}
            size="small"
            sx={{
              background: payment?.status === 'Активен' ? '#e8f5e9' : '#ffebee',
              color: payment?.status === 'Активен' ? '#2e7d32' : '#c62828'
            }}
          />
        </TableCell>

        <TableCell
          component="div"
          variant="body"
          sx={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
        >
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
    );
  };

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)'
      }}
    >
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                background: 'linear-gradient(90deg, #f6f6f6 0%, #f9f9f9 100%)',
                display: 'flex',
                width: '100%'
              }}
            >
              <TableCell sx={{ fontWeight: 700, flex: 1 }}>Дата</TableCell>
              <TableCell sx={{ fontWeight: 700, flex: 1 }}>Клиент</TableCell>
              <TableCell sx={{ fontWeight: 700, flex: 1 }}>Сумма</TableCell>
              <TableCell sx={{ fontWeight: 700, flex: 1 }}>Тип</TableCell>
              <TableCell sx={{ fontWeight: 700, flex: 1 }}>Статус</TableCell>
              <TableCell sx={{ fontWeight: 700, flex: 1 }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            component="div"
            sx={{ display: 'block', maxHeight: 440, overflow: 'auto' }}
          >
            <List
              height={380}
              itemCount={memoizedRows.length}
              itemSize={() => ROW_HEIGHT}
              width="100%"
              ref={listRef}
            >
              {Row}
            </List>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default React.memo(PaymentsTable);
