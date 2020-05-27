let stampState = true;

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

// ===================

function addToListDisplay(textValue) {
  let id = Date.now();
  $("#mission_list").append(
    '<p id="' + id + '" class="missions">' + textValue + "<button onclick='deleteMission(" + id + ")'>delete</button></p>");
};

function deleteMission(id) {
  list.toDo.pop();
  $("#" + id).remove();
  list.index = (list.index <= list.complete.length) ? list.complete.length : list.index - 1;
};

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




// =================== 

function displayTimer(msg) {
  document.getElementById("tomato_clock").innerText = msg;
};

function displayMission(msg) {
  document.getElementById("current_mission").innerText = msg;
};

function addZero(num) {
  return (num < 10) ? '0' + num : num;
};

};