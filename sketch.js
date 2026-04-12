let t = 0;
let pos; 
let angle = 0; 
let song, fft;
const poemText = "THE NOISY REVELRY OF LIVING BEINGS,\nIN THE ABYSSAL OCEAN,\nIS PRECISELY WHERE THEY CANNOT BE HEARD…";

// 按鈕設定
let btnX = 80; 
let btnY = 180;
let baseSize = 60; // 黑色核心大小

function preload() {
  song = loadSound('music.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  strokeWeight(0.12);
  noFill();
  pos = createVector(0, 0);
  fft = new p5.FFT();
  colorMode(HSB, 360, 100, 100, 1);

  if (getAudioContext().state !== 'running') {
    getAudioContext().suspend();
  }
}

function draw() {
  background(0); 

  // 1. 音頻分析
  let bass = 0;
  let isHeavyBeat = false;
  if (song && song.isPlaying()) {
    fft.analyze();
    bass = fft.getEnergy("bass");
    isHeavyBeat = bass > 210;
  }

  // 2. 水母移動邏輯
  let targetX = mouseX - width / 2;
  let targetY = mouseY - height / 2;
  let prevPos = pos.copy();
  pos.x = lerp(pos.x, targetX, 0.005);
  pos.y = lerp(pos.y, targetY, 0.005);

  let velocity = p5.Vector.sub(pos, prevPos);
  if (velocity.mag() > 0.005) { 
    let targetAngle = velocity.heading() + HALF_PI;
    angle = lerp(angle, targetAngle, 0.01);
  }
  t += PI / 45;

  // 3. 繪製 3D 水母
  push();
  translate(pos.x, pos.y, 0); 
  rotateZ(angle);         
  let normalHue = (t * 15) % 360; 
  beginShape(POINTS);
  for (let i = 0; i < 20000; i++) {
    let k = 9 * cos(i / 61);
    let e = i / 692 - 13; 
    if (isHeavyBeat) {
      stroke((i / 50 + t * 100) % 360, 80, 100, 0.8);
    } else {
      stroke(normalHue, 70, 80, 0.5);
    }
    let d = (mag(k, e) ** 2) / 99 + 1;
    let bloom = isHeavyBeat ? map(bass, 210, 255, 0, 12) : 0;
    let q = 79 - (e / 2) * sin(k) + (k / d) * (6 + 3 * sin(sin(d * d + e / 9 - t))) + bloom;
    let c = d / 2 + cos(t - d * 2.5) / 13 - t / 16;
    vertex(q * sin(c), q * cos(c), sin(d * 2 - t) * 40);
  }
  endShape();
  pop();

  // 4. 繪製 2D 介面與播放鍵
  drawUI(bass);
}

function drawUI(bass) {
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);

  // 詩句文字
  fill(255, 0.9);
  noStroke();
  textSize(22);
  textAlign(LEFT, TOP);
  text(poemText, 40, 40);

  // --- 單一播放鍵設計 ---
  let pulse = map(bass, 0, 255, 0, 40); // 隨重音擴張的光暈
  
  // A. 外圍擴散光暈 (柔和粉色/白色)
  noStroke();
  for(let i = 5; i > 0; i--) {
    let alpha = map(i, 0, 5, 0.05, 0);
    fill(340, 60, 100, alpha); // HSB 粉色光
    if (song && song.isPlaying()) {
        ellipse(btnX, btnY, baseSize * 1.5 + pulse * (i/2)); 
    } else {
        ellipse(btnX, btnY, baseSize * 1.2); 
    }
  }

  // B. 核心黑色圓餅
  fill(0); // 純黑
  stroke(255, 0.2); // 極細微白邊
  strokeWeight(1);
  ellipse(btnX, btnY, baseSize);

  // C. 播放/暫停小圖標 (置中)
  noFill();
  stroke(255, 0.8);
  strokeWeight(2);
  if (!song.isPlaying()) {
    // 播放三角形
    push();
    translate(btnX + 2, btnY);
    beginShape();
    vertex(-8, -10);
    vertex(-8, 10);
    vertex(12, 0);
    endShape(CLOSE);
    pop();
  } else {
    // 暫停雙線
    line(btnX - 5, btnY - 8, btnX - 5, btnY + 8);
    line(btnX + 5, btnY - 8, btnX + 5, btnY + 8);
  }
  pop();
}

function touchStarted() {
  // 判定是否點擊按鈕
  let d = dist(mouseX, mouseY, btnX, btnY);
  if (d < baseSize) {
    userStartAudio().then(() => {
      if (song.isPlaying()) {
        song.pause();
      } else {
        song.play();
        fft.setInput(song);
      }
    });
  }
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
