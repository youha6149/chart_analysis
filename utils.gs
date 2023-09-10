/**
 * "control" シートから証券コードを取得する。
 * @return {Array<string>} 証券コードの配列
 */
const fetchSymbolsFromControlSheet = () => {
  const controlSh = ALL_SHEETS[ALL_SHEETS_INDEX["control"]];
  return controlSh.getRange("A:A").getValues().filter(row => row[0]).slice(1).flat();
}

/**
 * 指定された名称のフォルダが存在する場合、そのフォルダのIDを返します。
 * 存在しない場合、新しくフォルダを作成し、そのIDを返します。
 *
 * @param {string} parentFolderId - 親フォルダのID
 * @param {string} targetFolderName - 探索または作成するフォルダの名称
 * @return {string} フォルダのID
 */
const getOrCreateFolder = (parentFolderId, targetFolderName) => {
  const parentFolder = DriveApp.getFolderById(parentFolderId);
  const targetFolders = parentFolder.getFoldersByName(targetFolderName);

  return targetFolders.hasNext() ? targetFolders.next().getId() : parentFolder.createFolder(targetFolderName).getId();
};

/**
 * 指定されたフォルダ内で指定された名称のファイルを探索し、
 * 存在する場合はそのファイルのIDを返します。
 * 存在しない場合、nullを返します。
 *
 * @param {string} folderId - 探索するフォルダのID
 * @param {string} filename - 探索するファイルの名称
 * @return {string|null} ファイルのIDまたはnull
 */
const findFileInFolder = (folderId, filename) => {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFilesByName(filename);

  return files.hasNext() ? files.next().getId() : null;
};

/**
 * 与えられたオブジェクトデータを二次元配列に変換します。
 * 変換された二次元配列の最初の行は、オブジェクトのキーであり、
 * それに続く行は、各キーの値を含む行になります。
 *
 * @param {Object} dataObj - 変換するオブジェクトデータ
 * @return {Array} 二次元配列
 */
const convertObjectToStructuredData = dataObj => {
  const headers = Object.keys(dataObj);
  const structuredData = dataObj.timestamp.map((_, idx) => headers.map(key => dataObj[key][idx]));

  return [headers, ...structuredData];
};

/**
 * 与えられたCSVファイルIDに、新しいデータオブジェクトを追加します。
 *
 * @param {string} fileId - 更新するCSVファイルのID
 * @param {Object} dataObj - 追加するデータのオブジェクト
 */
const appendDataToCSV = (fileId, dataObj) => {
  const file = DriveApp.getFileById(fileId);
  const existingData = convertCSVToStructuredData(file.getBlob().getDataAsString());
  const headers = existingData[0];
  
  const newDataRows = dataObj.timestamp.map((_, idx) => 
    headers.map(header => dataObj[header][idx])
  );

  const combinedData = existingData.concat(newDataRows);
  const csvString = combinedData.map(row => row.join(",")).join("\n");
  file.setContent(csvString);
};

/**
 * 指定されたディレクトリにCSVファイルを作成します。
 *
 * @param {string} filename - 作成するCSVファイルの名前
 * @param {Object} dataObj - CSVに変換するデータのオブジェクト
 * @param {string} directoryId - CSVファイルを作成するディレクトリのID
 * @return {string} 作成されたCSVファイルのID
 */
const createCSVFileInDirectory = (filename, dataObj, directoryId) => {
  const data = convertObjectToStructuredData(dataObj);
  const csvData = data.map(row => row.join(",")).join("\n");
  const blob = Utilities.newBlob(csvData, 'text/csv', filename);
  
  const folder = DriveApp.getFolderById(directoryId);
  const file = folder.createFile(blob);
  file.setName(filename);

  return file.getId();
};

/**
 * 与えられたCSV形式の文字列を二次元配列に変換します。
 *
 * @param {string} csvString - 変換するCSV形式の文字列
 * @return {Array} 二次元配列
 */
const convertCSVToStructuredData = csvString => 
  csvString.trim().split("\n").map(row => row.trim().split(","));

/**
 * 指定されたGoogleシートにデータを追加します。
 * 
 * @param {Object} sheet - データを追加する対象のGoogleシート。
 * @param {Object} addObj - シートに追加するデータオブジェクト。キーはシートのヘッダーと一致する必要があります。
 */
const appendDataToSheet = (sheet, addObj) => {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowsToAdd = addObj[headers[0]].map((_, idx) => headers.map(header => addObj[header][idx]));
  sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAdd.length, headers.length).setValues(rowsToAdd);
}

/**
 * 二次元配列をオブジェクトの配列に変換する関数。
 * 
 * @param {Array<Array>} arr - ヘッダーを含む二次元配列。最初の行はヘッダーとして扱われ、それ以降の行はデータとして扱われます。
 * @returns {Array<Object>} - オブジェクトの配列。各オブジェクトはヘッダーに基づいてキーが設定されます。
 * 
 * @example
 * const data = [
 *   ["id", "name", "age"],
 *   [1, "Alice", 28],
 *   [2, "Bob", 24]
 * ];
 * 
 * const result = convertArrayToObject(data);
 * console.log(result);
 * // [{id: 1, name: "Alice", age: 28}, {id: 2, name: "Bob", age: 24}]
 */
const convertArrayToObject = arr => {
  const headers = arr[0];
  return arr.slice(1).map(row => {
    return headers.reduce((obj, header, idx) => {
      obj[header] = row[idx];
      return obj;
    }, {});
  });
}
