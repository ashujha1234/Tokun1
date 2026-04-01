// import { useEffect, useRef, useState } from "react";
// import AgoraRTC from "agora-rtc-sdk-ng";
// import { client, APP_ID } from "@/lib/agora";

// export function useAgoraCall() {
//   const localVideoRef = useRef<HTMLDivElement>(null);
//   const remoteVideoRef = useRef<HTMLDivElement>(null);

//   const [localTracks, setLocalTracks] = useState<any[]>([]);
//   const [isInCall, setIsInCall] = useState(false);

//   useEffect(() => {
//     const handleUserPublished = async (user: any, mediaType: any) => {
//       await client.subscribe(user, mediaType);

//       if (mediaType === "video" && remoteVideoRef.current) {
//         user.videoTrack.play(remoteVideoRef.current);
//       }

//       if (mediaType === "audio") {
//         user.audioTrack.play();
//       }
//     };

//     client.on("user-published", handleUserPublished);

//     return () => {
//       client.off("user-published", handleUserPublished);
//     };
//   }, []);

//   const joinCall = async (channel: string, uid: string, video = true) => {
//     await client.join(APP_ID, channel, null, uid);

//     const tracks = await AgoraRTC.createMicrophoneAndCameraTracks(
//       {},
//       { encoderConfig: "720p" }
//     );

//     setLocalTracks(tracks);
//     tracks[1].play(localVideoRef.current!);

//     await client.publish(tracks);
//     setIsInCall(true);
//   };

//   const leaveCall = async () => {
//     localTracks.forEach(t => {
//       t.stop();
//       t.close();
//     });

//     await client.leave();
//     setLocalTracks([]);
//     setIsInCall(false);
//   };

//   return {
//     joinCall,
//     leaveCall,
//     localVideoRef,
//     remoteVideoRef,
//     isInCall,
//   };
// }

import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { client, APP_ID } from "@/lib/agora";

export function useAgoraCall() {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const localTracks = useRef<any[]>([]);
  const [isInCall, setIsInCall] = useState(false);

  /* REGISTER EVENTS ONCE */
  useEffect(() => {
    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        user.videoTrack?.play(remoteVideoRef.current!);
      }

      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    });

    client.on("user-unpublished", () => {
      remoteVideoRef.current!.innerHTML = "";
    });

    return () => {
      client.removeAllListeners();
    };
  }, []);

  /* JOIN CALL */
  const joinCall = async (channelName: string, uid: string) => {
    await client.join(APP_ID, channelName, null, uid);

    localTracks.current =
      await AgoraRTC.createMicrophoneAndCameraTracks(
        {},
        { encoderConfig: "720p" }
      );

    localTracks.current[1].play(localVideoRef.current!);
    await client.publish(localTracks.current);

    setIsInCall(true);
  };

  /* LEAVE CALL */
  const leaveCall = async () => {
    localTracks.current.forEach(track => {
      track.stop();
      track.close();
    });

    await client.leave();
    localTracks.current = [];
    setIsInCall(false);
  };

  return {
    joinCall,
    leaveCall,
    localVideoRef,
    remoteVideoRef,
    isInCall,
  };
}

