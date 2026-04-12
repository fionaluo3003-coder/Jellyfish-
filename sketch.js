let t = 0;
let pos; 
let song, fft;
let btnSize = 60;

function preload() {
  song = loadSound('music.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pos = createVector(0, 0);
  fft = new p5.FFT();
  colorMode(HSB, 360, 100, 100, 1);
}

function draw() {
  background(0); 

  let bass = fft.analyze() ? fft.getEnergy("bass") : 0;

  // 緩慢移動 (降低 70%)
  let targetX = mouseX - width / 2;
  let targetY = mouseY - height / 2;
  pos.x = lerp(pos.x, targetX, 0.015);
  pos.y = lerp(pos.y, targetY, 0.015);
  t += PI / 45;

  // --- 繪製巨大水母 ---
  push();
  translate(pos.x, pos.y, 0); 
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

  // --- 繪製按鈕 (保證看見版) ---
  drawSafeButton(bass);
}

function drawSafeButton(bass) {
  push();
  // 重置所有變換，確保座標以畫布中心 (0,0) 為準
  resetMatrix();
  
  // 計算左下角位置 (WEBGL 中心座標系)
  let x = -width / 2 + 70;
  let y = height / 2 - 70;
  
  // 音樂律動光暈
  if (song && song.isPlaying()) {
    noStroke();
    fill(330, 80, 100, 0.2);
    ellipse(x, y, btnSize + bass/10);
  }

  // 按鈕主體
  stroke(255, 0.8);
  strokeWeight(2);
  fill(0, 0.8);
  ellipse(x, y, btnSize);

  // 圖標
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

function mousePressed() {
  // 將滑鼠座標轉換回 WEBGL 中心座標
  let mX = mouseX - width / 2;
  let mY = mouseY - height / 2;
  
  let btnX = -width / 2 + 70;
  let btnY = height / 2 - 70;
  
  if (dist(mX, mY, btnX, btnY) < btnSize) {
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
