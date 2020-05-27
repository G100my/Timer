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