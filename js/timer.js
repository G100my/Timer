// sheet stamp block
$('#sheet_init').click(function () {
  console.log('click init');
  initSheet(timerSheetID);
})

let stampState = true;
$('#stamp_start').click(function () {
  stampState = !stampState;
  startStamp();
  $('#stamp_start').hide();
  $('#stamp_end').show();
});

$('#stamp_end').click(function () {
  stampState = !stampState;
  endStamp();
  $('#stamp_end').hide();
  $('#stamp_start').show();
});

// normal clock
var clockTime;
setInterval(() => {
  let t = new Date();
  let h = t.getHours();
  let m = t.getMinutes();
  let s = t.getSeconds();

  h = (h < 10) ? "0" + h : h;
  m = (m < 10) ? "0" + m : m;
  colon = (s % 2 == 0) ? " " : ":";
  clockTime = h + colon + m;

  $("#digital_clock").text(clockTime);

}, 1000);

$('#init').click(function () {
	initSheet(timerSheetID);
});

$('#stamp').click(function () { Stamp_start(); });
$('#end').click(function () { Stamp_end(); });

var currentTimer;
var tomato = {
  min: undefined,
  sec: undefined,
  index: 0,
  missionList: [],
  doneMission: [],
  lastMissionTitle: null,
  smokeCall: false
};
var currentMissionData = {
  min: 25,
  sec: 0,
  startTime: null,
  startDate: null,
  name: null,
  elapsedTime: null,
  complete: false,
  doing: false
}
