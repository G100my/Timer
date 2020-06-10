// =================== normal clock

var clockTime;
var clock = new Date();
setInterval(() => {
	clock = new Date();
	let h = clock.getHours();
	let m = clock.getMinutes();
	let s = clock.getSeconds();

	h = (h < 10) ? "0" + h : h;
	m = (m < 10) ? "0" + m : m;
	colon = (s % 2 == 0) ? " " : ":";
	clockTime = h + colon + m;
	
	if (!timer.intervalID && s == 0) { forecastTime() };

	$("#digital_clock").text(clockTime);
}, 1000);

// 當前計數器狀態，如果是當前事件循環的狀況、則重新設定歸零再次計數、mission資料則部份改變不重置
var timer = {
	min: 0,
	sec: 0,
	intervalID: 0,
	timeSet: 0,
	svgAngle: 0,
	set: function (min, sec = 0, angle = 0, title = mission.name) {
		this.min = min;
		this.sec = sec;
		this.timeSet = mission.minSet * 60000;
		this.svgAngle = angle
		console.log(this.svgAngle);
		displayTime();
		displayMissionTitle(title);
	},
	stop: () => { clearInterval(timer.intervalID); timer.intervalID = false; },
	start: function(callback = () => { console.log('No next mission? Really?') }) {
		let countSec = 10;
		console.log(this)
		this.intervalID = setInterval(() => {
			if (countSec === 10) {
				displayTime();
				this.sec -= 1;
				countSec = 0;
			};

			if (this.min <= 0 && this.sec < 0) {
				clearInterval(this.intervalID);
				callback();
			};
			if (this.sec < 0) {
				this.sec = 59;
				this.min -= 1;
			};

			countSec += 1;
			this.svgAngle += (100 / this.timeSet);
			drawProgress(this.svgAngle);
		}, 100);
	},
};

window.onresize = () => {
	node = document.getElementById('progress').parentElement;
	h = node.clientHeight;
	w = node.clientWidth;
};

function displayTime(m = timer.min, s = timer.sec) {
	document.getElementById("tomato_clock").innerText = addZero(m) + ':' + addZero(s);
	console.log('displayTime:  '+ m + ' m  ' + s + ' s');
};

function addZero(num) {
	return (num < 10) ? '0' + num : num;
};

// FIXME
var node = document.getElementById('progress').parentElement;
var h = node.clientHeight;
var w = node.clientWidth;

function countXYR(width, height, num) {
	let x = y = (width <= height) ? width / 2 : height / 2;
	let outside_r = x * 0.95;
	let inside_r = outside_r * 0.7;
	return {
		x: x,
		y: y,
		or: outside_r,
		ir: inside_r,
		ox: x + outside_r * Math.sin(num),
		oy: y - outside_r * Math.cos(num),
		ix: x + inside_r * Math.sin(num),
		iy: y - inside_r * Math.cos(num),
	};
};

function drawProgress(percent) {
	if (percent < 0.0005) { percent = 0 }
	else if (percent >= 1) { percent = 0.9999 };
	let degree = percent * 2 * Math.PI;
	var c = countXYR(h, w, degree);
	let mode = (percent > 0.5) ? '1' : '0';
	$('#progress').attr('d',
		'M ' + c.x + ' ' + (c.y - c.or) + ' ' +
		'A ' + c.or + ' ' + c.or + ' ' + '0 ' + mode + ' 1 ' + c.ox + ' ' + c.oy + ' ' +
		'L ' + c.x + ' ' + c.y + ' Z' + ' '
		+ 'M ' + c.x + ' ' + (c.y - c.ir) + ' ' +
		'A ' + c.ir + ' ' + c.ir + ' ' + '0 ' + mode + ' 1 ' + c.ix + ' ' + c.iy + ' ' +
		'L ' + c.x + ' ' + c.y + ' Z'
	);
	console.log(c);
	console.log('num ' + num);
};
let lastAngle = 0;
function chooseTimeNum(target, start = lastAngle) {
	const times = 20;
	let step = (target - start) / times;
	console.log('step')
	console.log(step)
	console.log('target')
	console.log(target)
	console.log('start')
	console.log(start)
	if (step == 0) { return };
	for (let i = 0; i <= times; i++) {
		setTimeout(() => {
			drawProgress(start + step * i);
		}, 10 * i);
	};
	lastAngle = target;
};
