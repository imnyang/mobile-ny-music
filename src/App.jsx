import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Music from "./components/Music";

let PLAYING = "Cloudless";
let START = 0;

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
    progress.current.value = 0
    audioContainer.current.currentTime = 0
  }, [])

  useEffect(() => {
    if (status == "play") {
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
          progress.current.value = e.seekTime*10
          audioContainer.current.currentTime = e.seekTime
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
    PLAYING = musics[(musics.indexOf(PLAYING) + 1) % musics.length];
    setPlaying(PLAYING);
  }

  function musicPrev() {
    PLAYING =
      musics[(musics.indexOf(PLAYING) - 1 + musics.length) % musics.length];
    setPlaying(PLAYING);
  }
  
  return (
    <main>
      <audio autobuffer id="audioContainer" preload="metadata" ref={audioContainer} autoplay>
        <source id="audioSource" src="" ref={audioSource} type="audio/mpeg" />
        Your browser does not support the audio format.
      </audio>

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
              setPlaying(name);
              PLAYING = name;
            }}
          />
        ))}
      </div>
      </div>
      <div id="bar">
        <input type="range" min="0" max="1000" ref={progress} />
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
