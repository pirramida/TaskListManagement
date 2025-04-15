import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  IconButton,
  Avatar,
  Chip,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import PaidIcon from '@mui/icons-material/Paid';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import PhoneIcon from '@mui/icons-material/Phone';
import NotesIcon from '@mui/icons-material/Notes';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PaymentDetailsPage = ({ open, close, client }) => {
  const { state } = useLocation();
  const [payment, setPayment] = useState(state?.payment || {});
  const [isEditing, setIsEditing] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    console.log(client)
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Здесь можно добавить логику сохранения изменений
    console.log('Данные сохранены:', payment);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayment(prev => ({ ...prev, [name]: value }));
  };

  const getFieldIcon = (name) => {
    switch(name) {
      case 'amount': return <PaidIcon fontSize="small" />;
      case 'client': return <PersonIcon fontSize="small" />;
      case 'date':
      case 'dateTo': return <EventIcon fontSize="small" />;
      case 'phone': return <PhoneIcon fontSize="small" />;
      case 'notes': return <NotesIcon fontSize="small" />;
      case 'method': return <CreditCardIcon fontSize="small" />;
      case 'type': return <FitnessCenterIcon fontSize="small" />;
      case 'status': return <CheckCircleIcon fontSize="small" />;
      default: return null;
    }
  };

  const renderStatusChip = (status) => {
    let color = 'default';
    if (status === 'Активен') color = 'success';
    if (status === 'Просрочен') color = 'error';
    if (status === 'Ожидает') color = 'warning';

    return (
      <Chip
        label={status}
        color={color}
        size="small"
        icon={<CheckCircleIcon fontSize="small" />}
        sx={{ borderRadius: '6px', fontWeight: 500 }}
      />
    );
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      onClose={() => close(false)}
      TransitionComponent={Transition}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '12px',
          background: theme.palette.background.paper,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ 
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        py: 2,
        position: 'relative'
      }}>
        <Box display="flex" alignItems="center">
          {isMobile && (
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={() => close(false)}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Детали платежа
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton 
            onClick={() => close(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 12,
              color: theme.palette.primary.contrastText
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent dividers sx={{ background: theme.palette.grey[50] }}>
        <Paper elevation={0} sx={{ 
          p: 3, 
          borderRadius: 2,
          background: 'transparent'
        }}>
          <Box display="flex" justifyContent="flex-end" mb={3}>
            {isEditing ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ 
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: theme.shadows[2]
                  }
                }}
              >
                Сохранить изменения
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleEdit}
                sx={{ 
                  borderRadius: '8px',
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px'
                  }
                }}
              >
                Редактировать
              </Button>
            )}
          </Box>

          <Box 
            display="grid" 
            gridTemplateColumns={isMobile ? '1fr' : 'repeat(2, 1fr)'} 
            gap={3}
          >
            <Field 
              label="Сумма" 
              name="amount" 
              value={payment.amount} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('amount')}
              suffix="₽"
            />
            <Field 
              label="Клиент" 
              name="client" 
              value={payment.client} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('client')}
            />
            <Field 
              label="Тип платежа" 
              name="customPaymentType" 
              value={payment.customPaymentType} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('customPaymentType')}
            />
            <Field 
              label="Дата" 
              name="date" 
              value={payment.date} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('date')}
              type={isEditing ? 'date' : 'text'}
            />
            <Field 
              label="Дата окончания" 
              name="dateTo" 
              value={payment.dateTo} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('dateTo')}
              type={isEditing ? 'date' : 'text'}
            />
            <Field 
              label="Метод оплаты" 
              name="method" 
              value={payment.method} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('method')}
            />
            <Field 
              label="Примечания" 
              name="notes" 
              value={payment.notes} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('notes')}
              multiline
              rows={3}
            />
            <Field 
              label="Телефон" 
              name="phone" 
              value={payment.phone} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('phone')}
            />
            <Field 
              label="Статус" 
              name="status" 
              value={payment.status} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('status')}
              customDisplay={!isEditing && renderStatusChip(payment.status)}
            />
            <Field 
              label="Тип" 
              name="type" 
              value={payment.type} 
              editing={isEditing} 
              onChange={handleChange}
              icon={getFieldIcon('type')}
            />
          </Box>
        </Paper>
      </DialogContent>
      
      <DialogActions sx={{ 
        background: theme.palette.grey[100],
        px: 3,
        py: 2
      }}>
        <Button 
          onClick={() => close(false)} 
          sx={{ 
            borderRadius: '8px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Field = ({ label, name, value, editing, onChange, icon, suffix, customDisplay, ...props }) => {
  return (
    <Box sx={{
      background: 'white',
      borderRadius: '8px',
      p: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }
    }}>
      <Box display="flex" alignItems="center" mb={1}>
        {icon && (
          <Avatar sx={{ 
            width: 24, 
            height: 24, 
            mr: 1,
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}>
            {icon}
          </Avatar>
        )}
        <Typography variant="subtitle2" color="textSecondary">
          {label}
        </Typography>
      </Box>
      
      {editing ? (
        <TextField
          name={name}
          value={value || ''}
          onChange={onChange}
          fullWidth
          variant="outlined"
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px'
            }
          }}
          InputProps={{
            endAdornment: suffix && (
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                {suffix}
              </Typography>
            )
          }}
          {...props}
        />
      ) : (
        customDisplay || (
          <Typography variant="body1" sx={{ 
            fontWeight: 500,
            color: value ? 'text.primary' : 'text.disabled'
          }}>
            {value || '—'} {suffix}
          </Typography>
        )
      )}
    </Box>
  );
};

export default PaymentDetailsPage;