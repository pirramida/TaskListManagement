import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
