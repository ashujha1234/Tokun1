import AgoraRTC from "agora-rtc-sdk-ng";

export const APP_ID = "dfe3def62d2e4694a95d12a7d46c2b78";

export const client = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});
