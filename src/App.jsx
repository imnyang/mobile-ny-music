import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Music from "./components/Music";

let PLAYING = "Cloudless";

function App() {
  const [playing, setPlaying] = useState("Cloudless");
  const [status, setStatus] = useState("pause");
  
  const [musics, setMusics] = useState([]);
  const audioContainer = useRef();
  const audioSource = useRef();
  const progress = useRef();
  const volume = useRef();

  useEffect(() => {
    fetchMusicList();

    const interval = setInterval(fetchMusicList, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchMusicList = () => {
    fetch("https://fback.imnyang.xyz//NY64_Cover/list")
      .then((res) => res.text())
      .then((data) => {
        setMusics(eval(data));
      });
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (audioContainer.current) {
        let overPlay =
          progress.current.value -
          (audioContainer.current.currentTime /
            audioContainer.current.duration) *
            1000;
        if (String(overPlay) === "NaN") overPlay = 0;
        if (
          document.hasFocus() &&
          (overPlay > 4 || overPlay < -4) &&
          !audioContainer.current.paused
        ) {
          audioContainer.current.currentTime =
            (progress.current.value / 1000) * audioContainer.current.duration;
        } else {
          let progressPercent =
            (audioContainer.current.currentTime /
              audioContainer.current.duration) *
            1000;
          if (String(progressPercent) === "NaN") progressPercent = 0;
          progress.current.value = progressPercent;
          if (progressPercent === 1000) {
            musicNext();
            progress.current.value = 0;
            audioContainer.current.currentTime = 0;
          }
        }
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [musics]);

  useEffect(() => {
    if (status === "play") {
      if (
        audioSource.current.src !==
        `https://fback.imnyang.xyz//NY64_Cover/Cover/${playing}.mp3`
      ) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: playing,
          album: "NY Music",
          artwork: [
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg`, sizes: '96x96', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg`, sizes: '128x128', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg`, sizes: '192x192', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg`, sizes: '256x256', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg`, sizes: '384x384', type: 'image/png' },
            { src: `https://fback.imnyang.xyz//NY64_Cover/Image/${playing}.jpg`, sizes: '512x512', type: 'image/png' },
          ] 
        });
        navigator.mediaSession.setActionHandler(
            'nexttrack',
            () => musicNext()
        );
        navigator.mediaSession.setActionHandler(
            'previoustrack',
            () => musicPrev()
        );
        navigator.mediaSession.setActionHandler(
            'play',
            () => setStatus("play")
        );
        navigator.mediaSession.setActionHandler(
            'pause',
            () => setStatus("pause")
        );
        navigator.mediaSession.setActionHandler(
            'stop',
            () => {
                audioContainer.current.pause();
                audioContainer.current.currentTime = 0;
            }
        );
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
        progress.current.value = 0;
        audioSource.current.src = `https://fback.imnyang.xyz//NY64_Cover/Cover/${playing}.mp3`;
        audioContainer.current.load();
        
      }
      audioContainer.current.play();
    } else {
      audioContainer.current.pause();
    }
  }, [playing, status]);

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
