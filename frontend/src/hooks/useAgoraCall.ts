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
import { getAgora, APP_ID } from "@/lib/agora";

export function useAgoraCall() {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const localTracks = useRef<any[]>([]);
  const [isInCall, setIsInCall] = useState(false);

  /* Set once the SDK has been fetched, so leaveCall can tear a call down
     without importing 1.3 MB to discover there was nothing to tear down. */
  const clientRef = useRef<Awaited<ReturnType<typeof getAgora>>["client"] | null>(null);

  /* Unmount safety net. The listeners themselves are attached in joinCall —
     they have to be registered BEFORE client.join(), or a peer who published
     first fires user-published into a client nobody is listening to and their
     video never appears. That is why this is not the "register events once on
     mount" effect it used to be: that version ran against a module-scope
     client, which is exactly what dragged 1.3 MB of SDK into ChatPage's chunk
     just for rendering the chat screen. */
  useEffect(() => {
    return () => {
      clientRef.current?.removeAllListeners();
    };
  }, []);

  /* JOIN CALL */
  const joinCall = async (channelName: string, uid: string) => {
    // The download happens here, on an explicit "start call" — the one moment
    // the user is expecting a pause.
    const { AgoraRTC, client } = await getAgora();
    clientRef.current = client;

    /* Attached before join, and replacing whatever a previous call left —
       `client` is shared across calls, so registering again without this
       would stack a second handler per call and subscribe twice. */
    client.removeAllListeners();

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
      /* Guarded: a peer can drop after this component has unmounted, and the
         ref is null by then — where this used to assert non-null and throw. */
      if (remoteVideoRef.current) remoteVideoRef.current.innerHTML = "";
    });

    // `null` token — see the warning in src/lib/agora.ts.
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

    // No client means no call was ever joined, so there is nothing to leave.
    await clientRef.current?.leave();
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

