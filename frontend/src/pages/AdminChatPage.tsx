/**
 * The user's side of the admin conversation.
 *
 * SellerAdminInbox has existed for a while but was never rendered anywhere, so
 * there was no URL a person could open to talk to the team. That mattered once
 * suspension stopped signing people out: the suspension notification tells them
 * to ask an admin why, and this is where that link lands.
 */
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import SellerAdminInbox from "@/components/SellerAdminInbox";

export default function AdminChatPage() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <main className="min-h-screen text-white pt-16 md:pt-20 bg-[#08080A]">
        <div className="mx-auto max-w-5xl px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Message the admin team</h1>
              <p className="text-xs text-white/40 mt-0.5">
                Account, compliance, and moderation questions — including appealing a suspension.
              </p>
            </div>
          </div>

          <SellerAdminInbox />
        </div>
      </main>
    </>
  );
}
