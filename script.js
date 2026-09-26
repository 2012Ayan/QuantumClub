const showToast = (message, icon = '✓', duration = 1800) => {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');

  if (!toast || !toastMessage || !toastIcon) return;

  toastIcon.textContent = icon;
  toastMessage.textContent = message;
  toast.classList.add('show');

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
};

document.addEventListener('DOMContentLoaded', () => {
  const mobileMenu = document.getElementById('mobileMenu');
  const nav = document.getElementById('mainNav');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  if (mobileMenu && nav) {
    mobileMenu.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      mobileMenu.setAttribute('aria-expanded', String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((item) => item.classList.toggle('active', item === link));
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
      }
      if (mobileMenu) {
        mobileMenu.setAttribute('aria-expanded', 'false');
      }
    });
  });

  const revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add('visible'));
    }
  }

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const countdownTitle = document.getElementById('countdownTitle');
  const countdownDate = document.getElementById('countdownDate');

  if (daysEl && hoursEl && minutesEl && secondsEl) {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 8);
    deadline.setHours(17, 0, 0, 0);

    const formatValue = (value) => String(value).padStart(2, '0');

    const updateCountdown = () => {
      const now = new Date();
      const distance = deadline - now;

      if (distance <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        if (countdownTitle) countdownTitle.textContent = 'Next Physics Test';
        if (countdownDate) countdownDate.textContent = 'Exam window opened';
        return;
      }

      const totalSeconds = Math.floor(distance / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      daysEl.textContent = formatValue(days);
      hoursEl.textContent = formatValue(hours);
      minutesEl.textContent = formatValue(minutes);
      secondsEl.textContent = formatValue(seconds);

      if (countdownDate) {
        countdownDate.textContent = deadline.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) + ' • 5:00 PM';
      }
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  const messageInput = document.getElementById('messageInput');
  const messages = document.getElementById('messages');
  const sendButton = document.getElementById('sendButton');
  const uploadButton = document.getElementById('uploadButton');
  const memeInput = document.getElementById('memeInput');
  const typingIndicator = document.getElementById('typingIndicator');

  const createMessageMarkup = ({ text, sender, type, image = null }) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (type === 'sent') {
      return `
        <div>
          <div class="bubble">${text}</div>
          <span class="message-time">${time}</span>
        </div>
      `;
    }

    const imageMarkup = image
      ? `<img class="message-image" src="${image}" alt="${sender} meme">`
      : '';

    return `
      <div class="message-avatar">${sender.charAt(0).toUpperCase()}</div>
      <div>
        <span class="message-name">${sender}</span>
        <div class="bubble">${text}</div>
        ${imageMarkup}
        <span class="message-time">${time}</span>
      </div>
    `;
  };

  const appendMessage = ({ text, sender, type = 'received', image = null }) => {
    if (!messages) return;

    const element = document.createElement('div');
    element.className = `message ${type}`;
    element.innerHTML = createMessageMarkup({ text, sender, type, image });
    messages.appendChild(element);
    messages.scrollTop = messages.scrollHeight;
  };

  const sendMessage = () => {
    if (!messageInput) return;

    const text = messageInput.value.trim();
    if (!text) return;

    appendMessage({ text, sender: 'You', type: 'sent' });
    messageInput.value = '';
    if (typingIndicator) {
      typingIndicator.classList.remove('show');
    }
  };

  if (sendButton) {
    sendButton.addEventListener('click', sendMessage);
  }

  if (messageInput) {
    messageInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
      }
    });

    messageInput.addEventListener('input', () => {
      if (typingIndicator) {
        typingIndicator.classList.toggle('show', messageInput.value.trim().length > 0);
      }
    });
  }

  if (uploadButton && memeInput) {
    uploadButton.addEventListener('click', () => memeInput.click());
    memeInput.addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        appendMessage({
          text: 'Shared a meme',
          sender: 'You',
          type: 'sent',
          image: loadEvent.target?.result || null
        });
        showToast('Meme uploaded', '✓');
      };
      reader.readAsDataURL(file);
      memeInput.value = '';
    });
  }

  const canvas = document.getElementById('pongCanvas');
  const startButton = document.getElementById('startGame');
  const gameOverlay = document.getElementById('gameOverlay');
  const playerScoreEl = document.getElementById('playerScore');
  const aiScoreEl = document.getElementById('aiScore');

  if (canvas && playerScoreEl && aiScoreEl) {
    const context = canvas.getContext('2d');
    const keys = { up: false, down: false };
    const state = {
      running: false,
      player: { x: 24, y: canvas.height / 2 - 60, width: 12, height: 120, speed: 6.5 },
      ai: { x: canvas.width - 36, y: canvas.height / 2 - 60, width: 12, height: 120 },
      ball: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 9,
        vx: 4.5,
        vy: 3.2,
      },
      score: { player: 0, ai: 0 },
      winScore: 7,
    };

    const resetBall = () => {
      state.ball.x = canvas.width / 2;
      state.ball.y = canvas.height / 2;
      const direction = Math.random() > 0.5 ? 1 : -1;
      state.ball.vx = direction * (4.5 + Math.random() * 1.1);
      state.ball.vy = (Math.random() - 0.5) * 5.5;
    };

    const endRound = (winnerText) => {
      state.running = false;
      if (gameOverlay) {
        const title = gameOverlay.querySelector('h3');
        const detail = gameOverlay.querySelector('p');
        if (title) title.textContent = winnerText;
        if (detail) detail.textContent = 'Press start to play again';
        gameOverlay.classList.remove('hidden');
      }
    };

    const updateScoreboard = () => {
      playerScoreEl.textContent = String(state.score.player);
      aiScoreEl.textContent = String(state.score.ai);
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#020203';
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = 'rgba(168, 85, 247, 0.5)';
      context.fillRect(canvas.width / 2 - 2, 0, 4, canvas.height);

      context.fillStyle = '#f7f4fb';
      context.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
      context.fillRect(state.ai.x, state.ai.y, state.ai.width, state.ai.height);

      context.beginPath();
      context.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      context.fillStyle = '#c084fc';
      context.fill();
      context.closePath();
    };

    const update = () => {
      if (!state.running) return;

      if (keys.up) {
        state.player.y -= state.player.speed;
      }
      if (keys.down) {
        state.player.y += state.player.speed;
      }

      state.player.y = Math.max(0, Math.min(canvas.height - state.player.height, state.player.y));

      const target = state.ball.y - state.ai.height / 2;
      state.ai.y += (target - state.ai.y) * 0.12;
      state.ai.y = Math.max(0, Math.min(canvas.height - state.ai.height, state.ai.y));

      state.ball.x += state.ball.vx;
      state.ball.y += state.ball.vy;

      if (state.ball.y - state.ball.radius <= 0 || state.ball.y + state.ball.radius >= canvas.height) {
        state.ball.vy *= -1;
      }

      const playerHit =
        state.ball.x - state.ball.radius <= state.player.x + state.player.width &&
        state.ball.x - state.ball.radius >= state.player.x &&
        state.ball.y >= state.player.y &&
        state.ball.y <= state.player.y + state.player.height;

      const aiHit =
        state.ball.x + state.ball.radius >= state.ai.x &&
        state.ball.x + state.ball.radius <= state.ai.x + state.ai.width &&
        state.ball.y >= state.ai.y &&
        state.ball.y <= state.ai.y + state.ai.height;

      if (playerHit) {
        state.ball.x = state.player.x + state.player.width + state.ball.radius;
        state.ball.vx = Math.abs(state.ball.vx) + 0.35;
        state.ball.vy += (state.ball.y - (state.player.y + state.player.height / 2)) * 0.12;
      }

      if (aiHit) {
        state.ball.x = state.ai.x - state.ball.radius;
        state.ball.vx = -Math.abs(state.ball.vx) - 0.35;
        state.ball.vy += (state.ball.y - (state.ai.y + state.ai.height / 2)) * 0.12;
      }

      if (state.ball.x < -20) {
        state.score.ai += 1;
        updateScoreboard();
        if (state.score.ai >= state.winScore) {
          endRound('AI WINS!');
          return;
        }
        resetBall();
      }

      if (state.ball.x > canvas.width + 20) {
        state.score.player += 1;
        updateScoreboard();
        if (state.score.player >= state.winScore) {
          endRound('YOU WIN!');
          return;
        }
        resetBall();
      }
    };

    const animate = () => {
      update();
      draw();
      window.requestAnimationFrame(animate);
    };

    const startGame = () => {
      state.running = true;
      if (state.score.player >= state.winScore || state.score.ai >= state.winScore) {
        state.score.player = 0;
        state.score.ai = 0;
        updateScoreboard();
      }
      resetBall();
      if (gameOverlay) {
        gameOverlay.classList.add('hidden');
      }
    };

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        keys.up = true;
      }
      if (key === 's' || key === 'arrowdown') {
        keys.down = true;
      }
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        keys.up = false;
      }
      if (key === 's' || key === 'arrowdown') {
        keys.down = false;
      }
    });

    if (startButton) {
      startButton.addEventListener('click', startGame);
    }

    updateScoreboard();
    resetBall();
    draw();
    window.requestAnimationFrame(animate);
  }
});
