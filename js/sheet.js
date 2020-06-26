// ==== base

var CLIENT_ID;
var API_KEY;
$.getJSON("json/client_secret.json", function (data) { CLIENT_ID = data.web.client_id; });
$.getJSON("json/api_key.json", function (data) { API_KEY = data.APIKEY; });

var DISCOVERY_DOCS = [
  "https://sheets.googleapis.com/$discovery/rest?version=v4",
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// spreadsheets & drive.metadata.readonly
var SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly";

let sheetID = undefined;
let startStampPosition;
let fileName = 'timer_data';


// ==== sign status

var signoutButton = document.getElementById("signOut");
var authorizeButton = document.getElementById("signIn");

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn().then((result) => console.log(result), (error) => console.log(error));
  console.log("gapi.auth2.getAuthInstance().signIn()");
};

function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut().then((result) => console.log(result), (error) => console.log(error));
  console.log("gapi.auth2.getAuthInstance().signOut()");
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
        // 監聽 updateSigninStatus
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state.
        let isSigned = gapi.auth2.getAuthInstance().isSignedIn.get();
        updateSigninStatus(isSigned);

        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
        cc('initClient')
        cc('isSigned', isSigned)
        getSpreadsheetId();
      },
      function (error) {
        test_display = error;
      }
    );
};

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
};

function getSpreadsheetId() {
  gapi.client.drive.files.list({})
    .then(function (response) {
      // Handle the results here (response.result has the parsed body).
      console.log("getSpreadsheetId() Response: ", response);
      let filesArray = response.result.files;
      for (let i = 0; i < filesArray.length; i++) {
        if (filesArray[i].name == fileName) {
          sheetID = filesArray[i].id;
          console.log('find: ' + i + ' ' + filesArray[i].id)
          return;
        }
      };
      cc('not found and creat new one');
      createSpreadsheet();
    },
      function (err) { console.error("Execute error", err); });
}

function createSpreadsheet() {
  var spreadsheetBody = {
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

  var request = gapi.client.sheets.spreadsheets.create({}, spreadsheetBody);
  request.then(function (response) {
    console.log('createSpreadsheet response: ' + response);
    sheetID = response.result.spreadsheetId;
    cc('create a new spreadsheet: ', sheetID)
  }, function (reason) {
    console.error('error: ' + reason.result.error.message);
  });
}

