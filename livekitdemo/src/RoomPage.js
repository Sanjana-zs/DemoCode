import {
  faSquare,
  faThLarge,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  DataPacket_Kind,
  RoomEvent,
  setLogLevel,
  VideoPresets,
} from "livekit-client";
import { DisplayContext, LiveKitRoom } from "@livekit/react-components";
import { useState } from "react";
import "react-aspect-ratio/aspect-ratio.css";
import { useNavigate, useLocation } from "react-router-dom";

const RoomPage = () => {
  const [numParticipants, setNumParticipants] = useState(0);
  const [msg, setMsg] = useState();
  const [currentRoom, setCurrentRoom] = useState();
  const [chats, setChats] = useState([]);
  const [displayOptions, setDisplayOptions] = useState({
    stageLayout: "grid",
    showStats: false,
  });
  const navigate = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const url = query.get("url");
  const token = query.get("token");
  const recorder = query.get("recorder");

  if (!url || !token) {
    return <div>url and token are required</div>;
  }

  const onLeave = () => {
    navigate("/");
  };

  const updateParticipantSize = () => {
    setNumParticipants(currentRoom.participants.size + 1);
  };

  const onParticipantDisconnected = () => {
    updateParticipantSize();

    /* Special rule for recorder */
    if (
      recorder &&
      parseInt(recorder, 10) === 1 &&
      currentRoom.participants.size === 0
    ) {
      console.log("END_RECORDING");
    }
  };

  const updateOptions = (options) => {
    setDisplayOptions({
      ...displayOptions,
      ...options,
    });
  };

  const sendMsg = () => {
    /*  Send Message to All participants */
    if (msg) {
      const data = new TextEncoder().encode(msg);
      currentRoom.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
      setChats((prevArr) => [...prevArr, `You: ${msg}`]);
      setMsg("");
    }
  };

  const handleData = (msg, participant) => {
    /* get messages */
    const data = new TextDecoder().decode(msg);
    let from = "server";
    if (participant) {
      from = participant.identity;
    }
    setChats((prevArr) => [...prevArr, `${from}: ${data}`]);
  };

  return (
    <DisplayContext.Provider value={displayOptions}>
      <div className="flex">
        <div>
          <div className="roomContainer">
            <div className="topBar">
              <h2>Bitfrost</h2>
              <div className="right">
                <div>
                  <input
                    id="showStats"
                    type="checkbox"
                    onChange={(e) =>
                      updateOptions({ showStats: e.target.checked })
                    }
                  />
                  <label htmlFor="showStats">Show Stats</label>
                </div>
                <div>
                  <button
                    className="iconButton"
                    disabled={displayOptions.stageLayout === "grid"}
                    onClick={() => {
                      updateOptions({ stageLayout: "grid" });
                    }}
                  >
                    <FontAwesomeIcon height={32} icon={faThLarge} />
                  </button>
                  <button
                    className="iconButton"
                    disabled={displayOptions.stageLayout === "speaker"}
                    onClick={() => {
                      updateOptions({ stageLayout: "speaker" });
                    }}
                  >
                    <FontAwesomeIcon height={32} icon={faSquare} />
                  </button>
                </div>
                <div className="participantCount">
                  <FontAwesomeIcon icon={faUserFriends} />
                  <span>{numParticipants}</span>
                </div>
              </div>
            </div>
            <LiveKitRoom
              url={url}
              token={token}
              onConnected={(room) => {
                setLogLevel("debug");
                onConnected(room, query);
                setCurrentRoom(room);
                room.on(RoomEvent.ParticipantConnected, updateParticipantSize);
                room.on(
                  RoomEvent.ParticipantDisconnected,
                  onParticipantDisconnected
                );
                room.on(RoomEvent.DataReceived, handleData);
                updateParticipantSize();
              }}
              roomOptions={{
                adaptiveStream: isSet(query, "adaptiveStream"),
                dynacast: isSet(query, "dynacast"),
                publishDefaults: {
                  simulcast: isSet(query, "simulcast"),
                },
                videoCaptureDefaults: {
                  resolution: VideoPresets.h720.resolution,
                },
              }}
              onLeave={onLeave}
            />
          </div>
        </div>
        <div className="relative top-6 left-[px]">
          {
            // Chat Feature
          }
          <div className="chat-container h-[775px] w-[350px] ">
            <div
              className="chats h-[735px] text-lg items-center "
              style={{ color: "black" }}
            >
              <div>
                {chats.map((e) => (
                  <p className="bg-slate-100 rounded-full mt-2 ">{e}</p>
                ))}
              </div>
            </div>
            <div className="input   h-[40px] ">
              <input 
                type="text"
                placeholder="Type Message"
                onChange={(e) => setMsg(e.target.value)}
                value={msg}
              />
              <button className="bg-slate-300" onClick={sendMsg}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </DisplayContext.Provider>
  );
};

async function onConnected(room, query) {
  // make it easier to debug
  window.currentRoom = room;

  if (isSet(query, "audioEnabled")) {
    const audioDeviceId = query.get("audioDeviceId");
    if (audioDeviceId && room.options.audioCaptureDefaults) {
      room.options.audioCaptureDefaults.deviceId = audioDeviceId;
    }
    await room.localParticipant.setMicrophoneEnabled(true);
  }

  if (isSet(query, "videoEnabled")) {
    const videoDeviceId = query.get("videoDeviceId");
    if (videoDeviceId && room.options.videoCaptureDefaults) {
      room.options.videoCaptureDefaults.deviceId = videoDeviceId;
    }
    await room.localParticipant.setCameraEnabled(true);
  }
  console.log(room);
}

function isSet(query, key) {
  return query.get(key) === "1" || query.get(key) === "true";
}

export default RoomPage;
