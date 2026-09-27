document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =====================================================
       QUANTUM CLUB MEMBERS
    ===================================================== */

    const MEMBERS = [
        "Ayan Ahmed",
        "Mohsin Kabeer",
        "Azan Zaheer",
        "Mallahat Shehzad",
        "Tayyab Ghuman",
        "Sufi Ur Rehman",
        "Ubaid Rizwan",
        "Salahudin Qamr",
        "Saad Afzal",
        "Talha Jameel",
        "Abdullah Mozam",
        "Abdullah Qadir",
        "Aarib Yaseen",
        "Huzaifa Mubarik"
    ];

    const RETIRED_MEMBERS = [
        "Ahmed Anwar"
    ];

    const APPROVED_MEMBERS = [
        ...MEMBERS,
        ...RETIRED_MEMBERS
    ];

    const NAME_KEY = "quantum_user_name";

    const normalizeName = (name) => {
        return String(name || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    };

    const findApprovedMember = (name) => {
        const normalized = normalizeName(name);

        return APPROVED_MEMBERS.find(
            member => normalizeName(member) === normalized
        ) || null;
    };

    /* =====================================================
       DOM
    ===================================================== */

    const body = document.body;

    const nameScreen = document.getElementById("nameScreen");
    const nameForm = document.getElementById("nameForm");
    const nameInput = document.getElementById("nameInput");

    const rejectionScreen = document.getElementById("rejectionScreen");
    const rejectionName = document.getElementById("rejectionName");
    const retryAccess = document.getElementById("retryAccess");

    const heroUserName = document.getElementById("heroUserName");

    const pages = document.querySelectorAll(".page");
    const navLinks = document.querySelectorAll(".nav-link");
    const pageButtons = document.querySelectorAll(".nav-open");

    const mainNav = document.getElementById("mainNav");
    const mobileMenu = document.getElementById("mobileMenu");

    const toast = document.getElementById("toast");
    const toastIcon = document.getElementById("toastIcon");
    const toastMessage = document.getElementById("toastMessage");

    /* =====================================================
       TOAST
    ===================================================== */

    let toastTimer = null;

    const showToast = (message, icon = "✦") => {
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toastIcon.textContent = icon;

        toast.classList.add("show");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    };

    /* =====================================================
       ACCESS GATE
    ===================================================== */

    const unlockSite = (memberName) => {
        const approved = findApprovedMember(memberName);

        if (!approved) {
            return false;
        }

        localStorage.setItem(NAME_KEY, approved);

        if (heroUserName) {
            heroUserName.textContent = approved.toUpperCase();
        }

        body.classList.remove("locked");

        if (nameScreen) {
            nameScreen.classList.add("hidden");
        }

        if (rejectionScreen) {
            rejectionScreen.classList.remove("show");
        }

        return true;
    };

    const rejectUser = (enteredName) => {
        localStorage.removeItem(NAME_KEY);

        if (rejectionName) {
            rejectionName.textContent =
                `${String(enteredName || "UNKNOWN").toUpperCase()} // IDENTITY NOT RECOGNIZED`;
        }

        if (nameScreen) {
            nameScreen.classList.add("hidden");
        }

        if (rejectionScreen) {
            rejectionScreen.classList.add("show");
        }

        body.classList.add("locked");

        /* Dramatic vibration on supported phones */
        if (navigator.vibrate) {
            navigator.vibrate([120, 60, 180, 60, 250]);
        }

        /* Small browser voice effect when speech synthesis is available */
        if ("speechSynthesis" in window) {
            try {
                window.speechSynthesis.cancel();

                const voice = new SpeechSynthesisUtterance(
                    "You are not part of Quantum Club. Go away."
                );

                voice.rate = 0.82;
                voice.pitch = 0.35;
                voice.volume = 1;

                window.speechSynthesis.speak(voice);
            } catch (error) {
                /* Speech is optional. */
            }
        }
    };

    nameForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const enteredName = nameInput.value.trim();

        if (!enteredName) {
            showToast("ENTER YOUR NAME FIRST.", "!");
            return;
        }

        const approved = findApprovedMember(enteredName);

        if (approved) {
            unlockSite(approved);
            showToast(`ACCESS GRANTED — ${approved}`, "✓");
        } else {
            rejectUser(enteredName);
        }
    });

    retryAccess?.addEventListener("click", () => {
        rejectionScreen?.classList.remove("show");
        nameScreen?.classList.remove("hidden");

        setTimeout(() => {
            nameInput?.focus();
            nameInput?.select();
        }, 200);
    });

    /* =====================================================
       REMEMBERED IDENTITY
    ===================================================== */

    const savedName = localStorage.getItem(NAME_KEY);

    if (savedName && findApprovedMember(savedName)) {
        unlockSite(savedName);
    } else {
        localStorage.removeItem(NAME_KEY);

        body.classList.add("locked");

        setTimeout(() => {
            nameInput?.focus();
        }, 400);
    }

    /* =====================================================
       PAGE NAVIGATION
    ===================================================== */

    const openPage = (pageName, updateHistory = true) => {
        const target = document.getElementById(`page-${pageName}`);

        if (!target) return;

        pages.forEach(page => {
            page.classList.remove("active-page");
        });

        navLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.dataset.page === pageName
            );
        });

        target.classList.add("active-page");

        mainNav?.classList.remove("open");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (updateHistory) {
            history.replaceState(
                null,
                "",
                `#${pageName}`
            );
        }
    };

    pageButtons.forEach(button => {
        button.addEventListener("click", () => {
            openPage(button.dataset.page);
        });
    });

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            openPage(link.dataset.page);
        });
    });

    mobileMenu?.addEventListener("click", () => {
        mainNav?.classList.toggle("open");
    });

    document.addEventListener("click", (event) => {
        if (
            mainNav &&
            mobileMenu &&
            !mainNav.contains(event.target) &&
            !mobileMenu.contains(event.target)
        ) {
            mainNav.classList.remove("open");
        }
    });

    const initialPage = location.hash
        .replace("#", "")
        .trim();

    if (initialPage && document.getElementById(`page-${initialPage}`)) {
        openPage(initialPage, false);
    } else {
        openPage("home", false);
    }

    window.addEventListener("hashchange", () => {
        const page = location.hash.replace("#", "").trim();

        if (document.getElementById(`page-${page}`)) {
            openPage(page, false);
        }
    });

    /* =====================================================
       CHAT
    ===================================================== */

    const chatForm = document.getElementById("chatForm");
    const messages = document.getElementById("messages");
    const messageInput = document.getElementById("messageInput");

    const memeInput = document.getElementById("memeInput");
    const uploadButton = document.getElementById("uploadButton");

    const voiceButton = document.getElementById("voiceButton");

    const typingIndicator = document.getElementById("typingIndicator");

    let mediaRecorder = null;
    let audioChunks = [];
    let recordingStream = null;

    let typingTimeout = null;

    const escapeHTML = (value) => {
        const div = document.createElement("div");
        div.textContent = String(value);
        return div.innerHTML;
    };

    const getTime = () => {
        return new Intl.DateTimeFormat([], {
            hour: "numeric",
            minute: "2-digit"
        }).format(new Date());
    };

    const getInitials = (name) => {
        return name
            .split(" ")
            .map(part => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const removeEmptyState = () => {
        const empty = messages?.querySelector(".chat-empty");

        if (empty) {
            empty.remove();
        }
    };

    const scrollChatToBottom = () => {
        if (!messages) return;

        requestAnimationFrame(() => {
            messages.scrollTop = messages.scrollHeight;
        });
    };

    const appendMessage = ({
        text = "",
        imageURL = null,
        audioURL = null,
        sent = true
    }) => {
        if (!messages) return;

        removeEmptyState();

        const currentName =
            localStorage.getItem(NAME_KEY) || "Quantum Member";

        const wrapper = document.createElement("div");

        wrapper.className = `message ${sent ? "sent" : ""}`;

        const safeName = escapeHTML(currentName);

        const initials = getInitials(currentName);

        const avatar = `
            <div class="message-avatar">
                ${escapeHTML(initials)}
            </div>
        `;

        let content = "";

        if (text) {
            content += `
                <div class="bubble">
                    ${escapeHTML(text)}
                </div>
            `;
        }

        if (imageURL) {
            content += `
                <div class="bubble">
                    <img
                        class="message-image"
                        src="${imageURL}"
                        alt="Uploaded meme"
                    >
                </div>
            `;
        }

        if (audioURL) {
            content += `
                <div class="bubble">
                    <audio
                        class="audio-message"
                        controls
                        preload="metadata"
                        src="${audioURL}"
                    ></audio>
                </div>
            `;
        }

        content += `
            <span class="message-time">${getTime()}</span>
        `;

        const bodyHTML = `
            <div class="message-content">
                <span class="message-name">${safeName}</span>
                ${content}
            </div>
        `;

        wrapper.innerHTML = sent
            ? bodyHTML
            : avatar + bodyHTML;

        messages.appendChild(wrapper);

        scrollChatToBottom();
    };

    chatForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        const value = messageInput.value.trim();

        if (!value) return;

        appendMessage({
            text: value,
            sent: true
        });

        messageInput.value = "";

        typingIndicator?.classList.remove("show");

        clearTimeout(typingTimeout);
    });

    messageInput?.addEventListener("input", () => {
        if (!typingIndicator) return;

        typingIndicator.classList.add("show");

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
            typingIndicator.classList.remove("show");
        }, 700);
    });

    messageInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();

            chatForm?.requestSubmit();
        }
    });

    /* =====================================================
       MEME UPLOAD
    ===================================================== */

    uploadButton?.addEventListener("click", () => {
        memeInput?.click();
    });

    memeInput?.addEventListener("change", () => {
        const file = memeInput.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showToast("PLEASE SELECT AN IMAGE.", "!");
            memeInput.value = "";
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            showToast("IMAGE MUST BE UNDER 8MB.", "!");
            memeInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            appendMessage({
                imageURL: reader.result,
                sent: true
            });

            showToast("MEME ATTACHED.", "◈");
        };

        reader.onerror = () => {
            showToast("COULDN'T READ THAT IMAGE.", "!");
        };

        reader.readAsDataURL(file);

        memeInput.value = "";
    });

    /* =====================================================
       REAL VOICE NOTES
    ===================================================== */

    const stopRecording = () => {
        if (
            mediaRecorder &&
            mediaRecorder.state !== "inactive"
        ) {
            mediaRecorder.stop();
        }
    };

    const cleanupRecordingStream = () => {
        if (!recordingStream) return;

        recordingStream
            .getTracks()
            .forEach(track => track.stop());

        recordingStream = null;
    };

    const startRecording = async () => {
        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            showToast(
                "YOUR BROWSER DOES NOT SUPPORT MICROPHONE RECORDING.",
                "!"
            );
            return;
        }

        try {
            recordingStream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                });

            let mimeType = "";

            const possibleTypes = [
                "audio/webm;codecs=opus",
                "audio/webm",
                "audio/ogg;codecs=opus",
                "audio/mp4"
            ];

            for (const type of possibleTypes) {
                if (
                    typeof MediaRecorder !== "undefined" &&
                    MediaRecorder.isTypeSupported &&
                    MediaRecorder.isTypeSupported(type)
                ) {
                    mimeType = type;
                    break;
                }
            }

            mediaRecorder = mimeType
                ? new MediaRecorder(
                    recordingStream,
                    { mimeType }
                )
                : new MediaRecorder(recordingStream);

            audioChunks = [];

            mediaRecorder.addEventListener(
                "dataavailable",
                event => {
                    if (event.data && event.data.size > 0) {
                        audioChunks.push(event.data);
                    }
                }
            );

            mediaRecorder.addEventListener(
                "stop",
                () => {
                    const finalType =
                        mediaRecorder.mimeType ||
                        mimeType ||
                        "audio/webm";

                    const blob = new Blob(
                        audioChunks,
                        { type: finalType }
                    );

                    if (!blob.size) {
                        showToast("NO AUDIO WAS RECORDED.", "!");
                        cleanupRecordingStream();
                        return;
                    }

                    const audioURL =
                        URL.createObjectURL(blob);

                    appendMessage({
                        audioURL,
                        sent: true
                    });

                    showToast(
                        "VOICE NOTE RECORDED.",
                        "🎙"
                    );

                    cleanupRecordingStream();

                    audioChunks = [];
                    mediaRecorder = null;
                }
            );

            mediaRecorder.addEventListener(
                "error",
                () => {
                    showToast(
                        "RECORDING ERROR.",
                        "!"
                    );

                    cleanupRecordingStream();
                    mediaRecorder = null;
                    audioChunks = [];

                    voiceButton?.classList.remove(
                        "voice-recording"
                    );

                    if (voiceButton) {
                        voiceButton.textContent = "🎙";
                    }
                }
            );

            mediaRecorder.start();

            voiceButton?.classList.add(
                "voice-recording"
            );

            if (voiceButton) {
                voiceButton.textContent = "■";
                voiceButton.title = "Stop recording";
            }

            showToast(
                "RECORDING... TAP AGAIN TO STOP.",
                "●"
            );

        } catch (error) {
            cleanupRecordingStream();

            if (error?.name === "NotAllowedError") {
                showToast(
                    "MICROPHONE PERMISSION WAS DENIED.",
                    "!"
                );
            } else if (error?.name === "NotFoundError") {
                showToast(
                    "NO MICROPHONE WAS FOUND.",
                    "!"
                );
            } else {
                showToast(
                    "COULDN'T START RECORDING.",
                    "!"
                );
            }
        }
    };

    voiceButton?.addEventListener("click", async () => {
        if (
            mediaRecorder &&
            mediaRecorder.state === "recording"
        ) {
            stopRecording();

            voiceButton.classList.remove(
                "voice-recording"
            );

            voiceButton.textContent = "🎙";
            voiceButton.title = "Record voice note";

            return;
        }

        await startRecording();
    });

    /* =====================================================
       CHAT BUTTONS
    ===================================================== */

    document
        .getElementById("chatSearchButton")
        ?.addEventListener("click", () => {
            showToast(
                "CHAT SEARCH WILL BE CONNECTED TO THE SHARED DATABASE.",
                "⌕"
            );
        });

    document
        .getElementById("chatMoreButton")
        ?.addEventListener("click", () => {
            showToast(
                "MORE QUANTUM FEATURES COMING WITH THE BACKEND.",
                "•••"
            );
        });

    /* =====================================================
       QUANTUM AI
    ===================================================== */

    /*
        IMPORTANT:
        NEVER put your Gemini API key here.

        Later, connect this endpoint to a secure backend:
        Supabase Edge Function / server / API route.

        Example:
        const QUANTUM_AI_ENDPOINT = "/api/quantum-ai";
    */

    const QUANTUM_AI_ENDPOINT = "";

    const miniAiForm =
        document.getElementById("miniAiForm");

    const miniAiInput =
        document.getElementById("miniAiInput");

    const aiForm =
        document.getElementById("aiForm");

    const aiInput =
        document.getElementById("aiInput");

    const aiMessages =
        document.getElementById("aiMessages");

    const aiSuggestions =
        document.querySelectorAll(".ai-suggestion");

    const appendAIMessage = (
        text,
        sender = "ai"
    ) => {
        if (!aiMessages) return;

        const wrapper =
            document.createElement("div");

        wrapper.className =
            `ai-message ${sender === "user" ? "user" : ""}`;

        const avatar = document.createElement("div");

        avatar.className =
            "ai-message-avatar";

        avatar.textContent =
            sender === "user"
                ? getInitials(
                    localStorage.getItem(NAME_KEY) ||
                    "QM"
                )
                : "Q";

        const bodyEl =
            document.createElement("div");

        bodyEl.className =
            "ai-message-body";

        const nameEl =
            document.createElement("div");

        nameEl.className =
            "ai-message-name";

        nameEl.textContent =
            sender === "user"
                ? "YOU"
                : "QUANTUM AI";

        const bubble =
            document.createElement("div");

        bubble.className = "ai-bubble";
        bubble.textContent = text;

        bodyEl.appendChild(nameEl);
        bodyEl.appendChild(bubble);

        if (sender === "user") {
            wrapper.appendChild(bodyEl);
            wrapper.appendChild(avatar);
        } else {
            wrapper.appendChild(avatar);
            wrapper.appendChild(bodyEl);
        }

        aiMessages.appendChild(wrapper);

        aiMessages.scrollTop =
            aiMessages.scrollHeight;

        return wrapper;
    };

    const appendAILoading = () => {
        if (!aiMessages) return null;

        const wrapper =
            document.createElement("div");

        wrapper.className = "ai-message";

        wrapper.innerHTML = `
            <div class="ai-message-avatar">Q</div>

            <div class="ai-message-body">
                <div class="ai-message-name">
                    QUANTUM AI
                </div>

                <div class="ai-bubble ai-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        aiMessages.appendChild(wrapper);

        aiMessages.scrollTop =
            aiMessages.scrollHeight;

        return wrapper;
    };

    const requestQuantumAI = async (prompt) => {
        if (!QUANTUM_AI_ENDPOINT) {
            throw new Error(
                "Quantum AI backend is not connected yet."
            );
        }

        const response =
            await fetch(QUANTUM_AI_ENDPOINT, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: prompt
                })
            });

        if (!response.ok) {
            throw new Error(
                `Backend error: ${response.status}`
            );
        }

        const data =
            await response.json();

        return (
            data.reply ||
            data.text ||
            data.response ||
            "Quantum AI returned no response."
        );
    };

    const sendAIMessage = async (prompt) => {
        const cleanPrompt =
            String(prompt || "").trim();

        if (!cleanPrompt) return;

        appendAIMessage(
            cleanPrompt,
            "user"
        );

        if (aiInput) {
            aiInput.value = "";
        }

        const loading =
            appendAILoading();

        try {
            const reply =
                await requestQuantumAI(
                    cleanPrompt
                );

            loading?.remove();

            appendAIMessage(
                reply,
                "ai"
            );

        } catch (error) {
            loading?.remove();

            appendAIMessage(
                "Quantum AI is visually online, but its secure Gemini backend is not connected yet. Connect the backend endpoint in script.js to activate the real AI.",
                "ai"
            );
        }
    };

    aiForm?.addEventListener(
        "submit",
        event => {
            event.preventDefault();

            sendAIMessage(
                aiInput?.value || ""
            );
        }
    );

    miniAiForm?.addEventListener(
        "submit",
        event => {
            event.preventDefault();

            const prompt =
                miniAiInput?.value.trim();

            if (!prompt) return;

            miniAiInput.value = "";

            openPage("ai");

            setTimeout(() => {
                aiInput.value = prompt;
                aiForm?.requestSubmit();
            }, 350);
        }
    );

    aiSuggestions.forEach(button => {
        button.addEventListener(
            "click",
            () => {
                const text =
                    button.textContent.trim();

                if (aiInput) {
                    aiInput.value = text;
                    aiInput.focus();
                }
            }
        );
    });

    /* =====================================================
       PONG
    ===================================================== */

    const canvas =
        document.getElementById("pongCanvas");

    const playerScoreElement =
        document.getElementById("playerScore");

    const aiScoreElement =
        document.getElementById("aiScore");

    const startGameButton =
        document.getElementById("startGame");

    const gameOverlay =
        document.getElementById("gameOverlay");

    const gameOverlayTitle =
        document.getElementById("gameOverlayTitle");

    const gameOverlayText =
        document.getElementById("gameOverlayText");

    const touchUp =
        document.getElementById("touchUp");

    const touchDown =
        document.getElementById("touchDown");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const GAME_WIDTH = canvas.width;
    const GAME_HEIGHT = canvas.height;

    const paddleWidth = 12;
    const paddleHeight = 90;

    const player = {
        x: 25,
        y: GAME_HEIGHT / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        speed: 7
    };

    const ai = {
        x: GAME_WIDTH - 25 - paddleWidth,
        y: GAME_HEIGHT / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        speed: 4.8
    };

    const ball = {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        radius: 8,
        speedX: 6,
        speedY: 4
    };

    let playerScore = 0;
    let aiScore = 0;

    let gameRunning = false;

    const keys = {
        up: false,
        down: false
    };

    const resetBall = (direction = 1) => {
        ball.x = GAME_WIDTH / 2;
        ball.y = GAME_HEIGHT / 2;

        const vertical =
            (Math.random() * 2 - 1) * 4.5;

        ball.speedX =
            6 * direction;

        ball.speedY =
            vertical;
    };

    const resetGame = () => {
        playerScore = 0;
        aiScore = 0;

        playerScoreElement.textContent =
            playerScore;

        aiScoreElement.textContent =
            aiScore;

        player.y =
            GAME_HEIGHT / 2 -
            paddleHeight / 2;

        ai.y =
            GAME_HEIGHT / 2 -
            paddleHeight / 2;

        resetBall(
            Math.random() > .5 ? 1 : -1
        );
    };

    const drawBackground = () => {
        ctx.fillStyle = "#020203";
        ctx.fillRect(
            0,
            0,
            GAME_WIDTH,
            GAME_HEIGHT
        );

        const gradient =
            ctx.createRadialGradient(
                GAME_WIDTH / 2,
                GAME_HEIGHT / 2,
                0,
                GAME_WIDTH / 2,
                GAME_HEIGHT / 2,
                GAME_WIDTH * .65
            );

        gradient.addColorStop(
            0,
            "rgba(168,85,247,.08)"
        );

        gradient.addColorStop(
            1,
            "rgba(0,0,0,0)"
        );

        ctx.fillStyle = gradient;

        ctx.fillRect(
            0,
            0,
            GAME_WIDTH,
            GAME_HEIGHT
        );

        ctx.strokeStyle =
            "rgba(168,85,247,.13)";

        ctx.setLineDash([7, 12]);

        ctx.beginPath();

        ctx.moveTo(
            GAME_WIDTH / 2,
            0
        );

        ctx.lineTo(
            GAME_WIDTH / 2,
            GAME_HEIGHT
        );

        ctx.stroke();

        ctx.setLineDash([]);

        for (
            let x = 0;
            x < GAME_WIDTH;
            x += 45
        ) {
            ctx.strokeStyle =
                "rgba(255,255,255,.018)";

            ctx.beginPath();

            ctx.moveTo(x, 0);
            ctx.lineTo(x, GAME_HEIGHT);

            ctx.stroke();
        }

        for (
            let y = 0;
            y < GAME_HEIGHT;
            y += 45
        ) {
            ctx.strokeStyle =
                "rgba(255,255,255,.018)";

            ctx.beginPath();

            ctx.moveTo(0, y);
            ctx.lineTo(GAME_WIDTH, y);

            ctx.stroke();
        }
    };

    const drawPaddle = paddle => {
        ctx.fillStyle =
            "#c084fc";

        ctx.shadowBlur = 20;
        ctx.shadowColor =
            "rgba(168,85,247,.7)";

        ctx.fillRect(
            paddle.x,
            paddle.y,
            paddle.width,
            paddle.height
        );

        ctx.shadowBlur = 0;
    };

    const drawBall = () => {
        ctx.beginPath();

        ctx.arc(
            ball.x,
            ball.y,
            ball.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffffff";

        ctx.shadowBlur = 25;
        ctx.shadowColor =
            "rgba(192,132,252,.9)";

        ctx.fill();

        ctx.shadowBlur = 0;
    };

    const draw = () => {
        drawBackground();

        drawPaddle(player);
        drawPaddle(ai);
        drawBall();
    };

    const clampPaddle = paddle => {
        paddle.y =
            Math.max(
                0,
                Math.min(
                    GAME_HEIGHT - paddle.height,
                    paddle.y
                )
            );
    };

    const update = () => {
        if (!gameRunning) return;

        if (keys.up) {
            player.y -= player.speed;
        }

        if (keys.down) {
            player.y += player.speed;
        }

        clampPaddle(player);

        /* AI */
        const aiCenter =
            ai.y + ai.height / 2;

        const target =
            ball.y;

        if (aiCenter < target - 10) {
            ai.y += ai.speed;
        } else if (aiCenter > target + 10) {
            ai.y -= ai.speed;
        }

        clampPaddle(ai);

        /* Ball */
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        if (
            ball.y - ball.radius <= 0 ||
            ball.y + ball.radius >= GAME_HEIGHT
        ) {
            ball.speedY *= -1;
        }

        /* Player collision */
        if (
            ball.x - ball.radius <=
                player.x + player.width &&
            ball.x + ball.radius >=
                player.x &&
            ball.y >= player.y &&
            ball.y <= player.y + player.height &&
            ball.speedX < 0
        ) {
            const relative =
                (ball.y -
                    (player.y + player.height / 2)) /
                (player.height / 2);

            ball.speedX =
                Math.abs(ball.speedX) * 1.05;

            ball.speedY =
                relative * 6;

            ball.x =
                player.x + player.width +
                ball.radius;
        }

        /* AI collision */
        if (
            ball.x + ball.radius >= ai.x &&
            ball.x - ball.radius <=
                ai.x + ai.width &&
            ball.y >= ai.y &&
            ball.y <= ai.y + ai.height &&
            ball.speedX > 0
        ) {
            const relative =
                (ball.y -
                    (ai.y + ai.height / 2)) /
                (ai.height / 2);

            ball.speedX =
                -Math.abs(ball.speedX) * 1.05;

            ball.speedY =
                relative * 6;

            ball.x =
                ai.x -
                ball.radius;
        }

        /* Score */
        if (ball.x < -30) {
            aiScore++;

            aiScoreElement.textContent =
                aiScore;

            if (aiScore >= 7) {
                endGame(false);
            } else {
                resetBall(1);
            }
        }

        if (ball.x > GAME_WIDTH + 30) {
            playerScore++;

            playerScoreElement.textContent =
                playerScore;

            if (playerScore >= 7) {
                endGame(true);
            } else {
                resetBall(-1);
            }
        }
    };

    const loop = () => {
        update();
        draw();

        requestAnimationFrame(loop);
    };

    const startGame = () => {
        resetGame();

        gameRunning = true;

        gameOverlay.classList.add("hidden");

        gameOverlayTitle.textContent =
            "QUANTUM PONG";

        gameOverlayText.textContent =
            "First to 7 wins.";
    };

    const endGame = playerWon => {
        gameRunning = false;

        gameOverlay.classList.remove(
            "hidden"
        );

        if (playerWon) {
            gameOverlayTitle.textContent =
                "YOU WIN.";

            gameOverlayText.textContent =
                "Quantum dominance achieved.";
        } else {
            gameOverlayTitle.textContent =
                "AI WINS.";

            gameOverlayText.textContent =
                "The machine got you this time.";
        }

        startGameButton.textContent =
            "PLAY AGAIN";
    };

    startGameButton?.addEventListener(
        "click",
        startGame
    );

    document.addEventListener(
        "keydown",
        event => {
            if (
                event.key === "w" ||
                event.key === "W" ||
                event.key === "ArrowUp"
            ) {
                keys.up = true;
                event.preventDefault();
            }

            if (
                event.key === "s" ||
                event.key === "S" ||
                event.key === "ArrowDown"
            ) {
                keys.down = true;
                event.preventDefault();
            }
        }
    );

    document.addEventListener(
        "keyup",
        event => {
            if (
                event.key === "w" ||
                event.key === "W" ||
                event.key === "ArrowUp"
            ) {
                keys.up = false;
            }

            if (
                event.key === "s" ||
                event.key === "S" ||
                event.key === "ArrowDown"
            ) {
                keys.down = false;
            }
        }
    );

    const bindTouchControl = (
        element,
        direction
    ) => {
        if (!element) return;

        const start = event => {
            event.preventDefault();
            keys[direction] = true;
        };

        const stop = event => {
            event.preventDefault();
            keys[direction] = false;
        };

        element.addEventListener(
            "touchstart",
            start,
            { passive: false }
        );

        element.addEventListener(
            "touchend",
            stop,
            { passive: false }
        );

        element.addEventListener(
            "touchcancel",
            stop,
            { passive: false }
        );

        element.addEventListener(
            "mousedown",
            start
        );

        element.addEventListener(
            "mouseup",
            stop
        );

        element.addEventListener(
            "mouseleave",
            stop
        );
    };

    bindTouchControl(
        touchUp,
        "up"
    );

    bindTouchControl(
        touchDown,
        "down"
    );

    draw();
    loop();

    /* =====================================================
       CLEANUP
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {
            cleanupRecordingStream();

            if (
                "speechSynthesis" in window
            ) {
                window.speechSynthesis.cancel();
            }
        }
    );
});
