let researchTickerSearchDropdown = document.getElementById('researchTickerSearchDropdown');
let researchTickerSearchInput = document.getElementById('researchTickerSearchInput');
let researchTickerSelectionPreview = document.getElementById('researchTickerSelectionPreview');
let researchTickerSearchButton = document.getElementById('researchTickerSearchButton');

let basicInfoBtn = document.getElementById('basicInfoBtn');
let advancedInfoBtn = document.getElementById('advancedInfoBtn');

let basicInfoContainer = document.getElementById('basicInfoContainer');
let advancedInfoContainer = document.getElementById('advancedInfoContainer');

let companySummary = document.getElementById('companySummary');

let dateOne = document.getElementById('dateOne');
let dateTwo = document.getElementById('dateTwo');
let dateThree = document.getElementById('dateThree');
let newsOneTitle = document.getElementById('newsOneTitle');
let newsTwoTitle = document.getElementById('newsTwoTitle');
let newsThreeTitle = document.getElementById('newsThreeTitle');
let newsOneLink = document.getElementById('newsOneLink');
let newsTwoLink = document.getElementById('newsTwoLink');
let newsThreeLink = document.getElementById('newsThreeLink');
let newsOneDescription = document.getElementById('newsOneDescription');
let newsTwoDescription = document.getElementById('newsTwoDescription');
let newsThreeDescription = document.getElementById('newsThreeDescription');


let tickerSearchInputUpper;
let searchResults = [];

let selectedTicker;
let selectedCompanyPrice;

let currentPrice = document.getElementById('currentPrice');
let openPrice = document.getElementById('openPrice');
let closingPrice = document.getElementById('closingPrice');
let fiftyTwoWeekHigh = document.getElementById('fiftyTwoWeekHigh');
let fiftyTwoWeekLow = document.getElementById('fiftyTwoWeekLow');
let avgVolume = document.getElementById('avgVolume');
let mktCap = document.getElementById('mktCap');
let divYield = document.getElementById('divYield');
let PERatio = document.getElementById('PERatio');

let industry = document.getElementById('industry');
let employees = document.getElementById('employees');
let revenue = document.getElementById('revenue');
let profit = document.getElementById('profit');
let margin = document.getElementById('margin');
let ebitda = document.getElementById('ebitda');
let quickRatio = document.getElementById('quickRatio');
let currentRatio = document.getElementById('currentRatio');
let returnOnAssets = document.getElementById('returnOnAssets');
let returnOnEquity = document.getElementById('returnOnEquity');



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
            researchTickerSearchDropdown.appendChild(tickerOption);

        
        tickerOption.addEventListener('click', function() {

                researchTickerSelectionPreview.innerHTML = '';
                ticker.innerText = searchArray[i]['ticker']; 
                tickerSpan.innerText = ' : ' + searchArray[i]['name'];
                selectedCompany = searchArray[i]['name'];
                researchTickerSelectionPreview.appendChild(ticker);
                researchTickerSelectionPreview.appendChild(tickerSpan);
                researchTickerSelectionPreview.appendChild(tickerOption);
                selectedTicker = searchArray[i]['ticker']; 
                researchTickerSearchInput.value = "";

                getStockQuoteData(selectedTicker);
                getStockFinancialData(selectedTicker);
                getStockNews(selectedTicker);
                researchTickerSearchDropdown.style.display = 'none';

        });

    };

    researchTickerSearchDropdown.style.display = 'grid';

};


async function getStockQuoteData (stockSymbol) {

    let url = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/qu/quote/'
    url += stockSymbol;

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

        currentPrice.innerText += " " + response[0]["bid"].toLocaleString('us-US', { style: 'currency', currency: 'USD'});
        openPrice.innerText += " " + response[0]["regularMarketOpen"].toLocaleString('us-US', { style: 'currency', currency: 'USD'});
        closingPrice.innerText += " " + response[0]["regularMarketPreviousClose"].toLocaleString('us-US', { style: 'currency', currency: 'USD'});
        fiftyTwoWeekHigh.innerText += " " + response[0]["fiftyTwoWeekHigh"].toLocaleString('us-US', { style: 'currency', currency: 'USD'});
        fiftyTwoWeekLow.innerText += " " + response[0]["fiftyTwoWeekLow"].toLocaleString('us-US', { style: 'currency', currency: 'USD'});
        let volume = formatNumber(response[0]["averageDailyVolume10Day"]);
        let marketCap = formatNumber(response[0]["marketCap"]);
        avgVolume.innerText += " " + volume;
        mktCap.innerText += " " + marketCap;
        let yield = response[0]["trailingAnnualDividendYield"] * 100;
        divYield.innerText += " " + yield.toFixed(2) + '%';
        let PE = response[0]["trailingPE"];
        PERatio.innerText += " " + PE.toFixed(2);

        })
        .catch((error) => {
            console.error(error);
        });   

};

