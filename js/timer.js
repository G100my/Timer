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

// mission_input
let input = document.getElementById("mission_input");
$("#mission_input").keyup((event) => {
  //enter鍵：
  // 如果不曾輸入過文字：null；
  // 如果曾經送出過文字、但目前留空：上次輸入的文字；
  let currenValue = (input.value === '') ? ((tomato.lastMissionTitle !== null) ? tomato.lastMissionTitle : null) : input.value;
  // 任務計數 + 1、新增並顯示任務名稱、清空 input、紀錄送出的文字、新增至 mission_list，切換 mission_delete
  if (event.which === 13 && (currenValue !== null || tomato.lastMissionTitle !== null)) {
    tomato.index += 1;
    $("#mission_list").append('<p id="mission_title_' + tomato.index + '" class="missions">Mission ' + tomato.index + ': <span id="mission_display_' + tomato.index + '"></span></p>');
    $("#mission_display_" + tomato.index).text(currenValue);
    input.value = '';

    tomato.lastMissionTitle = currenValue;
    tomato.missionList.push(currenValue);
    console.log(tomato.missionList);

    (tomato.index > 0 && $("#mission_delete").removeAttr("disabled"));
    (tomato.index === 0 && $("mission_delete").attr("disabled", "disabled"));
  };
  //esc鍵：清除目前所鍵入的文字
  (event.which === 27 && input.value !== '' && (input.value = ''));
});

$("#mission_delete").click(() => {
  console.log(tomato.index);
  tomato.missionList.pop();
  $("#mission_title_" + tomato.index).remove();
  tomato.index = (tomato.index <= tomato.doneMission.length) ? tomato.doneMission.length : tomato.index - 1;
});
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
