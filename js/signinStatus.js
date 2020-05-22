var signoutButton = document.getElementById("signOut");
var authorizeButton = document.getElementById("signIn");

function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
  console.log("gapi.auth2.getAuthInstance().signIn()");
}

function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
  console.log("gapi.auth2.getAuthInstance().signOut()");
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "inline";
  } else {
    authorizeButton.style.display = "inline";
    signoutButton.style.display = "none";
  }
}

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
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());

        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      function (error) {
        test_display = error;
      }
    );
}

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}