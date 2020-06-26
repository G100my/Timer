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
