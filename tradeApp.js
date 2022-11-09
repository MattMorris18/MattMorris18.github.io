let tradePageAccountValue = document.getElementById('accountValue');
let tradePageCashValue = document.getElementById('cashValue');

let tickerSearchButton = document.getElementById('tickerSearchButton');
let tickerSearchDropdown = document.getElementById('tickerSearchDropdown');
let tickerSelectionPreview = document.getElementById('tickerSelectionPreview');
let tickerSearchInput = document.getElementById('tickerSearchInput');
let quantityInput = document.getElementById('quantityInput');
let buySellSelector = document.getElementById('buySellSelector');

let tickerOrderPreview = document.getElementById('tickerOrderPreview');
let buySellPreview = document.getElementById('buySellPreview');
let orderPreviewQuantity = document.getElementById('orderPreviewQuantity');
let orderPreviewPrice = document.getElementById('orderPreviewPrice');
let orderPreviewTotal = document.getElementById('orderPreviewTotal');

let tradeEnterBtn = document.getElementById('tradeEnterBtn');
let tradeErrorMessage = document.getElementById('tradeErrorMessage');

let placeOrderButton = document.getElementById('placeOrderButton');
let placeOrderErrorMsg = document.getElementById('placeOrderErrorMsg');
let confirmationPopUp = document.getElementById('confirmationPopUp');
let noConfirmationButton = document.getElementById('noConfirmationButton');
let yesConfirmationButton = document.getElementById('yesConfirmationButton');

let accountValueTracker;
let cashValueTracker;

let tickerSearchInputUpper;
let searchResults = [];

let selectedTickerArray = [];

let selectedTicker;
let selectedCompany;
let buySell;
let quantity;
let stockPrice;
let total;
let today;
let time;

let holdings = [];
let transactions = [];

class Transaction {
    constructor(transactionType, symbol, description, quantity, pricePerShare, totalPrice , date, time) {
        this.transactionType = transactionType;
        this.symbol = symbol;
        this.description = description;
        this.quantity = quantity;
        this.pricePerShare = pricePerShare;
        this.totalPrice = totalPrice;
        this.date = date;
        this.time = time;
    };
};

class Holding {
    constructor (symbol, description, quantity, avgPricePerShare, initialPosition, startDate) {
        this.symbol = symbol;
        this.description = description;
        this.quantity = quantity;
        this.avgPricePerShare = avgPricePerShare;
        this.currentPrice = avgPricePerShare;
        this.initialPosition = initialPosition;
        this.startDate = startDate;
    };
};

setAccountValues();
initializer();

function initializer () {

    // if there is NO localstorage, create starting entry with todays date and 100000. Else set account values to localstorage values
    if (!localStorage.getItem('storageIndicator')) {

        // create first entry in account value log
        let accountValueEntry = new accountValueLogEntry(today, 100000);
        accountValueLog.push(accountValueEntry);
        let accountValueLogString = JSON.stringify(accountValueLog);
        localStorage.setItem('accountValueLog', accountValueLogString);
        // initialize account values to 100000, push all to localstorage, set values on DOM
        accountValueTracker = 100000;
        cashValueTracker = 100000;
        pushToLocalStorage();
        portfolioPageAccountValue.innerText = accountValueTracker.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
        portfolioPageCashValue.innerText = cashValueTracker.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
    } else {
        holdings = JSON.parse(localStorage.getItem('holdings'));
        transactions = JSON.parse(localStorage.getItem('transactions'));
        accountValueTracker = localStorage.getItem('accountValueTracker');
        cashValueTracker = localStorage.getItem('cashValueTracker');
        accountValueLog = JSON.parse(localStorage.getItem('accountValueLog'));
    };

};

function pushToLocalStorage () {
    
    // push holdings to local storage
    let holdingsString = JSON.stringify(holdings);
    localStorage.setItem('holdings', holdingsString);

    // push transactions to local storage
    let transactionString = JSON.stringify(transactions);
    localStorage.setItem('transactions', transactionString);

    // push account value to local storage
    localStorage.setItem('accountValueTracker', accountValueTracker);


    // push cash value to local storage
    localStorage.setItem('cashValueTracker', cashValueTracker);

    // indicate use of local storage
    localStorage.setItem('storageIndicator', 1);

};

function setAccountValues () {

    accountValueTracker = parseFloat(localStorage.getItem('accountValueTracker'));
    cashValueTracker = parseFloat(localStorage.getItem('cashValueTracker'));
    tradePageAccountValue.innerText = accountValueTracker.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
    tradePageCashValue.innerText = cashValueTracker.toLocaleString('us-US', { style: 'currency', currency: 'USD'});

    let holdingsJSON = JSON.parse(localStorage.getItem('holdings'));
    // console.log(holdingsJSON);
    holdings = holdingsJSON;
    let transactionsJSON = JSON.parse(localStorage.getItem('transactions'));
    // console.log(transactionsJSON);
    transactions = transactionsJSON;
};

