// Конфигурация тренажера
const config = {
    modes: {
        randomLetters: {
            name: "Случайные буквы",
            generate: function(length) {
                const russianLetters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
                let result = '';
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * russianLetters.length);
                    result += russianLetters[randomIndex];
                }
                return result;
            }
        },
        randomWords: {
            name: "Случайные слова",
            generate: function(length) {
                const words = [
                    "кот", "дом", "сад", "мир", "сон", "лес", "брат", "сестра", 
                    "вода", "огонь", "земля", "воздух", "книга", "ручка", "стол",
                    "окно", "дверь", "город", "улица", "машина", "работа", "школа",
                    "ученик", "учитель", "программа", "компьютер", "интернет"
                ];
                let result = [];
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * words.length);
                    result.push(words[randomIndex]);
                }
                return result.join(' ');
            }
        },
        randomSentences: {
            name: "Случайные предложения",
            generate: function() {
                const subjects = ["Я", "Ты", "Он", "Она", "Мы", "Вы", "Они"];
                const verbs = ["читаю", "пишу", "вижу", "слышу", "иду", "бегу", "люблю"];
                const objects = ["книгу", "письмо", "солнце", "музыку", "в парк", "быстро", "жизнь"];
                
                const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
                const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
                const randomObject = objects[Math.floor(Math.random() * objects.length)];
                
                return `${randomSubject} ${randomVerb} ${randomObject}.`;
            }
        }
    },
    currentMode: 'randomLetters',
    length: 30
};

// Элементы DOM
const textDisplay = document.getElementById('textDisplay');
const userInput = document.getElementById('userInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const cpmDisplay = document.getElementById('cpm');
const accuracyDisplay = document.getElementById('accuracy');
const timeDisplay = document.getElementById('time');
const progressChartCtx = document.getElementById('progressChart').getContext('2d');
const keyboardContainer = document.getElementById('keyboardContainer');

// Переменные состояния
let currentText = '';
let startTime;
let timerInterval;
let correctChars = 0;
let totalTyped = 0;
let sessionStats = [];
let currentCharIndex = 0;
let progressChart;

// Функция для установки темы
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggleButton = document.getElementById('theme-toggle');
    if (theme === 'dark') {
        toggleButton.innerHTML = '<i class="fas fa-sun"></i> Светлая тема';
        toggleButton.setAttribute('aria-label', 'light');
    } else {
        toggleButton.innerHTML = '<i class="fas fa-moon"></i> Тёмная тема';
        toggleButton.setAttribute('aria-label', 'dark');
    }
    localStorage.setItem('theme', theme);
}

// Функция для получения текущей темы
function getTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Функция для начала упражнения
function startExercise() {
    const mode = config.modes[config.currentMode];
    
    if (config.currentMode === 'randomSentences') {
        currentText = mode.generate();
    } else {
        currentText = mode.generate(config.length);
    }
    
    displayText();
    userInput.disabled = false;
    userInput.value = '';
    userInput.focus();
    
    startBtn.disabled = true;
    resetBtn.disabled = false;
    
    correctChars = 0;
    totalTyped = 0;
    currentCharIndex = 0;
    updateStats(0, 100);
    
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
    
    // Показать клавиатуру
    keyboardContainer.classList.add('visible');
}

// Функция для отображения текста
function displayText() {
    let html = '';
    for (let i = 0; i < currentText.length; i++) {
        let charClass = '';
        if (i < currentCharIndex) {
            charClass = userInput.value[i] === currentText[i] ? 'correct' : 'incorrect';
        } else if (i === currentCharIndex) {
            charClass = 'current-char';
        }
        html += `<span class="${charClass}">${currentText[i]}</span>`;
    }
    textDisplay.innerHTML = html;
}

// Функция для сброса упражнения
function resetExercise() {
    clearInterval(timerInterval);
    userInput.disabled = true;
    startBtn.disabled = false;
    resetBtn.disabled = true;
    userInput.value = '';
    textDisplay.textContent = 'Выберите режим и нажмите "Начать"';
    updateStats(0, 100);
    timeDisplay.textContent = '0:00';
    keyboardContainer.classList.remove('visible');
    clearKeyHighlights();
}

