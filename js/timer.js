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
  clockTime = h + ' : ' + m;

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
var list = {
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

function addToListDisplay(textValue) {
  let id = Date.now();
  $("#mission_list").append(
    '<p id="' + id + '" class="missions">' + textValue + "<button onclick='deleteMission(" + id + ")'>delete</button></p>");
};

$("#mission_input_btn").keyup((event) => {
  //enter鍵：
  // 如果不曾輸入過文字：null；
  // 如果曾經送出過文字、但目前留空：上次輸入的文字；
  let currenValue = (input.value === '') ? ((list.lastTitle !== null) ? list.lastTitle : null) : input.value;
  if (event.which === 13 && (currenValue !== null || list.lastTitle !== null)) {
    list.index += 1;
    list.lastTitle = currenValue;
    list.toDo.push({ id: list.index, name: currenValue });

    addToListDisplay(currenValue);
    input.value = '';
  };
  //esc鍵：清除目前所鍵入的文字
  (event.which === 27 && input.value !== '' && (input.value = ''));
});

function deleteMission(id) {
  list.toDo.pop();
  $("#" + id).remove();
  list.index = (list.index <= list.complete.length) ? list.complete.length : list.index - 1;
};

// =================== start pause stop

function checkNext() {
  let length = list.toDo.length;
  if (length > 0) {
    setNextMission();
    setCountDown(mission.minSet);
  };
};

function finishMission(completed = true) {
  mission.status = false;
  mission.completed = completed;
  list.complete.push(mission);
};

function setNextMission(min = 25) {
  let toDo = list.toDo.shift();
  $(".missions:first").remove();

  try {
    mission.id = toDo.id;
    mission.name = toDo.name;
  } catch (error) {
    list.index += 1;
    mission.id = list.index;
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

$("#start_btn").click(() => {
  if (!mission.status) {
    setNextMission();
    setCountDown(mission.minSet);
  };
  timer.start(() => {
    finishMission();
    setSmokeCall();
    displayMission('SmokeCall');
  });
});

$("#pause_btn").click(() => { timer.stop() });

$("#stop_btn").click(() => {
  finishMission(false);
  mission.status = false;
  timer.stop();
  checkNext();
});

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