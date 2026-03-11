// Tem English - Telegram Auth Logic

const BOT_USERNAME = "Tem_english_bot"; // Your bot's username

const auth = {
    // This function is called automatically by the Telegram Widget
    onTelegramAuth: (user) => {
        if (user) {
            localStorage.setItem('logged_user', JSON.stringify(user));
            auth.showMemberArea(user);
        }
    },

    showMemberArea: (user) => {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('member-area').style.display = 'block';
        
        // Welcome by First Name
        document.getElementById('welcome-msg').textContent = `WELCOME, ${user.first_name.toUpperCase()}`;
        
        // Show Profile Photo if available
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
        script.setAttribute('data-radius', '0'); // Square to match tactile style
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
