let t = 0;
let pos; 
let song, fft;

// 按鈕設定
let btnX = 60; 
let btnY = 60; 
let baseSize = 50; 

function preload() {
  song = loadSound('music.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // 稍微降低線條粗細，增加細膩感
  strokeWeight(2.0); 
  noFill();
  
  pos = createVector(0, 0);
  fft = new p5.FFT();
  // 設置 HSB 模式，方便控制色彩漸變
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

  // --- 緩慢移動邏輯 ---
  let targetX = mouseX - width / 2;
  let targetY = mouseY - height / 2;
  pos.x = lerp(pos.x, targetX, 0.015);
  pos.y = lerp(pos.y, targetY, 0.015);
  t += PI / 60; // 稍微放慢速度，增加優雅感

  push();
  translate(pos.x, pos.y, 0); 
  
  // 調整縮放
  let targetRadius = sqrt((width * height) / (5 * PI)); 
  let scaleFactor = targetRadius / 100; 
  scale(scaleFactor); 

  beginShape(POINTS);
  for (let i = 0; i < 15000; i++) {
    let k = 9 * cos(i / 61);
    let e = i / 692 - 13; 
    let d = (mag(k, e) ** 2) / 99 + 1;
    
    // --- 美化核心：色彩與透明度邏輯 ---
    // 讓顏色隨粒子索引 i 產生漸變，形成內外層次感
    let hueOffset = map(i, 0, 15000, 0, 60); 
    let baseHue = (t * 20 + hueOffset) % 360;
    
    // 模擬生物螢光的呼吸感 (Blinking Effect)
    let blink = map(sin(t * 2 + i), -1, 1, 0.4, 0.8);
    
    if (isHeavyBeat) {
      // 重低音觸發時：色彩瞬間變幻且明亮
      stroke((baseHue + 180) % 360, 80, 100, 0.9);
    } else {
      // 平時：柔和的漸變色，帶有呼吸閃爍
      stroke(baseHue, 70, 90, blink);
    }

    // --- 結構公式微調 ---
    let bloom = isHeavyBeat ? map(bass, 200, 255, 0, 25) : 0;
    
    // 增加一個波浪係數 wave，讓水母邊緣更有流動感
    let wave = sin(d * 3 - t * 2) * 5;
    let q = 95 - (e / 1.5) * sin(k) + (k / d) * (8 + 5 * sin(sin(d * d + e / 9 - t))) + bloom + wave;
    let c = d / 2 + cos(t - d * 2.5) / 13 - t / 16;
    
    // 三維空間點位
    vertex(q * sin(c), q * cos(c), sin(d * 2.5 - t) * 50);
  }
  endShape();
  pop();

  // --- 2D 按鈕 ---
  drawUI(bass);
}

function drawUI(bass) {
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);
  let pulse = map(bass, 0, 255, 0, 30); 
  noStroke();
  if (song && song.isPlaying()) {
    fill(200, 80, 100, 0.15); 
    ellipse(btnX, btnY, baseSize + pulse);
  }
  fill(0, 0.4);
  stroke(255, 0.6);
  strokeWeight(1.5);
  ellipse(btnX, btnY, baseSize);
  fill(255);
  noStroke();
  if (!song.isPlaying()) {
    triangle(btnX - 4, btnY - 8, btnX - 4, btnY + 8, btnX + 8, btnY);
  } else {
    rectMode(CENTER);
    rect(btnX - 5, btnY, 3, 15);
    rect(btnX + 5, btnY, 3, 15);
  }
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
}
