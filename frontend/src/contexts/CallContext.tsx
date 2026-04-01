import { createContext, useContext, useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";

const CallContext = createContext<any>(null);

export const CallProvider = ({ children }: any) => {
  const [incomingCall, setIncomingCall] = useState(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    socket.on("incoming-call", (data) => {
      console.log("📞 Incoming call", data);
      setIncomingCall(data);

      ringtoneRef.current = new Audio("/sounds/ringtone.mp3");
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(() => {});
    });

    return () => {
      socket.off("incoming-call");
    };
  }, []);

  return (
    <CallContext.Provider value={{ incomingCall, setIncomingCall }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
