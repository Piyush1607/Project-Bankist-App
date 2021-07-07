'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
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
const accounts = [account1, account2];
// Elements
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

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const EUR ='€'
/////////////////////////////////////////////////

// FUNCTIONS

// LogOut if Inactive for certain time
const startLogOutTimer=function(){
  let time = 300;

  const tick=function(){
    const min = String(Math.trunc(time/60)).padStart(2,0)
    const sec = String(Math.trunc(time%60)).padStart(2,0)
    labelTimer.textContent=`${min}:${sec}`
    
    if(time===0){
      clearInterval(timer)
      containerApp.style.opacity=0;
      labelWelcome.textContent=`Log in to get started`
    }
    time--
  }
  tick()
  const timer=setInterval(tick,1000)
  return timer;
}

//date formatter
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

// currency formatter
const formatCurr = function(value,locale,curr){
  return new Intl.NumberFormat(locale,{
    style : 'currency',
    currency : curr
  }).format(value)
}

// DISPLAYING THE TRANSACTIONS IN A LIST STYLE
const displayMovements = function(acc,sort=false){ 
  containerMovements.innerHTML='';

  const movs=sort?acc.movements.slice().sort((a,b)=>a-b):acc.movements;
  movs.forEach(function(mov,i){ 
    const type = mov >0 ? 'deposit' : 'withdrawal';

    //dates
    const date = new Date (acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCurr(mov,acc.locale,acc.currency)
    const transaction = 
    `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin',transaction);
  })
}

// DISPLAYING THE ACCOUNT BALANCE
const displayBalance=function(acc){
  acc.balance = acc.movements.reduce((acc,curr)=>acc+curr,0);
  labelBalance.textContent = `${formatCurr(acc.balance,acc.locale,acc.currency)}`;
}

//displaying account summary 
const displaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCurr(incomes,acc.locale,acc.currency)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCurr(Math.abs(out),acc.locale,acc.currency)}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCurr(interest,acc.locale,acc.currency)}`;
};

// creating usernames 
const createUserName = function(accs){
  accs.forEach(function(acc){
    acc.username =acc.owner.toLowerCase().split(' ').map((name)=>name[0]).join('');
  });
}
createUserName(accounts);

//UPDATE UI
function updateUI(acc) {
  displayMovements(acc);

  //display balance
  displayBalance(acc);

  //display summary
  displaySummary(acc);
}

//------------------LOGIN EVENT------------------------------------
//Event handler

let currentAccount,timer;
btnLogin.addEventListener('click',function(e){
  //prevent submitting form
  e.preventDefault();
  // in forms , enter is automatically triggered as clicking the sumbit button

  currentAccount=accounts.find(acc=>acc.username===inputLoginUsername.value)
  //optional chaining is done so if an account does not exits , it doesn't throw error
  if(currentAccount?.pin===Number(inputLoginPin.value)) {
    console.log('LOGIN');
    // if LOGIN is SUCCESSFULL

    // display UI and Message
    labelWelcome.textContent =`Welcome back , ${currentAccount.owner.split(' ')[0]}` // first name only
    containerApp.style.opacity =100;

    //clearing login credentials
    inputLoginPin.value=inputLoginUsername.value=''

    // removing focus/cursor from the pin section
    inputLoginPin.blur()

    // adding date in our app
    const today = new Date();
    const options={
      hour : 'numeric',
      minute :'numeric',
      day :'numeric',
      month : 'long', //'numeric',
      year :'numeric'
    }
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale,options).format(today);
    //if there exist any timer , then we stop it
    if(timer) clearInterval(timer)
    //starting LogOut Timer
    timer =startLogOutTimer()
    //UPDATING UI
    updateUI(currentAccount);
  }
})

// Implementing Transfers
btnTransfer.addEventListener('click',function(e){
  // prevent reloading
  e.preventDefault();
  const amount = Number (inputTransferAmount.value);
  const receiverAcc = accounts.find(acc=>acc.username===inputTransferTo.value)
  
  //checking if we have sufficient funds and we don't transfer to ourselves

  if(amount>0 && amount<=currentAccount.balance &&receiverAcc&& receiverAcc?.username !== currentAccount.username){
    console.log('Transfer Valid');
    
    //Transferring money
    currentAccount.movements.push(-amount)
    receiverAcc.movements.push(amount)

    // add date 
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    //updating UI
    updateUI(currentAccount);
    
    //Resetting Timer
    clearInterval(timer)
    //starting LogOut Timer
    timer =startLogOutTimer()
  }

  inputTransferAmount.value=inputTransferTo.value='';
})

// DELETING Account 
btnClose.addEventListener('click',function(e){
  e.preventDefault();
  console.log('delete')
  if(inputCloseUsername.value===currentAccount.username && Number(inputClosePin.value)===currentAccount.pin){
    const index = accounts.findIndex(acc=>acc.username===currentAccount.username)
    //delete the account
    accounts.splice(index,1);
    //log out the user  
    containerApp.style.opacity=0;
  }
  //clearing credentials
  inputClosePin.value=inputCloseUsername.value='';
})

// LOANS  
btnLoan.addEventListener('click',function(e){
  e.preventDefault();
  const reqLoan = Number(inputLoanAmount.value);
  if(currentAccount.movements.some(mov=> mov >= reqLoan*0.1) && reqLoan>0 ){
    //timer for loan
    setTimeout(function(){// Add movement
      currentAccount.movements.push(reqLoan);
      // add date
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);
      //Resetting timer
      clearInterval(timer)
      //starting LogOut Timer
      timer =startLogOutTimer()
      },1500)
  }
  inputLoanAmount.value='';
});

// SORTING OPTION
let sorted = false // variabel to toggle sort
btnSort.addEventListener('click',function(e){
  e.preventDefault();
  displayMovements(currentAccount,!sorted)
  sorted = !sorted;
})

