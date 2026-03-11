// Tem English - Ultimate Stability & Professional Grade
// 100% Robustness & Device Responsive

(function() {
    "use strict";

    const BOT_USERNAME = "Tem_english_bot"; 
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxTztosNbOnTP8St-G_xZfCYC_h7PplZGaVTlnwtpjPfsYiS0eqX4MRwt3SjCxFCY_H-A/exec";

    const ui = {
        get: (id) => document.getElementById(id),
        
        togglePopup: () => {
            const popup = ui.get('profile-popup');
            if (!popup) return;
            const isVisible = popup.style.display === 'flex';
            popup.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) {
                const input = ui.get('edit-name');
                if (input) setTimeout(() => input.focus(), 150);
            }
        },

        toggleMenu: () => {
            const popup = ui.get('main-menu-popup');
            if (!popup) return;
            const isVisible = popup.style.display === 'flex';
            popup.style.display = isVisible ? 'none' : 'flex';
            if (!isVisible) ui.renderMenu('main');
        },

        renderMenu: (view) => {
            const container = ui.get('menu-container');
            if (!container) return;
            let html = '';

            switch(view) {
                case 'main':
                    html = `
                        <div class="menu-list">
                            <button class="tactile-button" onclick="ui.renderMenu('tools')">Tools</button>
                        </div>
                    `;
                    break;
                case 'tools':
                    html = `
                        <div class="menu-header">
                            <button class="back-button" onclick="ui.renderMenu('main')">←</button>
                            <span class="member-name">Tools</span>
                        </div>
                        <div class="menu-list">
                            <button class="tactile-button" onclick="ui.renderMenu('beginner_tools')">Beginner Tools</button>
                        </div>
                    `;
                    break;
                case 'beginner_tools':
                    html = `
                        <div class="menu-header">
                            <button class="back-button" onclick="ui.renderMenu('tools')">←</button>
                            <span class="member-name">Beginner Tools</span>
                        </div>
                        <div class="menu-list">
                            <button class="tactile-button" onclick="numbers.start()">Numbers</button>
                            <button class="tactile-button" onclick="days.start()">Days</button>
                        </div>
                    `;
                    break;
            }
            container.innerHTML = html;
        },
        
        initListeners: () => {
            window.addEventListener('click', (e) => {
                const profilePopup = ui.get('profile-popup');
                const menuPopup = ui.get('main-menu-popup');
                if (e.target === profilePopup) ui.togglePopup();
                if (e.target === menuPopup) ui.toggleMenu();
            });

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (ui.get('profile-popup')?.style.display === 'flex') ui.togglePopup();
                    if (ui.get('main-menu-popup')?.style.display === 'flex') ui.toggleMenu();
                    if (ui.get('days-section')?.style.display === 'flex') days.close();
                    if (ui.get('numbers-section')?.style.display === 'flex') numbers.close();
                }
            });
        },

        initSlider: async () => {
            const track = ui.get('member-slider-track');
            const slideMemberCount = ui.get('slide-member-count');
            const sliderSection = ui.get('member-slider-section');
            const strengthSection = ui.get('strength-slides');
            
            if (!track || !sliderSection) return;

            try {
                const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=get_students`);
                const members = await response.json();
                
                if (!members || members.length === 0) {
                    if (sliderSection) sliderSection.style.display = 'none';
                    if (strengthSection) strengthSection.style.display = 'none';
                    return;
                }

                if (slideMemberCount) {
                    slideMemberCount.textContent = `${members.length} MEMBERS`;
                }

                const displayMembers = [...members, ...members, ...members];
                track.innerHTML = displayMembers.map(m => `
                    <div class="member-profile">
                        <div class="member-photo-frame">
                            ${m.photo ? `<img src="${m.photo}" alt="${m.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                            <span class="member-symbol" style="display: ${m.photo ? 'none' : 'block'}">👤</span>
                        </div>
                        <span class="member-name">${(m.name || 'User').split(' ')[0]}</span>
                    </div>
                `).join('');
                const duration = Math.max(15, members.length * 4);
                track.style.animationDuration = `${duration}s`;
                
                ui.initStrengthSlides();
            } catch (e) {
                if (sliderSection) sliderSection.style.display = 'none';
                if (strengthSection) strengthSection.style.display = 'none';
            }
        },

        initStrengthSlides: () => {
            const wrapper = ui.get('slides-wrapper');
            const indicators = document.querySelectorAll('.indicator');
            if (!wrapper || !indicators.length) return;

            const updateIndicators = () => {
                const index = Math.round(wrapper.scrollLeft / wrapper.offsetWidth);
                indicators.forEach((ind, i) => {
                    ind.classList.toggle('active', i === index);
                });
            };

            wrapper.addEventListener('scroll', updateIndicators);

            // Auto-slide every 6 seconds
            let slideInterval = setInterval(() => {
                const index = Math.round(wrapper.scrollLeft / wrapper.offsetWidth);
                const nextIndex = (index + 1) % indicators.length;
                wrapper.scrollTo({
                    left: nextIndex * wrapper.offsetWidth,
                    behavior: 'smooth'
                });
            }, 6000);

            // Pause auto-slide on user interaction
            wrapper.addEventListener('touchstart', () => clearInterval(slideInterval), { passive: true });
        }
    };

    const blog = {
        init: async () => {
            const container = ui.get('blog-feed');
            if (!container) return;
            container.innerHTML = '<div class="card" style="text-align:center;"><p class="hero-text">SYNCING UPDATES...</p></div>';
            
            try {
                // Use standard redirect following for Google Script Web App
                const timestamp = new Date().getTime();
                const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=get_blog_posts&t=${timestamp}`, {
                    method: 'GET',
                    redirect: 'follow'
                });
                
                if (!response.ok) throw new Error('Network response was not ok');
                
                const posts = await response.json();
                blog.render(posts);
            } catch (e) {
                console.error('Blog Sync Error:', e);
                container.innerHTML = '<div class="card" style="text-align:center;"><p class="hero-text">UNABLE TO SYNC</p></div>';
            }
        },

        render: (posts) => {
            const container = ui.get('blog-feed');
            if (!container || !posts) return;
            if (posts.length === 0) {
                container.innerHTML = '<div class="card" style="text-align:center;"><p class="hero-text">NO RECENT UPDATES</p></div>';
                return;
            }
            container.innerHTML = posts.map(post => {
                const youtubeId = blog.getYoutubeId(post.image);
                const mediaHtml = youtubeId ? `
                    <div class="video-container">
                        <iframe src="https://www.youtube.com/embed/${youtubeId}" allowfullscreen></iframe>
                    </div>
                ` : `
                    <div class="post-image-container">
                        <img src="${post.image}" alt="Update Image" onerror="this.src='https://placehold.co/400x400?text=IMAGE+EXPIRED'">
                    </div>
                `;

                return `
                <div class="feed-post card">
                    <div class="post-header">
                        <div class="post-user-photo" style="background: #eee; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            <span style="font-size: 0.8rem; font-weight:700;">TE</span>
                        </div>
                        <div class="post-user-info">
                            <span class="post-username">ADMINISTRATOR</span>
                            <span class="post-time">${post.date}</span>
                        </div>
                    </div>
                    ${mediaHtml}
                    <div class="post-caption" style="padding: 20px 15px;">
                        ${post.caption.replace(/\n/g, '<br>')}
                    </div>
                </div>
            `;}).join('');
        },

        getYoutubeId: (url) => {
            if (!url) return null;
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            return (match && match[2].length === 11) ? match[2] : null;
        }
    };

    const days = {
        currentQuestion: null,
        currentIndex: 0,
        score: 0,
        level: 0,
        totalQuestions: 20, 
        allDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

        start: () => {
            const section = ui.get('days-section');
            if (!section) return;
            section.style.display = 'flex';
            ui.get('days-lesson-selection').style.display = 'grid';
            ui.get('days-practice-area').style.display = 'none';
            ui.get('days-result-screen').style.display = 'none';
            ui.get('days-title').textContent = 'DAYS PRACTICE';
            ui.toggleMenu();
        },

        close: () => {
            const section = ui.get('days-section');
            if (section) section.style.display = 'none';
            window.speechSynthesis.cancel();
        },

        initLesson: (level) => {
            days.currentIndex = 0;
            days.score = 0;
            days.level = level; 
            const titles = ["MIXED ALL", "TOMORROW (+1)", "YESTERDAY (-1)"];
            ui.get('days-lesson-selection').style.display = 'none';
            ui.get('days-practice-area').style.display = 'block';
            ui.get('days-title').textContent = titles[level] || "DAYS";
            days.nextQuestion();
        },

        nextQuestion: () => {
            const todayIndex = Math.floor(Math.random() * 7);
            const today = days.allDays[todayIndex];
            let relation = days.level === 1 ? "tomorrow" : (days.level === 2 ? "yesterday" : (Math.random() > 0.5 ? "tomorrow" : "yesterday"));
            let correctIndex = relation === "tomorrow" ? (todayIndex + 1) % 7 : (todayIndex - 1 + 7) % 7;
            const correctAnswer = days.allDays[correctIndex];
            const options = [correctAnswer];
            while (options.length < 4) {
                const randomDay = days.allDays[Math.floor(Math.random() * 7)];
                if (!options.includes(randomDay)) options.push(randomDay);
            }
            options.sort(() => 0.5 - Math.random());
            days.currentQuestion = { today, relation, answer: correctAnswer, options, text: `Today is ${today}. What day is ${relation}?` };
            days.renderQuestion();
            setTimeout(() => days.speakQuestion(), 400);
        },

        renderQuestion: () => {
            const container = ui.get('days-options');
            if (!container) return;
            container.classList.remove('locked');
            container.innerHTML = days.currentQuestion.options.map(opt => `
                <button class="tactile-button" onclick="days.checkAnswer(this, '${opt}')">${opt}</button>
            `).join('');
            const progress = ((days.currentIndex + 1) / days.totalQuestions) * 100;
            if (ui.get('days-progress-fill')) ui.get('days-progress-fill').style.width = `${progress}%`;
            if (ui.get('days-progress-text')) ui.get('days-progress-text').textContent = `${days.currentIndex + 1} / ${days.totalQuestions}`;
        },

        speakQuestion: () => {
            if (!days.currentQuestion || ui.get('days-section')?.style.display === 'none') return;
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(days.currentQuestion.text);
            msg.lang = 'en-US';
            msg.rate = 0.7; 
            window.speechSynthesis.speak(msg);
        },

        checkAnswer: (btn, choice) => {
            const container = ui.get('days-options');
            if (!container || container.classList.contains('locked')) return;
            container.classList.add('locked');
            const isCorrect = choice === days.currentQuestion.answer;
            if (isCorrect) {
                days.score++;
                btn.classList.add('option-correct');
            } else {
                btn.classList.add('option-incorrect');
                Array.from(container.children).forEach(child => {
                    if (child.textContent === days.currentQuestion.answer) child.classList.add('option-correct');
                });
            }
            setTimeout(() => {
                if (ui.get('days-section')?.style.display === 'none') return;
                days.currentIndex++;
                if (days.currentIndex < days.totalQuestions) days.nextQuestion();
                else days.showResult();
            }, 1200);
        },

        showResult: () => {
            ui.get('days-practice-area').style.display = 'none';
            ui.get('days-result-screen').style.display = 'block';
            ui.get('days-final-score').textContent = `${days.score} / ${days.totalQuestions}`;
            let msg = days.score === days.totalQuestions ? "PERFECT! You are a master of days." : (days.score >= (days.totalQuestions * 0.8) ? "Excellent! You've almost got it!" : "Keep practicing!");
            ui.get('days-result-msg').textContent = msg;
        }
    };

    const numbers = {
        currentLesson: [], currentIndex: 0, score: 0, isFlipped: false,

        start: () => {
            const section = ui.get('numbers-section');
            if (!section) return;
            section.style.display = 'flex';
            ui.get('lesson-selection').style.display = 'grid';
            ui.get('flashcard-area').style.display = 'none';
            ui.get('result-screen').style.display = 'none';
            ui.get('lesson-title').textContent = 'NUMBERS PRACTICE';
            ui.toggleMenu();
        },

        close: () => {
            const section = ui.get('numbers-section');
            if (section) section.style.display = 'none';
            window.speechSynthesis.cancel();
        },

        initLesson: (level) => {
            const pool = [];
            const titles = ["MIXED ALL", "2-DIGITS", "HUNDREDS", "THOUSANDS", "10-THOUSANDS", "100-THOUSANDS"];
            const countToGenerate = (level === 1) ? 80 : 100;
            
            for (let i = 0; i < countToGenerate; i++) {
                let num;
                let attempts = 0;
                do {
                    attempts++;
                    switch(level) {
                        case 1: num = Math.floor(10 + Math.random() * 90); break;
                        case 2: num = Math.floor(100 + Math.random() * 900); break;
                        case 3: num = Math.floor(1000 + Math.random() * 9000); break;
                        case 4: num = Math.floor(10000 + Math.random() * 90000); break;
                        case 5: num = Math.floor(100000 + Math.random() * 900000); break;
                        default: num = Math.floor(10 + Math.random() * 999990); break;
                    }
                } while (pool.includes(num) && attempts < 10);
                pool.push(num);
            }

            numbers.currentLesson = pool.sort(() => 0.5 - Math.random()).slice(0, 20);
            numbers.currentIndex = 0; numbers.score = 0; numbers.isFlipped = false;
            ui.get('lesson-selection').style.display = 'none';
            ui.get('flashcard-area').style.display = 'block';
            ui.get('lesson-title').textContent = titles[level] || "NUMBERS";
            numbers.showCard();
        },

        showCard: () => {
            const num = numbers.currentLesson[numbers.currentIndex];
            const flashcard = ui.get('flashcard');
            if (!flashcard) return;
            numbers.isFlipped = false;
            flashcard.classList.remove('flipped');
            ui.get('card-controls').style.visibility = 'hidden';
            ui.get('card-number').textContent = num.toLocaleString();
            ui.get('card-text').textContent = numbers.toWords(num);
            const progress = ((numbers.currentIndex + 1) / 20) * 100;
            if (ui.get('progress-fill')) ui.get('progress-fill').style.width = `${progress}%`;
            if (ui.get('progress-text')) ui.get('progress-text').textContent = `${numbers.currentIndex + 1} / 20`;
        },

        flip: () => {
            if (numbers.isFlipped) return;
            numbers.isFlipped = true;
            ui.get('flashcard')?.classList.add('flipped');
            ui.get('card-controls').style.visibility = 'visible';
            setTimeout(() => numbers.speak(), 350);
        },

        next: (isPass) => {
            if (isPass) numbers.score++;
            numbers.currentIndex++;
            if (numbers.currentIndex < 20) numbers.showCard();
            else numbers.showResult();
        },

        showResult: () => {
            ui.get('flashcard-area').style.display = 'none';
            ui.get('result-screen').style.display = 'block';
            ui.get('final-score').textContent = `${numbers.score} / 20`;
            let msg = numbers.score === 20 ? "PERFECT! Absolute mastery." : (numbers.score >= 16 ? "Great job! You're getting fast!" : "Keep practicing!");
            ui.get('result-msg').textContent = msg;
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
            if (ui.get('numbers-section')?.style.display === 'none') return;
            const text = ui.get('card-text')?.textContent;
            if (!text) return;
            window.speechSynthesis.cancel();
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'en-US';
            msg.rate = 0.8; 
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
            const query = `type=login&id=${user.id}&first_name=${encodeURIComponent(user.first_name)}&username=${encodeURIComponent(user.username || '')}&photo_url=${encodeURIComponent(user.photo_url || '')}`;
            fetch(`${GOOGLE_SCRIPT_URL}?${query}`, { mode: 'no-cors' }).catch(() => {});
        },

        updateName: () => {
            const user = JSON.parse(localStorage.getItem('logged_user') || '{}');
            const newName = ui.get('edit-name')?.value.trim();
            if (!newName || !user.id) return;
            const btn = document.querySelector('.edit-name-group .tactile-button');
            if (btn) { btn.textContent = 'Updating...'; btn.disabled = true; }
            fetch(`${GOOGLE_SCRIPT_URL}?type=update_name&id=${user.id}&new_name=${encodeURIComponent(newName)}`, { mode: 'no-cors' })
                .then(() => {
                    user.first_name = newName;
                    localStorage.setItem('logged_user', JSON.stringify(user));
                    if (btn) btn.textContent = 'Confirmed';
                    setTimeout(() => { ui.togglePopup(); if (btn) { btn.textContent = 'Confirm Update'; btn.disabled = false; } }, 600);
                }).catch(() => { if (btn) { btn.textContent = 'Confirm Update'; btn.disabled = false; } });
        },

        showMemberArea: (user) => {
            if (ui.get('auth-section')) ui.get('auth-section').style.display = 'none';
            if (ui.get('strength-slides')) ui.get('strength-slides').style.display = 'none';
            if (ui.get('member-slider-section')) ui.get('member-slider-section').style.display = 'none';
            if (ui.get('member-area')) ui.get('member-area').style.display = 'block';
            if (ui.get('main-menu-trigger')) { ui.get('main-menu-trigger').style.display = 'flex'; ui.get('main-menu-trigger').onclick = ui.toggleMenu; }
            const pt = ui.get('user-profile-trigger');
            if (pt) {
                pt.style.display = 'flex'; pt.onclick = ui.togglePopup;
                const photo = ui.get('user-photo');
                if (user.photo_url && photo) { photo.src = user.photo_url; photo.style.display = 'block'; }
                else if (photo) { photo.style.display = 'none'; pt.innerHTML = '<span style="font-size: 1.2rem;">👤</span>'; }
            }
            if (ui.get('edit-name')) ui.get('edit-name').value = user.first_name;
            blog.init();
        },

        logout: () => { localStorage.removeItem('logged_user'); window.location.reload(); },

        loadWidget: () => {
            const container = ui.get('telegram-login-container');
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
                try { auth.showMemberArea(JSON.parse(loggedUser)); }
                catch(e) { localStorage.removeItem('logged_user'); auth.loadWidget(); ui.initSlider(); }
            } else { auth.loadWidget(); ui.initSlider(); }
        }
    };

    window.ui = ui;
    window.blog = blog;
    window.days = days;
    window.numbers = numbers;
    window.auth = auth;

    document.addEventListener('DOMContentLoaded', auth.init);

})();
