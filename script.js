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