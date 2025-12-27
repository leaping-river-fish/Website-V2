import { useState } from "react";
import Toast from "../components/Toast";
import { NavbarSpacer } from "../components/reusable_misc/navbarspacer";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [status, setStatus] = useState<{
        type: "success" | "error" | "info" | null;
        message: string;
    }>({
        type: null,
        message: "",
    });

    const [toastId, setToastId] = useState(0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setToastId(id => id + 1);
        setStatus({ type: "info", message: "Sending..." });

        try {
            const API_BASE = import.meta.env.VITE_API_BASE_URL;

            const response = await fetch(`${API_BASE}/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setToastId(id => id + 1);
                setStatus({
                    type: "success",
                    message: "Message Sent Successfully!"
                });

                setFormData({
                    name: "",
                    email: "",
                    subject: "",
                    message: ""
                });

                setTimeout(() => {
                    setToastId(id => id + 1);
                    setStatus({ type: null, message: "" });
                }, 3500);
            } else {
                setToastId(id => id + 1);
                setStatus({
                    type: "error",
                    message: result.error || "Failed to send message"
                });
            }
        } catch (error) {
            console.error("Fetch error:", error);

            setToastId(id => id + 1);
            setStatus({
                type: "error",
                message: "Error: Could not connect to server."
            });
        }
    };

    const email = import.meta.env.VITE_EMAIL;
    const phone = import.meta.env.VITE_PHONE;

    return (
        <div className="bg-[#1A1410] min-h-screen py-16 px-4 ">

            <NavbarSpacer />
            
            <div className="max-w-[1000px] mx-auto flex flex-wrap md:flex-nowrap justify-between gap-6 md:gap-8 items-start px-4">
                
                {/* Status toast message */}
                {status.message && (
                    <Toast
                        key={toastId}
                        message={status.message}
                        type={status.type ?? undefined}
                        duration={3000}
                        onClose={() => {
                            setToastId(id => id + 1);
                            setStatus({ type: null, message: "" });
                        }}
                    />
                )}
                
                <form
                    onSubmit={handleSubmit}
                    className="w-full md:w-2/3 lg:w-8/12 min-w-0 box-border bg-gray-800 p-8 rounded-xl shadow-lg space-y-4"
                >
                    <h1 className="text-3xl font-bold text-white mb-4">Contact Me</h1>
                    <p className="text-gray-300 mb-6">
                        I'd love to hear from you! Fill out the form below and I'll get back to you shortly.
                    </p>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                        type="text"
                        name="subject"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"         
                    />
                    <textarea
                        name="message"
                        rows={5}
                        placeholder="Your Message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />

                    <button
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow hover:shadow-lg"
                    >
                        Send Message
                    </button>
                </form>

                {/* Contact Info */}
                <div className="w-full md:w-1/3 lg:w-4/12 min-w-0 box-border text-white space-y-6">
                    <h2 className="text-2xl font-bold">Get in Touch</h2>
                    <p>
                        Email:{" "}
                        <a
                            href={`mailto:${email}`}
                            className="text-white hover:text-red-500 hover:underline transition-colors"
                        >
                            {email}
                        </a>
                    </p>
                    <p>
                        Phone:{" "}
                        <a
                            href={`tel:+${phone}`}
                            className="text-white hover:text-red-500 hover:underline transition-colors"
                        >
                            {phone}
                        </a>
                    </p>
                    <div className="flex gap-4 mt-4">
                        {/* Instagram */}
                        <a
                            href="https://www.instagram.com/leaping_river_fish/"
                            className="social-link text-white hover:text-red-500 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 23 23" fill="currentColor">
                                <path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5Zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5a4.25 4.25 0 0 1-4.25 4.25h-8.5a4.25 4.25 0 0 1-4.25-4.25v-8.5A4.25 4.25 0 0 1 7.75 3.5ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm4.75-.75a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                            </svg>
                        </a>

                        {/* Discord */}
                        <a
                            href="https://discord.com/users/567075024897572870"
                            className="social-link text-white hover:text-red-500 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Discord"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 640 512" fill="currentColor">
                                <path d="M524.5 69.8a1.5 1.5 0 0 0-.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0-1.9.9 337.5 337.5 0 0 0-14.9 30.6 447.8 447.8 0 0 0-134.4 0 309.5 309.5 0 0 0-15.1-30.6 1.9 1.9 0 0 0-1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0-.8.7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0-1-2.6 321.2 321.2 0 0 1-45.9-21.9 1.9 1.9 0 0 1-.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9.2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1-.2 3.1 301.4 301.4 0 0 1-45.9 21.8 1.9 1.9 0 0 0-1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1.7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z" />
                            </svg>
                        </a>

                        {/* LinkedIn */}
                        <a
                            href="https://www.linkedin.com/in/zheng-nick1/"
                            className="social-link text-white hover:text-red-500 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.026-3.036-1.85-3.036-1.851 0-2.134 1.445-2.134 2.939v5.666H9.354V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.368-1.85 3.598 0 4.262 2.368 4.262 5.452v6.289zM5.337 7.433c-1.144 0-2.068-.926-2.068-2.067 0-1.141.924-2.066 2.068-2.066 1.14 0 2.066.925 2.066 2.066 0 1.141-.926 2.067-2.066 2.067zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.225.792 24 1.771 24h20.451C23.2 24 24 23.225 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                            </svg>
                        </a>

                        {/* GitHub */}
                        <a
                            href="https://github.com/leaping-river-fish"
                            className="social-link text-white hover:text-red-500 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12a12 12 0 008.21 11.43c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.34-1.79-1.34-1.79-1.09-.74.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.91 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.59-2.8 5.61-5.48 5.9.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12.01 12.01 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            <footer className="text-center mt-16 text-gray-400">
                &copy; 2025 Nick Zheng. All Rights Reserved.
            </footer>
        </div>
    );
}

export default Contact