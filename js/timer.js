let stampState = true;

var timer = {
  min: undefined,
  sec: undefined,
  num: undefined,
  stop: undefined,
  start: undefined
};
var list = getLocal('localList') || {
  toDo: [],
  complete: [],
  lastTitle: undefined
};
var emptyMission = {
  startTime: undefined,
  name: undefined,
  minSet: undefined,
  completed: false,
  repeat: false,
};
var mission = getLocal('localMission') || Object.assign({}, emptyMission);
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

function addToList(textValue) {
  let id = Date.now();
  list.toDo.push({ id: id, name: textValue });
  setLocal('localList', list);
  $("#mission_list").append(
    '<p id="' + id + '" class="missions">' + textValue + "<button onclick='deleteMission(" + id + ")'>delete</button></p>");
};

function deleteMission(id) {
  list.toDo.pop();
  $("#" + id).remove();
  setLocal('localList', list);
};

function checkNext() {
  if (!mission.repeat) {
    setNextMission();
  };
  mission.completed = false;
  setCountDown(mission.minSet);
  displayMission(mission.name);
  timer.start(() => {
    finishMission();
    setSmokeCall();
  });
};

function finishMission(completed = true) {
  mission.completed = completed;
  list.complete.push(mission);
};

function setNextMission(min = 25) {
  mission.Date = clock.toLocaleDateString();
  mission.minSet = min;
  setCountDown(min);
  // 允許沒有輸入事件、行程
  if (list.toDo.length > 0) {
    console.log('ggg');
    let toDo = list.toDo.shift();
    $(".missions:first").remove();
    mission.name = toDo.name;
  } else {
    mission.name = 'Do your best';
  };
  displayMission(mission.name);
};

function setSmokeCall(min = 5, sec = 0) {
  setCountDown(min, sec);
  displayMission('SmokeCall');
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
      displayTimer(min_sec);
    }, 1000);
  };
  timer.stop = () => clearInterval(timer.num);
};

function loadLocal() {
  if (list.toDo.length > 0) {
    list.toDo.forEach(e => {
      $("#mission_list").append(
        '<p id="' + e.id + '" class="missions">' + e.name + "<button onclick='deleteMission(" + e.id + ")'>delete</button></p>");
    });
  };
  if (mission.startTime !== undefined) {
    t = ((mission.startTime + mission.minSet * 60000) - Date.now()) / 1000;

    if (t > 1) {
      let m = parseInt((t) / 60);
      let s = parseInt(t % 60)
      setCountDown(m, s);
      timer.start(setSmokeCall);
      displayMission(mission.name);

      $("#start_btn").hide();
      $("#stop_btn").show();
    }
  };
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

function setLocal(key, item) {
  localStorage.setItem(key, JSON.stringify(item));
};

function getLocal(item) {
  let v = JSON.parse(localStorage.getItem(item));
  return (v === null) ? false : v;
};