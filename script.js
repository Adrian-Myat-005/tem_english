// Tem English - Perfected Logic

const BOT_USERNAME = "Tem_english_bot"; 
// Using the new confirmed URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwXWYCkRbEtwsangwPvq5hxfkFoRCIYk_2_D3VDQm26BpoASeVgfkfm_HMu1dY77jTFmg/exec";

const ui = {
    togglePopup: () => {
        const popup = document.getElementById('profile-popup');
        const isVisible = popup.style.display === 'flex';
        popup.style.display = isVisible ? 'none' : 'flex';
        
        // Focus the name input when opening
        if (!isVisible) {
            setTimeout(() => document.getElementById('edit-name').focus(), 100);
        }
    },

    toggleMenu: () => {
        const popup = document.getElementById('main-menu-popup');
        const isVisible = popup.style.display === 'flex';
        popup.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) ui.renderMenu('main');
    },

    renderMenu: (view) => {
        const container = document.getElementById('menu-container');
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
                        <button class="tactile-button">Numbers</button>
                        <button class="tactile-button">Days</button>
                    </div>
                `;
                break;
        }
        container.innerHTML = html;
    },
    
    initListeners: () => {
        // Close popup when clicking outside the content
        window.addEventListener('click', (e) => {
            const profilePopup = document.getElementById('profile-popup');
            const menuPopup = document.getElementById('main-menu-popup');
            if (e.target === profilePopup) ui.togglePopup();
            if (e.target === menuPopup) ui.toggleMenu();
        });

        // Close on ESC key
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

            // Duplicate the list to ensure smooth infinite scroll
            const displayMembers = [...members, ...members, ...members];
            
            track.innerHTML = displayMembers.map(m => `
                <div class="member-profile">
                    <div class="member-photo-frame">
                        ${m.photo ? `<img src="${m.photo}" alt="${m.name}">` : `<span class="member-symbol">👤</span>`}
                    </div>
                    <span class="member-name">${m.name.split(' ')[0]}</span>
                </div>
            `).join('');

            // Adjust animation speed based on count
            const duration = Math.max(20, members.length * 5);
            track.style.animationDuration = `${duration}s`;

        } catch (e) {
            console.error('Slider load failed:', e);
            document.getElementById('member-slider-section').style.display = 'none';
        }
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
        // Tactical background fetch
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
                
                // Visual feedback before closing
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
        
        const trigger = document.getElementById('user-profile-trigger');
        trigger.style.display = 'flex';
        trigger.onclick = ui.togglePopup;

        const menuTrigger = document.getElementById('main-menu-trigger');
        menuTrigger.style.display = 'flex';
        menuTrigger.onclick = ui.toggleMenu;

        if (user.photo_url) {
            document.getElementById('user-photo').src = user.photo_url;
        } else {
            // Placeholder if no photo
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
