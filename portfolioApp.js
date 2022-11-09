let portfolioPageAccountValue = document.getElementById('accountValue');
let portfolioPageCashValue = document.getElementById('cashValue');

let portfolioTotalReturn = document.getElementById('portfolioTotalReturn');
let portfolioReturnPercentage = document.getElementById('portfolioReturnPercentage');

let lineChartBtn = document.getElementById('lineChartBtn');
let pieChartBtn = document.getElementById('pieChartBtn');

let chartContainer = document.getElementById('chartContainer');
let portfolioHoldingsChart = document.getElementById('portfolioHoldingsChart');
let portfolioPerformanceChart = document.getElementById('portfolioPerformanceChart');

let deleteLocalStorageBtn = document.getElementById('deleteLocalStorage');
let refreshHoldingsBtn = document.getElementById('refreshHoldingsBtn');

let holdings = [];
let holdingSymbols = [];
let transactions = [];

let accountValueTracker = [];
let cashValueTracker = [];

let accountValueLog = [];

let holdingsTable = document.getElementById('holdingsTable');
let transactionsTable = document.getElementById('transactionsTable');

let tradeHistoryBtn = document.getElementById('tradeHistoryBtn');

let overlay = document.getElementById('overlay');

let pieChart;
let lineChart;

let today = getTodaysDate()

class accountValueLogEntry {
    constructor (date, accountValue) {
        this.date = date;
        this.accountValue = accountValue;
    };
};

initializer();
setAccountValues();
trackProgress(today);

if (holdings) {
    addHoldingsToTable();
    let chartinit = setTimeout(createLineChart, 150);
};



function initializer () {

    // if there is NO localstorage, create starting entry with todays date and 100000. Else set account values to localstorage values
    if (!localStorage.getItem('storageIndicator')) {

        // create first entry in account value log
        let accountValueEntry = new accountValueLogEntry(today, 100000);
        accountValueLog.push(accountValueEntry);
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

function trackProgress (todaysDate) {

    let logIndex = checkIfTodayisLogged(todaysDate);
    // check if today has been logged to accountvaluelog. If yes, update entry with current account value. else, create new entry for today
        if (logIndex > -1) {
            //today exists in log
            accountValueLog[logIndex]['accountValue'] = accountValueTracker;
        } else {
            //today does not exist in log
            let newEntry = new accountValueLogEntry(todaysDate, accountValueTracker);
            accountValueLog.push(newEntry);
        };
        pushToLocalStorage();
};

// checks if today is logged in account value log, returns index value
function checkIfTodayisLogged (today) {
let logIndex = -1;

    for (let i = 0; i < accountValueLog.length; i++) {

        if (accountValueLog[i]['date'] == today) {
            logIndex = i;
        };
    };

    return logIndex;
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

    // push accountValueLog to local storage
    let accountValueLogString = JSON.stringify(accountValueLog);
    localStorage.setItem('accountValueLog', accountValueLogString);

    // indicate use of local storage
    localStorage.setItem('storageIndicator', 1);
    
    // reset existing values on DOM
    setAccountValues();

};

function setAccountValues () {

    accountValueTracker = parseFloat(localStorage.getItem('accountValueTracker'));
    cashValueTracker = parseFloat(localStorage.getItem('cashValueTracker'));
    portfolioPageAccountValue.innerText = accountValueTracker.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
    portfolioPageCashValue.innerText = cashValueTracker.toLocaleString('us-US', { style: 'currency', currency: 'USD'});

    let holdingsJSON = JSON.parse(localStorage.getItem('holdings'));
    holdings = holdingsJSON;
    let transactionsJSON = JSON.parse(localStorage.getItem('transactions'));
    transactions = transactionsJSON;

        let totalReturnPercentage = (accountValueTracker / 100000);

        if (totalReturnPercentage == 1) {
            portfolioReturnPercentage.innerText = 0 + '%';
            portfolioReturnPercentage.style.color = 'black';
        } else if (totalReturnPercentage > 1) {
            let percentGain = (totalReturnPercentage - 1) * 100
            portfolioReturnPercentage.innerText = percentGain.toFixed(2) + '%';
            portfolioReturnPercentage.style.color = 'green';        
        } else {
            let percentLoss = (totalReturnPercentage - 1) * 100
            portfolioReturnPercentage.innerText = percentLoss.toFixed(2) + '%';
            portfolioReturnPercentage.style.color = 'red';
        };
    
        let totalReturn = (accountValueTracker - 100000);

        if (totalReturn == 0) {
            portfolioTotalReturn.innerText = 0 + '%';
            portfolioTotalReturn.style.color = 'black';
        } else if (totalReturn > 0) {
            portfolioTotalReturn.innerText = totalReturn.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
            portfolioTotalReturn.style.color = 'green';        
        } else {
            portfolioTotalReturn.innerText = totalReturn.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
            portfolioTotalReturn.style.color = 'red';
        };

};

function calculateAccountValue () {

    let valueOfHoldings = 0;
    for (i = 0; i < holdings.length; i++) {

        let value = holdings[i]['quantity'] * holdings[i]['currentPrice'];
        valueOfHoldings += value;
    };
    accountValueTracker = valueOfHoldings + cashValueTracker;
    pushToLocalStorage();

};

// use holdings to create an array of just holdings symbols for use in API call
function updateHoldingSymbols() {

    holdingSymbols = [];

    for (let i = 0; i < holdings.length; i++) {
        holdingSymbols.push(holdings[i]['symbol'])
    };

    return holdingSymbols;

};

async function getStockData(stockSymbols) {
    
    let apiResponse;
    let url = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/'
    let stockSymbolsList = stockSymbols.join();
    url += stockSymbolsList;

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
            apiResponse = response;

        })
        .catch((error) => {
            console.error(error);
        });

        for (let i = 0; i < stockSymbols.length; i++) {

            let currentPriceOfStock = apiResponse[i]['bid'];
            holdings[i]['currentPrice'] = currentPriceOfStock;

        };

        pushToLocalStorage();
        addHoldingsToTable();
};

