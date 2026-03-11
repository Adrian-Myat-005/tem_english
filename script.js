// Tem English - Telegram Auth & Management Logic

const BOT_USERNAME = "Tem_english_bot"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybpHhLYvsIvlZiEhdk5fTeHEP9yQwc_iC6ax_T2a68wj5S1H4qjAgSw8edg2vXm0o_cg/exec";

const auth = {
    onTelegramAuth: (user) => {
        if (user) {
            localStorage.setItem('logged_user', JSON.stringify(user));
            auth.registerStudent(user); 
            auth.showMemberArea(user);
        }
    },

    registerStudent: (user) => {
        // Ensure all data are strings for the URL
        const query = `id=${user.id}&first_name=${encodeURIComponent(user.first_name)}&username=${encodeURIComponent(user.username || '')}`;
        fetch(`${GOOGLE_SCRIPT_URL}?${query}`, { mode: 'no-cors' })
            .then(() => console.log('Auth data sent to Brain'))
            .catch(e => console.error('Error:', e));
    },

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