async function getStockData(stockSymbols) {

    let url = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/'
    let stockSymbolsList = stockSymbols.join();
    url += stockSymbolsList;

            // un-comment API call when ready for use

    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '93d0c0b77fmshcfa49e78e4a6dbcp130daajsnf70e5df703e7',
            'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
        }
    };
    
    await fetch(url, options)
        .then(response => response.json())
        .then((response) => {
            // console.log(response);
            stockPrice = response[0]["bid"];

        })
        .catch((error) => {
            console.error(error);
        });   

        tickerOrderPreview.innerText = selectedTicker;
        buySellPreview.innerText = buySellSelector.value;
        orderPreviewQuantity.innerText = quantity;
        orderPreviewPrice.innerText = stockPrice.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
        total = stockPrice * quantity;
        orderPreviewTotal.innerText = total.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
    

};

tickerSearchButton.addEventListener('click', function() {
    tickerSearchDropdown.innerHTML = '';
    searchResults = [];
    tickerSearchInputUpper = tickerSearchInput.value.toUpperCase();
    searchTicker(tickerSearchInputUpper);    

});

tradeEnterBtn.addEventListener('click', function () {

        tradeErrorMessage.innerText = '';

        let float = parseFloat(quantityInput.value)
        if(isFloat(float)) {
            tradeErrorMessage.innerText = 'Decimal values will be truncated to whole numbers'
        };

        quantity = parseInt(quantityInput.value);

        if (checkTradeValuesTrue(quantity)) {
            selectedTickerArray = [];
            selectedTickerArray.push(selectedTicker);
            getStockData(selectedTickerArray);
            
        };   

});

placeOrderButton.addEventListener('click', function() {

    if (tickerOrderPreview.innerText) {
        confirmationPopUp.style.display = 'flex';
    };
    

});

noConfirmationButton.addEventListener('click', function () {

    confirmationPopUp.style.display = 'none';

});

yesConfirmationButton.addEventListener('click', function () {

    placeOrderErrorMsg.style.display = 'none';
    today = getTodaysDate();
    time = getTime();
    let transaction;

    // check if cash is greater than total price, if so make purchase
    if (buySellSelector.value == 'Buy' && cashValueTracker >= total) {
        transaction = new Transaction(buySellSelector.value, selectedTicker, selectedCompany, quantity, stockPrice, total, today, time);
        console.log(transaction);
        console.log(transactions);
        transactions.push(transaction);
        cashValueTracker -= total;
        editHoldings(buySellSelector.value, selectedTicker, selectedCompany, quantity, stockPrice, total, today);
    } else if (buySellSelector.value == 'Buy' && cashValueTracker < total) {
        // not enough cash!
        placeOrderErrorMsg.innerText = 'Not enough cash to make this purchase!'
        placeOrderErrorMsg.style.display = 'flex';
    };

    // check if user has enough shares to sell, if so make transaction
    if (buySellSelector.value == 'Sell') {

        let holdingIndex = checkIfHoldingExists(selectedTicker);

        if (holdingIndex == -1) {
            // this is not a holding
            placeOrderErrorMsg.innerText = 'You do not own any shares of this company!'
            placeOrderErrorMsg.style.display = 'flex';
        } else if (holdingIndex >= -1 && holdings[holdingIndex]['quantity'] < quantity) {
            // not enough shares!
            placeOrderErrorMsg.innerText = 'Not enough shares to make this transaction!'
            placeOrderErrorMsg.style.display = 'flex';

        } else if (holdingIndex >= -1 && holdings[holdingIndex]['quantity'] >= quantity) {
            console.log('exists and there are enough shares!')
            transaction = new Transaction(buySellSelector.value, selectedTicker, selectedCompany, quantity, stockPrice, total, today, time);
            transactions.push(transaction);
            cashValueTracker += total;
            // setAccountValues();
            editHoldings(buySellSelector.value, selectedTicker, selectedCompany, quantity, stockPrice, total, today);
        }; 
    };

    pushToLocalStorage();
    setAccountValues();
    confirmationPopUp.style.display = 'none';

});

