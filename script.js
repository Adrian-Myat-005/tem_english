// Tem English - Perfected Logic

const BOT_USERNAME = "Tem_english_bot"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXWYCkRbEtwsangwPvq5hxfkFoRCIYk_2_D3VDQm26BpoASeVgfkfm_HMu1dY77jTFmg/exec";

const ui = {
    togglePopup: () => {
        const popup = document.getElementById('profile-popup');
        const isVisible = popup.style.display === 'flex';
        popup.style.display = isVisible ? 'none' : 'flex';
        
        if (!isVisible) {
            setTimeout(() => document.getElementById('edit-name').focus(), 100);
        }
    },

    toggleMenu: () => {
        const popup = document.getElementById('main-menu-popup');
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
                if (profilePopup.style.display === 'flex') ui.togglePopup();
                if (menuPopup.style.display === 'flex') ui.toggleMenu();
            }
        });
    },

    initSlider: async () => {
        const track = document.getElementById('member-slider-track');
        const countBadge = document.getElementById('member-count');
        if (!track) return;

        try {
            const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=get_students`);
            const members = await response.json();
            
            if (members.length === 0) {
                document.getElementById('member-slider-section').style.display = 'none';
                return;
            }

            countBadge.textContent = `${members.length} MEMBERS JOINED`;
            const displayMembers = [...members, ...members, ...members];
            
            track.innerHTML = displayMembers.map(m => `
                <div class="member-profile">
                    <div class="member-photo-frame">
                        ${m.photo ? `<img src="${m.photo}" alt="${m.name}">` : `<span class="member-symbol">👤</span>`}
                    </div>
                    <span class="member-name">${m.name.split(' ')[0]}</span>
                </div>
            `).join('');

            const duration = Math.max(20, members.length * 5);
            track.style.animationDuration = `${duration}s`;
        } catch (e) {
            console.error('Slider load failed:', e);
            document.getElementById('member-slider-section').style.display = 'none';
        }
    }
};

const days = {
    currentQuestion: null,
    currentIndex: 0,
    score: 0,
    allDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

    start: () => {
        document.getElementById('days-section').style.display = 'flex';
        document.getElementById('days-lesson-selection').style.display = 'grid';
        document.getElementById('days-practice-area').style.display = 'none';
        document.getElementById('days-result-screen').style.display = 'none';
        document.getElementById('days-title').textContent = 'DAYS';
        const menu = document.getElementById('main-menu-popup');
        if (menu.style.display === 'flex') ui.toggleMenu();
    },

    close: () => {
        document.getElementById('days-section').style.display = 'none';
    },

    initLesson: (level) => {
        days.currentIndex = 0;
        days.score = 0;
        days.level = level; // 1: Tomorrow, 2: Yesterday, 0: Mixed

        const titles = ["MIXED ALL", "TOMORROW (+1)", "YESTERDAY (-1)"];
        document.getElementById('days-lesson-selection').style.display = 'none';
        document.getElementById('days-practice-area').style.display = 'block';
        document.getElementById('days-title').textContent = titles[level];

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
        
        // Generate 4 options
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
        optionsContainer.innerHTML = days.currentQuestion.options.map(opt => `
            <button class="tactile-button" onclick="days.checkAnswer(this, '${opt}')">${opt}</button>
        `).join('');

        const progress = ((days.currentIndex + 1) / 10) * 100;
        document.getElementById('days-progress-fill').style.width = `${progress}%`;
        document.getElementById('days-progress-text').textContent = `${days.currentIndex + 1} / 10`;
    },

    speakQuestion: () => {
        const msg = new SpeechSynthesisUtterance(days.currentQuestion.text);
        msg.lang = 'en-US';
        msg.rate = 0.75; // Slower for beginners
        window.speechSynthesis.speak(msg);
    },

    checkAnswer: (btn, choice) => {
        if (btn.parentElement.classList.contains('locked')) return;
        btn.parentElement.classList.add('locked');

        const isCorrect = choice === days.currentQuestion.answer;
        if (isCorrect) {
            days.score++;
            btn.classList.add('option-correct');
        } else {
            btn.classList.add('option-incorrect');
            // Show correct one
            Array.from(btn.parentElement.children).forEach(child => {
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
        document.getElementById('numbers-section').style.display = 'flex';
        document.getElementById('lesson-selection').style.display = 'grid';
        document.getElementById('flashcard-area').style.display = 'none';
        document.getElementById('result-screen').style.display = 'none';
        document.getElementById('lesson-title').textContent = 'NUMBERS';
        const menu = document.getElementById('main-menu-popup');
        if (menu.style.display === 'flex') ui.toggleMenu();
    },

    close: () => {
        document.getElementById('numbers-section').style.display = 'none';
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
        document.getElementById('lesson-title').textContent = titles[level];
        
        numbers.showCard();
    },

    showCard: () => {
        const num = numbers.currentLesson[numbers.currentIndex];
        const flashcard = document.getElementById('flashcard');
        
        numbers.isFlipped = false;
        flashcard.classList.remove('flipped');
        document.getElementById('card-controls').style.visibility = 'hidden';
        document.getElementById('card-number').textContent = num.toLocaleString();
        document.getElementById('card-text').textContent = numbers.toWords(num);
        
        const progress = ((numbers.currentIndex + 1) / 20) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = `${numbers.currentIndex + 1} / 20`;
    },

    flip: () => {
        if (numbers.isFlipped) return;
        numbers.isFlipped = true;
        document.getElementById('flashcard').classList.add('flipped');
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
        const text = document.getElementById('card-text').textContent;
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'en-US';
        msg.rate = 0.85; 
        window.speechSynthesis.speak(msg);
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
            .catch(e => console.error('Silent failure:', e));
    },

    updateName: () => {
        const user = JSON.parse(localStorage.getItem('logged_user'));
        const newName = document.getElementById('edit-name').value.trim();
        if (!newName) return;
        
        const btn = document.querySelector('.edit-name-group .tactile-button');
        const originalText = btn.textContent;
        btn.textContent = 'Updating...';
        btn.disabled = true;

        const query = `type=update_name&id=${user.id}&new_name=${encodeURIComponent(newName)}`;
        fetch(`${GOOGLE_SCRIPT_URL}?${query}`, { mode: 'no-cors' })
            .then(() => {
                user.first_name = newName;
                localStorage.setItem('logged_user', JSON.stringify(user));
                btn.textContent = 'Confirmed';
                setTimeout(() => {
                    ui.togglePopup();
                    btn.textContent = originalText;
                    btn.disabled = false;
                }, 600);
            })
            .catch(e => {
                console.error('Update failure:', e);
                btn.textContent = originalText;
                btn.disabled = false;
            });
    },

    showMemberArea: (user) => {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('member-slider-section').style.display = 'none';
        document.getElementById('member-area').style.display = 'block';
        
        document.getElementById('main-menu-trigger').style.display = 'flex';
        const trigger = document.getElementById('user-profile-trigger');
        trigger.style.display = 'flex';
        trigger.onclick = ui.togglePopup;

        if (user.photo_url) {
            document.getElementById('user-photo').src = user.photo_url;
        } else {
            document.getElementById('user-photo').style.display = 'none';
            trigger.innerHTML = '<span style="font-size: 1.2rem;">👤</span>';
        }
        document.getElementById('edit-name').value = user.first_name;
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
            auth.showMemberArea(JSON.parse(loggedUser));
        } else {
            auth.loadWidget();
            ui.initSlider();
        }
    }
};

document.addEventListener('DOMContentLoaded', auth.init);
