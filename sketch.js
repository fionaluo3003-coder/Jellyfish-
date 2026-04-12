let t = 0;
let pos; 
let song, fft;
let btnSize = 60;

function preload() {
  // 確保你的 GitHub 倉庫裡有 music.mp3
  song = loadSound('music.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pos = createVector(0, 0);
  fft = new p5.FFT();
  colorMode(HSB, 360, 100, 100, 1);
}

function draw() {
  background(0); // 這裡的黑會與 HTML 背景融合

  // 1. 獲取音頻能量 (用於按鈕跳動)
  let bass = 0;
  if (song && song.isPlaying()) {
    fft.analyze();
    bass = fft.getEnergy("bass");
  }

  // 2. 水母移動邏輯 (速度降低 70%)
  let targetX = mouseX - width / 2;
  let targetY = mouseY - height / 2;
  pos.x = lerp(pos.x, targetX, 0.015);
  pos.y = lerp(pos.y, targetY, 0.015);
  t += PI / 45;

  // --- 繪製巨大水母 ---
  push();
  translate(pos.x, pos.y, 0); 
  // 面積佔螢幕約 1/3
  let targetRadius = sqrt((width * height) / (3 * PI)); 
  scale(targetRadius / 100); 
  
  strokeWeight(2.5);
  noFill();
  let normalHue = (t * 15) % 360; 
  
  beginShape(POINTS);
  for (let i = 0; i < 12000; i++) {
    let k = 9 * cos(i / 61);
    let e = i / 692 - 13; 
    stroke(normalHue, 70, 80, 0.6);
    let d = (mag(k, e) ** 2) / 99 + 1;
    let q = 95 - (e / 1.5) * sin(k) + (k / d) * (8 + 5 * sin(sin(d * d + e / 9 - t)));
    let c = d / 2 + cos(t - d * 2.5) / 13 - t / 16;
    vertex(q * sin(c), q * cos(c), sin(d * 2 - t) * 40);
  }
  endShape();
  pop();

  // --- 繪製 UI 按鈕 (採用 2D 覆蓋寫法) ---
  drawButton(bass);
}

function drawButton(bass) {
  push();
  // 強制重置矩陣，回到螢幕中心座標
  resetMatrix();
  
  // 定位在左下角
  let x = -width / 2 + 70;
  let y = height / 2 - 70;
  
  // 音樂光暈
  if (song && song.isPlaying()) {
    noStroke();
    fill(330, 80, 100, 0.2);
    ellipse(x, y, btnSize + bass/10);
  }

  // 按鈕圓框
  stroke(255, 0.8);
  strokeWeight(2);
  fill(0, 0.9); // 稍微深色一點確保看得到
  ellipse(x, y, btnSize);

  // 播放/暫停圖標
  fill(255);
  noStroke();
  if (!song.isPlaying()) {
    triangle(x - 5, y - 12, x - 5, y + 12, x + 15, y);
  } else {
    rectMode(CENTER);
    rect(x - 8, y, 6, 22);
    rect(x + 8, y, 6, 22);
  }
  pop();
}

// 點擊判定邏輯
function mousePressed() {
  // 將滑鼠座標轉換為 WEBGL 的中心點座標系
  let mX = mouseX - width / 2;
  let mY = mouseY - height / 2;
  
  // 對應 drawButton 裡的 x, y
  let bX = -width / 2 + 70;
  let bY = height / 2 - 70;
  
  if (dist(mX, mY, bX, bY) < btnSize/2 + 10) {
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.play();
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