function editHoldings (tranactionType, symbol, description, quantity, pricePerShare, totalPrice, date) {

    let holdingIndex = checkIfHoldingExists(symbol);
    let updatedavgPrice;


    // buy transaction and holding exists
    if (tranactionType == 'Buy' && holdingIndex > -1) {

        // then update existing holding
        holdings[holdingIndex]['quantity'] += quantity;
        holdings[holdingIndex]['initialPosition'] += totalPrice;

        updatedavgPrice = holdings[holdingIndex]['initialPosition'] / holdings[holdingIndex]['quantity'];
        updatedavgPrice = parseFloat(updatedavgPrice);
        holdings[holdingIndex]['avgPricePerShare'] = updatedavgPrice;

    // buy transaction and holding does not exist, create new holding
    } 
    // create new holding
    else if (tranactionType == 'Buy' && holdingIndex == -1) {
        let holding = new Holding(symbol, description, quantity, pricePerShare, totalPrice, date)
        holdings.push(holding);
    };
    // if sell, edit holding
    if (tranactionType == 'Sell') {
        // if quantity is equal to holding quantity then splice, otherwise edit quantity and total position
        if (holdings[holdingIndex]['quantity'] == quantity) {
            holdings.splice(holdingIndex);

        } else if (holdings[holdingIndex]['quantity'] > quantity) {
            holdings[holdingIndex]['quantity'] -= quantity;
            holdings[holdingIndex]['initialPosition'] -= totalPrice;
        };
    };
};

function checkIfHoldingExists (symbol) {

    result = -1;

    for (var i = 0; i < holdings.length; i++) {

        if (holdings[i]["symbol"] == symbol) {
    
            result = i;
        };
    
    };

    return result;

};

function checkTradeValuesTrue(quantity) {

    let tradeValuesResponse;

    if (!selectedTicker) {
        // console.log('no ticker selected');
        tradeValuesResponse = false;
    } else {
        // console.log('ticker selected');

        if (!checkQuantityIsInteger(quantity)) {
            // console.log('not a quantity');
            tradeValuesResponse = false;
        } else {
            // console.log('usable quantity');

            if (!checkBuySellOption(buySellSelector.value)) {
                // console.log('no buy sell selected');
                tradeValuesResponse = false;
            } else {
                // console.log('buy sell selected');
                // console.log('all true, get price and send to preview');
                tradeValuesResponse = true;
            };
        };
    };

    return tradeValuesResponse;
};

function checkBuySellOption (buySellInput) {

    let buySellResponse;

if (buySellInput == 'Buy / Sell') {
    tradeErrorMessage.innerText = 'Please select Buy or Sell'
    buySellResponse = false;
} else {
    buySellResponse = true;
};

    return buySellResponse;

};

function checkQuantityIsInteger (quantity) {
    let integerResponse;
    let errorMSG;
    let number;

    tradeErrorMessage.innerText = '';

    if (quantity) {
        number = Number.isInteger(quantity);
        if (number) {
            integerResponse = true;
        } else {
            errorMSG = 'Please enter a numerical value in Quantity'
            tradeErrorMessage.innerText = errorMSG;
            integerResponse = false;
        };

    } else { 
        errorMSG = 'Please enter a numerical value in Quantity'
        tradeErrorMessage.innerText = errorMSG;
        integerResponse = false;
    };

    return integerResponse;

};

function searchTicker(searchInput) {

    fetch('./source.json')
        .then((response) => response.json())
        .then((json) => {

            for (var i = 0; i < json.length; i++) {

                if (json[i]["ticker"].includes(searchInput)) {
        
                    searchResults.push(json[i]);
        
                    if (searchResults.length === 4) {
                        
                        break;
                        
                    };
                };
        
            };

            addTickersToDropdown(searchResults);
            
        });
        
};

function addTickersToDropdown (searchArray) {

    for (let i = 0; i < searchArray.length; i++) {

        let tickerOption = document.createElement('div');
            tickerOption.classList.add('searchResults');
        let ticker = document.createElement('b');
        let tickerSpan = document.createElement('span');
            ticker.innerText = searchArray[i]['ticker']; 
        let companyName = searchArray[i]['name'];
            tickerSpan.innerText = ' : ' + companyName;
            tickerOption.appendChild(ticker);
            tickerOption.appendChild(tickerSpan);
            tickerSearchDropdown.appendChild(tickerOption);

        
        tickerOption.addEventListener('click', function() {

                    tickerSelectionPreview.innerHTML = '';
                    ticker.innerText = searchArray[i]['ticker']; 
                    tickerSpan.innerText = ' : ' + searchArray[i]['name'];
                    selectedCompany = searchArray[i]['name'];
                    tickerSelectionPreview.appendChild(ticker);
                    tickerSelectionPreview.appendChild(tickerSpan);
                    tickerSelectionPreview.appendChild(tickerOption);
                    selectedTicker = searchArray[i]['ticker']; 
                    tickerSearchInput.value = "";

            tickerSearchDropdown.style.display = 'none';
        });

    };

    tickerSearchDropdown.style.display = 'grid';

};
    
function isFloat(number) {
    return Number(number) === number && number % 1 !== 0;
};

function getTodaysDate() {
    return new Date().toLocaleDateString();
};

function getTime() {
    return new Date().toLocaleTimeString();
};
