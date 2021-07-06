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

/////////////////////////////////////////////////

// DISPLAYING THE TRANSACTIONS IN A LIST STYLE
const displayMovements = function(movements,sort=false){ 
  containerMovements.innerHTML='';

  const movs=sort?movements.slice().sort((a,b)=>a-b):movements;
  movs.forEach(function(mov,i){ 
    const type = mov >0 ? 'deposit' : 'withdrawal';
    const transaction = 
    `<div class="movements__row">
      <div class="movements__type movements__type--${type}">${i+1} ${type}</div>
      <div class="movements__value">${mov}</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin',transaction);
  })
}

// DISPLAYING THE ACCOUNT BALANCE
const displayBalance=function(acc){
  acc.balance = acc.movements.reduce((acc,curr)=>acc+curr,0);
  labelBalance.textContent=`${acc.balance} $`;
}

//displaying account summary 
const displaySummary=function(account){
  labelSumIn.textContent = `${account.movements.filter(mov=>mov>0).reduce((acc,depo)=>acc+depo,0)}€`;
  labelSumOut.textContent= `${account.movements.filter(mov=>mov<0).reduce((acc,depo)=>acc+Math.abs(depo),0)}€`;
  labelSumInterest.textContent = `${account.movements.filter(mov=>mov>0).map(mov=>mov*account.interestRate/100).filter(inte=>inte>1).reduce((acc,inte)=>acc+inte,0)}€`
}

// creating usernames 
const createUserName = function(accs){
  accs.forEach(function(acc){
    acc.username =acc.owner.toLowerCase().split(' ').map((name)=>name[0]).join('');
  });
}
createUserName(accounts);

//UPDATE UI
function updateUI(acc) {
  displayMovements(acc.movements);

  //display balance
  displayBalance(acc);

  //display summary
  displaySummary(acc);
}

//------------------LOGIN EVENT------------------------------------
//Event handler

let currentAccount;
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

    //updating UI
    updateUI(currentAccount);
  }
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
    currentAccount.movements.push(reqLoan);
    updateUI(currentAccount);
  }
  inputLoanAmount.value='';
});

// SORTING OPTION
let sorted = false // variabel to toggle sort
btnSort.addEventListener('click',function(e){
  e.preventDefault();
  displayMovements(currentAccount.movements,!sorted)
  sorted = !sorted;
})

