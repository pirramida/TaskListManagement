import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useMediaQuery,
  Slide
} from '@mui/material';
import { ArrowBack, Close } from '@mui/icons-material';
import { fetchWithRetry } from '../utils/refreshToken';
import { addToast } from '../utils/addToast';

const SlideTransition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

export const WriteOffSessions = ({ open, onClose, client }) => {
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleConfirm = async () => {
    const response = await fetchWithRetry('/payment_history', 'PATCH', { client: client });
    if (!response.status) {
        addToast('errorWriteOffSession', 'error', 'Ошибка списания тренировоки', 1000);
        return
    }

    addToast('successWriteOffSession', 'success', `Тренировки успешносписана у ${client.name}, Осталось: ${response.data[0]?.quantityLeft} / ${response.data[0]?.quantity}`, 1000);
    onClose();
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      TransitionComponent={SlideTransition}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          boxShadow: 12
        }
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 2,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        {isMobile && (
          <IconButton color="inherit" onClick={onClose}>
            <ArrowBack fontSize="medium" />
          </IconButton>
        )}
        
        <Typography variant="h6" fontWeight="600">
          Списание тренировки
        </Typography>
        
        {!isMobile && (
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 16,
              color: 'inherit'
            }}
          >
            <Close fontSize="medium" />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body1" fontSize={18}>
          Вы действительно хотите списать тренировку у клиента?
        </Typography>
        {client && (
          <Typography variant="subtitle1" color="text.secondary" mt={1}>
            {client.name}
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: 'background.default' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          size="large"
          sx={{
            flex: 1,
            borderRadius: 1,
            py: 1.5,
            fontWeight: 600
          }}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          size="large"
          sx={{
            flex: 1,
            borderRadius: 1,
            py: 1.5,
            fontWeight: 600,
            ml: 2
          }}
        >
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default WriteOffSessions;