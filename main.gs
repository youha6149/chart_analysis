const HOURS_TO_EXECUTE = 15;
const MINUTES_TO_EXECUTE = 0;
const SECONDS_TO_EXECUTE = 0;

function main() {
  const symbols = fetchSymbolsFromControlSheet();
  const intervals = getInterval();
  
  const insertObj = {
    symbol_code: [],
    interval: []
  }; // {key: [val, val, ...], key: [val, val, ...], ...}

  symbols.forEach(symbol => {
    intervals.forEach(interval => {
      const symbolWithT = `${symbol}.T`;
      const fileName = `${interval}.csv`;
      const jsonData = fetchYahooFinanceHistoryChart(symbolWithT);
      const jsonObject = extractFromJson(jsonData);
      const symbolFolderId = getOrCreateFolder(CONFIG.CHART_DIRECTORY_ID, symbolWithT);
      const targetFileId = findFileInFolder(symbolFolderId, fileName);

      targetFileId ? appendDataToCSV(targetFileId, jsonObject) : createCSVFileInDirectory(fileName, jsonObject, symbolFolderId);

      jsonObject["timestamp"].map(_ => {
        insertObj.symbol_code.push(symbol)
        insertObj.interval.push(interval)
        Object.keys(jsonObject).forEach(key => {
          if (key in insertObj) {
            insertObj[key] = insertObj[key].concat(jsonObject[key])
          } else {
            insertObj[key] = jsonObject[key]
          }
        })
      })
    });
  });
  
  appendDataToSheet(ALL_SHEETS[ALL_SHEETS_INDEX["historical_data"]], insertObj)
}

const doGet = () => HtmlService.createHtmlOutputFromFile('chart');

const setTriggerForSpecificTime = () => {
  const targetDate = new Date();
  targetDate.setHours(HOURS_TO_EXECUTE, MINUTES_TO_EXECUTE, SECONDS_TO_EXECUTE);

  const triggers = ScriptApp.getProjectTriggers();
  for(const trigger of triggers){
    if(trigger.getHandlerFunction() == "main"){
      ScriptApp.deleteTrigger(trigger);
    }
  } 

  ScriptApp.newTrigger('main').timeBased().at(targetDate).create(); 
}