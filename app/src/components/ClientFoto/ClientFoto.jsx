import React, { useState, useRef, useEffect } from "react";
import "./ClientFoto.css";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Typography,
  AppBar,
  Toolbar,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { fetchWithRetry } from "../../utils/refreshToken";

const PHOTO_TYPES = {
  front: { label: "Спереди", icon: "🔼" },
  side: { label: "Сбоку", icon: "⏹️" },
  back: { label: "Сзади", icon: "🔽" },
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ClientFoto = ({ clientId }) => {
  const [primaryPhotos, setPrimaryPhotos] = useState({
    front: null,
    side: null,
    back: null,
  });
  const [folders, setFolders] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [editFolderName, setEditFolderName] = useState("");
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);
  const [fullscreenPair, setFullscreenPair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  useEffect(() => {
    refreshData();
  }, [clientId]);

  const fetchFolders = async () => {
    try {
      const response = await fetchWithRetry(
        `/clients_foto/get-folders?clientId=${clientId}`
      );

      const normalizedFolders = response.map((folder) => {
        const input = folder.nameFolder;

        // Ищем: название + дата и время через |
        const regex =
          /^(.*?)\s(\d{2})\|(\d{2})\|(\d{4})\|\s(\d{2})\|(\d{2})\|(\d{2})$/;
        const match = input.match(regex);

        if (match) {
          const title = match[1].trim(); // "Без названия"
          const day = match[2];
          const month = match[3];
          const year = match[4];
          const hour = match[5];
          const minute = match[6];
          const second = match[7];

          const formattedDate = `${day}.${month}.${year}, ${hour}:${minute}:${second}`;

          const isoDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
          ).toISOString();

          return {
            id: folder.id,
            customLabel: title,
            createdAt: isoDate,
            createdAtFormatted: formattedDate,
            counterPhoto: folder.counterPhoto,
            photos: {
              front: null,
              side: null,
              back: null,
            },
          };
        } else {
          // Если формат не совпал — заглушка
          return {
            id: folder.id,
            customLabel: folder.nameFolder,
            createdAt: new Date().toISOString(),
            createdAtFormatted: "",
            photos: {
              front: null,
              side: null,
              back: null,
            },
          };
        }
      });

      setFolders(normalizedFolders);
    } catch (err) {
      console.error("Ошибка при загрузке папок:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const data = await fetchWithRetry(
        `/clients_foto/get-photos?folderId=${currentFolder.id}`
      );
      setPhotos(data); // это массив фото
    } catch (err) {
      console.error("Ошибка при загрузке фотографий:", err);
    }
  };

  const getPrimaryPhotos = async () => {
    try {
      const data = await fetchWithRetry(
        `/clients_foto/get-primary-photos?isPrimary=1&clientId=${clientId}&userId=${userId}`
      );

      // 🔁 Преобразуем массив в объект { front, side, back }
      const grouped = {
        front: null,
        side: null,
        back: null,
      };

      const SERVER_URL = "https://localhost:5000"; // или https://yourdomain.com

      data.forEach((photo) => {
        if (["front", "side", "back"].includes(photo.type)) {
          grouped[photo.type] = {
            url: SERVER_URL + photo.url,
            date: photo.uploaded_at,
            id: photo.id,
            comment: photo.comment,
          };
        }
      });

      setPrimaryPhotos(grouped);
    } catch (err) {
      console.error("Ошибка при загрузке фотографий:", err);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchFolders(), fetchPhotos(), getPrimaryPhotos()]);
    setLoading(false);
  };

  const handlePrimaryUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Предпросмотр
    const reader = new FileReader();
    reader.onload = (event) => {
      setPrimaryPhotos((prev) => ({
        ...prev,
        [type]: {
          url: event.target.result,
          date: new Date().toISOString(),
        },
      }));
    };
    reader.readAsDataURL(file);

    // Загрузка на сервер
    const formData = new FormData();
    formData.append("file", file); // загружаемое фото
    formData.append("clientId", clientId); // ID клиента
    formData.append("userId", 1); // пока заглушка
    formData.append("type", type); // тип фото: front | side | back
    formData.append("isPrimary", 1); // не первичное фото
    formData.append("comment", ""); // описание из UI
    formData.append("originalName", ""); // описание из UI

    try {
      const response = await fetchWithRetry(
        "/clients_foto/upload-primary-photo",
        "POST",
        formData
      );

      console.log("Фото загружено:", response);
    } catch (err) {
      console.error("Ошибка при загрузке фото:", err);
    } finally {
      refreshData();
    }
  };

  const createNewFolder = async () => {
    const now = new Date();
    const createdAtFormatted = now.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const newFolderName = `Без названия ${createdAtFormatted.replace(/[,:.]/g, "|")}`;

    try {
      // 🔥 запрос к серверу
      const response = await fetchWithRetry(
        "/clients_foto/create-folder",
        "POST",
        {
          userId: 1,
          clientId,
          folderName: newFolderName,
        }
      );
      const { id } = response;

      const newFolder = {
        id,
        createdAt: now.toISOString(),
        createdAtFormatted,
        customLabel: "",
        photos: { front: null, side: null, back: null },
      };

      setFolders((prev) => [newFolder, ...prev]);
    } catch (error) {
      console.error("Не удалось создать папку на сервере", error);
    } finally {
      refreshData();
    }
  };

  const handleFolderClick = async (folder) => {
    setCurrentFolder(folder);
    setEditFolderName(folder.customLabel);

    try {
      // 🔥 Загружаем фото из папки по folder.id
      const data = await fetchWithRetry(
        `/clients_foto/get-photos?folderId=${folder.id}`
      );

      // 🔁 Обновляем фото в папке
      const photosByType = {
        front: null,
        side: null,
        back: null,
      };
      const SERVER_URL = "https://localhost:5000"; // или https://yourdomain.com

      data.forEach((photo) => {
        const { type, url } = photo;
        console.log("type, url", type, url);
        if (type in photosByType) {
          photosByType[type] = {
            url: SERVER_URL + url,
            date: photo.uploaded_at,
            id: photo.id,
          };
        }
      });
      console.log("datadatadata", photosByType);
      // Обновляем currentFolder с фото
      const updatedFolder = { ...folder, photos: photosByType };
      setCurrentFolder(updatedFolder);

      // Также обновляем в списке folders
      setFolders((prev) =>
        prev.map((f) => (f.id === folder.id ? updatedFolder : f))
      );
    } catch (error) {
      console.error("Ошибка при загрузке фото для папки:", error);
    }

    setEditDialogOpen(true);
  };

  const handleFolderPhotoUpload = async (type, e) => {
    const file = e.target.files[0];
    if (!file || !currentFolder) return;

    console.log("currentFoldercurrentFolder", currentFolder);
    const formData = new FormData();
    formData.append("file", file); // загружаемое фото
    formData.append("clientId", clientId); // ID клиента
    formData.append("userId", 0); // пока заглушка
    formData.append("folderId", currentFolder.id);
    formData.append("type", type); // тип фото: front | side | back
    formData.append("isPrimary", 0); // не первичное фото
    formData.append("comment", currentFolder.customLabel || ""); // описание из UI
    formData.append("createdAt", currentFolder.createdAt); // ISO дата
    formData.append("createdAtFormatted", currentFolder.createdAtFormatted); // читаемая
    formData.append("folderName", currentFolder.customLabel || "Без названия");

    try {
      const response = await fetchWithRetry(
        "/clients_foto/upload",
        "POST",
        formData
      );

      if (!response.success) throw new Error("Ошибка загрузки");
      console.log(response);

      // Обновим путь к сохраненной фотографии на сервере
      const SERVER_URL = "https://localhost:5000"; // или https://yourdomain.com
      const photoData = {
        url: SERVER_URL + response.url,
        date: new Date().toISOString(),
      };
      console.log("photoDataphotoData", photoData);
      setFolders((prev) =>
        prev.map((f) =>
          f.id === currentFolder.id
            ? {
                ...f,
                photos: {
                  ...f.photos,
                  [type]: photoData,
                },
              }
            : f
        )
      );
      setCurrentFolder((prev) => ({
        ...prev,
        photos: {
          ...prev.photos,
          [type]: photoData,
        },
      }));
    } catch (err) {
      console.error("Ошибка при сохранении фото:", err);
    } finally {
      refreshData();
    }
  };

  const deleteFolderPhoto = async (photo, action) => {
    if (!currentFolder && !action) return;
    try {
      const id = photo.id;
      console.log("photophotophotophoto", photo);
      const response = await fetchWithRetry(
        "/clients_foto/delete-photos",
        "DELETE",
        {
          id,
        }
      );
    } catch (err) {
      console.error(err);
    }

    if (action) {
      refreshData();
      return;
    }

    setFolders((prev) =>
      prev.map((f) =>
        f.id === currentFolder.id
          ? {
              ...f,
              photos: {
                ...f.photos,
                [photo.type]: null,
              },
            }
          : f
      )
    );
    setCurrentFolder((prev) => ({
      ...prev,
      photos: {
        ...prev.photos,
        [photo.type]: null,
      },
    }));
    handleFolderClick(currentFolder);
  };

  const saveFolderName = async () => {
    const trimmedName = editFolderName.trim();
    if (!trimmedName) return;

    const formattedDate = currentFolder.createdAtFormatted
      .replace(/\./g, "|") // "07.06.2025" → "07|06|2025"
      .replace(",", "|") // ", " → "|"
      .replace(/:\s?/, "|") // пробел между временем → "|"
      .replace(/:/g, "|"); // "12:42:40" → "12|42|40"

    const fullName = `${trimmedName} ${formattedDate}`;

    try {
      await fetchWithRetry("/clients_foto/update-folder-name", "PUT", {
        userId: 0,
        clientId,
        folderId: currentFolder.id,
        newName: fullName,
      });

      setFolders((prev) =>
        prev.map((f) =>
          f.id === currentFolder.id ? { ...f, customLabel: trimmedName } : f
        )
      );

      setCurrentFolder((prev) => ({ ...prev, customLabel: trimmedName }));
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Ошибка при обновлении имени папки:", error);
    }
  };

  const deleteFolder = async () => {
    if (!currentFolder) return;
    try {
      console.log("currentFoldercurrentFolder", currentFolder);
      const userId = 1;

      await fetchWithRetry("/clients_foto/delete-folder", "DELETE", {
        userId,
        clientId,
        folderId: currentFolder.id, // числовой ID из базы
      });

      setFolders((prev) => prev.filter((f) => f.id !== currentFolder.id));
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Ошибка при удалении папки:", error);
      alert("Не удалось удалить папку. Попробуйте ещё раз.");
    }
  };

  const toggleFolderSelection = async (folderId) => {
    const isSelected = selectedFolders.includes(folderId);
    let updated = [];

    if (isSelected) {
      updated = selectedFolders.filter((id) => id !== folderId);
    } else {
      updated = [...selectedFolders, folderId];
      const folder = folders.find((f) => f.id === folderId);
      if (
        folder &&
        !folder.photos.front &&
        !folder.photos.side &&
        !folder.photos.back
      ) {
        try {
          const data = await fetchWithRetry(
            `/clients_foto/get-photos?folderId=${folder.id}`
          );
          const photosByType = { front: null, side: null, back: null };
          const SERVER_URL = "https://localhost:5000";

          data.forEach((photo) => {
            const { type, url } = photo;
            if (type in photosByType) {
              photosByType[type] = {
                url: SERVER_URL + url,
                date: photo.uploaded_at,
                id: photo.id,
              };
            }
          });

          // Обновляем состояние папки
          const updatedFolder = { ...folder, photos: photosByType };
          setFolders((prev) =>
            prev.map((f) => (f.id === folder.id ? updatedFolder : f))
          );
        } catch (err) {
          console.error("Ошибка при подгрузке фото выбранной папки:", err);
        }
      }
    }

    setSelectedFolders(updated);
  };

  const getComparisonData = () => {
    const result = [
      { type: "primary", photos: primaryPhotos, name: "Первичные фото" },
    ];
    selectedFolders.forEach((id) => {
      const folder = folders.find((f) => f.id === id);
      if (folder) {
        result.push({
          type: "folder",
          photos: folder.photos,
          name: folder.name,
        });
      }
    });
    return result;
  };

  return (
    <div className="app">
      {/* Основной экран */}
      <div className="main-view">
        <div className="primary-section">
          <h2>Первичные фотографии</h2>
          <div className="photo-types">
            {Object.entries(PHOTO_TYPES).map(([type, { label, icon }]) => (
              <div key={type} className="photo-type">
                <h3>
                  {icon} {label}
                </h3>
                {primaryPhotos[type] ? (
                  <div className="photo-container">
                    <img
                      src={`${primaryPhotos[type].url}`}
                      alt={label}
                      className="photo-preview"
                      onClick={() =>
                        setFullscreenPhoto(`${primaryPhotos[type].url}`)
                      }
                      style={{ cursor: "pointer" }}
                    />
                    <IconButton
                      size="small"
                      className="delete-icon"
                      onClick={() => {
                        deleteFolderPhoto(primaryPhotos[type], "primary");
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                ) : (
                  <div className="upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      id={`primary-${type}`}
                      hidden
                      onChange={(e) => handlePrimaryUpload(type, e)}
                    />
                    <label htmlFor={`primary-${type}`} className="upload-btn">
                      Загрузить
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="folders-section">
          <div className="folders-header">
            <h2>Корректировочные фото</h2>
            {/* 💡 Добавляем кнопку сравнения */}
            {selectedFolders.length > 0 && (
              <div style={{}}>
                <button
                  onClick={() => setCompareDialogOpen(true)}
                  className="action-btn primary"
                >
                  Сравнить выбранные
                </button>
              </div>
            )}
            <button onClick={createNewFolder} className="action-btn primary">
              + Новая папка
            </button>
          </div>
          {loading ? (
            <p>Загрузка...</p>
          ) : folders.length > 0 ? (
            <div className="folders-list">
              {folders
                .slice() // Копируем массив, чтобы не мутировать оригинал
                .reverse()
                .map((folder) => (
                  <div
                    key={folder.id}
                    className={`folder-item ${selectedFolders.includes(folder.id) ? "selected" : ""}`}
                    onClick={() => handleFolderClick(folder)}
                  >
                    <div className="folder-name">
                      {" "}
                      {folder.createdAtFormatted} —{" "}
                      {folder.customLabel || "Без названия"}
                    </div>
                    <div className="folder-photos-count">
                      {folder.counterPhoto}/3
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedFolders.includes(folder.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleFolderSelection(folder.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
            </div>
          ) : (
            <p>Нет созданных папок</p>
          )}
        </div>
      </div>

      {/* Диалог редактирования папки */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Редактирование папки
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Дата создания"
            fullWidth
            value={currentFolder?.createdAtFormatted || ""}
            margin="normal"
            disabled
          />
          <TextField
            label="Описание (например, Неделя 1)"
            fullWidth
            value={editFolderName}
            onChange={(e) => setEditFolderName(e.target.value)}
            margin="normal"
          />
          <div className="photo-types">
            {Object.entries(PHOTO_TYPES).map(([type, { label, icon }]) => {
              const photo = currentFolder?.photos[type];
              return (
                <div key={type} className="photo-type">
                  <h4>
                    {icon} {label}
                  </h4>
                  {photo ? (
                    <>
                      <img
                        src={photo.url}
                        alt={label}
                        className="photo-preview"
                        onClick={() => setFullscreenPhoto(photo.url)}
                        style={{ cursor: "pointer" }}
                      />
                      <Button onClick={() => deleteFolderPhoto(photo)}>
                        Удалить
                      </Button>
                    </>
                  ) : (
                    <div className="upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        id={`edit-folder-${type}`}
                        hidden
                        onChange={(e) => handleFolderPhotoUpload(type, e)}
                      />
                      <label
                        htmlFor={`edit-folder-${type}`}
                        className="upload-btn"
                      >
                        Загрузить
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={deleteFolder}>
            Удалить папку
          </Button>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={saveFolderName} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог сравнения */}
      <Dialog
        fullScreen
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        TransitionComponent={Transition}
        PaperProps={{
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "#fff",
          },
        }}
      >
        <AppBar
          sx={{
            position: "relative",
            backgroundColor: "rgba(30, 30, 30, 0.8)",
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setCompareDialogOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
              Сравнение фотографий
            </Typography>
          </Toolbar>
        </AppBar>

        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 64px)",
            padding: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "40px",
              width: "100%",
              maxWidth: "1200px",
              padding: "20px",
            }}
          >
            {getComparisonData().map((item, index, array) => (
              <React.Fragment key={item.id || "primary"}>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      padding: "10px 15px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                    }}
                  ></div>

                  {Object.entries(PHOTO_TYPES).map(
                    ([type, { label, icon }]) => {
                      const current = item.photos[type];
                      const next = array[index + 1]?.photos[type];
                      const next2 = array[index + 2]?.photos[type];

                      const canCompare = current && next;

                      return (
                        <div
                          key={type}
                          style={{
                            width: "100%",
                            textAlign: "center",
                            cursor: canCompare ? "pointer" : "default",
                          }}
                          onClick={() => {
                            if (canCompare) {
                              setFullscreenPair({
                                before: current?.url,
                                after1: next?.url,
                                after2: next2 ? next2?.url : null,
                              });
                            }
                          }}
                        >
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {icon} {label}
                          </Typography>

                          {/* фото "до" */}
                          {current ? (
                            <img
                              src={current.url}
                              alt={label}
                              style={{
                                maxWidth: "100%",
                                maxHeight: "300px",
                                objectFit: "contain",
                                display: "block",
                                margin: "0 auto",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                height: "200px",
                                backgroundColor: "#222",
                                color: "#888",
                              }}
                            >
                              Нет фото
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>

                {index < array.length - 1 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      color: "rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 40 }} />
                    <Typography variant="caption">
                      {index === 0 ? "Первичная" : "→"}
                    </Typography>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(fullscreenPhoto)}
        onClose={() => setFullscreenPhoto(null)}
        fullScreen
        PaperProps={{
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <IconButton
          onClick={() => setFullscreenPhoto(null)}
          style={{ position: "absolute", top: 20, right: 20, color: "#fff" }}
        >
          <CloseIcon />
        </IconButton>

        {fullscreenPhoto && (
          <img
            src={fullscreenPhoto}
            alt="fullscreen"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              borderRadius: "10px",
              boxShadow: "0 0 30px rgba(0,0,0,0.8)",
            }}
          />
        )}
      </Dialog>

      <Dialog
        open={Boolean(fullscreenPair)}
        onClose={() => setFullscreenPair(null)}
        fullScreen
        PaperProps={{
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <IconButton
          onClick={() => setFullscreenPair(null)}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            color: "#fff",
            zIndex: 1000,
          }}
        >
          <CloseIcon />
        </IconButton>

        {fullscreenPair && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              gap: "40px",
              padding: "40px",
            }}
          >
            <img
              src={fullscreenPair.before}
              alt="Before"
              style={{
                maxWidth: "45%",
                maxHeight: "90%",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0 0 20px rgba(0,0,0,0.7)",
              }}
            />
            <img
              src={fullscreenPair.after1}
              alt="After"
              style={{
                maxWidth: "45%",
                maxHeight: "90%",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0 0 20px rgba(0,0,0,0.7)",
              }}
            />
            {fullscreenPair.after2 && (
              <img
                src={fullscreenPair.after2}
                alt="After"
                style={{
                  maxWidth: "45%",
                  maxHeight: "90%",
                  objectFit: "contain",
                  borderRadius: "10px",
                  boxShadow: "0 0 20px rgba(0,0,0,0.7)",
                }}
              />
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default ClientFoto;
