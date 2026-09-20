const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('.calculator__theme-icon');

function updateTheme(isDarkMode) {
  document.body.classList.toggle('dark-mode', isDarkMode);

  themeIcon.textContent = isDarkMode ? '☀' : '☾';

  themeToggle.setAttribute(
    'aria-label',
    isDarkMode ? 'Switch to light mode' : 'Switch to dark mode',
  );

  themeToggle.setAttribute('aria-pressed', String(isDarkMode));

  localStorage.setItem('calculator-theme', isDarkMode ? 'dark' : 'light');
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('calculator-theme');
  const prefersDarkMode = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;

  const isDarkMode =
    savedTheme === 'dark' || (savedTheme === null && prefersDarkMode);

  updateTheme(isDarkMode);
}

themeToggle.addEventListener('click', () => {
  const isDarkMode = !document.body.classList.contains('dark-mode');

  updateTheme(isDarkMode);
});

initializeTheme();

const display = document.querySelector('#calculator-display');
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const actionButtons = document.querySelectorAll('[data-action]');

let currentValue = '0';
let previousValue = null;
let operator = null;
let shouldResetDisplay = false;

function updateDisplay() {
  display.textContent = currentValue;
}

function inputNumber(value) {
  if (shouldResetDisplay) {
    currentValue = value === '.' ? '0.' : value;
    shouldResetDisplay = false;
    updateDisplay();
    return;
  }

  if (value === '.' && currentValue.includes('.')) {
    return;
  }

  if (currentValue === '0' && value !== '.') {
    currentValue = value;
  } else {
    currentValue += value;
  }

  updateDisplay();
}

function chooseOperator(selectedOperator) {
  if (operator && !shouldResetDisplay) {
    calculate();
  }

  previousValue = Number(currentValue);
  operator = selectedOperator;
  shouldResetDisplay = true;
}

function calculate() {
  if (operator === null || previousValue === null) {
    return;
  }

  const currentNumber = Number(currentValue);
  let result;

  switch (operator) {
    case '+':
      result = previousValue + currentNumber;
      break;

    case '-':
      result = previousValue - currentNumber;
      break;

    case '*':
      result = previousValue * currentNumber;
      break;

    case '/':
      if (currentNumber === 0) {
        showError();
        return;
      }

      result = previousValue / currentNumber;
      break;

    default:
      return;
  }

  currentValue = formatResult(result);
  previousValue = null;
  operator = null;
  shouldResetDisplay = true;
  updateDisplay();
}

function calculatePercentage() {
  const value = Number(currentValue);

  if (previousValue !== null && operator) {
    currentValue = formatResult((previousValue * value) / 100);
  } else {
    currentValue = formatResult(value / 100);
  }

  updateDisplay();
}

function deleteLastDigit() {
  if (shouldResetDisplay || currentValue === 'Error') {
    return;
  }

  if (currentValue.length === 1) {
    currentValue = '0';
  } else {
    currentValue = currentValue.slice(0, -1);

    if (currentValue === '-' || currentValue === '') {
      currentValue = '0';
    }
  }

  updateDisplay();
}

function clearCalculator() {
  currentValue = '0';
  previousValue = null;
  operator = null;
  shouldResetDisplay = false;
  updateDisplay();
}

function showError() {
  currentValue = 'Error';
  previousValue = null;
  operator = null;
  shouldResetDisplay = true;
  updateDisplay();
}

function formatResult(value) {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  return Number.parseFloat(value.toFixed(10)).toString();
}

function handleKeyboardInput(event) {
  const { key } = event;

  if (/^[0-9.]$/.test(key)) {
    inputNumber(key);
    return;
  }

  if (['+', '-', '*', '/'].includes(key)) {
    chooseOperator(key);
    return;
  }

  if (key === '%') {
    calculatePercentage();
    return;
  }

  if (key === 'Enter' || key === '=') {
    calculate();
    return;
  }

  if (key === 'Backspace') {
    deleteLastDigit();
    return;
  }

  if (key === 'Escape' || key.toLowerCase() === 'c') {
    clearCalculator();
  }
}

numberButtons.forEach((button) => {
  button.addEventListener('click', () => {
    inputNumber(button.dataset.number);
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener('click', () => {
    chooseOperator(button.dataset.operator);
  });
});

actionButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    if (action === 'clear') {
      clearCalculator();
    }

    if (action === 'delete') {
      deleteLastDigit();
    }

    if (action === 'percentage') {
      calculatePercentage();
    }

    if (action === 'calculate') {
      calculate();
    }
  });
});

document.addEventListener('keydown', handleKeyboardInput);
