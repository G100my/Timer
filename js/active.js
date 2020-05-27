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

$("#start_btn").click(() => {
	setNextMission();
	setCountDown(mission.misSet);
	mission.startTime = Date.now();
	timer.start(() => {
		finishMission();
		setSmokeCall();
		displayMission('SmokeCall');
	});
	$("#start_btn").hide();
	$("#stop_btn").show();
});

$("#repeat_btn").click(() => {
	mission.repeat = !mission.repeat;
	setLocal('localMission', mission);
	console.log(mission.repeat);
});

$("#stop_btn").click(() => {
	timer.stop();
	finishMission(false);
	displayMission('stop');
	displayTimer('25:00');

	$("#start_btn").show();
	$("#stop_btn").hide();
});