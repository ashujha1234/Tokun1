import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

export default function RequestSentPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0E0F12] text-white flex flex-col">
      <Header />

      <div className="flex-1 flex items-start justify-center pt-28">
        <div className="w-[420px] bg-[#121212] rounded-xl p-6 shadow-xl relative">

          {/* ICON */}
          <div className="mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg">
              ✦
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-2">
            Your request was sent!
          </h3>

          <p className="text-sm text-white/60 mb-6">
            The user has received your message. You can continue the conversation
            anytime from chat.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/chat")}
              className="flex-1 rounded-full bg-white text-black py-2 text-sm font-medium hover:scale-105 transition"
            >
              View Message
            </button>

            <button
              onClick={() => navigate(-1)}
              className="flex-1 rounded-full bg-[#1E1E1E] text-white py-2 text-sm hover:bg-white/10 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}