function createPieChart () {

    if (pieChart) {
        pieChart.destroy();
    };

    portfolioPerformanceChart.style.display = 'none';
    portfolioHoldingsChart.style.display = 'block';
    portfolioHoldingsChart.classList.add('showPieChart');

    let holdingsNamesArray = [];
    let holdingsValuesArray = [];
    

    for (let i = 0; i < holdings.length; i++) {
        let totalValue = holdings[i]['quantity'] * holdings[i]['currentPrice'];

        holdingsNamesArray.push(holdings[i]['symbol']);
        holdingsValuesArray.push(((totalValue / accountValueTracker) * 100).toFixed(2));

    };

    holdingsNamesArray.push('Cash');
    holdingsValuesArray.push(((cashValueTracker / accountValueTracker) * 100).toFixed(2));

    const data = {

        labels: holdingsNamesArray,
        datasets: [{
            label: 'Holdings by %',
            data: holdingsValuesArray,
            backgroundColor: [
                'Blue',
                'Green',
                'Red',
                'Orange',
                'Yellow',
                'Purple',
                'Pink',
                'White',
                'Black'
            ],
            hoverOffset: 5
        }]
    };


    pieChart = new Chart(portfolioHoldingsChart, {
        type: 'pie',
        data: data,
        options: {
            responsive: false,
            maintainAspectRatio: true,
            layout: {
                padding: {
                    bottom: 10
                }
            }
        }
    });

};

function createLineChart () {

    if (lineChart) {
        lineChart.destroy();
    };
    
    portfolioHoldingsChart.style.display = 'none';
    portfolioPerformanceChart.style.display = 'block';
    portfolioHoldingsChart.classList.remove('showPieChart');


    let holdingsDatesArray = [];
    let holdingsValuesArray = [];

    for (i = 0; i < accountValueLog.length; i++) {

        holdingsDatesArray.push(accountValueLog[i]['date']);
        holdingsValuesArray.push(accountValueLog[i]['accountValue']);

    };



    holdingsDatesArray.unshift('Start');
    holdingsValuesArray.unshift(100000);

    const data = {

        labels: holdingsDatesArray,
        datasets: [{
            label: 'Account Value',
            data: holdingsValuesArray,
            fill: true,
            borderColor: 'rgb(114, 136, 155)',
            tension: 0.1
        }]
    };


    lineChart = new Chart(portfolioPerformanceChart, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: {
                        callback: function(value, index, ticks) {
                            value = value.toLocaleString('us-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0});
                            return value
                        }
                    }
                }
            }
        }
    });

};

pieChartBtn.addEventListener('click', function () {
    createPieChart();
});

lineChartBtn.addEventListener('click', function () {
    createLineChart();
});


function deleteLocalStorage () {
    localStorage.clear();
};

deleteLocalStorageBtn.addEventListener ('click', function () {
    deleteLocalStorage();
});

// use holdings symbols to gather stock data from API
refreshHoldingsBtn.addEventListener('click', function () {
    getStockData(updateHoldingSymbols());
    setTimeout(() => {
        calculateAccountValue();
        trackProgress(today);
        createLineChart();
    }, 350);
});


