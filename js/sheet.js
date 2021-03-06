// ==== base

let CLIENT_ID;
let API_KEY;

let DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// spreadsheets & drive.metadata.readonly
let SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly";

let sheetID = undefined;
let fileName = 'timer_data';


// ==== sign status

let signoutButton = document.getElementById("signOut");
let authorizeButton = document.getElementById("signIn");
authorizeButton.onclick = handleClientLoad;

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn()
    .then(
      (result) => { getSpreadsheetId(); console.log(result) },
      (error) => console.log(error)
    );
};

function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut()
    .then(
      (result) => console.log(result), (error) => console.log(error)
    );
};

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "inline";
  } else {
    authorizeButton.style.display = "inline";
    signoutButton.style.display = "none";
  }
};

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(
      function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        let isSigned = gapi.auth2.getAuthInstance().isSignedIn.get();
        updateSigninStatus(isSigned);

        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      (error) => { console.log('getAuthInstance error: ' + error) }
    ).then(
      handleAuthClick,
      (error) => { console.log('handleAuthClick error: ' + error) }
    ).then(
      getSpreadsheetId
    );
};

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
};

function getSpreadsheetId() {
  gapi.client.drive.files.list({})
    .then(
      function (response) {
        // Handle the results here (response.result has the parsed body).
        let filesArray = response.result.files;
        for (let i = 0; i < filesArray.length; i++) {
          if (filesArray[i].name == fileName) {
            sheetID = filesArray[i].id;
            return;
          }
        };
        console.log('not found and creat new one');
        createSpreadsheet();
      },
      (error) => { console.log('getSpreadsheetId error: ' + error) }
    )
}

function createSpreadsheet() {
  let spreadsheetBody = {
    "properties": { "title": fileName },
    "sheets": [
      {
        "properties": {
          "title": "Record",
          "sheetId": 2020000,
          "index": 1,
          "tabColor": {
            "red": 72,
            "green": 159,
            "blue": 181
          },
          "sheetType": "GRID",
          "gridProperties": {
            "columnCount": 3,
            "frozenRowCount": 1
          }
        },
        "data": [
          {
            "startRow": 0,
            "startColumn": 0,
            "rowData": [{
              "values": [
                { "userEnteredValue": { "stringValue": "Start time" } },
                { "userEnteredValue": { "stringValue": "Event" } },
                { "userEnteredValue": { "stringValue": "Focus Time" } }
              ]
            }]
          }
        ]
      },
      {
        "properties": {
          "title": "Statistics",
          "sheetId": 2020001,
          "index": 0,
          "tabColor": {
            "red": 255,
            "green": 166,
            "blue": 43
          },
          "sheetType": "GRID",
          "gridProperties": {
            "columnCount": 10,
            "frozenRowCount": 1
          },
        },
        "data": [
          {
            "startRow": 0,
            "startColumn": 0,
            "rowData": [{
              "values": [
                { "userEnteredValue": { "stringValue": "Event" } },
                { "userEnteredValue": { "stringValue": "Total" } },
              ]
            }]
          }
        ]
      }
    ]
  };

  let request = gapi.client.sheets.spreadsheets.create({}, spreadsheetBody);
  request.then(function (response) {
    sheetID = response.result.spreadsheetId;
  }, function (reason) {
    console.error('error: ' + reason.result.error.message);
  });
}


// ==== cell control

function appendRecord(valueArray) {
  gapi.client.sheets.spreadsheets.values.append(
    {
      "spreadsheetId": sheetID,
      "range": "Record!A:B",
      "valueInputOption": "USER_ENTERED",
      "responseDateTimeRenderOption": "FORMATTED_STRING",
      "values": [valueArray]
    }
  ).then(
    (response) => { console.log('appendRecord response: ' + response) },
    (error) => { console.log('appendRecord error: ' + error) }
  )
};
