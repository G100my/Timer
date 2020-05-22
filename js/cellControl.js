var test_display;

function getTimeNow() {
  let n = new Date();
  return (
    n.getFullYear() + "/" + n.getMonth() + "/" + n.getDate()
    + " " +
    n.getHours() + ":" + n.getMinutes() + ":" + n.getSeconds()
  )
};
function initFormatRepeatCell(rangeValue, inputValue) {
  gapi.client.sheets.spreadsheets
    .batchUpdate({
      spreadsheetId: timerSheetID,
      requests: {
        repeatCell: {
          range: rangeValue,
          cell: {
            userEnteredValue: { formulaValue: inputValue },
            userEnteredFormat: {
              numberFormat: {
                type: "DATE_TIME",
                pattern: "[hh]:[mm]:[ss]"
              }
            }
          },
          fields: "*"
        },
      }
    }).then(
      function (response) {
        console.log(response);
        test_display = response;
      },
      function (response) {
        test_display = response;
      }
    )
};

function initSheet() {
  gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: timerSheetID,
    requests: [
      {
        updateSheetProperties: {
          properties: {
            sheetId: 0,
            title: 'Timer_master',
            gridProperties: {
              frozenRowCount: 1
            }
          },
          fields: 'gridProperties.frozenRowCount'
        }
      },
      {
        updateCells: {
          rows: {
            values: [
              { userEnteredValue: { stringValue: "startTime" } },
              { userEnteredValue: { stringValue: "EndTime" } },
              { userEnteredValue: { stringValue: "block" } },
              { userEnteredValue: { stringValue: "AVG" } },
              { userEnteredValue: { stringValue: "Total" } },
              { userEnteredValue: { stringValue: "State" } }
            ]
          },
          start: {
            "sheetId": 0,
            "rowIndex": 0,
            "columnIndex": 0
          },
          fields: '*'
        }
      }
    ]
  }).then(
    function (response) {
      console.log('Append Success:' + response);
      test_display = response;
    },
    function (response) {
      console.log(response.body);
      test_display = response;
    }
  );
  initFormatRepeatCell({ startColumnIndex: 2, endColumnIndex: 3, startRowIndex: 1 }, '=if(ISBLANK(B2),"", $B2-$A2)');
  initFormatRepeatCell({ startColumnIndex: 3, endColumnIndex: 4, startRowIndex: 1 }, '=if(ISBLANK(B2),"", $E2/COUNT($C$2:$C$1000))');
  initFormatRepeatCell({ startColumnIndex: 4, endColumnIndex: 5, startRowIndex: 1 }, '=if(ISBLANK(B2),"", SUM($C$2:$C2))');
};