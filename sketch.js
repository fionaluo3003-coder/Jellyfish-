let t = 0;
let pos; 
let song, fft;

// 按鈕座標
let btnX, btnY;
let baseSize = 60;

function preload() {
  song = loadSound('music.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // 初始化按鈕座標 (WEBGL 中心點座標系)
  btnX = -width / 2 + 70;
  btnY = height / 2 - 70;
  
  strokeWeight(2.5); // 加粗
  noFill();
  pos = createVector(0, 0);
  fft = new p5.FFT();
  colorMode(HSB, 360, 100, 100, 1);
}

function draw() {
  background(0); 

  let bass = 0;
  if (song && song.isPlaying()) {
    fft.analyze();
    bass = fft.getEnergy("bass");
  }

  // 速度降低 70%
  let targetX = mouseX - width / 2;
  let targetY = mouseY - height / 2;
  pos.x = lerp(pos.x, targetX, 0.015);
  pos.y = lerp(pos.y, targetY, 0.015);
  t += PI / 45;

  // --- 繪製巨大水母 ---
  push();
  translate(pos.x, pos.y, 0); 
  let targetRadius = sqrt((width * height) / (3 * PI)); // 面積佔 1/3
  scale(targetRadius / 100); 
  
  let normalHue = (t * 15) % 360; 
  beginShape(POINTS);
  for (let i = 0; i < 15000; i++) {
    let k = 9 * cos(i / 61);
    let e = i / 692 - 13; 
    stroke(normalHue, 70, 80, 0.7);
    let d = (mag(k, e) ** 2) / 99 + 1;
    let q = 95 - (e / 1.5) * sin(k) + (k / d) * (8 + 5 * sin(sin(d * d + e / 9 - t)));
    let c = d / 2 + cos(t - d * 2.5) / 13 - t / 16;
    vertex(q * sin(c), q * cos(c), sin(d * 2 - t) * 40);
  }
  endShape();
  pop();

  // --- 繪製代碼按鈕 ---
  drawButton(bass);
}

function drawButton(bass) {
  push();
  // 保持在左下角
  btnX = -width / 2 + 70;
  btnY = height / 2 - 70;
  
  let pulse = map(bass, 0, 255, 0, 30);
  
  // 按鈕發光
  if (song && song.isPlaying()) {
    noStroke();
    fill(330, 80, 100, 0.2);
    ellipse(btnX, btnY, baseSize + pulse);
  }

  // 按鈕圓圈
  fill(0, 0.6);
  stroke(255, 0.8);
  strokeWeight(2);
  ellipse(btnX, btnY, baseSize);

  // 圖標
  fill(255);
  noStroke();
  if (!song.isPlaying()) {
    triangle(btnX - 5, btnY - 10, btnX - 5, btnY + 10, btnX + 12, btnY);
  } else {
    rectMode(CENTER);
    rect(btnX - 7, btnY, 5, 20);
    rect(btnX + 7, btnY, 5, 20);
  }
  pop();
}

function mousePressed() {
  // 將滑鼠點擊座標轉為 WEBGL 座標
  let mX = mouseX - width / 2;
  let mY = mouseY - height / 2;
  
  let d = dist(mX, mY, btnX, btnY);
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

