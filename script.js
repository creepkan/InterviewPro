// 登录功能
const loginBtn = document.getElementById('login-btn');
const loginCodeInput = document.getElementById('login-code');
const loginError = document.getElementById('login-error');
const loginContainer = document.getElementById('login-container');
const cameraContainer = document.getElementById('camera-container');

loginBtn.addEventListener('click', async () => {
  const inputCode = loginCodeInput.value.trim();
  if (!inputCode) {
    loginError.textContent = '请输入动态码！';
    return;
  }

  try {
    const response = await fetch('https://2be3-117-151-107-26.ngrok-free.app/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: inputCode }),
    });
    const result = await response.json();
    if (result.valid) {
      loginContainer.style.display = 'none';
      cameraContainer.style.display = 'block';
      loginError.textContent = '';
    } else {
      loginError.textContent = result.message || '动态码错误，请重新输入！';
    }
  } catch (error) {
    loginError.textContent = '无法连接到后端服务，请稍后再试！';
    console.error(error);
  }
});

// 面试问题生成器
const questions = [
  "你喜欢的穿衣风格是什么？",
"你怎么选衣服 ？",
"介绍一下你今天穿的衣服 ",
"你喜欢什么品牌 ？（分男女装）",
"你喜欢的设计师是谁 ？（分男女）",
"你喜欢什么音乐 ？",
"你喜欢什么电影 ？",
"你喜欢看什么书？",
"你喜欢什么颜色 ",
"平时喜欢做什么?",
"有什么样的兴趣爱好?",
"最喜欢的专业课程是什么？",
"你最喜欢旅行的地方是哪里？为什么 ",
"介绍下你的家乡 ",
"介绍一下你的成长经历 ",
"介绍一下你的母校 ",
"你的性格是怎样的？",
"为什么跨专业 ？",
"为什么选择服装设计 ？",
"为什么毕业多年再考研？",
"为什么要考武纺？",
"会不会做衣服？",
"如果让你设计一个系列，你会怎么做？",
"有什么工作经历 ？（往届生）",
"在工作中具体干什么 ？",
"什么时候毕业的？",
"工作了多久？",
"（二战）第一次失败在哪里？如何调整心态 ？",
"（大赛经验多）大赛的心得？",
"毕业设计和毕业论文是如何融合的？",
"面料在使用过程中的难点？",
"毕业设计做的什么？",
"你的读研规划是什么？",
"你选择的专硕还是学硕？为什么 ？",
"录取了想选择什么研究方向？",
];

document.getElementById('generate-question-btn').addEventListener('click', () => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  document.getElementById('question-text').textContent = questions[randomIndex];
});

// 摄像头功能
const video = document.getElementById('video');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const recordBtn = document.getElementById('record-btn');
const stopRecordBtn = document.getElementById('stop-record-btn');
const screenshotBtn = document.getElementById('screenshot-btn');
const historyList = document.getElementById('history-list');

let stream = null; // 全局变量，用于存储媒体流
let mediaRecorder = null; // 用于录制的视频流
let recordedChunks = []; // 存储录制的片段

startBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    recordBtn.disabled = false;
    screenshotBtn.disabled = false;
  } catch (error) {
    console.error('Error accessing media devices.', error);
    alert('无法访问摄像头或麦克风，请检查权限设置。');
  }
});

stopBtn.addEventListener('click', () => {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
    stream = null;
  }
  startBtn.disabled = false;
  stopBtn.disabled = true;
  recordBtn.disabled = true;
  stopRecordBtn.disabled = true;
  screenshotBtn.disabled = true;
});

// 录制功能
recordBtn.addEventListener('click', () => {
  if (!stream) {
    alert('摄像头未开启！');
    return;
  }

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const videoBlob = new Blob(recordedChunks, { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(videoBlob);
    addHistoryItem('录制视频', videoUrl, 'video');
  };

  mediaRecorder.start();
  recordBtn.disabled = true;
  stopRecordBtn.disabled = false;
});

stopRecordBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    recordBtn.disabled = false;
    stopRecordBtn.disabled = true;
  }
});

// 截图功能
screenshotBtn.addEventListener('click', () => {
  if (!stream) {
    alert('摄像头未开启！');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    const imgUrl = URL.createObjectURL(blob);
    addHistoryItem('截图', imgUrl, 'image');
  }, 'image/png');
});

// 倒计时功能
const countdownInput = document.getElementById('countdown-input');
const timerDisplay = document.getElementById('timer-display');
const countdownBtn = document.getElementById('countdown-btn');
const stopCountdownBtn = document.getElementById('stop-countdown-btn');

let countdownInterval = null;

countdownBtn.addEventListener('click', () => {
  let countdownTime = parseInt(countdownInput.value);
  if (isNaN(countdownTime) || countdownTime <= 0) {
    timerDisplay.textContent = '请输入有效时间！';
    return;
  }

  countdownBtn.disabled = true;
  stopCountdownBtn.disabled = false;
  countdownInput.disabled = true;

  countdownInterval = setInterval(() => {
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;
    timerDisplay.textContent = `倒计时：${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    countdownTime--;

    if (countdownTime < 0) {
      clearInterval(countdownInterval);
      timerDisplay.textContent = '倒计时结束！';
      countdownBtn.disabled = false;
      stopCountdownBtn.disabled = true;
      countdownInput.disabled = false;
    }
  }, 1000);
});

stopCountdownBtn.addEventListener('click', () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
    timerDisplay.textContent = '倒计时已停止！';
    countdownBtn.disabled = false;
    stopCountdownBtn.disabled = true;
    countdownInput.disabled = false;
  }
});

// 历史记录功能
function addHistoryItem(type, url, mediaType) {
  const li = document.createElement('li');
  const timestamp = new Date().toLocaleString();
  const label = document.createElement('span');
  label.textContent = `${type} (${timestamp})`;

  if (mediaType === 'video') {
    const videoElem = document.createElement('video');
    videoElem.src = url;
    videoElem.controls = true;
    videoElem.width = 200;
    li.appendChild(label);
    li.appendChild(videoElem);
  } else if (mediaType === 'image') {
    const imgElem = document.createElement('img');
    imgElem.src = url;
    imgElem.alt = '截图';
    imgElem.width = 200;
    li.appendChild(label);
    li.appendChild(imgElem);
  }

  // 创建删除按钮
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '删除';
  deleteBtn.addEventListener('click', () => {
    historyList.removeChild(li);
  });
  li.appendChild(deleteBtn);

  // 限制历史记录最多5项
  if (historyList.children.length >= 5) {
    historyList.removeChild(historyList.lastChild);
  }

  historyList.prepend(li); // 最新的记录在最上方
}
