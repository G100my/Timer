let stampState = true;
let defaultTitle = 'Do your best';

// 紀錄接下來的事件、已經完成準備上傳到 sheet 的事件
var list = getLocal('localList') || {
  toDo: [],
  completed: [],
  lastTitle: defaultTitle
};
// 紀錄當前工作事件資料，每次完成、中止都會記錄到 list.complete
var mission = {
  combo: 0,
  repeat: false,

  completed: false,
  name: defaultTitle,
  minSet: 25,
  startTime: 0
};
let input = document.getElementById("mission_input");


// ===================

function displayList(id, string) {
  $("#mission_list").append(
    '<div id="' + id + '" class="missions"><button class="icon_button" type="button" onclick="deleteMission(' + id + ')"><svg class="bi bi-trash-fill" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z" /></svg ></button>' + string + '</div>');
}

function addToList(msg) {
  let currenValue = (msg === '') ? list.lastTitle : msg;
  list.lastTitle = currenValue;
  let id = Date.now();
  list.toDo.push( currenValue );
  setLocal('localList', list);
  displayList(id, currenValue);
};

function deleteMission(id) {
  console.log('deleteMission');
  let target = $("#" + id);
  let index = list.toDo.findIndex(t => t === target.text());
  list.toDo.splice(index, 1);
  target.remove();
  setLocal('localList', list);
};

// ===================

function checkSmokeCall() {
  if (mission.combo >= 4) {
    mission.combo = 0;
    timer.set(15);
    displayMissionTitle('take a walk!');
  } else {
    mission.combo += 1;
    timer.set(5);
    displayMissionTitle('take a breath');
  }
  timer.start(checkNext);
};

function checkNext() {
  if (!mission.repeat) {
    let next = $("#mission_list div:first");
    mission.name = next.text();
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

function setNextNameMin(min = 25) {
  console.log('setNextNameMin ' + min);
  mission.minSet = min;
  timer.set(min);
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
    displayList(e.id, e.name);
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

$('#sheet_init').click(() => {
  console.log('click init');
  initSheet(timerSheetID);
});

$('#stamp_start').click(() => {
  stampState = !stampState;
  startStamp();
  $('#stamp_start').hide();
  $('#stamp_end').show();
});

$('#stamp_end').click(() => {
  stampState = !stampState;
  endStamp();
  $('#stamp_end').hide();
  $('#stamp_start').show();
});

$('#mission_input_btn').click(() => {
  addToList(input.value);
  input.value = '';
})

$("#mission_input").keyup((event) => {
  //enter鍵：
  // 如果不曾輸入過文字：null；
  // 如果曾經送出過文字、但目前留空：上次輸入的文字；
  
  if (event.which === 13 && (input.value !== '' || list.lastTitle !== '')) {
    addToList(input.value);
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
  timer.set(mission.minSet);
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
$('#sidebarCollapse').on('click', () => {
  $('#sidebar').toggleClass('active');
});