// =================== sheet stamp

$('#sheet_init').click(function () {
  console.log('click init');
  initSheet(timerSheetID);
});

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

// =================== normal clock

var clockTime;
var clock;
setInterval(() => {
  clock = new Date();
  let h = clock.getHours();
  let m = clock.getMinutes();
  let s = clock.getSeconds();

  h = (h < 10) ? "0" + h : h;
  m = (m < 10) ? "0" + m : m;
  colon = (s % 2 == 0) ? " " : ":";
  clockTime = h + colon + m;

  $("#digital_clock").text(clockTime);
}, 1000);

// =================== sheet stamp

$('#init').click(function () { initSheet(timerSheetID); });
$('#stamp').click(function () { Stamp_start(); });
$('#end').click(function () { Stamp_end(); });

// =================== input 
var timer = {
  min: undefined,
  sec: undefined,
  num: undefined,
  stop: undefined,
  start: undefined
};
var missionList = {
  index: 0,
  toDo: [],
  complete: [],
  lastTitle: undefined,  //離線記錄用
};
var emptyMission = {
  id: undefined,
  name: undefined,
  minSet: undefined,
  startClockTime: undefined,
  status: false,
  completed: true
};
var mission = Object.assign({}, emptyMission);

let input = document.getElementById("mission_input_btn");
let current_mission_display = document.getElementById("current_mission");

function addToMissionListDisplay(textValue) {
  $("#mission_list").append('<p id="mission_' + missionList.index + '" class="missions">Mission ' + missionList.index + ': <span id="mission_name_' + missionList.index + '"></span></p>');
  $("#mission_name_" + missionList.index).text(textValue);
};

$("#mission_input_btn").keyup((event) => {
  //enter鍵：
  // 如果不曾輸入過文字：null；
  // 如果曾經送出過文字、但目前留空：上次輸入的文字；
  let currenValue = (input.value === '') ? ((missionList.lastTitle !== null) ? missionList.lastTitle : null) : input.value;
  if (event.which === 13 && (currenValue !== null || missionList.lastTitle !== null)) {
    missionList.index += 1;
    missionList.lastTitle = currenValue;
    missionList.toDo.push({ id: missionList.index, name: currenValue });

    addToMissionListDisplay(currenValue);
    input.value = '';

    (missionList.index > 0 && $("#delete_btn").removeAttr("disabled"));
    (missionList.index === 0 && $("delete_btn").attr("disabled", "disabled"));
  };
  //esc鍵：清除目前所鍵入的文字
  (event.which === 27 && input.value !== '' && (input.value = ''));
});

$("#delete_btn").click(() => {
  missionList.toDo.pop();
  $("#mission_" + missionList.index).remove();
  missionList.index = (missionList.index <= missionList.complete.length) ? missionList.complete.length : missionList.index - 1;
});

$("#mission_start").click(() => { setTomato(25, 00); });
$("#mission_end").click(() => { endMission() });
$("#mission_pause").click(() => { clearInterval(currentTimer); });
$("#mission_restart").click(() => { startCountDownClock(); });

function setTomato(mins = 25, secs = 0) {
  let now = new Date();
  currentMissionData.startTime = now.getHours() + ":" + now.getMinutes();
  currentMissionData.startDate = now.getFullYear() + "/" + now.getMonth() + "/" + now.getDate();
  currentMissionData.name = (tomato.missionList.shift() === undefined) ? "Do your best!!" : tomato.missionList.shift();
  currentMissionData.doing = true;
  currentMissionData.min = mins < 10 ? '0' + mins : mins;
  currentMissionData.sec = secs < 10 ? '0' + secs : secs;

  display.innerText = currentMissionData.name;
  startCountDownClock();
};

function startCountDownClock() {
  currentTimer = setInterval(() => {
    currentMissionData.sec -= 1;
    if (currentMissionData.sec < 0) {
      currentMissionData.sec = 59;
      currentMissionData.min = (currentMissionData.min - 1 < 10) ? '0' + currentMissionData.min - 1 : currentMissionData.min - 1;
    } else if (currentMissionData.sec < 10) {
      currentMissionData.sec = '0' + currentMissionData.sec;
    };
    $("#tomato_clock").text(currentMissionData.min + ':' + currentMissionData.sec);

    if (currentMissionData.min == 00 && currentMissionData.sec == 00) {
      endMission();
    }
  }, 1000);
}

function endMission() {
  clearInterval(currentTimer);
  currentMissionData.elapsedTime = (!currentMissionData.complete) ? (25 - currentMissionData.min - 1) + ":" + (60 - currentMissionData.sec) : 'Done';
  tomato.doneMission.push(Object.assign({}, currentMissionData));
  display.innerText = currentMissionData.name;
};
