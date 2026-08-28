"use strict";

/* ==============================
   ELEMENTS
============================== */

const camera =
  document.getElementById("camera");

const startBtn =
  document.getElementById("startBtn");

const setup =
  document.getElementById("setup");

const recordBtn =
  document.getElementById("recordBtn");

const switchBtn =
  document.getElementById("switchBtn");

const blurBtn =
  document.getElementById("blurBtn");

const effectBtn =
  document.getElementById("effectBtn");

const textBtn =
  document.getElementById("textBtn");

const blurLayer =
  document.getElementById("blurLayer");

const recording =
  document.getElementById("recording");

const timer =
  document.getElementById("timer");

const resultPanel =
  document.getElementById("resultPanel");

const resultVideo =
  document.getElementById("resultVideo");

const downloadBtn =
  document.getElementById("downloadBtn");

const againBtn =
  document.getElementById("againBtn");

const music =
  document.getElementById("music");

const musicInput =
  document.getElementById("musicInput");

const musicBtn =
  document.getElementById("musicBtn");

const musicName =
  document.getElementById("musicName");


/* ==============================
   STATE
============================== */

let stream = null;

let recorder = null;

let chunks = [];

let recordedBlob = null;

let videoURL = null;

let facingMode = "user";

let blurOn = false;

let effect = 0;

let timerInterval = null;

let seconds = 0;


/* ==============================
   DATE
============================== */

function updateDate(){

  const now = new Date();

  document.getElementById(
    "dateText"
  ).textContent =
    now.toLocaleDateString(
      "id-ID",
      {
        day:"numeric",
        month:"long",
        year:"numeric"
      }
    );

}

updateDate();


/* ==============================
   CAMERA
============================== */

async function startCamera(){

  if(
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ){

    alert(
      "Browser tidak mendukung kamera. Gunakan Chrome/Edge terbaru."
    );

    return false;
  }


  if(stream){

    stream
      .getTracks()
      .forEach(track => track.stop());

  }


  try{

    stream =
      await navigator.mediaDevices.getUserMedia({

        audio:true,

        video:{
          facingMode:{
            ideal:facingMode
          },

          width:{
            ideal:1280
          },

          height:{
            ideal:720
          }
        }

      });


    camera.srcObject = stream;

    await camera.play();

    return true;

  }catch(error){

    console.error(error);

    if(error.name === "NotAllowedError"){

      alert(
        "Izin kamera/mikrofon ditolak. Izinkan akses kamera dan mikrofon di browser."
      );

    }else if(error.name === "NotFoundError"){

      alert(
        "Kamera atau mikrofon tidak ditemukan."
      );

    }else{

      alert(
        "Kamera gagal dibuka."
      );

    }

    return false;

  }

}


/* ==============================
   START
============================== */

startBtn.onclick =
async()=>{

  const ok =
    await startCamera();

  if(!ok)return;


  const n1 =
    document.getElementById(
      "name1"
    ).value.trim();

  const n2 =
    document.getElementById(
      "name2"
    ).value.trim();

  const title =
    document.getElementById(
      "title"
    ).value.trim();


  document.getElementById(
    "namePreview"
  ).textContent =
    n1 && n2
      ? `♡ ${n1} × ${n2} ♡`
      : "♡ You & Me ♡";


  document.getElementById(
    "titlePreview"
  ).textContent =
    title || "Our Little Moments";


  setup.style.display =
    "none";

};


/* ==============================
   SWITCH CAMERA
============================== */

switchBtn.onclick =
async()=>{

  if(recorder?.state === "recording"){

    return;

  }

  facingMode =
    facingMode === "user"
      ? "environment"
      : "user";

  await startCamera();

};


/* ==============================
   BLUR
============================== */

blurBtn.onclick =
()=>{

  blurOn = !blurOn;

  if(blurOn){

    blurLayer.style.backdropFilter =
      "blur(8px)";

    blurLayer.style.webkitBackdropFilter =
      "blur(8px)";

    blurBtn.textContent =
      "🌫️ Blur ON";

  }else{

    blurLayer.style.backdropFilter =
      "blur(0px)";

    blurLayer.style.webkitBackdropFilter =
      "blur(0px)";

    blurBtn.textContent =
      "🌫️ Blur OFF";

  }

};


/* ==============================
   VISUAL EFFECTS
============================== */

effectBtn.onclick =
()=>{

  effect++;

  if(effect > 4){
    effect = 0;
  }


  const filters = [

    "none",

    "brightness(1.08) saturate(1.15)",

    "contrast(1.08) saturate(1.25)",

    "sepia(.18) saturate(1.1)",

    "grayscale(.25) contrast(1.05)"

  ];


  camera.style.filter =
    filters[effect];

};


/* ==============================
   MUSIC
============================== */

musicBtn.onclick =
()=>{

  musicInput.click();

};


