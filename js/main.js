let stampState = true;
let defaultTitle = 'Do your best';

// 紀錄接下來的事件、已經完成準備上傳到 sheet 的事件
var list = getLocal('list') || {
  toDo: [],
  completed: [],
  lastTitle: defaultTitle
};
// 紀錄當前工作事件資料，每次完成、中止都會記錄到 list.complete
var mission = getLocal('mission') || {
  combo: 0,
  repeat: false,

  completed: false,
  name: defaultTitle,
  minSet: 25,
  startTime: 0
};
let input = document.getElementById("mission_input");

//   var origAppend = $.fn.append;


// ===================

function displayList(id, string) {
  $("#mission_list").append(
    '<div id="' + id + '" class="missions"><button class="icon_button" type="button" onclick="deleteMission(' + id + ')"><svg class="bi bi-trash-fill" width="1.2rem" height="1.2rem" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z" /></svg ></button>' + string + '<span class="forecast">00:00</span></div>');
}

function addToList(msg) {
  let currenValue = (msg === '') ? list.lastTitle : msg;
  list.lastTitle = currenValue;
  let id = Date.now();
  list.toDo.push(currenValue);
  setLocal();
  displayList(id, currenValue);
  forecastTime();
};

function deleteMission(id) {
  console.log('deleteMission');
  let target = $("#" + id);
  let index = list.toDo.findIndex(t => t === target.text());
  list.toDo.splice(index, 1);
  target.remove();
  setLocal();
  forecastTime();
};

// ===================

function forecastTime() {
  let forecast = document.getElementsByClassName('forecast');
  for (let i = 0; i < forecast.length; i++) {
    let h = clock.getHours();
    let m = clock.getMinutes() + mission.minSet * (i + 1) + 5;
    if (m >= 60) {
      h += parseInt(m / 60);
      m = m % 60;
    };
    if (h >= 24) {
      h -= 24;
    };
    forecast[i].innerText = addZero(h) + ':' + addZero(m);
  };
};

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

// 當前 mission 複製到 list.complete
function recordMission(isCompleted = true) {
  list.completed.push({
    title: mission.name,
    startTime: mission.startTime,
    timeSet: mission.minSet,
    completed: (isCompleted) ? mission.minSet : mission.minSet - timer.min -1
  });

  setLocal();
};

// ===================

function loadLocal() {
  if (list.toDo.length > 0) {
    console.log('load local list');
    console.log(list);
    let index = 0;
    list.toDo.forEach(e => {
      displayList(index, e);
      index += 1;
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
      timer.start(checkSmokeCall);
      displayMissionTitle(mission.name);

      $("#start_btn").hide();
      $("#stop_btn").show();
    }
  };
  forecastTime();
};

// ===================

function setLocal() {
  localStorage.setItem('localList', JSON.stringify(list));
  localStorage.setItem('mission', JSON.stringify(mission));
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
  if (!mission.repeat && list.toDo.length > 0) {
    $(".missions:first").remove();
    mission.name = list.toDo.shift();
  };

  mission.startTime = Date.now();

  timer.set(mission.minSet);
  timer.start(() => {
    recordMission();
    checkSmokeCall();
  });
  forecastTime();

  setLocal();
  $("#start_btn").hide();
  $("#stop_btn").show();
});

$("#stop_btn").click(() => {
  timer.stop();
  recordMission(false);

  drawProgress(0);
  displayMissionTitle('manual stop');
  document.getElementById("tomato_clock").innerText = '--:--';

  forecastTime();
  $("#start_btn").show();
  $("#stop_btn").hide();
  setLocal();
});
$('#sidebarCollapse').on('click', () => {
  $('#sidebar').toggleClass('active');
});


$('p').each(function (e) {
  $(this).click(() => {
    mission.minSet = (e + 1) * 5;
    chooseTimeNum(mission.minSet / 60);
  });
});

function numberDisappear() {
  let x = document.getElementById('number_group').clientWidth / 2;
  let y = document.getElementById('number_group').clientHeight / 2;
  // 還不明白為什麼 $('p').each(()=>{$(this)}) 裡面的 $(this) 會指向 window .......
  $('#number_group div').each(function () {
    let targetX = x - $(this).position().left;
    let targetY = y - $(this).position().top;
    let stepX = (targetX) / 150;
    let stepY = (targetY) / 200;
    let step = 0;
    let t = setInterval(() => {
      if (step >= 100) clearInterval(t);

      if (step <= 5) {
        let scale = (1 + step * 0.025);
        $(this).css('transform', 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + (-stepX * step) + ', ' + (-stepY * step) + ')');
        step += 0.1;
      }

      if (step > 5 && step < 20) {
        step += 1;
      }

      if (step > 20) {
        let scale = (1 - step * 0.01);
        scale = (scale < 0.1) ? 0 : scale;
        $(this).css('transform', 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + stepX * step + ', ' + stepY * step + ')');
        step += 5;

        if (scale === 0) {
          $('#number_group').hide();
          console.log($(this))
          clearInterval(t);
          $(this).css('transform', "none");
        };
      }
    }, 10);
  })
};

function numberAppear() {
  let step = 0;
  let group = $('#number_group');
  group.css({ 'opacity': '0.0' }).show();

  let t = setInterval(() => {
    if (step >= 1) clearInterval(t);
    group.css('opacity', step)
    step += 0.05;
  }, 50);
};

$('#repeat_switch').click(() => {
  mission.repeat = !mission.repeat;
  $('#repeat_switch').toggleClass('repeat_switch');
  console.log(mission.repeat);
})