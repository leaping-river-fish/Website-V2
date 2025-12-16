import React, { useState, useEffect, useRef } from "react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

const Chatbot: React.FC = () => {
    const dotAnimation = ["", ".", "..", "..."];
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState<ChatMessage[]>(() => {
        const savedChats = sessionStorage.getItem("chatMessages");
        return savedChats ? JSON.parse(savedChats) : [];
    });
    const [isTyping, setIsTyping] = useState(false);
    const [typingDotsIndex, setTypingDotsIndex] = useState(0);

    const chatBoxRef = useRef<HTMLDivElement>(null);

    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    const isGreeting = (text: string) =>
        /^(hi|hello|hey|yo|sup|wassup|greetings)[.!]?$/i.test(text.trim());

    useEffect(() => {
        const interval = setInterval(() => {
            setTypingDotsIndex((prev) => (prev + 1) % dotAnimation.length);
        }, 600);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        sessionStorage.setItem("chatMessages", JSON.stringify(chats));
    }, [chats]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [chats, isTyping]);

    const chat = async (e: React.FormEvent, message: string) => {
        e.preventDefault();
        if (!message) return;

        setIsTyping(true);
        const updatedChats = [...chats, { role: "user" as const, content: message }];
        setChats(updatedChats);
        setMessage("");

        if (isGreeting(message) || message.length < 10) {
            await sleep(1500);
        }

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL;

            const response = await fetch(`${API_BASE}/chatbot`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chats: updatedChats
                }),
            });

            const data = await response.json();
            if (data?.output?.content) {
                setChats([...updatedChats, { role: "assistant", content: data.output.content }]);
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setIsTyping(false);
        }
    };

    const clearChat = () => {
        setChats([]);
        sessionStorage.removeItem("chatMessages");
    };

    return (
        <section className="py-8 w-full flex flex-col items-center px-4 md:px-6">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-center">Ask Lumie About Me</h1>
            <h6 className="text-lg mb-4 text-center">Say Hello!</h6>

            <div className="w-full max-w-3xl bg-[#202123] p-6 rounded-xl shadow-lg border-2 border-gray-600 h-[400px] flex flex-col">
                <div
                    className="flex-1 flex flex-col gap-3 max-h-[400px] overflow-y-auto mb-4"
                    ref={chatBoxRef}
                >
                    {chats.map((c: ChatMessage, idx: number) => (
                        <p
                            key={idx}
                            className={`px-4 py-2 rounded-2xl max-w-[70%] wrap-break-word ${
                            c.role === "user" ? "self-end bg-gray-700 text-right" : "self-start bg-gray-600 text-left"
                            }`}
                        >
                            {c.content}
                        </p>
                    ))}
                </div>

                {isTyping && (
                    <p className="px-4 py-2 bg-gray-600 rounded-full max-w-[50%] italic">
                        Typing{dotAnimation[typingDotsIndex]}
                    </p>
                )}

                <form
                    className="flex mt-4 gap-2"
                    onSubmit={(e) => chat(e, message)}
                >
                    <input
                        className="flex-1 px-4 py-2 rounded-full bg-gray-800 text-white focus:outline-none"
                        type="text"
                        placeholder="Ask a question..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 rounded-full hover:bg-blue-700 transition"
                    >
                        Send
                    </button>
                </form>

                {chats.length > 0 && (
                    <button
                        className="mt-3 px-4 py-1 w-fit bg-gray-700 rounded hover:bg-gray-600 transition"
                        onClick={clearChat}
                    >
                        Clear Chat
                    </button>
                )}
            </div>

            <p className="text-center mt-4 text-sm text-gray-400">
                As the AI is relatively new, some answers may not be 100% accurate.
            </p>
        </section>
    );
};

export default Chatbot;