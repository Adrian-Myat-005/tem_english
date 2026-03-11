// Tem English - Perfected Logic

const BOT_USERNAME = "Tem_english_bot"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXWYCkRbEtwsangwPvq5hxfkFoRCIYk_2_D3VDQm26BpoASeVgfkfm_HMu1dY77jTFmg/exec";

const ui = {
    togglePopup: () => {
        const popup = document.getElementById('profile-popup');
        if (!popup) return;
        const isVisible = popup.style.display === 'flex';
        popup.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
            const input = document.getElementById('edit-name');
            if (input) setTimeout(() => input.focus(), 100);
        }
    },

    toggleMenu: () => {
        const popup = document.getElementById('main-menu-popup');
        if (!popup) return;
        const isVisible = popup.style.display === 'flex';
        popup.style.display = isVisible ? 'none' : 'flex';
    },
    
    initListeners: () => {
        window.addEventListener('click', (e) => {
            const profilePopup = document.getElementById('profile-popup');
            const menuPopup = document.getElementById('main-menu-popup');
            if (e.target === profilePopup) ui.togglePopup();
            if (e.target === menuPopup) ui.toggleMenu();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const profilePopup = document.getElementById('profile-popup');
                const menuPopup = document.getElementById('main-menu-popup');
                if (profilePopup && profilePopup.style.display === 'flex') ui.togglePopup();
                if (menuPopup && menuPopup.style.display === 'flex') ui.toggleMenu();
            }
        });
    },

    initSlider: async () => {
        const track = document.getElementById('member-slider-track');
        const countBadge = document.getElementById('member-count');
        const sliderSection = document.getElementById('member-slider-section');
        if (!track || !countBadge || !sliderSection) return;

        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=get_students`);
            const members = await response.json();
            
            if (!members || members.length === 0) {
                sliderSection.style.display = 'none';
                return;
            }

            countBadge.textContent = `${members.length} MEMBERS JOINED`;
            const displayMembers = [...members, ...members, ...members];
            
            track.innerHTML = displayMembers.map(m => `
                <div class="member-profile">
                    <div class="member-photo-frame">
                        ${m.photo ? `<img src="${m.photo}" alt="${m.name}">` : `<span class="member-symbol">👤</span>`}
                    </div>
                    <span class="member-name">${(m.name || 'User').split(' ')[0]}</span>
                </div>
            `).join('');

            const duration = Math.max(20, members.length * 5);
            track.style.animationDuration = `${duration}s`;
        } catch (e) {
            console.error('Slider load failed:', e);
            sliderSection.style.display = 'none';
        }
    }
};

const days = {
    currentQuestion: null,
    currentIndex: 0,
    score: 0,
    level: 0,
    allDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

    start: () => {
        const section = document.getElementById('days-section');
        if (!section) return;
        section.style.display = 'flex';
        document.getElementById('days-lesson-selection').style.display = 'grid';
        document.getElementById('days-practice-area').style.display = 'none';
        document.getElementById('days-result-screen').style.display = 'none';
        document.getElementById('days-title').textContent = 'DAYS';
        ui.toggleMenu();
    },

    close: () => {
        const section = document.getElementById('days-section');
        if (section) section.style.display = 'none';
    },

    initLesson: (level) => {
        days.currentIndex = 0;
        days.score = 0;
        days.level = level; 

        const titles = ["MIXED ALL", "TOMORROW (+1)", "YESTERDAY (-1)"];
        document.getElementById('days-lesson-selection').style.display = 'none';
        document.getElementById('days-practice-area').style.display = 'block';
        document.getElementById('days-title').textContent = titles[level] || "DAYS";

        days.nextQuestion();
    },

    nextQuestion: () => {
        const todayIndex = Math.floor(Math.random() * 7);
        const today = days.allDays[todayIndex];
        
        let relation;
        if (days.level === 1) relation = "tomorrow";
        else if (days.level === 2) relation = "yesterday";
        else relation = Math.random() > 0.5 ? "tomorrow" : "yesterday";

        let correctIndex;
        if (relation === "tomorrow") {
            correctIndex = (todayIndex + 1) % 7;
        } else {
            correctIndex = (todayIndex - 1 + 7) % 7;
        }

        const correctAnswer = days.allDays[correctIndex];
        const options = [correctAnswer];
        while (options.length < 4) {
            const randomDay = days.allDays[Math.floor(Math.random() * 7)];
            if (!options.includes(randomDay)) options.push(randomDay);
        }
        options.sort(() => 0.5 - Math.random());

        days.currentQuestion = {
            today: today,
            relation: relation,
            answer: correctAnswer,
            options: options,
            text: `Today is ${today}. What day is ${relation}?`
        };

        days.renderQuestion();
        setTimeout(() => days.speakQuestion(), 500);
    },

    renderQuestion: () => {
        const optionsContainer = document.getElementById('days-options');
        if (!optionsContainer) return;
        
        optionsContainer.classList.remove('locked');
        optionsContainer.innerHTML = days.currentQuestion.options.map(opt => `
            <button class="tactile-button" onclick="days.checkAnswer(this, '${opt}')">${opt}</button>
        `).join('');

        const progress = ((days.currentIndex + 1) / 10) * 100;
        const fill = document.getElementById('days-progress-fill');
        const text = document.getElementById('days-progress-text');
        if (fill) fill.style.width = `${progress}%`;
        if (text) text.textContent = `${days.currentIndex + 1} / 10`;
    },

    speakQuestion: () => {
        if (!days.currentQuestion) return;
        try {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(days.currentQuestion.text);
            msg.lang = 'en-US';
            msg.rate = 0.75; 
            window.speechSynthesis.speak(msg);
        } catch(e) { console.error("Speech error:", e); }
    },

    checkAnswer: (btn, choice) => {
        const container = document.getElementById('days-options');
        if (!container || container.classList.contains('locked')) return;
        container.classList.add('locked');

        const isCorrect = choice === days.currentQuestion.answer;
        if (isCorrect) {
            days.score++;
            btn.classList.add('option-correct');
        } else {
            btn.classList.add('option-incorrect');
            Array.from(container.children).forEach(child => {
                if (child.textContent === days.currentQuestion.answer) {
                    child.classList.add('option-correct');
                }
            });
        }

        setTimeout(() => {
            days.currentIndex++;
            if (days.currentIndex < 10) {
                days.nextQuestion();
            } else {
                days.showResult();
            }
        }, 1500);
    },

    showResult: () => {
        document.getElementById('days-practice-area').style.display = 'none';
        document.getElementById('days-result-screen').style.display = 'block';
        document.getElementById('days-final-score').textContent = `${days.score} / 10`;
        
        let msg = "Keep practicing!";
        if (days.score === 10) msg = "PERFECT! You're a days expert!";
        else if (days.score > 7) msg = "Great job! Almost perfect!";
        document.getElementById('days-result-msg').textContent = msg;
    }
};

const numbers = {
    currentLesson: [],
    currentIndex: 0,
    score: 0,
    isFlipped: false,

    start: () => {
        const section = document.getElementById('numbers-section');
        if (!section) return;
        section.style.display = 'flex';
        document.getElementById('lesson-selection').style.display = 'grid';
        document.getElementById('flashcard-area').style.display = 'none';
        document.getElementById('result-screen').style.display = 'none';
        document.getElementById('lesson-title').textContent = 'NUMBERS';
        ui.toggleMenu();
    },

    close: () => {
        const section = document.getElementById('numbers-section');
        if (section) section.style.display = 'none';
    },

    initLesson: (level) => {
        const pool = [];
        const titles = ["MIXED ALL", "2-DIGITS", "HUNDREDS", "THOUSANDS", "10-THOUSANDS", "100-THOUSANDS"];
        
        while (pool.length < 100) {
            let num;
            switch(level) {
                case 1: num = Math.floor(10 + Math.random() * 90); break;
                case 2: num = Math.floor(100 + Math.random() * 900); break;
                case 3: num = Math.floor(1000 + Math.random() * 9000); break;
                case 4: num = Math.floor(10000 + Math.random() * 90000); break;
                case 5: num = Math.floor(100000 + Math.random() * 900000); break;
                default: num = Math.floor(10 + Math.random() * 999990); break;
            }
            if (!pool.includes(num)) pool.push(num);
        }

        numbers.currentLesson = pool.sort(() => 0.5 - Math.random()).slice(0, 20);
        numbers.currentIndex = 0;
        numbers.score = 0;
        numbers.isFlipped = false;

        document.getElementById('lesson-selection').style.display = 'none';
        document.getElementById('flashcard-area').style.display = 'block';
        document.getElementById('lesson-title').textContent = titles[level] || "NUMBERS";
        
        numbers.showCard();
    },

    showCard: () => {
        const num = numbers.currentLesson[numbers.currentIndex];
        const flashcard = document.getElementById('flashcard');
        if (!flashcard) return;
        
        numbers.isFlipped = false;
        flashcard.classList.remove('flipped');
        document.getElementById('card-controls').style.visibility = 'hidden';
        document.getElementById('card-number').textContent = num.toLocaleString();
        document.getElementById('card-text').textContent = numbers.toWords(num);
        
        const progress = ((numbers.currentIndex + 1) / 20) * 100;
        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');
        if (fill) fill.style.width = `${progress}%`;
        if (text) text.textContent = `${numbers.currentIndex + 1} / 20`;
    },

    flip: () => {
        if (numbers.isFlipped) return;
        numbers.isFlipped = true;
        const card = document.getElementById('flashcard');
        if (card) card.classList.add('flipped');
        document.getElementById('card-controls').style.visibility = 'visible';
        setTimeout(() => numbers.speak(), 300);
    },

    next: (isPass) => {
        if (isPass) numbers.score++;
        numbers.currentIndex++;
        
        if (numbers.currentIndex < 20) {
            numbers.showCard();
        } else {
            numbers.showResult();
        }
    },

    showResult: () => {
        document.getElementById('flashcard-area').style.display = 'none';
        document.getElementById('result-screen').style.display = 'block';
        document.getElementById('final-score').textContent = `${numbers.score} / 20`;
        
        let msg = "Keep practicing!";
        if (numbers.score === 20) msg = "PERFECT! You're a pro!";
        else if (numbers.score > 15) msg = "Great job! Almost there!";
        document.getElementById('result-msg').textContent = msg;
    },

    toWords: (n) => {
        const ones = ["", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
        const teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
        const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
        
        const convert = (num) => {
            if (num === 0) return "zero";
            if (num < 10) return ones[num];
            if (num < 20) return teens[num - 10];
            if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? "-" + ones[num % 10] : "");
            if (num < 1000) return ones[Math.floor(num / 100)] + " hundred" + (num % 100 !== 0 ? " and " + convert(num % 100) : "");
            if (num < 1000000) return convert(Math.floor(num / 1000)) + " thousand" + (num % 1000 !== 0 ? (num % 1000 < 100 ? " and " : " ") + convert(num % 1000) : "");
            return num.toString();
        };
        return convert(n);
    },

    speak: () => {
        const textElem = document.getElementById('card-text');
        if (!textElem) return;
        try {
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(textElem.textContent);
            msg.lang = 'en-US';
            msg.rate = 0.85; 
            window.speechSynthesis.speak(msg);
        } catch(e) { console.error("Speech error:", e); }
    }
};

const auth = {
    onTelegramAuth: (user) => {
        if (user) {
            localStorage.setItem('logged_user', JSON.stringify(user));
            auth.registerStudent(user); 
            auth.showMemberArea(user);
        }
    },

    registerStudent: (user) => {
        const photo = user.photo_url || '';
        const query = `id=${user.id}&first_name=${encodeURIComponent(user.first_name)}&username=${encodeURIComponent(user.username || '')}&photo_url=${encodeURIComponent(photo)}`;
        fetch(`${GOOGLE_SCRIPT_URL}?${query}`, { mode: 'no-cors' })
            .catch(e => console.error('Registration error:', e));
    },

    updateName: () => {
        const userStr = localStorage.getItem('logged_user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const input = document.getElementById('edit-name');
        if (!input) return;
        const newName = input.value.trim();
        if (!newName) return;
        
        const btn = document.querySelector('.edit-name-group .tactile-button');
        const originalText = btn ? btn.textContent : 'Update';
        if (btn) {
            btn.textContent = 'Updating...';
            btn.disabled = true;
        }

        const query = `type=update_name&id=${user.id}&new_name=${encodeURIComponent(newName)}`;
        fetch(`${GOOGLE_SCRIPT_URL}?${query}`, { mode: 'no-cors' })
            .then(() => {
                user.first_name = newName;
                localStorage.setItem('logged_user', JSON.stringify(user));
                if (btn) btn.textContent = 'Confirmed';
                setTimeout(() => {
                    ui.togglePopup();
                    if (btn) {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }
                }, 600);
            })
            .catch(e => {
                console.error('Update failure:', e);
                if (btn) {
                    btn.textContent = originalText;
                    btn.disabled = false;
                }
            });
    },

    showMemberArea: (user) => {
        const authSec = document.getElementById('auth-section');
        const sliderSec = document.getElementById('member-slider-section');
        const memberArea = document.getElementById('member-area');
        if (authSec) authSec.style.display = 'none';
        if (sliderSec) sliderSec.style.display = 'none';
        if (memberArea) memberArea.style.display = 'block';
        
        const menuTrigger = document.getElementById('main-menu-trigger');
        if (menuTrigger) {
            menuTrigger.style.display = 'flex';
            menuTrigger.onclick = ui.toggleMenu;
        }

        const profileTrigger = document.getElementById('user-profile-trigger');
        if (profileTrigger) {
            profileTrigger.style.display = 'flex';
            profileTrigger.onclick = ui.togglePopup;

            const photo = document.getElementById('user-photo');
            if (user.photo_url && photo) {
                photo.src = user.photo_url;
                photo.style.display = 'block';
            } else if (photo) {
                photo.style.display = 'none';
                profileTrigger.innerHTML = '<span style="font-size: 1.2rem;">👤</span>';
            }
        }
        const nameInput = document.getElementById('edit-name');
        if (nameInput) nameInput.value = user.first_name;
    },

    logout: () => {
        localStorage.removeItem('logged_user');
        window.location.reload();
    },

    loadWidget: () => {
        const container = document.getElementById('telegram-login-container');
        if (!container) return;

        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-login', BOT_USERNAME);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '0'); 
        script.setAttribute('data-onauth', 'auth.onTelegramAuth(user)');
        script.setAttribute('data-request-access', 'write');
        container.appendChild(script);
    },

    init: () => {
        ui.initListeners();
        const loggedUser = localStorage.getItem('logged_user');
        if (loggedUser) {
            try {
                auth.showMemberArea(JSON.parse(loggedUser));
            } catch(e) {
                localStorage.removeItem('logged_user');
                auth.loadWidget();
                ui.initSlider();
            }
        } else {
            auth.loadWidget();
            ui.initSlider();
        }
    }
};

document.addEventListener('DOMContentLoaded', auth.init);