async function getStockFinancialData (stockSymbol) {

    let url = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/mo/module/'
    url += stockSymbol + '?module=asset-profile%2Cfinancial-data%2Cearning';

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

            companySummary.innerText += " " + response["assetProfile"]["longBusinessSummary"];
            industry.innerText += " " + response["assetProfile"]["industry"];
            employees.innerText += " " + response["assetProfile"]["fullTimeEmployees"].toLocaleString(undefined);
            revenue.innerText += " " + response["financialData"]["totalRevenue"]["fmt"];
            profit.innerText += " " + response["financialData"]["grossProfits"]["fmt"];
            margin.innerText += " " + response["financialData"]["grossMargins"]["fmt"];
            ebitda.innerText += " " + response["financialData"]["ebitda"]["fmt"];
            quickRatio.innerText += " " + response["financialData"]["quickRatio"]["fmt"];
            currentRatio.innerText += " " + response["financialData"]["currentRatio"]["fmt"];
            returnOnAssets.innerText += " " + response["financialData"]["returnOnAssets"]["fmt"];
            returnOnEquity.innerText += " " + response["financialData"]["returnOnEquity"]["fmt"];

        })
        .catch((error) => {
            console.error(error);
        });   

};

async function getStockNews (stockSymbol) {

    let url = 'https://yahoo-finance15.p.rapidapi.com/api/yahoo/ne/news/'
    url += stockSymbol;

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

            let dateOneText = response["item"][0]["pubDate"].substr(5, 11);
            dateOne.innerText = dateOneText;
            let newsOneTitleText = response["item"][0]["title"].substr(0, 130);
            newsOneTitle.innerText = newsOneTitleText;
            newsOneTitle.href = response["item"][0]["link"];
            let newsOneDescriptionText = response["item"][0]["description"].substr(0, 150) + "...";
            newsOneDescription.innerText = newsOneDescriptionText;

            let dateTwoText = response["item"][1]["pubDate"].substr(5, 11);
            dateTwo.innerText = dateTwoText;
            let newsTwoTitleText = response["item"][1]["title"].substr(0, 130);
            newsTwoTitle.innerText = newsTwoTitleText;
            newsTwoTitle.href = response["item"][1]["link"];
            let newsTwoDescriptionText = response["item"][1]["description"].substr(0, 150) + "...";
            newsTwoDescription.innerText = newsTwoDescriptionText;

            let dateThreeText = response["item"][2]["pubDate"].substr(5, 11);
            dateThree.innerText = dateThreeText;
            let newsThreeTitleText = response["item"][2]["title"].substr(0, 130);
            newsThreeTitle.innerText = newsThreeTitleText;
            newsThreeTitle.href = response["item"][2]["link"];
            let newsThreeDescriptionText = response["item"][2]["description"].substr(0, 150) + "...";
            newsThreeDescription.innerText = newsThreeDescriptionText;

        })
        .catch((error) => {
            console.error(error);
        });   

};

function formatNumber (number) {

    let formattedNumberString;
    let decimal;

    if (number >= 1000000000000) {
        decimal = (number / 1000000000000);
        decimal = Math.round(decimal*100)/100;
        formattedNumberString = decimal + "T";
    } else if (number >= 1000000000) {
        decimal = (number / 1000000000);
        decimal = Math.round(decimal*100)/100;
        formattedNumberString = decimal + "B";
    } else if (number >= 1000000) {
        decimal = (number / 1000000);
        decimal = Math.round(decimal*100)/100;
        formattedNumberString = decimal + "M";
    } else {
        formattedNumberString = number.toFixed(0);
    };

    return formattedNumberString;

};

researchTickerSearchButton.addEventListener('click', function() {
    researchTickerSearchDropdown.innerHTML = '';
    searchResults = [];
    tickerSearchInputUpper = researchTickerSearchInput.value.toUpperCase();
    searchTicker(tickerSearchInputUpper);    

});

basicInfoBtn.addEventListener('click', function () {

    advancedInfoContainer.style.display = 'none';
    basicInfoContainer.style.display = 'grid';

});

advancedInfoBtn.addEventListener('click', function () {

    basicInfoContainer.style.display = 'none';
    advancedInfoContainer.style.display = 'grid';

});