/**
 * 指定されたシンボルコードと間隔に基づいてチャートデータを取得します。
 * 
 * @param {string} symbol_code - データを取得するシンボルのコード。
 * @param {string} interval - データの間隔（例: "1d", "1wk", "1mo"）。
 * @returns {Array} データ行の配列を返します。各行は値の配列です。
 */
const getChartData = (symbol_code, interval) => {
  const sheet = ALL_SHEETS[ALL_SHEETS_INDEX["historical_data"]];
  const data = sheet.getDataRange().getValues();
  const dataObject = convertArrayToObject(data)
  const symbol_code_num = parseInt(symbol_code, 10);

  const filteredData = dataObject.filter(row => row["symbol_code"] === symbol_code_num && row["interval"] === interval);

  return filteredData.map(row => {
    const date = new Date(row["timestamp"]);
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    const filteredObj = {
      "timestamp": formattedDate,
      "open": row["open"],
      "close": row["close"],
      "high": row["high"],
      "low": row["low"]
    }
    return filteredObj;
  });
}
