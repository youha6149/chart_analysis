/**
 * 現在の日付に基づいて、日足、週足、月足を判定する。
 * @return {Array<string>} 取得間隔（'1d'、'1wk'、'1mo' のいずれかまたは複数）
 */
const getInterval = () => {
  const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
  const intervals = [];

  if (today.getDay() === 1) intervals.push('1wk');
  if (today.getDate() === 1 && ![0, 6].includes(today.getDay())) intervals.push('1mo');

  if (intervals.length === 0) intervals.push('1d');

  return intervals;
}

/**
 * Yahoo Financeから履歴チャートデータを取得します。
 * 
 * @param {string} symbol - 株のシンボル。
 * @param {string} [period="1d"] - データの期間。
 * @param {string} [interval="1d"] - データの間隔。
 * @returns {Object} Yahoo FinanceからのJSONデータをパースしたもの。
 * @throws {Error} フェッチのレスポンスが200でない場合にエラーをスローします。
 */
const fetchYahooFinanceHistoryChart = (symbol, period = "1d", interval = "1d") => {
  const params = { "range": period, "interval": interval };
  const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&');  
  const url = `${CONFIG.BASE_URL}/v8/finance/chart/${symbol}?${queryString}`;
  const options = { "method": "get", "headers": CONFIG.USER_AGENT_HEADERS };

  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    throw new Error("Failed to fetch Yahoo Finance data.");
  }

  return JSON.parse(response.getContentText());
}

/**
 * Yahoo Financeから取得した生のJSONから関連データを抽出します。
 * 
 * @param {Object} jsonData - 生のJSONデータ。
 * @returns {Object} 構造化され簡略化されたデータオブジェクト。
 */
const extractFromJson = jsonData => {
  const resultData = jsonData.chart.result[0];
  const timestamps = resultData.timestamp.map(time => {
    const date = new Date(time * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  });
  const indicators = resultData.indicators;
  const quoteData = indicators.quote[0];
  const adjcloseData = indicators.adjclose[0].adjclose.map(String);

  const extractedData = { "timestamp": timestamps, "adjclose": adjcloseData };
  Object.keys(quoteData).forEach(key => extractedData[key] = quoteData[key].map(String));

  return extractedData;
}

