'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

  movs=sort?movements.slice().sort((a,b)=>a-b):movements;
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
function upddateUI(acc) {
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
    upddateUI(currentAccount);
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
    upddateUI(currentAccount);
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

