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
// =================== start pause stop

function checkNext() {
  let length = missionList.toDo.length;
  if (length > 0) {
    setNextMission();
    setCountDown(mission.minSet);
  };
};

function finishMission(completed = true) {
  mission.status = false;
  mission.completed = completed;
  missionList.complete.push(mission);
};

function setNextMission(min = 25) {
  let toDo = missionList.toDo.shift();
  $(".missions:first").remove();

  try {
    mission.id = toDo.id;
    mission.name = toDo.name;
  } catch (error) {
    missionList.index += 1;
    mission.id = missionList.index;
    mission.name = "Do your best!";
  };
  mission.startClockTime = clockTime;
  mission.Date = clock.toLocaleDateString();
  mission.minSet = min;
  mission.status = true;

  displayMission(mission.id + ' ' + mission.name);
};

function setSmokeCall(min = 5, sec = 0) {
  setCountDown(min, sec);
  timer.start(checkNext);
};

// =================== util

function displayTimer(msg) {
  document.getElementById("tomato_clock").innerText = msg;
};

function displayMission(msg) {
  document.getElementById("current_mission").innerText = msg;
};

function addZero(num) {
  return (num < 10) ? '0' + num : num;
};

function setCountDown(min = 25, sec = 0) {
  timer.min = min;
  timer.sec = sec;
  timer.start = (callback = () => { console.log('No next mission? Really?') }) => {
    timer.num = setInterval(() => {
      timer.sec -= 1;
      if (timer.min == 0 && timer.sec == 0) {
        clearInterval(timer.num);
        callback();
      };
      if (timer.sec < 0) {
        timer.sec = 59;
        timer.min -= 1;
      };
      let min_sec = addZero(timer.min) + ':' + addZero(timer.sec);
      console.log(min_sec);
      displayTimer(min_sec);
    }, 1000);
  };
  timer.stop = () => clearInterval(timer.num);
};

function setCountUp(min = 0, sec = 0) {
  timer.min = min;
  timer.sec = sec;
  timer.start = () => {
    timer.num = setInterval(() => {
      timer.sec += 1;
      if (timer.sec >= 60) {
        timer.sec = 0;
        timer.min += 1;
      };
      let min_sec = addZero(timer.min) + ':' + addZero(timer.sec);
      console.log(min_sec);
      displayTimer(min_sec);
    }, 1000);
  };
  timer.stop = () => clearInterval(timer.num);
};