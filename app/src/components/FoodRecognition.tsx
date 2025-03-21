import React, { useState, useEffect } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import axios from 'axios';

// API для получения данных о калориях
const CALORIE_API_KEY = 'pQIj4l+SZD9VgPrevSjTHw==bP6aAmCK2h1Snp4d'; // Замените на свой API ключ
const CALORIE_API_URL = 'https://api.calorieninjas.com/v1/nutrition?query=';

interface ProductDetails {
  name: string;
  caloriesPer100g: number;
  estimatedWeight: number;
}

interface FoodState {
  prediction: string | null;
  calories: number | null;
  weightEstimate: { [key: string]: number };
  foodDetails: { [key: string]: ProductDetails };
  loading: boolean;
  error: string | null;
  portion: number;
  selectedFoods: string[]; // Хранит выбранные продукты
  customWeights: { [key: string]: number }; // Индивидуальные веса для продуктов
}

const FoodRecognition = () => {
  const [foodState, setFoodState] = useState<FoodState>({
    prediction: null,
    calories: null,
    weightEstimate: {},
    foodDetails: {},
    loading: false,
    error: null,
    portion: 100, // По умолчанию 100 грамм
    selectedFoods: [],
    customWeights: {}, // Изначально пустой объект для индивидуальных весов
  });

  const [image, setImage] = useState<string | null>(null);
  const [model, setModel] = useState<mobilenet.MobileNet | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await mobilenet.load();
        setModel(loadedModel);
      } catch (error) {
        setFoodState((prevState) => ({ ...prevState, error: 'Ошибка загрузки модели. Попробуйте еще раз.' }));
      }
    };
    loadModel();
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setImage(e.target?.result as string);
        resetFoodState();
      };
      reader.readAsDataURL(file);
    }
  };

  const resetFoodState = () => {
    setFoodState({
      ...foodState,
      prediction: null,
      calories: null,
      weightEstimate: {},
      foodDetails: {},
      loading: false,
      error: null,
      selectedFoods: [],
      customWeights: {}, // Сброс индивидуальных весов
    });
  };

  const analyzeImage = async () => {
    if (!image || !model) return;

    setFoodState((prevState) => ({ ...prevState, loading: true }));

    const img = new Image();
    img.src = image;
    img.onload = async () => {
      try {
        const predictions = await model.classify(img);

        let newFoodDetails: { [key: string]: ProductDetails } = {};
        let newWeightEstimate: { [key: string]: number } = {};

        // Для каждого продукта делаем запрос в API и оцениваем калории
        for (const prediction of predictions) {
          const productName = prediction.className.toLowerCase();
          try {
            const response = await axios.get(`${CALORIE_API_URL}${productName}`, {
              headers: { 'X-Api-Key': CALORIE_API_KEY },
            });

            const productData = response.data.items[0];
            if (productData) {
              const caloriesPer100g = productData.calories;
              const estimatedWeight = estimateProductWeight(productName);

              newFoodDetails[productName] = {
                name: productName,
                caloriesPer100g,
                estimatedWeight,
              };

              newWeightEstimate[productName] = estimatedWeight;
            }
          } catch (error) {
            console.error(`Ошибка при запросе данных для ${prediction.className}:`, error);
          }
        }

        setFoodState((prevState) => ({
          ...prevState,
          prediction: predictions.map((prediction) => prediction.className).join(', '),
          foodDetails: newFoodDetails,
          weightEstimate: newWeightEstimate,
          loading: false,
        }));
      } catch (err) {
        setFoodState((prevState) => ({ ...prevState, error: 'Ошибка обработки изображения.', loading: false }));
      }
    };
  };

  const estimateProductWeight = (productName: string): number => {
    // Оценка веса для продуктов
    switch (productName) {
      case 'pizza':
        return 300; // Примерный вес пиццы
      case 'bread':
        return 50; // Примерный вес хлеба
      case 'soup':
        return 250; // Примерный вес супа
      default:
        return 100; // Стандартная оценка
    }
  };

  const handlePortionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPortion = Number(event.target.value);
    setFoodState((prevState) => ({
      ...prevState,
      portion: newPortion,
    }));
  };

  const handleFoodSelectionChange = (food: string) => {
    setFoodState((prevState) => {
      const selectedFoods = prevState.selectedFoods.includes(food)
        ? prevState.selectedFoods.filter((item) => item !== food)
        : [...prevState.selectedFoods, food];
      return { ...prevState, selectedFoods };
    });
  };

  const handleCustomWeightChange = (food: string, weight: number) => {
    setFoodState((prevState) => {
      const customWeights = { ...prevState.customWeights, [food]: weight };
      return { ...prevState, customWeights };
    });
  };

  const calculateTotalCalories = () => {
    let totalCalories = 0;
    foodState.selectedFoods.forEach((food) => {
      const foodDetail = foodState.foodDetails[food];
      if (foodDetail) {
        const weight = foodState.customWeights[food] || foodState.weightEstimate[food];
        const caloriesForPortion = (weight / 100) * foodDetail.caloriesPer100g;
        totalCalories += caloriesForPortion;
      }
    });
    return totalCalories;
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', textAlign: 'center', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h2>🍽️ Распознай свою еду и узнай калории!</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {image && <img src={image} alt="Загруженное изображение" style={styles.image} />}
      <div style={styles.inputContainer}>
        <button onClick={analyzeImage} disabled={!image || foodState.loading}>
          {foodState.loading ? 'Анализирую...' : 'Определить'}
        </button>
      </div>
      {foodState.error && <p style={styles.error}>{foodState.error}</p>}
      {foodState.prediction && (
        <div style={styles.resultContainer}>
          <p>
            <strong>Распознанные продукты:</strong> {foodState.prediction}
          </p>
          <div style={{ marginTop: '10px', textAlign: 'left' }}>
            <h4>Выберите продукты:</h4>
            {Object.keys(foodState.foodDetails).map((food) => (
              <div key={food} style={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  id={food}
                  checked={foodState.selectedFoods.includes(food)}
                  onChange={() => handleFoodSelectionChange(food)}
                />
                <label htmlFor={food}>{food}</label>
                {foodState.selectedFoods.includes(food) && (
                  <div style={styles.customWeightContainer}>
                    <label>
                      Индивидуальный вес (граммы):
                      <input
                        type="number"
                        value={foodState.customWeights[food] || foodState.weightEstimate[food]}
                        onChange={(e) => handleCustomWeightChange(food, Number(e.target.value))}
                        style={styles.input}
                      />
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={styles.inputContainer}>
            <label>
              Введите вес порции:
              <input
                type="number"
                value={foodState.portion}
                onChange={handlePortionChange}
                style={styles.input}
              />
            </label>
          </div>
          {foodState.selectedFoods.length > 0 && (
            <p>
              <strong>Общее количество калорий:</strong> {calculateTotalCalories().toFixed(2)} ккал
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: 'auto',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  image: {
    width: '100%',
    marginTop: '10px',
    borderRadius: '8px',
  },
  inputContainer: {
    marginTop: '20px',
  },
  checkboxContainer: {
    marginBottom: '10px',
  },
  customWeightContainer: {
    marginTop: '10px',
  },
  resultContainer: {
    marginTop: '20px',
  },
  foodListContainer: {
    marginTop: '10px',
    textAlign: 'left',
  },
  input: {
    padding: '5px',
    width: '80px',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
};

export default FoodRecognition;
