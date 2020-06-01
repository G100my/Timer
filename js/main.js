let stampState = true;

// 紀錄接下來的事件、已經完成準備上傳到 sheet 的事件
var list = getLocal('localList') || {
  toDo: [],
  complete: [],
  lastTitle: ''
};
// 紀錄當前工作事件資料，每次完成、中止都會記錄到 list.complete
var mission = {
  startTime: undefined,
  name: '',
  minSet: undefined,
  completed: false,
};
let minSet = 1; //fix
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
  console.log('addToList: ');
  let id = Date.now();
  list.toDo.push({ id: id, name: textValue });
  setLocal('localList', list);
  $("#mission_list").append(
    '<p id="' + id + '" class="missions">' + textValue + "<button onclick='deleteMission(" + id + ")'>delete</button></p>");
};

function deleteMission(id) {
  console.log('deleteMission');
  list.toDo.pop();
  $("#" + id).remove();
  setLocal('localList', list);
};

// ===================

function checkNext() {
  console.log('checkout');
  if (timer.combo >= 4) {
    console.log('check combo-4');
    setSmokeCall(1, 0);
    displayMissionTitle('take a walk!');
    return;
  };
  if (document.getElementById('repeat_switch').checked) {
    console.log('check repeat');
    timer.set(mission.minSet);
    mission.completed = false;
    timer.start(() => {
      finishMission();
      setSmokeCall();
    });
    return;
  };

  $("#start_btn").show();
  $("#stop_btn").hide();
};

function finishMission(completed = true) {
  console.log('finishMission() ' + completed)
  mission.completed = completed;
  list.complete.push(mission);
  if (completed) { timer.combo += 1; };
  setLocal('localList', list);
};

function setNextNameMin(minSet = 25) {
  console.log('setNextNameMin ' + minSet);
  mission.minSet = minSet;
  timer.set(minSet);
  if (list.toDo.length > 0) {
    let toDo = list.toDo.shift();
    $(".missions:first").remove();
    mission.name = toDo.name;
  } else {
    mission.name = 'Do your best';
  };
  displayMissionTitle(mission.name);
};

function setSmokeCall(min = 5) {
  console.log('setSmokeCall: ' + min + ' ' + sec);
  timer.set(min);
  timer.start(checkNext);
};

// ===================

function loadLocal() {
  if (list.toDo.length > 0) {
    console.log('load local list');
    console.log(list);
    list.toDo.forEach(e => {
      $("#mission_list").append(
        '<p id="' + e.id + '" class="missions">' + e.name + "<button onclick='deleteMission(" + e.id + ")'>delete</button></p>");
    });
  };
  if (mission.startTime !== undefined && !mission.completed) {
    console.log('load local mission');
    console.log(mission);
    t = ((mission.startTime + mission.minSet * 60000) - Date.now()) / 1000;
    if (t > 1) {
      let m = parseInt((t) / 60);
      let s = parseInt(t % 60)
      timer.set(m, s);
      timer.start(setSmokeCall);
      displayMissionTitle(mission.name);

      $("#start_btn").hide();
      $("#stop_btn").show();
    }
  };
};

// ===================

function setLocal(key, item) {
  console.log('setLocal ' + key);
  localStorage.setItem(key, JSON.stringify(item));
  console.log(item);
  console.log('local storage: ');
  console.log(localStorage);
};

function getLocal(item) {
  let v = JSON.parse(localStorage.getItem(item));
  return (v === null) ? false : v;
};

function displayMissionTitle(msg) {
  document.getElementById("current_mission").innerText = msg;
};

$('#sheet_init').click(function () {
  console.log('click init');
  initSheet(timerSheetID);
});

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

$("#mission_input_btn").keyup((event) => {
  //enter鍵：
  // 如果不曾輸入過文字：null；
  // 如果曾經送出過文字、但目前留空：上次輸入的文字；
  let currenValue = (input.value === '') ? ((list.lastTitle === undefined) ? '' : list.lastTitle) : input.value;
  if (event.which === 13 && (currenValue !== '' || list.lastTitle !== '')) {
    list.lastTitle = currenValue;
    addToList(currenValue);
    input.value = '';
  };
  //esc鍵：清除目前所鍵入的文字
  (event.which === 27 && input.value !== '' && (input.value = ''));
});

// 按下後與 stop 互換顯示狀態，目標: 不會有還沒中止就能再按一次開始，
$("#start_btn").click(() => {
  setNextNameMin();
  mission.startTime = Date.now();
  mission.minSet = minSet;
  timer.start(() => {
    finishMission();
    setSmokeCall();
    displayMissionTitle('SmokeCall');
  });
  setLocal('localMission', mission);
  setLocal('localList', list);
  $("#start_btn").hide();
  $("#stop_btn").show();
});

$("#stop_btn").click(() => {
  timer.stop();
  finishMission(false);
  displayMissionTitle('stop');

  checkNext();
  // reset SVG
  displayMissionTitle('manual stop');
  document.getElementById("tomato_clock").innerText = '--:--';
  // re

});
$('#sidebarCollapse').on('click', function () {
  $('#sidebar').toggleClass('active');
});