musicInput.onchange =
()=>{

  const file =
    musicInput.files[0];

  if(!file)return;


  if(music.src){

    URL.revokeObjectURL(
      music.src
    );

  }


  music.src =
    URL.createObjectURL(file);


  musicName.textContent =
    file.name;


  music.play()
    .catch(()=>{});

};


/* ==============================
   MUSIC TOUCH
============================== */

document.body.addEventListener(
  "click",
  ()=>{
    if(music.src){

      music.play()
        .catch(()=>{});

    }
  },
  {
    once:false
  }
);


/* ==============================
   TIMER
============================== */

function startTimer(){

  seconds=0;

  timer.textContent =
    "00:00";


  timerInterval =
    setInterval(
      ()=>{

        seconds++;

        const min =
          Math.floor(seconds/60)
          .toString()
          .padStart(2,"0");

        const sec =
          (seconds%60)
          .toString()
          .padStart(2,"0");

        timer.textContent =
          `${min}:${sec}`;

      },
      1000
    );

}


function stopTimer(){

  clearInterval(
    timerInterval
  );

}


/* ==============================
   RECORDER MIME
============================== */

function getMimeType(){

  const types = [

    "video/webm;codecs=vp9,opus",

    "video/webm;codecs=vp8,opus",

    "video/webm",

    "video/mp4"

  ];


  for(
    const type of types
  ){

    if(
      MediaRecorder.isTypeSupported(
        type
      )
    ){

      return type;

    }

  }


  return "";

}


/* ==============================
   RECORD
============================== */

recordBtn.onclick =
()=>{

  if(!stream){

    alert(
      "Aktifkan kamera terlebih dahulu."
    );

    return;

  }


  if(
    recorder &&
    recorder.state === "recording"
  ){

    stopRecording();

  }else{

    startRecording();

  }

};


/* ==============================
   START RECORDING
============================== */

function startRecording(){

  chunks=[];

  const mime =
    getMimeType();


  try{

    recorder =
      new MediaRecorder(
        stream,
        mime
          ? {mimeType:mime}
          : undefined
      );

  }catch(error){

    alert(
      "Browser tidak mendukung perekaman video."
    );

    return;

  }


  recorder.ondataavailable =
    event=>{

      if(
        event.data &&
        event.data.size > 0
      ){

        chunks.push(
          event.data
        );

      }

    };


  recorder.onstop =
    finishRecording;


  recorder.start(
    250
  );


  recordBtn.classList.add(
    "active"
  );

  recording.classList.add(
    "show"
  );

  startTimer();


  if(music.src){

    music.currentTime=0;

    music.play()
      .catch(()=>{});

  }

}


/* ==============================
   STOP RECORDING
============================== */

function stopRecording(){

  if(
    recorder &&
    recorder.state === "recording"
  ){

    recorder.stop();

  }

}


/* ==============================
   FINISH
============================== */

function finishRecording(){

  stopTimer();


  recordBtn.classList.remove(
    "active"
  );

  recording.classList.remove(
    "show"
  );


  const type =
    recorder.mimeType ||
    "video/webm";


  recordedBlob =
    new Blob(
      chunks,
      {
        type:type
      }
    );


  if(videoURL){

    URL.revokeObjectURL(
      videoURL
    );

  }


  videoURL =
    URL.createObjectURL(
      recordedBlob
    );


  resultVideo.src =
    videoURL;


  resultVideo.load();


  resultPanel.classList.add(
    "show"
  );


  if(music.src){

    music.pause();

  }

}


/* ==============================
   DOWNLOAD
============================== */

downloadBtn.onclick =
()=>{

  if(!recordedBlob){

    return;

  }


  const url =
    URL.createObjectURL(
      recordedBlob
    );


  const extension =
    recordedBlob.type
      .includes("mp4")
      ? "mp4"
      : "webm";


  const a =
    document.createElement(
      "a"
    );


  a.href=url;

  a.download =
    `LoveCamera-${Date.now()}.${extension}`;


  document.body.appendChild(a);

  a.click();

  a.remove();


  setTimeout(
    ()=>{
      URL.revokeObjectURL(url);
    },
    5000
  );

};


/* ==============================
   AGAIN
============================== */

againBtn.onclick =
()=>{

  resultPanel.classList.remove(
    "show"
  );

  chunks=[];

  recordedBlob=null;

  if(videoURL){

    URL.revokeObjectURL(
      videoURL
    );

    videoURL=null;

  }


  resultVideo.removeAttribute(
    "src"
  );

};


/* ==============================
   TEXT BUTTON
============================== */

textBtn.onclick =
()=>{

  const title =
    prompt(
      "Masukkan tulisan:",
      document.getElementById(
        "titlePreview"
      ).textContent
    );


  if(
    title !== null &&
    title.trim()
  ){

    document.getElementById(
      "titlePreview"
    ).textContent =
      title.trim();

  }

};


/* ==============================
   PAGE CLOSE
============================== */

window.addEventListener(
  "beforeunload",
  ()=>{

    if(stream){

      stream
        .getTracks()
        .forEach(
          track=>track.stop()
        );

    }

  }
);
