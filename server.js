const express = require('express');
const axios = require('axios');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = 3001;

// Middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Основной эндпоинт для получения расписания
app.get('/api/schedule/:group', async (req, res) => {
  try {
    const { group } = req.params; // Формат: ES11, KS21 и т.д.
    const pdfUrl = `https://ttgt.org/images/raspisanie/ochno/${group}.pdf`;

    // Получаем PDF-файл
    const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
    const dataBuffer = Buffer.from(response.data);
    const pdfData = await pdfParse(dataBuffer);

    // Нормализация текста: замена переносов строк на пробелы
    let text = pdfData.text.replace(/\r?\n/g, ' ').trim();

    // Добавляем дополнительную обработку здесь
    text = normalizeScheduleText(text);

    res.json({
      success: true,
      group: group,
      schedule: text
    });
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).json({
      success: false,
      error: 'Не удалось загрузить расписание'
    });
  }
});

// Эндпоинт для получения списка групп (если нужно)
app.get('/api/groups', (req, res) => {
  const groups = {
    "1": ["A11", "V11", "D11", "ES11", "KS11", "IS11"],
    "2": ["ES21", "KS21", "IS21"],
    "3": ["ES31", "KS31", "IS31"],
    "4": ["ES41", "KS41", "IS41"]
  };
  res.json(groups);
});

// Функция для нормализации текста расписания
function normalizeScheduleText(text) {
  // Заменяем двойные пробелы на одинарные
  text = text.replace(/\s+/g, ' ');

  // Добавьте здесь любую дополнительную логику для обработки текста
  // Например, если известно, что каждая пара должна быть в формате "Предмет Преподаватель Аудитория",
  // можно попробовать разделить текст на пары по этому шаблону.

  return text;
}

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});