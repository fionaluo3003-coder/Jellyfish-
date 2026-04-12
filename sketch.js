let t = 0;
let pos; 
let angle = 0; 
let song, fft;

// 按鈕設定
let btnX = 60; 
let btnY = 0; // 會在 setup 中根據螢幕高度動態設定
let baseSize = 50; 

function preload() {
  // 請確保 GitHub 裡有 music.mp3 這個檔案
  song = loadSound('music.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // 初始化按鈕位置在左下角
  btnY = height - 80;
  
  strokeWeight(2.5); // 加粗粒子
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

  let bass = 0;
  let isHeavyBeat = false;
  if (song && song.isPlaying()) {
    fft.analyze();
    bass = fft.getEnergy("bass");
    isHeavyBeat = bass > 200; 
  }

  // --- 緩慢移動邏輯 (速度降低 70%) ---
  let targetX = mouseX - width / 2;
  let targetY = mouseY - height / 2;
  pos.x = lerp(pos.x, targetX, 0.015);
  pos.y = lerp(pos.y, targetY, 0.015);
  t += PI / 45;

  // --- 繪製巨大水母 ---
  push();
  translate(pos.x, pos.y, 0); 
  
  // 面積佔螢幕大約 1/3 (超巨大版)
  let targetRadius = sqrt((width * height) / (3 * PI)); 
  let scaleFactor = targetRadius / 100; 
  scale(scaleFactor); 
  
  let normalHue = (t * 15) % 360; 
  beginShape(POINTS);
  for (let i = 0; i < 15000; i++) {
    let k = 9 * cos(i / 61);
    let e = i / 692 - 13; 
    
    if (isHeavyBeat) {
      stroke((i / 50 + t * 100) % 360, 80, 100, 0.9);
    } else {
      stroke(normalHue, 70, 80, 0.7);
    }

    let d = (mag(k, e) ** 2) / 99 + 1;
    let bloom = isHeavyBeat ? map(bass, 200, 255, 0, 20) : 0;
    
    let q = 95 - (e / 1.5) * sin(k) + (k / d) * (8 + 5 * sin(sin(d * d + e / 9 - t))) + bloom;
    let c = d / 2 + cos(t - d * 2.5) / 13 - t / 16;
    
    vertex(q * sin(c), q * cos(c), sin(d * 2 - t) * 40);
  }
  endShape();
  pop();

  // --- 繪製交互按鈕 ---
  drawUI(bass);
}

function drawUI(bass) {
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);

  // 確保按鈕始終在螢幕左下角
  let currentBtnY = height - 80; 

  let pulse = map(bass, 0, 255, 0, 30); 
  noStroke();
  if (song && song.isPlaying()) {
    fill(330, 80, 100, 0.2); 
    ellipse(btnX, currentBtnY, baseSize + pulse);
  }

  fill(0, 0.5);
  stroke(255, 0.8);
  strokeWeight(2);
  ellipse(btnX, currentBtnY, baseSize);

  fill(255);
  noStroke();
  if (!song.isPlaying()) {
    triangle(btnX - 4, currentBtnY - 10, btnX - 4, currentBtnY + 10, btnX + 10, currentBtnY);
  } else {
    rectMode(CENTER);
    rect(btnX - 6, currentBtnY, 4, 18);
    rect(btnX + 6, currentBtnY, 4, 18);
  }
  
  btnY = currentBtnY; // 同步位置給點擊判定使用
  pop();
}

function touchStarted() {
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
  btnY = height - 80;
}
