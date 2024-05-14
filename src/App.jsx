import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Music from "./components/Music";

let PLAYING = "Cloudless";
let START = 0;
let FOCUS = true;
function App() {
  const [playing, setPlaying] = useState("Cloudless");
  const [status, setStatus] = useState("pause");
  const [musics, setMusics] = useState([]);
  /** @type {React.MutableRefObject<HTMLAudioElement>} */
  const audioContainer = useRef()

  /** @type {React.MutableRefObject<HTMLSourceElement>} */
  const audioSource = useRef()
  
  /** @type {React.MutableRefObject<HTMLInputElement>} */
  const progress = useRef()

  const [isDesktop, setDesktop] = useState(window.innerWidth > 1450);

  useEffect(() => {
    if (START == 1) return
    START = 1
    fetch(`https://fback.imnyang.xyz//NY64_Cover/list?${Date.now()}`).then(res => res.text().then(data => {
      setMusics(eval(data))
    }));
    setInterval(() => {
      fetch(`https://fback.imnyang.xyz//NY64_Cover/list?${Date.now()}`).then(res => res.text().then(data => {
        setMusics(eval(data))
      }));
    }, 10000)
    setDesktop(window.innerWidth > 1200);
    progress.current.value = 0
    audioContainer.current.currentTime = 0
  }, [])

  
  useEffect(() => {
    if (musics.length == 0) return
    setInterval(async () => {
        let overPlay = progress.current.value - audioContainer.current.currentTime / audioContainer.current.duration * 1000;
        if (String(overPlay) == "NaN") overPlay = 0

        if (FOCUS && (overPlay > 10 || overPlay < -10)) {
          audioContainer.current.currentTime = progress.current.value / 1000 * audioContainer.current.duration
        }else {
          if (audioContainer.current.paused || String(audioContainer.current.duration) == "NaN") {return}

          let progressPercent = audioContainer.current.currentTime / audioContainer.current.duration * 1000;
          if (String(progressPercent) == "NaN") { 
            progressPercent = 0
          }
          progress.current.value = progressPercent
          if (progressPercent >= 990) {
            musicNext()
            progress.current.value = 0
            audioContainer.current.currentTime = 0
          }
        }
    }, 100)
  }, [musics])

  useEffect(() => {
    if (status == "play") {
      audioContainer.current.play()
      if (!decodeURI(audioSource.current.src).startsWith(`https://fback.imnyang.xyz//NY64_Cover/Cover/${playing}.mp3`)) {
        let date = Date.now();
        navigator.mediaSession.metadata = new MediaMetadata({
          title: playing,
          album: "NY Music",
          artwork: [
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '96x96', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '128x128', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '192x192', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '256x256', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '384x384', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '512x512', type: 'image/png' },
          ]
        });
        navigator.mediaSession.setActionHandler(
          'nexttrack',
          musicNext
        );
        navigator.mediaSession.setActionHandler(
          'previoustrack',
          musicPrev
        );
        navigator.mediaSession.setActionHandler("seekto", (e) => {
          let seekTime = e.seekTime / 2
          console.log(seekTime)
          progress.current.value = seekTime*10
          audioContainer.current.currentTime = seekTime
        });
        audioSource.current.src = `https://fback.imnyang.xyz//NY64_Cover/Cover/${playing}.mp3?${date}`
        audioContainer.current.load()

        progress.current.value = 0
        audioContainer.current.currentTime = 0
      }
      audioContainer.current.play()
    } else {
      audioContainer.current.pause()
    }

  }, [playing, status])

  function musicNext() {

    audioContainer.current.currentTime = 0
    progress.current.value = 0
    
    PLAYING = musics[(musics.indexOf(PLAYING) + 1) % musics.length];
    setPlaying(PLAYING);
  }

  function musicPrev() {
    audioContainer.current.currentTime = 0
    progress.current.value = 0
    PLAYING = musics[(musics.indexOf(PLAYING) - 1 + musics.length) % musics.length];
    setPlaying(PLAYING);

  }
  
  onfocus = () => {
    FOCUS = true
  }
  onblur = () => {
    FOCUS = false
  }

  return (
    <main>
      <audio id="audioContainer" preload="metadata" ref={audioContainer}>
        <source id="audioSource" src="" ref={audioSource} type="audio/mpeg" />
        Your browser does not support the audio format.
      </audio>

      {isDesktop && (
        <div id="modal">
          <h1>지금 데스크탑 이신거 같아요!</h1>
          <img src="desk.png" />
          <div>
            <a href="https://github.com/5-23/ny-music">
              데스크탑 버전으로 설치하기
            </a>
            <button onClick={() => setDesktop(false)}>지금은 그냥 볼레요</button>
          </div>
        </div>
      )}

      <div id="music">
        <div id="FurryClass">
          <img
            src={`https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg`}
            alt={`${playing} cover`}
          />{" "}
          {playing}
        </div>
        <div id="musics">
        {musics.map((name, index) => (
          <Music
            key={index}
            name={name}
            onClick={(name) => {

              audioContainer.current.currentTime = 0
              progress.current.value = 0
              setPlaying(name);
              PLAYING = name;
            }}
          />
        ))}
      </div>
      </div>
      <div id="bar">
        <input type="range" min="0" max="1000" ref={progress} onChange={() =>{
          if (!decodeURI(audioSource.current.src).startsWith(`https://fback.imnyang.xyz//NY64_Cover/Cover/${playing}.mp3`)) {
            let date = Date.now();
            navigator.mediaSession.metadata = new MediaMetadata({
              title: playing,
              album: "NY Music",
              artwork: [
                { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '96x96', type: 'image/png' },
                { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '128x128', type: 'image/png' },
                { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '192x192', type: 'image/png' },
                { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '256x256', type: 'image/png' },
                { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '384x384', type: 'image/png' },
                { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg?${date}`, sizes: '512x512', type: 'image/png' },
              ]
            });
            audioSource.current.src = `https://fback.imnyang.xyz//NY64_Cover/Cover/${playing}.mp3?${date}`
            audioContainer.current.load()
          }
        }}/>
        <div>
          <img
            className="rev-x"
            src="skip.svg"
            alt=">>"
            onClick={musicPrev}
          />
          <img
            id="status-change"
            src={status === "play" ? "pause.svg" : "play.svg"}
            alt={status === "play" ? "||" : "|>"}
            onClick={() => setStatus(status === "play" ? "pause" : "play")}
          />
          <img src="skip.svg" alt=">>" onClick={musicNext} />
        </div>
      </div>
    </main>
  );
}

export default App;