// Функция обновления таймера
function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = Math.floor((currentTime - startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    if (elapsedTime > 0) {
        const cpm = Math.floor((correctChars / elapsedTime) * 60);
        const accuracy = totalTyped > 0 ? Math.floor((correctChars / totalTyped) * 100) : 100;
        updateStats(cpm, accuracy);
    }
}

// Функция обновления статистики
function updateStats(cpm, accuracy) {
    cpmDisplay.textContent = cpm;
    accuracyDisplay.textContent = accuracy;
}

// Функция завершения упражнения
function finishExercise() {
    clearInterval(timerInterval);
    userInput.disabled = true;
    
    const endTime = new Date();
    const elapsedTime = (endTime - startTime) / 1000;
    const cpm = Math.floor((correctChars / elapsedTime) * 60);
    const accuracy = Math.floor((correctChars / totalTyped) * 100);
    
    sessionStats.push({
        cpm: cpm,
        accuracy: accuracy,
        date: new Date()
    });
    
    updateProgressChart();
    
    textDisplay.innerHTML += '<p style="color: var(--success-green);">Упражнение завершено!</p>';
    keyboardContainer.classList.remove('visible');
    clearKeyHighlights();
}

// Функция обновления графика прогресса
function updateProgressChart() {
    const labels = sessionStats.map((_, i) => `Попытка ${i + 1}`);
    const data = sessionStats.map(stat => stat.cpm);
    
    progressChart.data.labels = labels;
    progressChart.data.datasets[0].data = data;
    progressChart.update();
}

// Функция для очистки подсветки клавиш
function clearKeyHighlights() {
    document.querySelectorAll('.key').forEach(key => {
        key.classList.remove('active');
    });
}

// Функция для подсветки клавиши
function highlightKey(char) {
    clearKeyHighlights();
    let keyChar = char === ' ' ? 'space' : char;
    // Handle special characters
    const specialChars = {
        '.': '.',
        ',': ',',
        '-': '-',
        '=': '=',
        '\\': '\\',
        '`': '`'
    };
    if (specialChars[keyChar]) {
        keyChar = specialChars[keyChar];
    }
    const keyElement = document.querySelector(`.key[data-char="${keyChar}"]`);
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 300); // Animation duration
    } else {
        console.warn(`Key not found for character: ${char}`);
    }
}

// Инициализация приложения
function init() {
    // Установка начальной темы
    setTheme(getTheme());

    // Обработчик переключения темы
    const toggleButton = document.getElementById('theme-toggle');
    toggleButton.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // Создаем элементы выбора режима
    const modeSelectContainer = document.getElementById('modeSelectContainer');
    let modeSelectHTML = '<label for="modeSelect">Режим:</label><select id="modeSelect">';
    
    for (const mode in config.modes) {
        modeSelectHTML += `<option value="${mode}">${config.modes[mode].name}</option>`;
    }
    
    modeSelectHTML += '</select>';
    modeSelectContainer.innerHTML = modeSelectHTML;
    
    // Инициализация графика
    progressChart = new Chart(progressChartCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Символов в минуту',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Обработчики событий
    document.getElementById('modeSelect').addEventListener('change', function(e) {
        config.currentMode = e.target.value;
    });
    
    startBtn.addEventListener('click', startExercise);
    resetBtn.addEventListener('click', resetExercise);
    
    userInput.addEventListener('input', (e) => {
        const inputText = e.target.value;
        totalTyped++;
        
        if (inputText[inputText.length - 1] === currentText[inputText.length - 1]) {
            correctChars++;
        }
        
        currentCharIndex = inputText.length;
        displayText();
        
        // Подсветка клавиши
        const lastChar = inputText[inputText.length - 1];
        if (lastChar) {
            highlightKey(lastChar);
        }
        
        if (inputText.length === currentText.length) {
            finishExercise();
        }
    });
    
    // Обработчик нажатия клавиш для backspace
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && userInput.value.length > 0) {
            const prevChar = userInput.value[userInput.value.length - 1];
            highlightKey(prevChar);
        } else if (e.key === 'Backspace') {
            clearKeyHighlights();
        }
    });
}

// Запускаем приложение
document.addEventListener('DOMContentLoaded', init);