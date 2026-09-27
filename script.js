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
    const nameError = document.getElementById("nameError");

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

        nameError?.classList.remove("show");
        nameInput?.classList.remove("input-error");

        return true;
    };

    const rejectUser = () => {
        localStorage.removeItem(NAME_KEY);

        nameError?.classList.add("show");
        nameInput?.classList.add("input-error");
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
            rejectUser();
        }
    });

    nameInput?.addEventListener("input", () => {
        nameError?.classList.remove("show");
        nameInput.classList.remove("input-error");
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

    const voiceRecorderBar = document.getElementById("voiceRecorderBar");
    const voiceRecorderTime = document.getElementById("voiceRecorderTime");
    const voiceCancelButton = document.getElementById("voiceCancelButton");
    const voiceStopButton = document.getElementById("voiceStopButton");

    let mediaRecorder = null;
    let audioChunks = [];
    let recordingStream = null;
    let recordingCancelled = false;
    let recordingTimerInterval = null;
    let recordingStartedAt = 0;

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
       VOICE NOTES

       Tapping the mic button opens a dedicated recorder bar
       (like WhatsApp / Discord) showing a live timer, with a
       cancel option and a send option — instead of silently
       toggling the mic icon.
    ===================================================== */

    const formatRecordingTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

    const showRecorderBar = () => {
        voiceRecorderBar?.classList.add("show");
        chatForm?.classList.add("hidden");
    };

    const hideRecorderBar = () => {
        voiceRecorderBar?.classList.remove("show");
        chatForm?.classList.remove("hidden");

        if (voiceRecorderTime) {
            voiceRecorderTime.textContent = "0:00";
        }
    };

    const cleanupRecordingStream = () => {
        if (!recordingStream) return;

        recordingStream
            .getTracks()
            .forEach(track => track.stop());

        recordingStream = null;
    };

    const stopRecordingTimer = () => {
        clearInterval(recordingTimerInterval);
        recordingTimerInterval = null;
    };

    const stopRecording = (cancelled = false) => {
        recordingCancelled = cancelled;

        if (
            mediaRecorder &&
            mediaRecorder.state !== "inactive"
        ) {
            mediaRecorder.stop();
        }

        stopRecordingTimer();
        hideRecorderBar();
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
            recordingCancelled = false;

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
                    cleanupRecordingStream();

                    const wasCancelled = recordingCancelled;

                    if (wasCancelled) {
                        audioChunks = [];
                        mediaRecorder = null;
                        showToast("VOICE NOTE DISCARDED.", "✕");
                        return;
                    }

                    const finalType =
                        mediaRecorder.mimeType ||
                        mimeType ||
                        "audio/webm";

                    const blob = new Blob(
                        audioChunks,
                        { type: finalType }
                    );

                    audioChunks = [];
                    mediaRecorder = null;

                    if (!blob.size) {
                        showToast("NO AUDIO WAS RECORDED.", "!");
                        return;
                    }

                    const audioURL =
                        URL.createObjectURL(blob);

                    appendMessage({
                        audioURL,
                        sent: true
                    });

                    showToast(
                        "VOICE NOTE SENT.",
                        "🎙"
                    );
                }
            );

            mediaRecorder.addEventListener(
                "error",
                () => {
                    showToast(
                        "RECORDING ERROR.",
                        "!"
                    );

                    stopRecordingTimer();
                    hideRecorderBar();
                    cleanupRecordingStream();

                    mediaRecorder = null;
                    audioChunks = [];
                }
            );

            mediaRecorder.start();

            showRecorderBar();

            recordingStartedAt = Date.now();

            if (voiceRecorderTime) {
                voiceRecorderTime.textContent = "0:00";
            }

            recordingTimerInterval = setInterval(() => {
                if (voiceRecorderTime) {
                    voiceRecorderTime.textContent =
                        formatRecordingTime(
                            Date.now() - recordingStartedAt
                        );
                }
            }, 250);

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
            return;
        }

        await startRecording();
    });

    voiceStopButton?.addEventListener("click", () => {
        stopRecording(false);
    });

    voiceCancelButton?.addEventListener("click", () => {
        stopRecording(true);
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

    const QUANTUM_AI_ENDPOINT = "https://quantum-ai.2012ayan27.workers.dev/";

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
       ARCADE — GAME SELECTION COVER
    ===================================================== */

    const arcadeSelect = document.getElementById("arcadeSelect");
    const arcadeSelectCards = document.querySelectorAll(".arcade-select-card");
    const arcadeBackButtons = document.querySelectorAll("[data-arcade-back]");

    const gameContainers = {
        pong: document.getElementById("pongContainer"),
        snake: document.getElementById("snakeContainer"),
        tictactoe: document.getElementById("tttContainer")
    };

    let pongStarted = false;
    let snakeInitialized = false;
    let tttInitialized = false;

    const showArcadeSelect = () => {
        arcadeSelect?.classList.remove("hidden");

        Object.values(gameContainers).forEach(container => {
            container?.classList.add("hidden");
        });

        pauseSnakeLoop();
        pongRunning = false;
    };

    const openGame = (gameName) => {
        const container = gameContainers[gameName];

        if (!container) return;

        arcadeSelect?.classList.add("hidden");

        Object.entries(gameContainers).forEach(([name, el]) => {
            el?.classList.toggle("hidden", name !== gameName);
        });

        if (gameName === "snake") {
            initSnake();
        }

        if (gameName === "tictactoe") {
            initTicTacToe();
        }
    };

    arcadeSelectCards.forEach(card => {
        card.addEventListener("click", () => {
            openGame(card.dataset.game);
        });
    });

    arcadeBackButtons.forEach(button => {
        button.addEventListener("click", showArcadeSelect);
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

    let pongRunning = false;

    if (canvas) {
        const ctx = canvas.getContext("2d");

        if (ctx) {

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
                ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

                const gradient =
                    ctx.createRadialGradient(
                        GAME_WIDTH / 2, GAME_HEIGHT / 2, 0,
                        GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH * .65
                    );

                gradient.addColorStop(0, "rgba(168,85,247,.08)");
                gradient.addColorStop(1, "rgba(0,0,0,0)");

                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

                ctx.strokeStyle = "rgba(168,85,247,.13)";
                ctx.setLineDash([7, 12]);

                ctx.beginPath();
                ctx.moveTo(GAME_WIDTH / 2, 0);
                ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
                ctx.stroke();

                ctx.setLineDash([]);

                for (let x = 0; x < GAME_WIDTH; x += 45) {
                    ctx.strokeStyle = "rgba(255,255,255,.018)";
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, GAME_HEIGHT);
                    ctx.stroke();
                }

                for (let y = 0; y < GAME_HEIGHT; y += 45) {
                    ctx.strokeStyle = "rgba(255,255,255,.018)";
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(GAME_WIDTH, y);
                    ctx.stroke();
                }
            };

            const drawPaddle = paddle => {
                ctx.fillStyle = "#c084fc";
                ctx.shadowBlur = 20;
                ctx.shadowColor = "rgba(168,85,247,.7)";

                ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

                ctx.shadowBlur = 0;
            };

            const drawBall = () => {
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

                ctx.fillStyle = "#ffffff";
                ctx.shadowBlur = 25;
                ctx.shadowColor = "rgba(192,132,252,.9)";

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
                paddle.y = Math.max(
                    0,
                    Math.min(GAME_HEIGHT - paddle.height, paddle.y)
                );
            };

            const endGame = playerWon => {
                pongRunning = false;

                gameOverlay.classList.remove("hidden");

                if (playerWon) {
                    gameOverlayTitle.textContent = "YOU WIN.";
                    gameOverlayText.textContent = "Quantum dominance achieved.";
                } else {
                    gameOverlayTitle.textContent = "AI WINS.";
                    gameOverlayText.textContent = "The machine got you this time.";
                }

                startGameButton.textContent = "PLAY AGAIN";
            };

            const update = () => {
                if (!pongRunning) return;

                if (keys.up) player.y -= player.speed;
                if (keys.down) player.y += player.speed;

                clampPaddle(player);

                const aiCenter = ai.y + ai.height / 2;
                const target = ball.y;

                if (aiCenter < target - 10) ai.y += ai.speed;
                else if (aiCenter > target + 10) ai.y -= ai.speed;

                clampPaddle(ai);

                ball.x += ball.speedX;
                ball.y += ball.speedY;

                if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= GAME_HEIGHT) {
                    ball.speedY *= -1;
                }

                if (
                    ball.x - ball.radius <= player.x + player.width &&
                    ball.x + ball.radius >= player.x &&
                    ball.y >= player.y &&
                    ball.y <= player.y + player.height &&
                    ball.speedX < 0
                ) {
                    const relative = (ball.y - (player.y + player.height / 2)) / (player.height / 2);

                    ball.speedX = Math.abs(ball.speedX) * 1.05;
                    ball.speedY = relative * 6;
                    ball.x = player.x + player.width + ball.radius;
                }

                if (
                    ball.x + ball.radius >= ai.x &&
                    ball.x - ball.radius <= ai.x + ai.width &&
                    ball.y >= ai.y &&
                    ball.y <= ai.y + ai.height &&
                    ball.speedX > 0
                ) {
                    const relative = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);

                    ball.speedX = -Math.abs(ball.speedX) * 1.05;
                    ball.speedY = relative * 6;
                    ball.x = ai.x - ball.radius;
                }

                if (ball.x < -30) {
                    aiScore++;
                    aiScoreElement.textContent = aiScore;

                    if (aiScore >= 7) endGame(false);
                    else resetBall(1);
                }

                if (ball.x > GAME_WIDTH + 30) {
                    playerScore++;
                    playerScoreElement.textContent = playerScore;

                    if (playerScore >= 7) endGame(true);
                    else resetBall(-1);
                }
            };

            const loop = () => {
                update();
                draw();
                requestAnimationFrame(loop);
            };

            const startPong = () => {
                resetGame();
                pongRunning = true;

                gameOverlay.classList.add("hidden");
                gameOverlayTitle.textContent = "QUANTUM PONG";
                gameOverlayText.textContent = "First to 7 wins.";
            };

            startGameButton?.addEventListener("click", startPong);

            const isTypingTarget = (target) => {
                const tag = target?.tagName;
                return tag === "INPUT" || tag === "TEXTAREA";
            };

            document.addEventListener("keydown", event => {
                if (isTypingTarget(event.target)) return;

                const container = gameContainers.pong;
                if (!container || container.classList.contains("hidden")) return;

                if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") {
                    keys.up = true;
                    event.preventDefault();
                }
                if (event.key === "s" || event.key === "S" || event.key === "ArrowDown") {
                    keys.down = true;
                    event.preventDefault();
                }
            });

            document.addEventListener("keyup", event => {
                if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") {
                    keys.up = false;
                }
                if (event.key === "s" || event.key === "S" || event.key === "ArrowDown") {
                    keys.down = false;
                }
            });

            const bindTouchControl = (element, direction) => {
                if (!element) return;

                const start = event => { event.preventDefault(); keys[direction] = true; };
                const stop = event => { event.preventDefault(); keys[direction] = false; };

                element.addEventListener("touchstart", start, { passive: false });
                element.addEventListener("touchend", stop, { passive: false });
                element.addEventListener("touchcancel", stop, { passive: false });
                element.addEventListener("mousedown", start);
                element.addEventListener("mouseup", stop);
                element.addEventListener("mouseleave", stop);
            };

            bindTouchControl(touchUp, "up");
            bindTouchControl(touchDown, "down");

            draw();
            loop();
        }
    }

    /* =====================================================
       SNAKE
    ===================================================== */

    const snakeCanvas = document.getElementById("snakeCanvas");
    const snakeScoreElement = document.getElementById("snakeScore");
    const snakeBestElement = document.getElementById("snakeBest");
    const snakeOverlay = document.getElementById("snakeOverlay");
    const snakeOverlayTitle = document.getElementById("snakeOverlayTitle");
    const snakeOverlayText = document.getElementById("snakeOverlayText");
    const startSnakeButton = document.getElementById("startSnake");

    const snakeUpBtn = document.getElementById("snakeUp");
    const snakeDownBtn = document.getElementById("snakeDown");
    const snakeLeftBtn = document.getElementById("snakeLeft");
    const snakeRightBtn = document.getElementById("snakeRight");

    const SNAKE_COLS = 22;
    let snakeCtx = null;
    let snakeCellSize = 0;

    let snake = [];
    let snakeDirection = { x: 1, y: 0 };
    let snakeNextDirection = { x: 1, y: 0 };
    let food = { x: 0, y: 0 };
    let snakeScore = 0;
    let snakeBest = Number(localStorage.getItem("quantum_snake_best")) || 0;
    let snakeRunning = false;
    let snakeLoopHandle = null;
    const SNAKE_SPEED_MS = 110;

    const initSnake = () => {
        if (snakeInitialized || !snakeCanvas) return;

        snakeInitialized = true;
        snakeCtx = snakeCanvas.getContext("2d");
        snakeCellSize = snakeCanvas.width / SNAKE_COLS;

        if (snakeBestElement) {
            snakeBestElement.textContent = snakeBest;
        }

        drawSnakeFrame();
    };

    const placeFood = () => {
        let candidate;

        do {
            candidate = {
                x: Math.floor(Math.random() * SNAKE_COLS),
                y: Math.floor(Math.random() * SNAKE_COLS)
            };
        } while (
            snake.some(segment => segment.x === candidate.x && segment.y === candidate.y)
        );

        food = candidate;
    };

    const resetSnake = () => {
        const mid = Math.floor(SNAKE_COLS / 2);

        snake = [
            { x: mid - 1, y: mid },
            { x: mid - 2, y: mid },
            { x: mid - 3, y: mid }
        ];

        snakeDirection = { x: 1, y: 0 };
        snakeNextDirection = { x: 1, y: 0 };
        snakeScore = 0;

        if (snakeScoreElement) snakeScoreElement.textContent = snakeScore;

        placeFood();
    };

    const drawSnakeFrame = () => {
        if (!snakeCtx) return;

        snakeCtx.fillStyle = "#020203";
        snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

        snakeCtx.strokeStyle = "rgba(255,255,255,.02)";

        for (let i = 0; i <= SNAKE_COLS; i++) {
            const pos = i * snakeCellSize;

            snakeCtx.beginPath();
            snakeCtx.moveTo(pos, 0);
            snakeCtx.lineTo(pos, snakeCanvas.height);
            snakeCtx.stroke();

            snakeCtx.beginPath();
            snakeCtx.moveTo(0, pos);
            snakeCtx.lineTo(snakeCanvas.width, pos);
            snakeCtx.stroke();
        }

        if (food) {
            snakeCtx.fillStyle = "#ff8fae";
            snakeCtx.shadowBlur = 18;
            snakeCtx.shadowColor = "rgba(255,54,95,.8)";

            snakeCtx.beginPath();
            snakeCtx.arc(
                food.x * snakeCellSize + snakeCellSize / 2,
                food.y * snakeCellSize + snakeCellSize / 2,
                snakeCellSize / 2.6,
                0,
                Math.PI * 2
            );
            snakeCtx.fill();
            snakeCtx.shadowBlur = 0;
        }

        snake.forEach((segment, index) => {
            snakeCtx.fillStyle = index === 0 ? "#c084fc" : "#8b5cf6";
            snakeCtx.shadowBlur = index === 0 ? 18 : 0;
            snakeCtx.shadowColor = "rgba(168,85,247,.7)";

            const pad = 1.5;

            snakeCtx.fillRect(
                segment.x * snakeCellSize + pad,
                segment.y * snakeCellSize + pad,
                snakeCellSize - pad * 2,
                snakeCellSize - pad * 2
            );
            snakeCtx.shadowBlur = 0;
        });
    };

    const endSnake = () => {
        snakeRunning = false;
        clearTimeout(snakeLoopHandle);

        if (snakeScore > snakeBest) {
            snakeBest = snakeScore;
            localStorage.setItem("quantum_snake_best", String(snakeBest));

            if (snakeBestElement) snakeBestElement.textContent = snakeBest;
        }

        snakeOverlay?.classList.remove("hidden");

        if (snakeOverlayTitle) snakeOverlayTitle.textContent = "GAME OVER.";
        if (snakeOverlayText) snakeOverlayText.textContent = `You scored ${snakeScore}. Try again?`;

        if (startSnakeButton) startSnakeButton.textContent = "PLAY AGAIN";
    };

    const stepSnake = () => {
        snakeDirection = snakeNextDirection;

        const head = {
            x: snake[0].x + snakeDirection.x,
            y: snake[0].y + snakeDirection.y
        };

        if (
            head.x < 0 || head.x >= SNAKE_COLS ||
            head.y < 0 || head.y >= SNAKE_COLS ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            endSnake();
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            snakeScore++;
            if (snakeScoreElement) snakeScoreElement.textContent = snakeScore;
            placeFood();
        } else {
            snake.pop();
        }

        drawSnakeFrame();

        if (snakeRunning) {
            snakeLoopHandle = setTimeout(stepSnake, SNAKE_SPEED_MS);
        }
    };

    const pauseSnakeLoop = () => {
        snakeRunning = false;
        clearTimeout(snakeLoopHandle);
    };

    const startSnake = () => {
        resetSnake();
        snakeRunning = true;

        snakeOverlay?.classList.add("hidden");

        drawSnakeFrame();

        clearTimeout(snakeLoopHandle);
        snakeLoopHandle = setTimeout(stepSnake, SNAKE_SPEED_MS);
    };

    startSnakeButton?.addEventListener("click", startSnake);

    const setSnakeDirection = (x, y) => {
        if (!snakeRunning) return;

        if (snakeDirection.x === -x && snakeDirection.y === -y) return;

        snakeNextDirection = { x, y };
    };

    document.addEventListener("keydown", event => {
        const tag = event.target?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;

        const container = gameContainers.snake;

        if (!container || container.classList.contains("hidden")) return;

        if (event.key === "w" || event.key === "W" || event.key === "ArrowUp") {
            setSnakeDirection(0, -1);
            event.preventDefault();
        } else if (event.key === "s" || event.key === "S" || event.key === "ArrowDown") {
            setSnakeDirection(0, 1);
            event.preventDefault();
        } else if (event.key === "a" || event.key === "A" || event.key === "ArrowLeft") {
            setSnakeDirection(-1, 0);
            event.preventDefault();
        } else if (event.key === "d" || event.key === "D" || event.key === "ArrowRight") {
            setSnakeDirection(1, 0);
            event.preventDefault();
        }
    });

    snakeUpBtn?.addEventListener("click", () => setSnakeDirection(0, -1));
    snakeDownBtn?.addEventListener("click", () => setSnakeDirection(0, 1));
    snakeLeftBtn?.addEventListener("click", () => setSnakeDirection(-1, 0));
    snakeRightBtn?.addEventListener("click", () => setSnakeDirection(1, 0));

    /* =====================================================
       TIC TAC TOE (unbeatable minimax AI)
    ===================================================== */

    const tttBoardElement = document.getElementById("tttBoard");
    const tttStatus = document.getElementById("tttStatus");
    const tttResetButton = document.getElementById("tttReset");
    const tttPlayerScoreEl = document.getElementById("tttPlayerScore");
    const tttAiScoreEl = document.getElementById("tttAiScore");

    const WIN_LINES = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    let tttBoard = Array(9).fill(null);
    let tttGameOver = false;
    let tttPlayerScore = 0;
    let tttAiScore = 0;

    const initTicTacToe = () => {
        if (tttInitialized || !tttBoardElement) return;

        tttInitialized = true;

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement("button");
            cell.type = "button";
            cell.className = "ttt-cell";
            cell.dataset.index = String(i);

            cell.addEventListener("click", () => handleTttMove(i));

            tttBoardElement.appendChild(cell);
        }

        tttResetButton?.addEventListener("click", resetTicTacToe);

        resetTicTacToe();
    };

    const getWinner = (board) => {
        for (const line of WIN_LINES) {
            const [a, b, c] = line;

            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { player: board[a], line };
            }
        }

        if (board.every(cell => cell)) {
            return { player: "draw", line: null };
        }

        return null;
    };

    const minimax = (board, isMaximizing) => {
        const result = getWinner(board);

        if (result) {
            if (result.player === "O") return { score: 1 };
            if (result.player === "X") return { score: -1 };
            return { score: 0 };
        }

        const scores = [];

        board.forEach((cell, index) => {
            if (cell) return;

            const nextBoard = board.slice();
            nextBoard[index] = isMaximizing ? "O" : "X";

            const evalResult = minimax(nextBoard, !isMaximizing);

            scores.push({ index, score: evalResult.score });
        });

        if (isMaximizing) {
            return scores.reduce((best, cur) => (cur.score > best.score ? cur : best));
        }

        return scores.reduce((best, cur) => (cur.score < best.score ? cur : best));
    };

    const renderTtt = () => {
        const cells = tttBoardElement.querySelectorAll(".ttt-cell");

        cells.forEach((cell, index) => {
            const value = tttBoard[index];

            cell.textContent = value || "";
            cell.classList.toggle("filled", Boolean(value));
            cell.classList.toggle("x-mark", value === "X");
            cell.classList.toggle("o-mark", value === "O");
        });
    };

    const highlightWin = (line) => {
        if (!line) return;

        line.forEach(index => {
            tttBoardElement.children[index]?.classList.add("win-cell");
        });
    };

    const aiMove = () => {
        const best = minimax(tttBoard, true);

        if (best?.index === undefined) return;

        tttBoard[best.index] = "O";
        renderTtt();

        checkTttEnd();
    };

    const checkTttEnd = () => {
        const result = getWinner(tttBoard);

        if (!result) {
            if (tttStatus) tttStatus.textContent = "Your move.";
            return false;
        }

        tttGameOver = true;

        if (result.player === "draw") {
            if (tttStatus) tttStatus.textContent = "It's a draw.";
        } else if (result.player === "X") {
            tttPlayerScore++;
            if (tttPlayerScoreEl) tttPlayerScoreEl.textContent = tttPlayerScore;
            if (tttStatus) tttStatus.textContent = "You win!";
            highlightWin(result.line);
        } else {
            tttAiScore++;
            if (tttAiScoreEl) tttAiScoreEl.textContent = tttAiScore;
            if (tttStatus) tttStatus.textContent = "Quantum AI wins.";
            highlightWin(result.line);
        }

        return true;
    };

    const handleTttMove = (index) => {
        if (tttGameOver || tttBoard[index]) return;

        tttBoard[index] = "X";
        renderTtt();

        if (checkTttEnd()) return;

        if (tttStatus) tttStatus.textContent = "Quantum AI is thinking...";

        setTimeout(() => {
            aiMove();
        }, 300);
    };

    const resetTicTacToe = () => {
        tttBoard = Array(9).fill(null);
        tttGameOver = false;

        renderTtt();

        tttBoardElement.querySelectorAll(".ttt-cell").forEach(cell => {
            cell.classList.remove("win-cell");
        });

        if (tttStatus) tttStatus.textContent = "Your move.";
    };

    /* =====================================================
       CLEANUP
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {
            cleanupRecordingStream();
        }
    );
});
