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
	colon = (s % 2 == 0) ? " " : ":";
	clockTime = h + colon + m;

	$("#digital_clock").text(clockTime);
}, 1000);

// 當前計數器狀態，如果是當前事件循環的狀況、則重新設定歸零再次計數、mission資料則部份改變不重置
var timer = {
	min: 0,
	sec: 0,
	num: 0,
	// countSec: 10,
	combo: 0,
	startTime: 0,
	set: (min, sec = 0) => {
		timer.min = min;
		timer.sec = sec;
		timer.minSet = min * 60000 + sec * 1000;
		displayTime();
	},
	stop: () => { clearInterval(timer.num); },
	start: (callback = () => { console.log('No next mission? Really?') }) => {
		let countSec = 10;
		timer.startTime = Date.now();
		timer.num = setInterval(() => {
			console.log('startime ' + timer.startTime);
			console.log('timer.minset ' + timer.minSet);
			console.log(countSec);
			if (countSec === 10) {
				displayTime();
				timer.sec -= 1;
				countSec = 0;
			};
			
			if (timer.min <= 0 && timer.sec < 0) {
				clearInterval(timer.num);
				callback();
			};
			if (timer.sec < 0) {
				timer.sec = 59;
				timer.min -= 1;
			};
			let n = (Date.now() - timer.startTime) / (timer.minSet);

			if (n < 0.0005) { n = 0 }
			else if (n > 1) { n = 1 };

			drawProgress(n);
			countSec += 1;
		}, 100);
	},
};

// FIXME
var node = document.getElementById('progress').parentElement;
var h = node.clientHeight;
var w = node.clientWidth;

window.onresize = () => {
	node = document.getElementById('progress').parentElement;
	h = node.clientHeight;
	w = node.clientWidth;
};

function displayTime(m = timer.min, s = timer.sec) {
	document.getElementById("tomato_clock").innerText = addZero(m) + ':' + addZero(s);
	console.log('displayTime:  m ' + m + 's ' + s);
};

function addZero(num) {
	return (num < 10) ? '0' + num : num;
};

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

function drawProgress(num) {
	let degree = num * 2 * Math.PI;
	var c = countXYR(h, w, degree);
	let mode = (num > 0.5) ? '1' : '0';
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