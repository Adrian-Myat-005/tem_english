// Tem English - Telegram Auth & Management Logic

const BOT_USERNAME = "Tem_english_bot"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybpHhLYvsIvlZiEhdk5fTeHEP9yQwc_iC6ax_T2a68wj5S1H4qjAgSw8edg2vXm0o_cg/exec";

const auth = {
    // 1. Handle the Telegram Auth Response
    onTelegramAuth: (user) => {
        if (user) {
            localStorage.setItem('logged_user', JSON.stringify(user));
            auth.registerStudent(user); // Save to Google Brain
            auth.showMemberArea(user);
        }
    },

    // 2. Send student data to your Google Apps Script "Brain"
    registerStudent: (user) => {
        const params = new URLSearchParams(user).toString();
        fetch(`${GOOGLE_SCRIPT_URL}?${params}`, { mode: 'no-cors' })
            .then(() => console.log('Student registered in Brain'))
            .catch(error => console.error('Error registering student:', error));
    },

    // 3. Update the UI for the Student
    showMemberArea: (user) => {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('member-area').style.display = 'block';
        
        document.getElementById('welcome-msg').textContent = `WELCOME, ${user.first_name.toUpperCase()}`;
        
        if (user.photo_url) {
            const photoImg = document.getElementById('user-photo');
            photoImg.src = user.photo_url;
            photoImg.style.display = 'inline-block';
        }
    },

    logout: () => {
        localStorage.removeItem('logged_user');
        window.location.reload();
    },

    loadWidget: () => {
        const container = document.getElementById('telegram-login-container');
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
        const loggedUser = localStorage.getItem('logged_user');
        if (loggedUser) {
            auth.showMemberArea(JSON.parse(loggedUser));
        } else {
            auth.loadWidget();
        }
    }
};

document.addEventListener('DOMContentLoaded', auth.init);
