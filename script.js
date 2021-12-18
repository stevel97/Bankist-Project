'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// UI Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-11-18T21:31:17.178Z',
    '2020-12-23T07:42:02.383Z',
    '2021-01-28T09:15:04.904Z',
    '2021-04-01T10:17:24.185Z',
    '2021-05-08T14:11:59.604Z',
    '2021-10-26T17:01:17.194Z',
    '2021-12-01T23:36:17.929Z',
    '2021-12-06T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,

  movementsDates: [
    '2020-11-01T13:15:33.035Z',
    '2020-11-30T09:48:16.867Z',
    '2020-11-25T06:04:23.907Z',
    '2021-01-25T14:18:46.235Z',
    '2021-02-05T16:33:06.386Z',
    '2021-04-10T14:43:26.374Z',
    '2021-06-25T18:49:59.371Z',
    '2021-07-26T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'en-US',
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,

  movementsDates: [
    '2021-04-01T13:15:33.035Z',
    '2021-05-30T09:48:16.867Z',
    '2021-06-25T06:04:23.907Z',
    '2021-08-25T14:18:46.235Z',
    '2021-11-05T16:33:06.386Z',
  ],
  currency: 'EUR',
  locale: 'de-DE',
};

// Global Variables

let accounts = [account1, account2, account3, account4];
let currentAccount;
let timer;
let sort = false;

// Functions

const resetTimer = () => (timer = 120);

const calcBalance = account => {
  account.balance = account.movements.reduce((acc, value) => acc + value, 0);
};

function calcSummary(account) {
  account.deposits = account.movements.reduce(
    (acc, value) => (value > 0 ? acc + value : acc),
    0
  );
  account.withdrawls = account.movements.reduce(
    (acc, value) => (value < 0 ? acc + Math.abs(value) : acc),
    0
  );
  calcBalance(account);
  account.interest = (account.balance * account.interestRate) / 100;
}

const dispMovements = account => {
  containerMovements.innerHTML = '';

  let movDisp = account.movements;
  let movDates = account.movementsDates;

  if (sort) {
    const indices = Array.from(account.movements.keys()).sort(
      (a, b) => account.movements[a] - account.movements[b]
    );
    movDisp = indices.map(i => account.movements[i]);
    movDates = indices.map(i => account.movementsDates[i]);
  }

  movDisp.forEach((mov, i) => {
    let date = '';
    const dateTransaction = movDates[i];
    const dateVsToday =
      Math.abs(Date.parse(dateTransaction) - Date.now()) /
      (1000 * 60 * 60 * 24);
    if (dateVsToday < 1) date = 'Today';
    else if (dateVsToday > 1 && dateVsToday < 2) date = 'Yesterday';
    else if (dateVsToday > 2 && dateVsToday < 7)
      date = `${Math.trunc(dateVsToday)} days ago`;
    else date = displayDate(Date.parse(dateTransaction), false);
    const type = mov < 0 ? 'withdrawal ' : 'deposit';
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${date}</div>
    <div class="movements__value">${displayCurrency(
      account.locale,
      account.currency,
      Math.abs(mov)
    )}</div>
</div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const dispBalance = account => {
  const amt = displayCurrency(
    account.locale,
    account.currency,
    account.balance
  );
  labelBalance.textContent = `${amt}`;
};

const dispSummary = account => {
  const locale = account.locale;
  const currency = account.currency;
  labelSumIn.textContent = `${displayCurrency(
    locale,
    currency,
    account.deposits
  )}`;
  labelSumOut.textContent = `${displayCurrency(
    locale,
    currency,
    account.withdrawls
  )}`;
  labelSumInterest.textContent = `${displayCurrency(
    locale,
    currency,
    account.interest
  )}`;
};

const updateUI = account => {
  calcBalance(account);
  dispBalance(account);
  calcSummary(account);
  dispSummary(account);
  dispMovements(account, false);
};

const calcUsername = account => {
  account.username = account.owner
    .toLowerCase()
    .split(' ')
    .reduce((acc, word) => acc + word.substr(0, 1), '');
};

const displayDate = (date, displayTime) => {
  if (displayTime)
    return new Intl.DateTimeFormat(currentAccount.locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  else
    return new Intl.DateTimeFormat(currentAccount.locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(date);
};

const displayCurrency = (locale, currency, amt) => {
  return amt.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
  });
};

const displayTimer = () => {
  const minutes = Math.trunc(timer / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timer % 60).toString().padStart(2, '0');
  labelTimer.textContent = `${minutes}:${seconds}`;
};

const login = e => {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner}`;
    const date = new Date();
    sort = false;
    labelDate.textContent = displayDate(date, true);
    updateUI(currentAccount);
    containerApp.style.opacity = 100;
    inputLoginPin.blur();
    resetTimer();
    displayTimer();
  } else {
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Please enter valid username and pasword';
  }
};

const transfer = e => {
  e.preventDefault();
  const transferAmt = Number(inputTransferAmount.value);
  const recipientAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  if (
    recipientAccount &&
    transferAmt > 0 &&
    transferAmt <= currentAccount.balance
  ) {
    const date = new Date().toISOString();
    currentAccount.movements.push(-transferAmt);
    currentAccount.movementsDates.push(date);
    recipientAccount.movements.push(transferAmt);
    recipientAccount.movementsDates.push(date);
    updateUI(currentAccount);
  }
  inputTransferAmount.value = '';
  inputTransferTo.value = '';
  inputTransferAmount.blur();
  resetTimer();
};

const loanRequest = e => {
  e.preventDefault();
  const loanAmt = Number(inputLoanAmount.value);
  const conditionMet = currentAccount.movements.some(
    mov => mov > loanAmt * 0.1
  );
  if (loanAmt > 0 && conditionMet) {
    setTimeout(() => {
      currentAccount.movements.push(loanAmt);
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
    }, 3000);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
  resetTimer();
};

const closeAccount = e => {
  e.preventDefault();
  const confirmUsername = inputCloseUsername.value;
  const confirmUserPin = Number(inputClosePin.value);
  if (
    confirmUsername === currentAccount.username &&
    confirmUserPin === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
  inputCloseUsername.value = '';
  inputClosePin.value = '';
  inputClosePin.blur();
  resetTimer();
};

const toggleSort = e => {
  e.preventDefault();
  sort = !sort;
  dispMovements(currentAccount);
  resetTimer();
};

/////////////////////////
// Main body
/////////////////////////

// Calculate usernames

accounts.forEach(calcUsername);

// Button event listeners

btnLogin.addEventListener('click', login);
btnTransfer.addEventListener('click', transfer);
btnLoan.addEventListener('click', loanRequest);
btnClose.addEventListener('click', closeAccount);
btnSort.addEventListener('click', toggleSort);

setInterval(() => {
  displayTimer();
  if (timer === 0) {
    labelWelcome.textContent = 'Log in to get started';
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    containerApp.style.opacity = 0;
  }
  timer--;
}, 1000);
