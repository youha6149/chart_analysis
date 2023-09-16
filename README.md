# chart_analysis

このプロジェクトは、Yahoo Finance APIを利用して最新の株価時系列データを取得し、それをグラフで視覚的に表現するといった一連の流れをGoogle Apps Scriptを用いて行うことを目的としています。

# Diagram
```mermaid
sequenceDiagram
    participant Trigger as トリガー
    participant SetTrigger as setTrigger
    participant Main as main
    participant Spreadsheet as GoogleSpreadSheet
    participant YahooAPI as Yahoo Finance API
    participant JSON as JSON
    participant Directory as directory
    participant CSV as CSV

    Trigger->>SetTrigger: 毎日14~15時に実行
    SetTrigger->>Main: 15時にmainを実行
    Main->>Spreadsheet: 証券コードを取得 (fetchSymbolsFromControlSheet)
    Main->>Main: 日足・週足・月足のいずれかまたは複数を取得 (getInterval)
    loop 証券コードごと
        loop 間隔ごと
            Main->>YahooAPI: データを取得 (fetchYahooFinanceHistoryChart)
            YahooAPI->>JSON: 時系列データを返す
            Main->>JSON: 必要なデータを抽出 (extractFromJson)
            Main->>Directory: フォルダを取得/作成 (getOrCreateFolder)
            Main->>Directory: フォルダ内のファイルを確認 (findFileInFolder)
            alt 既存のCSVファイルが存在する場合
                Main->>CSV: データを追加 (appendDataToCSV)
            else 既存のCSVファイルが存在しない場合
                Main->>CSV: 新しいCSVファイルを作成 (createCSVFileInDirectory)
            end
            Main->>Main: insertObjへのデータの追加
        end
    end
```

# Example
https://github.com/youha6149/chart_analysis/assets/60963226/97f87988-5444-4219-9443-ac5a7abb850e

# Technologies Used

- Google Apps Script
- HTML5

## libralies
- chart.js
- luxon
