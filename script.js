// write javascript here

const categoryOption = document.querySelector('.categoryOption');

const quizForm = document.querySelector('.form-quiz');
const btnStartQuiz = document.querySelector('.btn--start-quiz');
const errorMessage = document.querySelector('.error-message');
const inputAmount = document.querySelector('#question-number');

const questionContainer = document.querySelector('#question-container');
const questionEl = document.querySelector('#question');
const answersContainer = document.querySelector('#answers-container');
const nextBtn = document.querySelector('#next-btn');
const timer = document.querySelector('#timer');
const restartBtn = document.querySelector('#restart-btn');
const finalScore = document.querySelector('#final-score');
const score = document.querySelector('#score');

const modal = document.querySelector('.model-popup__overlay');
const cancleBtn = document.querySelector('#cancel-btn');
const confirmBtn = document.querySelector('#confirm-btn');
const quitBtn = document.querySelector('#quit-btn');
const spinner = document.querySelector('.loader-spinner');

const screen1 = document.querySelector('#screen1');
const screen2 = document.querySelector('#screen2');
const screen3 = document.querySelector('#screen3');
const screen4 = document.querySelector('#model-popup');

class Quiz {
  #questions = [];
  #currentQuestionIndex = 0;
  #correctAnswer;
  #score = 0;
  #countdown = 30; // seconds
  #interval;

  constructor() {
    this.#init();
  }

  async #init() {
    this.#getCategory();
    btnStartQuiz.addEventListener('click', this.#startQuiz.bind(this));
    nextBtn.addEventListener('click', this.#nextQuestion.bind(this));
    [restartBtn, confirmBtn].forEach(btn =>
      btn.addEventListener('click', this.#cancelQuiz.bind(this))
    );
    quitBtn.addEventListener('click', () => {
      screen4.classList.remove('hidden');
    });
    [modal, cancleBtn].forEach(btn =>
      btn.addEventListener('click', () => {
        screen4.classList.add('hidden');
      })
    );
  }

  async #getCategory() {
    try {
      const resCat = await fetch('https://opentdb.com/api_category.php');
      if (!resCat.ok)
        throw new Error(`Error fetching categories: ${resCat.status}`);
      const catData = await resCat.json();
      const markup = catData.trivia_categories
        .map(cat => `<option value="${cat.id}">${cat.name}</option>`)
        .join('');
      categoryOption.firstElementChild.insertAdjacentHTML('afterend', markup);
    } catch (error) {
      console.error(error);
    }
  }

  async #startQuiz(e) {
    e.preventDefault();

    const amountValue = parseInt(inputAmount.value);

    if (isNaN(amountValue) || amountValue < 1 || amountValue > 50) {
      errorMessage.classList.remove('hidden');
      inputAmount.classList.add('error-border');
      return;
    } else {
      errorMessage.classList.add('hidden');
      inputAmount.classList.remove('error-border');
    }

    try {
      spinner.classList.remove('hidden');
      screen1.classList.add('hidden');

      const formData = Object.fromEntries([...new FormData(quizForm)]);
      const category = formData.category
        ? `&category=${formData.category}`
        : '';
      const difficulty = formData.difficulty
        ? `&difficulty=${formData.difficulty}`
        : '';
      const type = formData.type ? `&type=${formData.type}` : '';

      const resQuestions = await fetch(
        `https://opentdb.com/api.php?amount=${amountValue}${category}${difficulty}${type}`
      );
      const questionData = await resQuestions.json();

      if (questionData.response_code === 1) {
        alert(
          "No Results Could not return results. The API doesn't have enough questions for your query."
        );
      }
      if (questionData.response_code === 2) {
        alert("Arguements passed in aren't valid.");
      }
      if (!resQuestions.ok)
        alert(`Error fetching questions: ${resQuestions.status}`);
      if (questionData.response_code === 5) {
        alert('Rate Limit Too many requests have occurred.');
      }

      spinner.classList.add('hidden');
      screen2.classList.remove('hidden');
      this.#displayQuestion(questionData.results);
    } catch (error) {
      console.error(error);
    }
  }

  #displayQuestion(questions) {
    spinner.classList.add('hidden');
    this.#questions = questions;
    this.#currentQuestionIndex = 0;
    this.#setQuestion();
  }

  async #setQuestion() {
    const currentQue = document.querySelector('.currentQue');
    currentQue.textContent = this.#currentQuestionIndex + 1;
    const totalQue = document.querySelector('.totalQue');
    totalQue.textContent = this.#questions.length;

    const question = this.#questions[this.#currentQuestionIndex];

    questionEl.textContent = question.question;
    this.#correctAnswer = question.correct_answer;
    const answers = question.incorrect_answers.concat(question.correct_answer);

    answersContainer.innerHTML = '';
    answers.sort(() => Math.random() - 0.5);
    answers.forEach(answer => {
      const btn = document.createElement('button');
      btn.classList.add('btn--answer');
      btn.textContent = answer;
      btn.addEventListener('click', this.#answerClicked.bind(this));
      answersContainer.appendChild(btn);
    });

    this.#countdown = 30;
    clearInterval(this.#interval);
    this.#timerCounter();
  }

  #timerCounter() {
    timer.textContent = this.#countdown;
    this.#interval = setInterval(() => {
      timer.textContent = this.#countdown;
      this.#countdown--;
      if (this.#countdown < 0) {
        clearInterval(this.#interval);
        nextBtn.click();
      }
    }, 1000);
  }

  #answerClicked(e) {
    const selectedAnswer = e.target.textContent;

    const allButtons = answersContainer.querySelectorAll('.btn--answer');
    allButtons.forEach(btn => (btn.disabled = true));

    if (selectedAnswer === this.#correctAnswer) {
      e.target.classList.add('btn--correct');
      this.#score++;
      score.textContent = this.#score;
    } else {
      e.target.classList.add('btn--incorrect');
      allButtons.forEach(btn => {
        if (btn.textContent === this.#correctAnswer) {
          btn.classList.add('btn--correct');
        }
      });
    }
  }

  #nextQuestion() {
    this.#currentQuestionIndex++;
    if (this.#currentQuestionIndex < this.#questions.length) {
      clearInterval(this.#interval);
      this.#setQuestion();
    } else {
      screen1.classList.add('hidden');
      screen2.classList.add('hidden');
      screen3.classList.remove('hidden');
      finalScore.textContent = this.#score;
    }
  }

  #cancelQuiz() {
    this.#countdown = 5;
    clearInterval(this.#interval);
    timer.textContent = this.#countdown;
    this.#questions = [];
    this.#currentQuestionIndex = 0;
    this.#score = 0;
    screen1.classList.remove('hidden');
    screen2.classList.add('hidden');
    screen3.classList.add('hidden');
    screen4.classList.add('hidden');
  }
}

new Quiz();
