const THISWORKBOOK = SpreadsheetApp.getActiveSpreadsheet();
const ALL_SHEETS = THISWORKBOOK.getSheets();

//  シート名からシート番号を取得する
const ALL_SHEETS_INDEX = ALL_SHEETS.reduce((acc, sheet, index) => {
  acc[sheet.getName()] = index;
  return acc;
}, {});

const CONFIG = {
  CHART_DIRECTORY_ID: "13ZVgY6fQwqKNGe-NKi4lmZ2EIzB2jQlw",
  BASE_URL: "https://query2.finance.yahoo.com",
  USER_AGENT_HEADERS: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
  }
};
