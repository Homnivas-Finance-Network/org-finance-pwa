// Pointing exactly to your live Cloud Run Python backend
const BACKEND_API_URL = "https://org-finance-backend-1059108924249.us-central1.run.app";

async function sendMessageToBackend() {
    const inputField = document.getElementById("chat-input");
    const chatLog = document.getElementById("chat-log");
    const messageText = inputField.value.trim();

    if (!messageText) return;

    // 1. Show the user's message immediately
    appendMessage(messageText, "user");
    inputField.value = ""; // Clear the input box

    // 2. Show the pulsing AI loading state
    const loadingId = appendMessage("Thinking...", "ai-loading");

    try {
        // 3. Send the secure payload to your Python API
        const response = await fetch(`${BACKEND_API_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_message: messageText,
                broker_id: "demo_broker_howrah", // Placeholder ID for testing
                language: "en"
            })
        });

        const data = await response.json();
        
        // 4. Remove the loading pulse
        document.getElementById(loadingId).remove();

        // 5. Display the AI's response
        if (response.ok && data.reply) {
            appendMessage(data.reply, "ai");
        } else {
            appendMessage("I ran into an issue connecting to processing. Please try again shortly.", "ai");
        }

    } catch (error) {
        console.error("API Request Error:", error);
        document.getElementById(loadingId).remove();
        appendMessage("Network timeout or connection dropped. Please check your internet connection.", "ai");
    }
}

function appendMessage(text, sender) {
    const chatLog = document.getElementById("chat-log");
    const msgId = "msg-" + Date.now();
    const wrapper = document.createElement("div");
    wrapper.id = msgId;
    
    // Align user to the right, AI to the left
    wrapper.className = "flex gap-2 " + (sender === "user" ? "justify-end" : "justify-start");

    // Styling logic based on who is sending
    let bubbleStyle = "glass-card text-slate-300 rounded-2xl rounded-tl-none p-3 text-xs max-w-[85%]";
    
    if (sender === "user") {
        bubbleStyle = "bg-goldAccent text-darkBg font-medium rounded-2xl rounded-tr-none p-3 text-xs max-w-[85%] shadow-md";
    } else if (sender === "ai-loading") {
        bubbleStyle = "glass-card text-slate-500 rounded-2xl rounded-tl-none p-3 text-xs animate-pulse";
    }

    // Convert basic line breaks to HTML so lists and paragraphs look clean
    const formattedText = text.replace(/\n/g, '<br>');

    wrapper.innerHTML = `<div class="${bubbleStyle}">${formattedText}</div>`;
    chatLog.appendChild(wrapper);
    
    // Auto-scroll to the newest message
    chatLog.scrollTop = chatLog.scrollHeight;
    
    return msgId;
}

// Allow pressing "Enter" to send
document.getElementById("chat-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessageToBackend();
    }
});
