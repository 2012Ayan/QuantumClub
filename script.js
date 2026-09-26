/* =========================================================
   9C QUANTUM — MAIN SYSTEM
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       NAME / IDENTITY SYSTEM
    ====================================================== */

    const NAME_KEY = "quantum_user_name";

    const nameScreen = document.getElementById("nameScreen");
    const nameForm = document.getElementById("nameForm");
    const nameInput = document.getElementById("nameInput");
    const heroUserName = document.getElementById("heroUserName");

    let userName = localStorage.getItem(NAME_KEY) || "";

    const updateUserNameUI = () => {
        if (heroUserName) {
            heroUserName.textContent = userName || "USER";
        }

        document.querySelectorAll(".sent-name").forEach((element) => {
            element.textContent = userName || "You";
        });
    };

    const unlockWebsite = () => {
        if (nameScreen) {
            nameScreen.classList.add("hidden");
        }

        document.body.classList.remove("locked");

        updateUserNameUI();
    };

    if (userName) {
        unlockWebsite();
    } else {
        document.body.classList.add("locked");

        setTimeout(() => {
            nameInput?.focus();
        }, 400);
    }

    if (nameForm) {
        nameForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const enteredName = nameInput?.value.trim();

            if (!enteredName) {
                showToast("Enter your name first", "!");
                nameInput?.focus();
                return;
            }

            userName = enteredName.slice(0, 24);

            localStorage.setItem(NAME_KEY, userName);

            unlockWebsite();

            showToast(`Welcome, ${userName}`, "✓", 2200);
        });
    }


    /* =====================================================
       TOAST
    ====================================================== */

    const showToast = (
        message,
        icon = "✓",
        duration = 1800
    ) => {

        const toast = document.getElementById("toast");
        const toastMessage = document.getElementById("toastMessage");
        const toastIcon = document.getElementById("toastIcon");

        if (!toast || !toastMessage || !toastIcon) {
            return;
        }

        toastIcon.textContent = icon;
        toastMessage.textContent = message;

        toast.classList.add("show");

        window.clearTimeout(showToast.timeoutId);

        showToast.timeoutId = window.setTimeout(() => {
            toast.classList.remove("show");
        }, duration);
    };


    /* =====================================================
       PAGE / WINDOW SYSTEM
    ====================================================== */

    const pages = Array.from(document.querySelectorAll(".page"));
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const pageButtons = Array.from(document.querySelectorAll(".nav-open"));

    let currentPage = "home";

    const setActiveNav = (pageName) => {

        navLinks.forEach((link) => {
            link.classList.toggle(
                "active",
                link.dataset.page === pageName
            );
        });
    };

    const openPage = (pageName, updateHistory = true) => {

        const target = document.getElementById(`page-${pageName}`);

        if (!target) {
            return;
        }

        pages.forEach((page) => {
            page.classList.toggle(
                "active-page",
                page === target
            );
        });

        currentPage = pageName;

        setActiveNav(pageName);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (updateHistory) {
            history.replaceState(
                { page: pageName },
                "",
                `#${pageName}`
            );
        }

        const nav = document.getElementById("mainNav");
        const mobileMenu = document.getElementById("mobileMenu");

        nav?.classList.remove("open");

        mobileMenu?.setAttribute(
            "aria-expanded",
            "false"
        );
    };

    pageButtons.forEach((button) => {
        button.addEventListener("click", () => {
            openPage(button.dataset.page);
        });
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            openPage(link.dataset.page);
        });
    });

    const initialPage =
        window.location.hash.replace("#", "") || "home";

    if (document.getElementById(`page-${initialPage}`)) {
        openPage(initialPage, false);
    } else {
        openPage("home", false);
    }


    /* =====================================================
       MOBILE NAVIGATION
    ====================================================== */

    const mobileMenu = document.getElementById("mobileMenu");
    const mainNav = document.getElementById("mainNav");

    if (mobileMenu && mainNav) {

        mobileMenu.addEventListener("click", () => {

            const open =
                mainNav.classList.toggle("open");

            mobileMenu.setAttribute(
                "aria-expanded",
                String(open)
            );
        });
    }


    /* =====================================================
       ONLINE COUNT
    ====================================================== */

    const onlineCount =
        document.getElementById("onlineCount");

    const chatStatus =
        document.getElementById("chatStatus");

    const updateOnlineCount = () => {

        const count =
            Math.floor(21 + Math.random() * 6);

        if (onlineCount) {
            onlineCount.textContent = count;
        }

        if (chatStatus) {
            chatStatus.textContent =
                `${count} members online`;
        }
    };

    updateOnlineCount();

    window.setInterval(
        updateOnlineCount,
        7000
    );


    /* =====================================================
       COUNTDOWN
    ====================================================== */

    const daysEl =
        document.getElementById("days");

    const hoursEl =
        document.getElementById("hours");

    const minutesEl =
        document.getElementById("minutes");

    const secondsEl =
        document.getElementById("seconds");

    const countdownTitle =
        document.getElementById("countdownTitle");

    const countdownDate =
        document.getElementById("countdownDate");

    if (
        daysEl &&
        hoursEl &&
        minutesEl &&
        secondsEl
    ) {

        const deadline = new Date();

        deadline.setDate(
            deadline.getDate() + 8
        );

        deadline.setHours(
            17,
            0,
            0,
            0
        );

        const formatValue = (value) =>
            String(value).padStart(2, "0");

        const updateCountdown = () => {

            const now = new Date();

            const distance =
                deadline - now;

            if (distance <= 0) {

                daysEl.textContent = "00";
                hoursEl.textContent = "00";
                minutesEl.textContent = "00";
                secondsEl.textContent = "00";

                if (countdownTitle) {
                    countdownTitle.textContent =
                        "Next Physics Test";
                }

                if (countdownDate) {
                    countdownDate.textContent =
                        "Exam window opened";
                }

                return;
            }

            const totalSeconds =
                Math.floor(distance / 1000);

            const days =
                Math.floor(
                    totalSeconds / 86400
                );

            const hours =
                Math.floor(
                    (totalSeconds % 86400) / 3600
                );

            const minutes =
                Math.floor(
                    (totalSeconds % 3600) / 60
                );

            const seconds =
                totalSeconds % 60;

            daysEl.textContent =
                formatValue(days);

            hoursEl.textContent =
                formatValue(hours);

            minutesEl.textContent =
                formatValue(minutes);

            secondsEl.textContent =
                formatValue(seconds);

            if (countdownDate) {

                countdownDate.textContent =
                    deadline.toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    ) + " • 5:00 PM";
            }
        };

        updateCountdown();

        window.setInterval(
            updateCountdown,
            1000
        );
    }


    /* =====================================================
       CHAT
    ====================================================== */

    const messageInput =
        document.getElementById("messageInput");

    const messages =
        document.getElementById("messages");

    const sendButton =
        document.getElementById("sendButton");

    const uploadButton =
        document.getElementById("uploadButton");

    const memeInput =
        document.getElementById("memeInput");

    const voiceButton =
        document.getElementById("voiceButton");

    const typingIndicator =
        document.getElementById("typingIndicator");


    const escapeHTML = (value) => {

        const div =
            document.createElement("div");

        div.textContent = value;

        return div.innerHTML;
    };


    const getTime = () => {

        return new Date().toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };


    const createWaveform = () => {

        return `
            <div class="voice-message">
                <div class="play-icon">▶</div>

                <div class="waveform">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <small>0:08</small>
            </div>
        `;
    };


    const appendTextMessage = (text) => {

        if (!messages) {
            return;
        }

        const safeText =
            escapeHTML(text);

        const safeName =
            escapeHTML(userName || "You");

        const element =
            document.createElement("div");

        element.className =
            "message sent";

        element.innerHTML = `
            <div>

                <span class="message-name sent-name">
                    ${safeName}
                </span>

                <div class="bubble">
                    ${safeText}
                </div>

                <span class="message-time">
                    ${getTime()}
                </span>

            </div>
        `;

        messages.appendChild(element);

        messages.scrollTop =
            messages.scrollHeight;
    };


    const appendImageMessage = (imageData) => {

        if (!messages) {
            return;
        }

        const safeName =
            escapeHTML(userName || "You");

        const element =
            document.createElement("div");

        element.className =
            "message sent";

        element.innerHTML = `
            <div>

                <span class="message-name sent-name">
                    ${safeName}
                </span>

                <div class="bubble">
                    Shared a meme 🖼️
                </div>

                <img
                    class="message-image"
                    src="${imageData}"
                    alt="${safeName} shared meme"
                >

                <span class="message-time">
                    ${getTime()}
                </span>

            </div>
        `;

        messages.appendChild(element);

        messages.scrollTop =
            messages.scrollHeight;
    };


    const appendVoiceMessage = () => {

        if (!messages) {
            return;
        }

        const safeName =
            escapeHTML(userName || "You");

        const element =
            document.createElement("div");

        element.className =
            "message sent";

        element.innerHTML = `
            <div>

                <span class="message-name sent-name">
                    ${safeName}
                </span>

                <div class="bubble">
                    ${createWaveform()}
                </div>

                <span class="message-time">
                    ${getTime()}
                </span>

            </div>
        `;

        messages.appendChild(element);

        messages.scrollTop =
            messages.scrollHeight;
    };


    const sendMessage = () => {

        if (!messageInput) {
            return;
        }

        const text =
            messageInput.value.trim();

        if (!text) {
            return;
        }

        appendTextMessage(text);

        messageInput.value = "";

        if (typingIndicator) {
            typingIndicator.classList.remove("show");
        }

        showToast("Message sent", "✓");
    };


    sendButton?.addEventListener(
        "click",
        sendMessage
    );


    messageInput?.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();
            }
        }
    );


    messageInput?.addEventListener(
        "input",
        () => {

            if (!typingIndicator) {
                return;
            }

            typingIndicator.classList.toggle(
                "show",
                messageInput.value.trim().length > 0
            );
        }
    );


    /* =====================================================
       MEME UPLOAD
    ====================================================== */

    uploadButton?.addEventListener(
        "click",
        () => memeInput?.click()
    );


    memeInput?.addEventListener(
        "change",
        (event) => {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            if (!file.type.startsWith("image/")) {

                showToast(
                    "Please choose an image",
                    "!"
                );

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                (loadEvent) => {

                    appendImageMessage(
                        loadEvent.target?.result
                    );

                    showToast(
                        "Meme uploaded",
                        "✓"
                    );
                };

            reader.readAsDataURL(file);

            memeInput.value = "";
        }
    );


    /* =====================================================
       VOICE NOTE SIMULATION
    ====================================================== */

    voiceButton?.addEventListener(
        "click",
        () => {

            appendVoiceMessage();

            showToast(
                "Voice note sent",
                "🎙"
            );
        }
    );


    /* =====================================================
       PONG
    ====================================================== */

    const canvas =
        document.getElementById("pongCanvas");

    const startButton =
        document.getElementById("startGame");

    const gameOverlay =
        document.getElementById("gameOverlay");

    const playerScoreEl =
        document.getElementById("playerScore");

    const aiScoreEl =
        document.getElementById("aiScore");


    if (
        canvas &&
        playerScoreEl &&
        aiScoreEl
    ) {

        const context =
            canvas.getContext("2d");

        if (!context) {
            return;
        }

        const keys = {
            up: false,
            down: false
        };

        const state = {

            running: false,

            player: {
                x: 24,
                y: canvas.height / 2 - 60,
                width: 12,
                height: 120,
                speed: 6.5
            },

            ai: {
                x: canvas.width - 36,
                y: canvas.height / 2 - 60,
                width: 12,
                height: 120
            },

            ball: {
                x: canvas.width / 2,
                y: canvas.height / 2,
                radius: 9,
                vx: 4.5,
                vy: 3.2
            },

            score: {
                player: 0,
                ai: 0
            },

            winScore: 7
        };


        const resetBall = () => {

            state.ball.x =
                canvas.width / 2;

            state.ball.y =
                canvas.height / 2;

            const direction =
                Math.random() > 0.5
                    ? 1
                    : -1;

            state.ball.vx =
                direction *
                (4.5 + Math.random() * 1.1);

            state.ball.vy =
                (Math.random() - 0.5) * 5.5;
        };


        const updateScoreboard = () => {

            playerScoreEl.textContent =
                String(state.score.player);

            aiScoreEl.textContent =
                String(state.score.ai);
        };


        const endRound = (winnerText) => {

            state.running = false;

            if (!gameOverlay) {
                return;
            }

            const title =
                gameOverlay.querySelector("h3");

            const detail =
                gameOverlay.querySelector("p");

            if (title) {
                title.textContent =
                    winnerText;
            }

            if (detail) {
                detail.textContent =
                    "Press start to play again";
            }

            gameOverlay.classList.remove(
                "hidden"
            );
        };


        const draw = () => {

            context.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            context.fillStyle = "#020203";

            context.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            context.fillStyle =
                "rgba(168, 85, 247, 0.5)";

            context.fillRect(
                canvas.width / 2 - 2,
                0,
                4,
                canvas.height
            );


            context.fillStyle =
                "#f7f4fb";

            context.fillRect(
                state.player.x,
                state.player.y,
                state.player.width,
                state.player.height
            );

            context.fillRect(
                state.ai.x,
                state.ai.y,
                state.ai.width,
                state.ai.height
            );


            context.beginPath();

            context.arc(
                state.ball.x,
                state.ball.y,
                state.ball.radius,
                0,
                Math.PI * 2
            );

            context.fillStyle =
                "#c084fc";

            context.fill();

            context.closePath();
        };


        const update = () => {

            if (!state.running) {
                return;
            }


            if (keys.up) {
                state.player.y -=
                    state.player.speed;
            }

            if (keys.down) {
                state.player.y +=
                    state.player.speed;
            }


            state.player.y =
                Math.max(
                    0,
                    Math.min(
                        canvas.height -
                            state.player.height,
                        state.player.y
                    )
                );


            const target =
                state.ball.y -
                state.ai.height / 2;

            state.ai.y +=
                (target - state.ai.y) *
                0.12;


            state.ai.y =
                Math.max(
                    0,
                    Math.min(
                        canvas.height -
                            state.ai.height,
                        state.ai.y
                    )
                );


            state.ball.x +=
                state.ball.vx;

            state.ball.y +=
                state.ball.vy;


            if (
                state.ball.y -
                    state.ball.radius <= 0 ||
                state.ball.y +
                    state.ball.radius >=
                    canvas.height
            ) {

                state.ball.vy *= -1;
            }


            const playerHit =
                state.ball.x -
                    state.ball.radius <=
                    state.player.x +
                        state.player.width &&
                state.ball.x -
                    state.ball.radius >=
                    state.player.x &&
                state.ball.y >=
                    state.player.y &&
                state.ball.y <=
                    state.player.y +
                        state.player.height;


            const aiHit =
                state.ball.x +
                    state.ball.radius >=
                    state.ai.x &&
                state.ball.x +
                    state.ball.radius <=
                    state.ai.x +
                        state.ai.width &&
                state.ball.y >=
                    state.ai.y &&
                state.ball.y <=
                    state.ai.y +
                        state.ai.height;


            if (playerHit) {

                state.ball.x =
                    state.player.x +
                    state.player.width +
                    state.ball.radius;

                state.ball.vx =
                    Math.abs(
                        state.ball.vx
                    ) + 0.35;

                state.ball.vy +=
                    (
                        state.ball.y -
                        (
                            state.player.y +
                            state.player.height / 2
                        )
                    ) * 0.12;
            }


            if (aiHit) {

                state.ball.x =
                    state.ai.x -
                    state.ball.radius;

                state.ball.vx =
                    -Math.abs(
                        state.ball.vx
                    ) - 0.35;

                state.ball.vy +=
                    (
                        state.ball.y -
                        (
                            state.ai.y +
                            state.ai.height / 2
                        )
                    ) * 0.12;
            }


            if (state.ball.x < -20) {

                state.score.ai += 1;

                updateScoreboard();

                if (
                    state.score.ai >=
                    state.winScore
                ) {

                    endRound("AI WINS!");

                    return;
                }

                resetBall();
            }


            if (
                state.ball.x >
                canvas.width + 20
            ) {

                state.score.player += 1;

                updateScoreboard();

                if (
                    state.score.player >=
                    state.winScore
                ) {

                    endRound("YOU WIN!");

                    return;
                }

                resetBall();
            }
        };


        const animate = () => {

            update();

            draw();

            window.requestAnimationFrame(
                animate
            );
        };


        const startGame = () => {

            state.running = true;

            if (
                state.score.player >=
                    state.winScore ||
                state.score.ai >=
                    state.winScore
            ) {

                state.score.player = 0;
                state.score.ai = 0;

                updateScoreboard();
            }

            resetBall();

            if (gameOverlay) {

                const title =
                    gameOverlay.querySelector("h3");

                const detail =
                    gameOverlay.querySelector("p");

                if (title) {
                    title.textContent =
                        "READY?";
                }

                if (detail) {
                    detail.innerHTML = `
                        Use
                        <kbd>W</kbd>
                        <kbd>S</kbd>
                        or
                        <kbd>↑</kbd>
                        <kbd>↓</kbd>
                    `;
                }

                gameOverlay.classList.add(
                    "hidden"
                );
            }
        };


        window.addEventListener(
            "keydown",
            (event) => {

                const key =
                    event.key.toLowerCase();

                if (
                    key === "w" ||
                    key === "arrowup"
                ) {

                    keys.up = true;

                    if (
                        currentPage === "games"
                    ) {
                        event.preventDefault();
                    }
                }

                if (
                    key === "s" ||
                    key === "arrowdown"
                ) {

                    keys.down = true;

                    if (
                        currentPage === "games"
                    ) {
                        event.preventDefault();
                    }
                }
            }
        );


        window.addEventListener(
            "keyup",
            (event) => {

                const key =
                    event.key.toLowerCase();

                if (
                    key === "w" ||
                    key === "arrowup"
                ) {
                    keys.up = false;
                }

                if (
                    key === "s" ||
                    key === "arrowdown"
                ) {
                    keys.down = false;
                }
            }
        );


        startButton?.addEventListener(
            "click",
            startGame
        );


        updateScoreboard();

        resetBall();

        draw();

        window.requestAnimationFrame(
            animate
        );
    }

});
