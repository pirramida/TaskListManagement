import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    FormControlLabel,
    Switch,
    Autocomplete,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import { fetchWithRetry } from "../utils/refreshToken";

const AdditionalPayDialog = ({ open, onClose, onSubmit, clients }) => {
    const [isOurClient, setIsOurClient] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [externalClientName, setExternalClientName] = useState("");
    const [amount, setAmount] = useState("");
    const [incomeType, setIncomeType] = useState("");
    const [comment, setComment] = useState("");

    // Клише суммы и типов дохода для автокомплита
    const amountOptions = ["500", "1000", "2000", "3000", "5000"];
    const incomeTypeOptions = [
        "Продажа программы тренировок",
        "Продажа диеты",
        "СПТ",
        "Консультация",
        "Другое",
    ];

    const handleSave = async () => {
        const form = {
            client: isOurClient ? selectedClient : externalClientName,
            isOurClient,
            amount,
            incomeType,
            comment,
        }
        try {
            // const response = await fetchWithRetry('', 'POST')
        } catch (error) {
            console.error('ПРоизошла ошибка при добавлении сторонней оплаты!');
        } 
        onClose();
        // Сбросить состояние
        setIsOurClient(true);
        setSelectedClient(null);
        setExternalClientName("");
        setAmount("");
        setIncomeType("");
        setComment("");
    };

    const canSave =
        amount.trim() !== "" &&
        incomeType.trim() !== "" &&
        ((isOurClient && selectedClient) || (!isOurClient && externalClientName.trim() !== ""));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Добавить доход</DialogTitle>
            <DialogContent>
                <Stack spacing={2} mt={1}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isOurClient}
                                onChange={() => {
                                    setIsOurClient((prev) => !prev);
                                    setSelectedClient(null);
                                    setExternalClientName("");
                                }}
                            />
                        }
                        label={isOurClient ? "Наш клиент" : "Не наш клиент"}
                    />

                    {isOurClient ? (
                        <Autocomplete
                            options={clients || []}
                            getOptionLabel={(option) => option.name || ""}
                            value={selectedClient}
                            onChange={(_, newValue) => setSelectedClient(newValue)}
                            renderInput={(params) => <TextField {...params} label="Выберите клиента" />}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            clearOnEscape
                        />
                    ) : (
                        <TextField
                            label="Имя клиента"
                            value={externalClientName}
                            onChange={(e) => setExternalClientName(e.target.value)}
                            fullWidth
                        />
                    )}

                    <Autocomplete
                        freeSolo
                        options={amountOptions}
                        value={amount}
                        onInputChange={(_, newInputValue) => setAmount(newInputValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Сумма (в рублях)"
                                type="number"
                                InputProps={{ ...params.InputProps, inputMode: "numeric" }}
                            />
                        )}
                    />

                    <Autocomplete
                        freeSolo
                        options={incomeTypeOptions}
                        value={incomeType}
                        onInputChange={(_, newInputValue) => setIncomeType(newInputValue)}
                        renderInput={(params) => (
                            <TextField {...params} label="Назначение дохода" fullWidth />
                        )}
                    />

                    <TextField
                        label="Комментарий (необязательно)"
                        multiline
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        fullWidth
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={handleSave} disabled={!canSave}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AdditionalPayDialog;

