import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Button, Paper, Box,
  useTheme, useMediaQuery, Avatar,TextField
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Field = ({ label, name, value, editing, onChange, icon, suffix, customDisplay, ...props }) => {
  return (
    <Box sx={{ background: 'white', borderRadius: '8px', p: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <Box display="flex" alignItems="center" mb={1}>
        {icon && (
          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            {icon}
          </Avatar>
        )}
        <Typography variant="subtitle2" color="textSecondary">{label}</Typography>
      </Box>
      {editing ? (
        <TextField
          name={name}
          value={value || ''}
          onChange={onChange}
          fullWidth
          variant="outlined"
          size="small"
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
          <Typography variant="body1" sx={{ fontWeight: 500, color: value ? 'text.primary' : 'text.disabled' }}>
            {value || '—'} {suffix}
          </Typography>
        )
      )}
    </Box>
  );
};

const PaymentDetailsDialog = ({
  open,
  onClose,
  payment,
  isEditing,
  setIsEditing,
  handleChange,
  handleSave,
  getFieldIcon,
  renderStatusChip
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      onClose={onClose}
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
            <IconButton edge="start" color="inherit" onClick={onClose} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Детали платежа</Typography>
        </Box>
        {!isMobile && (
          <IconButton onClick={onClose} sx={{
            position: 'absolute',
            right: 16,
            top: 12,
            color: theme.palette.primary.contrastText
          }}>
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers sx={{ background: theme.palette.grey[50] }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, background: 'transparent' }}>
          <Box display="flex" justifyContent="flex-end" mb={3}>
            {isEditing ? (
              <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSave}>
                Сохранить изменения
              </Button>
            ) : (
              <Button variant="outlined" color="primary" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                Редактировать
              </Button>
            )}
          </Box>

          <Box display="grid" gridTemplateColumns={isMobile ? '1fr' : 'repeat(2, 1fr)'} gap={3}>
            <Field label="Сумма" name="amount" value={payment?.amount} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('amount')} suffix="₽" />
            <Field label="Клиент" name="client" value={payment?.client} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('client')} />
            <Field label="Тип платежа" name="customPaymentType" value={payment?.customPaymentType} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('customPaymentType')} />
            <Field label="Дата" name="date" value={payment?.date} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('date')} type={isEditing ? 'date' : 'text'} />
            <Field label="Дата окончания" name="dateTo" value={payment?.dateTo} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('dateTo')} type={isEditing ? 'date' : 'text'} />
            <Field label="Метод оплаты" name="method" value={payment?.method} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('method')} />
            <Field label="Примечания" name="notes" value={payment?.notes} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('notes')} multiline rows={3} />
            <Field label="Телефон" name="phone" value={payment?.phone} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('phone')} />
            <Field label="Статус" name="status" value={payment?.status} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('status')}
              customDisplay={!isEditing && renderStatusChip(payment?.status)} />
            <Field label="Тип" name="type" value={payment?.type} editing={isEditing}
              onChange={handleChange} icon={getFieldIcon('type')} />
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ background: theme.palette.grey[100], px: 3, py: 2 }}>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDetailsDialog;
