// Tem English - Telegram Auth & Management Logic

const BOT_USERNAME = "Tem_english_bot"; 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybpHhLYvsIvlZiEhdk5fTeHEP9yQwc_iC6ax_T2a68wj5S1H4qjAgSw8edg2vXm0o_cg/exec";

const ui = {
    togglePopup: () => {
        const popup = document.getElementById('profile-popup');
        popup.style.display = (popup.style.display === 'none') ? 'flex' : 'none';
    },
    initListeners: () => {
        // Close popup when clicking outside the content
        window.addEventListener('click', (e) => {
            const popup = document.getElementById('profile-popup');
            if (e.target === popup) {
                ui.togglePopup();
            }
        });
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
        // Ensure all data are strings for the URL
        const query = `id=${user.id}&first_name=${encodeURIComponent(user.first_name)}&username=${encodeURIComponent(user.username || '')}`;
        fetch(`${GOOGLE_SCRIPT_URL}?${query}`, { mode: 'no-cors' })
            .then(() => console.log('Auth data sent to Brain'))
            .catch(e => console.error('Error:', e));
    },

    updateName: () => {
        const user = JSON.parse(localStorage.getItem('logged_user'));
        const newName = document.getElementById('edit-name').value.trim();
        
        if (!newName) return alert('Please enter a name');
        
        const btn = document.querySelector('.edit-name-group .tactile-button');
        const originalText = btn.textContent;
        btn.textContent = 'SAVING...';
        btn.disabled = true;

        const query = `type=update_name&id=${user.id}&new_name=${encodeURIComponent(newName)}`;
        fetch(`${GOOGLE_SCRIPT_URL}?${query}`, { mode: 'no-cors' })
            .then(() => {
                user.first_name = newName;
                localStorage.setItem('logged_user', JSON.stringify(user));
                ui.togglePopup();
                btn.textContent = originalText;
                btn.disabled = false;
                alert('Name updated successfully!');
            })
            .catch(e => {
                console.error('Error:', e);
                btn.textContent = originalText;
                btn.disabled = false;
            });
    },

    showMemberArea: (user) => {
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('member-area').style.display = 'block';
        
        // Show profile trigger in top right
        const trigger = document.getElementById('user-profile-trigger');
        trigger.style.display = 'block';
        trigger.onclick = ui.togglePopup;

        if (user.photo_url) {
            document.getElementById('user-photo').src = user.photo_url;
        }
        
        document.getElementById('edit-name').value = user.first_name;
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
        ui.initListeners();
        const loggedUser = localStorage.getItem('logged_user');
        if (loggedUser) {
            auth.showMemberArea(JSON.parse(loggedUser));
        } else {
            auth.loadWidget();
        }
    }
};

document.addEventListener('DOMContentLoaded', auth.init);
