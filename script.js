// Tem English - Telegram Auth & Management Logic

const BOT_USERNAME = "Tem_english_bot"; 
const BOT_TOKEN = "8738017008:AAE8pb--I9oZoMrzZaKNLS97UThQeFk5LZk";
const MY_CHAT_ID = "6172408005";

const auth = {
    // 1. Handle the Telegram Auth Response
    onTelegramAuth: (user) => {
        if (user) {
            localStorage.setItem('logged_user', JSON.stringify(user));
            auth.notifyAdmin(user); // Send notification to YOU
            auth.showMemberArea(user);
        }
    },

    // 2. Notify YOU (the Admin) via Telegram Bot
    notifyAdmin: (user) => {
        const message = `🔔 *New Student Joined!*%0A%0A` +
                        `👤 Name: ${user.first_name} ${user.last_name || ''}%0A` +
                        `🆔 Username: @${user.username || 'N/A'}%0A` +
                        `🔗 ID: ${user.id}`;

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${MY_CHAT_ID}&text=${message}&parse_mode=Markdown`)
            .then(response => console.log('Admin notified'))
            .catch(error => console.error('Error notifying admin:', error));
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
