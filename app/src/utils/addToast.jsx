import { toast } from 'react-toastify';
import React, { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { Snackbar, Alert } from '@mui/material';
import { createContext, useContext } from 'react';
/**
 * Вызов toast-уведомления.
 * 
 * @param {string} id - ID тоста.
 * @param {string} type - Тип тоста.
 * @param {string} text - Текст.
 * @param {number} delay - Время задержки (мс).
 */
export const addToast = async (id, type, text, delay) => {
    try {
        if (toast.isActive(id)) {
            toast.update(id, { autoClose: delay });
        } else {
            toast.dismiss();
            toast[type](text, { toastId: id, autoClose: delay, style:{ background:'var(--color-primary)', color:'var(--color-text)' } });
        }
    } catch (error) {
        console.error(`Ошибка добавления toast c ID: ${id}, type: ${type}, text: ${text}, delay: ${delay}`, error);
    }
};



const SnackbarContext = createContext(null);

export const useSnackbarContext = () => useContext(SnackbarContext);

export const SnackbarProvider = ({ children }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    id: null,
    type: 'info',
    text: '',
    delay: 3000,
  });

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const addSnackBar = (id, type, text, delay = 3000) => {
    if (snackbar.id === id && snackbar.open) {
      setSnackbar(prev => ({ ...prev, delay }));
    } else {
      setSnackbar({ open: true, id, type, text, delay });
    }
  };

  return (
    <SnackbarContext.Provider value={{ addSnackBar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.delay}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.type}
          onClose={closeSnackbar}
          sx={{
            background: '#4caf50',
            color: '#fff',
          }}
        >
          {snackbar.text}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
