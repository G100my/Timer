var CLIENT_ID;
var API_KEY;
$.getJSON("json/client_secret.json", function (data) { CLIENT_ID = data.web.client_id; });
$.getJSON("json/api_key.json", function (data) { API_KEY = data.APIKEY; });

var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API
// 採用可讀可寫的
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";