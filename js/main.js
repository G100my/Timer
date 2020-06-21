let stampState = true;
let defaultMissionTitle = 'Do your best';
let SmokeCallMsg = 'Take a breath.';
let RestMsg = 'Take a walk.';
let restTime = 20;
let smokeTime = 5;
const input = document.getElementById("mission_input");


let list = getLocal('list') || {
  toDo: [],
  completed: [],
  lastTitle: defaultMissionTitle
};

let mission = getLocal('mission') || {
  combo: 0,
  repeat: false,
  name: defaultMissionTitle,
  minSet: 25,
  startTime: undefined
};


// ==== input mission

// true => reset last mission's forecast time, false => reset all
function setForecastTime(mode = false) {
  let forecast = document.getElementsByClassName('forecast');
  if (forecast.length == 0) { return };
  for (let i = (mode) ? forecast.length - 1 : 0; i < forecast.length; i++) {
    let h = clock.getHours();
    let m = clock.getMinutes() + (mission.minSet + smokeTime) * (i + 1);
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

function addTo_mission_list(id, string) {
  $("#mission_list").append(
    '<div id="' + id + '" class="missions"><button class="icon_button" type="button" onclick="deleteMission(' + id + ')"><svg class="bi bi-trash-fill" width="1.2rem" height="1.2rem" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z" /></svg ></button>' + string + '<span class="forecast">00:00</span></div>');
};

function addToList(msg) {
  let currenValue = (msg === '') ? list.lastTitle : msg;
  list.lastTitle = currenValue;

  let id = Date.now();
  list.toDo.push(currenValue);
  addTo_mission_list(id, currenValue);

  saveList();
  setForecastTime(true);
};

function deleteMission(id) {
  let target = $("#" + id);
  let index = list.toDo.findIndex(t => t === target.text());
  list.toDo.splice(index, 1);
  target.remove();
  
  saveList();
  setForecastTime();
};

$('#mission_input_btn').click(() => {
  addToList(input.value);
  input.value = '';
});

$("#mission_input").keyup((event) => {
  if (event.which === 13 && (input.value !== '' || list.lastTitle !== '')) {
    addToList(input.value);
    input.value = '';
  };
  (event.which === 27 && input.value !== '' && (input.value = ''));
});


// ==== start button & stop button

function displayMissionTitle(msg) {
  document.getElementById("current_mission").innerText = msg;
};

function finishSmokeCall() {
  if (!mission.repeat) {
    let next = $("#mission_list div:first");
    mission.name = next.text();
  };
  numberAppear();
  $("#start_btn").show();
  $("#stop_btn").hide();
};

function setNextSmokeCall() {
  if (mission.combo >= 4) {
    mission.combo = 0;
    mission.name = restTime;
    timer.set(restTime, 0, 0);
  } else {
    mission.combo += 1;
    mission.name = SmokeCallMsg
    timer.set(smokeTime, 0, 0);
  }
  saveMission();
  timer.start(() => {
    finishSmokeCall();
    createNotification("Time's up! Go back to work and do your best again.");
  });
};


$("#start_btn").click(() => {
  mission.name = (list.toDo.length > 0) ? list.toDo[0] : defaultMissionTitle;
  mission.startTime = Date.now();

  timer.set(mission.minSet);
  timer.start(() => {
    finishMission();
    setNextSmokeCall();
    createNotification("It's time to take a break.");
  });
  
  $("#start_btn").hide();
  $("#stop_btn").show();
  setForecastTime();
  numberDisappear();
  saveMission();
});

$("#stop_btn").click(() => {
  timer.stop();
  finishMission(false);

  drawProgress(0);
  displayMissionTitle('Manual Stop');
  document.getElementById("tomato_clock").innerText = '--:--';

  numberAppear();
  $("#start_btn").show();
  $("#stop_btn").hide();
  
  setForecastTime();
});


// ==== data

function finishMission(isCompleted = true) {
  list.completed.push({
    title: mission.name,
    startTime: mission.startTime,
    timeSet: mission.minSet,
    completed: (isCompleted) ? mission.minSet : mission.minSet - timer.min - 1
  });
  if (list.toDo.length >= 1 && isCompleted && !mission.repeat) {
    mission.name = list.toDo.shift();
    $(".missions:first").remove();
  };
  mission.startTime = undefined;
  saveList();
  saveMission();
};

function saveMission() {
  localStorage.setItem('mission', JSON.stringify(mission));
};

function saveList() {
  localStorage.setItem('list', JSON.stringify(list));
};

function getLocal(item) {
  let v = JSON.parse(localStorage.getItem(item));
  return (v === null) ? false : v;
};

function loadLocal() {
  if (list.toDo.length > 0) {
    let index = 0;
    list.toDo.forEach(e => {
      addTo_mission_list(index, e);
      index += 1;
    });
  };
  if (mission.startTime !== undefined) {
    t = ((mission.startTime + mission.minSet * 60000) - Date.now()) / 1000;
    if (t > 1) {
      let m = parseInt((t) / 60);
      let s = parseInt(t % 60);
      let angle = (mission.minSet * 60 - t) / (mission.minSet * 60);
      timer.set(m, s, angle);
      timer.start(setNextSmokeCall);
      numberDisappear();
      $("#start_btn").hide();
      $("#stop_btn").show();
    } else {
      finishMission();
    }
  };
  setForecastTime();
};


// ==== number Disappear & Appear

function numberDisappear() {
  let x = document.getElementById('number_group').clientWidth / 2;
  let y = document.getElementById('number_group').clientHeight / 2;
  // 還不明白為什麼 $('p').each(()=>{$(this)}) 裡面的 $(this) 會指向 window .......
  $('#number_group div').each(function () {
    let targetX = x - $(this).position().left;
    let targetY = y - $(this).position().top;
    let stepX = (targetX) / 100;
    let stepY = (targetY) / 100;
    let step = 0;
    let t = setInterval(() => {
      if (step >= 100) clearInterval(t);

      if (step <= 5) {
        let scale = (1 + step * 0.025);
        $(this).css('transform', 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + (-stepX * step) + ', ' + (-stepY * step) + ')');
        step += 0.1;
      };

      if (step > 5 && step < 20) {
        step += 1;
      };

      if (step > 20) {
        let scale = (1 - step * 0.01);
        // scale = (scale < 0.1) ? 0 : scale;
        $(this).css('transform', 'matrix(' + scale + ', 0, 0, ' + scale + ', ' + stepX * step + ', ' + stepY * step + ')');
        step += 5;

        if (scale <= 0) {
          $('#number_group').hide();
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


// ==== Notification

notificationBtn = document.getElementById('notification_btn');
notificationBtn.onclick = askNotificationPermission;

function askNotificationPermission() {
  if (!"Notification" in window) {
    console.log("This browser does not support notifications.");
  } else {
    if (checkNotificationPromise()) {
      Notification.requestPermission()
        .then((permission) => {
          handlePermission(permission);
          console.log(Notification.permission);
        })
    } else {
      Notification.requestPermission(function (permission) {
        handlePermission(permission);
      });
    };
  };

  function checkNotificationPromise() {
    try {
      Notification.requestPermission().then();
    } catch (e) {
      return false;
    };
    return true;
  };

  function handlePermission(permission) {
    if (!('permission' in Notification)) {
      Notification.permission = permission;
    };

    // set the button to shown or hidden, depending on what the user answers
    if (Notification.permission === 'denied' || Notification.permission === 'default') {
      displayMissionTitle('Alert has been lock, go to broswer seting and unlock')
      cc('QQ')
    } else {
      notificationBtn.onclick = function () { createNotification('Timer alert has been actived') }
    };
  };
};

function createNotification(msg) {
  let img = '../favicon.ico';
  new Notification('Timer', { body: msg, icon: img });
};

// ==== oters

$('#sidebarCollapse').on('click', () => {
  $('#sidebar').toggleClass('active');
});

$('#repeat_switch').click(() => {
  mission.repeat = !mission.repeat;
  $('#repeat_switch').toggleClass('repeat_switch');
});