function addHoldingsToTable () {

    let numberOfRows = holdingsTable.rows.length
    // reset table back to blank with just header row
    for (var i = 0; i < numberOfRows - 1; i++) {
        holdingsTable.removeChild(holdingsTable.lastChild);
    };

    // create new entries for holdings in holdings table
    for (var i = 0; i < holdings.length; i++) {

        //create new row in holdings table
        let holdingRow = document.createElement('tr');
        holdingsTable.appendChild(holdingRow);

            // add symbol name to cell
            let symbolCell = document.createElement('td');
            symbolCell.innerText = holdings[i]['symbol'];
            holdingRow.appendChild(symbolCell);

            // add description name to cell
            let descriptionCell = document.createElement('td');
            descriptionCell.innerText = holdings[i]['description'];
            holdingRow.appendChild(descriptionCell);

            // add quantity to cell
            let quantityCell = document.createElement('td');
            quantityCell.innerText = holdings[i]['quantity'];
            holdingRow.appendChild(quantityCell);

            // add avg purchase price to cell
            let avgPricePerShareCell = document.createElement('td');
            let purchasePriceFromStorage = holdings[i]['avgPricePerShare'];
            avgPricePerShareCell.innerText = purchasePriceFromStorage.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
            holdingRow.appendChild(avgPricePerShareCell);
            
            // add initial position to cell
            let initialPositionCell = document.createElement('td');
            let initalPositionFromStorage = holdings[i]['initialPosition'];
            initialPositionCell.innerText = initalPositionFromStorage.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
            holdingRow.appendChild(initialPositionCell);

            // add current price to cell
            let currentPriceCell = document.createElement('td');
            let currentPrice = holdings[i]['currentPrice'];
            currentPriceCell.innerText = currentPrice.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
            holdingRow.appendChild(currentPriceCell);

            // add total Value Cell
            let totalValueCell = document.createElement('td');
            let totalValue = holdings[i]['quantity'] * parseFloat(currentPrice);
            totalValueCell.innerText = totalValue.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
            holdingRow.appendChild(totalValueCell);

            // add Gain-Loss Cell
            let gainLossCell = document.createElement('td');
            let gainLoss = parseFloat(totalValue) - parseFloat(initalPositionFromStorage);
            gainLossCell.innerText = gainLoss.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
            holdingRow.appendChild(gainLossCell);

            // add Gain-Loss % Cell
            let gainLossPercentageCell = document.createElement('td');
            let gainLossPercentage = (parseFloat(gainLoss) / parseFloat(initalPositionFromStorage)) * 100;
            gainLossPercentageCell.innerText = gainLossPercentage.toFixed(2) + '%';
            holdingRow.appendChild(gainLossPercentageCell);
    };
};

overlay.addEventListener('click', function (click) {
    // if click outside of window then exit
    if (click.target.id == "overlay") { 
        overlay.style.display = 'none';
    };
    

});

tradeHistoryBtn.addEventListener('click', function () {

    fillTradeHistoryPage();
    overlay.style.display = 'block';

});

function fillTradeHistoryPage () {

    let numberOfRows = transactionsTable.rows.length
    // reset table back to blank with just header row
    for (var i = 0; i < numberOfRows - 1; i++) {
        transactionsTable.removeChild(transactionsTable.lastChild);
    };

    for (let i = 0; i < transactions.length; i++) {

        //create new row in transactions table
        let transactionRow = document.createElement('tr');
        transactionsTable.appendChild(transactionRow);

        transactionRow.addEventListener('click', function () {
            console.log('fuk u bitch')
        });

            // add Buy / Sell label to cell
            let BuySell = document.createElement('td');
            BuySell.innerText = transactions[i]['transactionType'];
            transactionRow.appendChild(BuySell);

            // add symbol name to cell
            let symbolCell = document.createElement('td');
            symbolCell.innerText = transactions[i]['symbol'];
            transactionRow.appendChild(symbolCell);

            // add description name to cell
            let descriptionCell = document.createElement('td');
            descriptionCell.innerText = transactions[i]['description'];
            transactionRow.appendChild(descriptionCell);

            // add quantity to cell
            let quantityCell = document.createElement('td');
            quantityCell.innerText = transactions[i]['quantity'];
            transactionRow.appendChild(quantityCell);

            // add avg purchase price to cell
            let avgPricePerShareCell = document.createElement('td');
            let purchasePrice = transactions[i]['pricePerShare'];
            avgPricePerShareCell.innerText = purchasePrice.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
            transactionRow.appendChild(avgPricePerShareCell);
            
            // add initial position to cell
            let initialPositionCell = document.createElement('td');
            let initalPosition = transactions[i]['totalPrice'];
            initialPositionCell.innerText = initalPosition.toLocaleString('us-US', { style: 'currency', currency: 'USD'});
            transactionRow.appendChild(initialPositionCell);
            
            // add date of transaction to cell
            let dateCell = document.createElement('td');
            let date = transactions[i]['date'];
            dateCell.innerText = date;
            transactionRow.appendChild(dateCell);
            
            // add time of transaction to cell
            let timeCell = document.createElement('td');
            let time = transactions[i]['time'];
            timeCell.innerText = time;
            transactionRow.appendChild(timeCell);

    };

};

function getTodaysDate() {
    return new Date().toLocaleDateString();
};
