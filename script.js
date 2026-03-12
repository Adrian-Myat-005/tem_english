// Tem English - Ultimate Stability & Professional Grade
// 100% Robustness & Device Responsive

(function() {
    "use strict";

    const BOT_USERNAME = "Tem_english_bot"; 
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwreCxhjscVkc24maOmCWBGQkeNNhNmZpng3ntxs34ssV-WjDRlPp9V3-tSTwTY454lMw/exec";

    const ui = {
        get: (id) => document.getElementById(id),
        
        toggleTheme: () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        },
        
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

        switchView: (viewName) => {
            // Toggle Views
            document.querySelectorAll('.tab-view').forEach(view => view.style.display = 'none');
            const targetView = ui.get(`view-${viewName}`);
            if (targetView) targetView.style.display = 'block';

            // Toggle Tabs
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            const targetTab = ui.get(`tab-${viewName}`);
            if (targetTab) targetTab.classList.add('active');

            // View Specific Logic
            if (viewName === 'blogs') blog.init();
            if (viewName === 'friends') ui.renderFriends();
            if (viewName === 'tools') ui.renderTools();
        },

        renderFriends: async () => {
            const container = ui.get('friends-list');
            if (!container) return;
            container.innerHTML = '<div class="card" style="text-align:center;"><p class="hero-text">FINDING FRIENDS...</p></div>';

            try {
                const response = await fetch(`${GOOGLE_SCRIPT_URL}?type=get_students`);
                const friends = await response.json();

                if (!friends || friends.length === 0) {
                    container.innerHTML = '<div class="card" style="text-align:center;"><p class="hero-text">ALONE FOR NOW</p></div>';
                    return;
                }

                container.innerHTML = friends.map(f => {
                    const dmUrl = f.username && f.username !== 'N/A' 
                        ? `https://t.me/${f.username}` 
                        : `tg://user?id=${f.id}`;
                    
                    return `
                    <div class="friend-row">
                        <img class="friend-photo" src="${f.photo || 'https://placehold.co/100x100?text=👤'}" alt="${f.name}" onerror="this.src='https://placehold.co/100x100?text=👤'">
                        <div class="friend-info">
                            <span class="friend-name">${f.name}</span>
                            <span class="friend-status">ACTIVE</span>
                        </div>
                        <button class="tactile-button small-button dm-btn" onclick="window.open('${dmUrl}', '_blank')">💬 DM</button>
                    </div>
                    `;
                }).join('');
            } catch (e) {
                container.innerHTML = '<div class="card" style="text-align:center;"><p class="hero-text">UNABLE TO CONNECT</p></div>';
            }
        },

        renderTools: () => {
            const container = ui.get('tools-container');
            if (!container) return;
            container.innerHTML = `
                <button class="tactile-button" onclick="numbers.start()">Numbers Practice</button>
                <button class="tactile-button" onclick="days.start()">Days Practice</button>
                <button class="tactile-button" onclick="prepositions.start()">Preposition Practice</button>
                <button class="tactile-button" onclick="sentences.start()">Sentence Builder</button>
            `;
        },

        initListeners: () => {
            window.addEventListener('click', (e) => {
                const profilePopup = ui.get('profile-popup');
                if (e.target === profilePopup) ui.togglePopup();
            });

            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (ui.get('profile-popup')?.style.display === 'flex') ui.togglePopup();
                    if (ui.get('days-section')?.style.display === 'flex') days.close();
                    if (ui.get('numbers-section')?.style.display === 'flex') numbers.close();
                    if (ui.get('sentences-section')?.style.display === 'flex') sentences.close();
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

    const prepositions = {
        lessons: [
            { word: "About", pure_example: "I am thinking about my future. (ကျွန်တော် ကျွန်တော့်ရဲ့ အနာဂတ်အကြောင်းကို စဉ်းစားနေပါတယ်။)", notes: "<h3>1. Subject Matter (အကြောင်းအရာ)</h3><p>တစ်ခုခု သို့မဟုတ် တစ်စုံတစ်ယောက်၏ အကြောင်းကို ဖော်ပြရာတွင် သုံးသည်။ (e.g., A book about animals.)</p><h3>2. Approximation (ခန့်မှန်းခြေ)</h3><p>အရေအတွက်၊ အချိန် သို့မဟုတ် အတိုင်းအတာတစ်ခုကို အတိအကျမဟုတ်ဘဲ နီးစပ်ရာ ခန့်မှန်းပြောဆိုရာတွင် သုံးသည်။ (e.g., About 5 o'clock.)</p><h3>3. Movement in Area (ဟိုဟိုဒီဒီ)</h3><p>နေရာတစ်ခုအတွင်း ဦးတည်ချက်မရှိဘဲ လှုပ်ရှားသွားလာခြင်းကို ပြသည်။ (e.g., Walking about the town.)</p><h3>4. Presence/Quality (ရှိနေခြင်း/အရည်အသွေး)</h3><p>တစ်စုံတစ်ယောက်တွင် ရှိနေသော အငွေ့အသက် သို့မဟုတ် ဝိသေသကို ဖော်ပြရာတွင်လည်း သုံးတတ်သည်။ (e.g., There is something strange about him.)</p>", exercises: [{"options": ["I am thinking about my future.", "I am thinking on my future.", "I am thinking at my future."], "answer": "I am thinking about my future."}, {"options": ["It is about 10 miles from here.", "It is above 10 miles from here.", "It is across 10 miles from here."], "answer": "It is about 10 miles from here."}, {"options": ["Stop running about the room.", "Stop running against the room.", "Stop running among the room."], "answer": "Stop running about the room."}] },
            { word: "Above", pure_example: "The plane is flying above the clouds. (လေယာဉ်ပျံဟာ တိမ်တွေရဲ့ အပေါ်ဘက်မှာ ပျံသန်းနေပါတယ်။)", notes: "<h3>1. Higher Position (အထက်ဘက်)</h3><p>အရာဝတ္ထုတစ်ခု၏ အပေါ်ဘက် တည့်တည့် သို့မဟုတ် မြင့်သောနေရာတွင် ရှိနေခြင်း (ထိကပ်မနေရပါ)။</p><h3>2. Superiority/Rank (အဆင့်အတန်း)</h3><p>အရေအတွက်၊ အရည်အချင်း သို့မဟုတ် အဆင့်အတန်း ပိုမိုမြင့်မားခြင်းကို ပြသည်။ (e.g., Captain is above Lieutenant.)</p><h3>3. Measurement (အတိုင်းအတာ)</h3><p>သတ်မှတ်ချက်တစ်ခုထက် ပို၍ များပြားခြင်းကို ဖော်ပြရာတွင် သုံးသည်။ (e.g., Temperatures above average.)</p>", exercises: [{"options": ["The plane is flying above the clouds.", "The plane is flying on the clouds.", "The plane is flying about the clouds."], "answer": "The plane is flying above the clouds."}, {"options": ["His work is above average.", "His work is about average.", "His work is across average."], "answer": "His work is above average."}, {"options": ["He lives in the flat above us.", "He lives in the flat across us.", "He lives in the flat along us."], "answer": "He lives in the flat above us."}] },
            { word: "Across", pure_example: "We walked across the bridge. (ကျွန်တော်တို့ တံတားကို ဖြတ်ပြီး လမ်းလျှောက်ခဲ့ကြပါတယ်။)", notes: "<h3>1. Movement (ဖြတ်သန်းခြင်း)</h3><p>တစ်ဖက်မှ အခြားတစ်ဖက်သို့ ဖြတ်ကျော်သွားခြင်း။ (e.g., Swim across the river.)</p><h3>2. Opposite Side (တစ်ဖက်ခြမ်း)</h3><p>လမ်း သို့မဟုတ် မြစ်၏ တစ်ဖက်တစ်ချက်တွင် ရှိနေခြင်း။ (e.g., The house across the street.)</p><h3>3. Extension (ပျံ့နှံ့မှု)</h3><p>ဧရိယာတစ်ခုလုံး သို့မဟုတ် မျက်နှာပြင်တစ်ခုလုံးကို လွှမ်းခြုံထားခြင်း။ (e.g., A smile across her face.)</p>", exercises: [{"options": ["We walked across the bridge.", "We walked along the bridge.", "We walked against the bridge."], "answer": "We walked across the bridge."}, {"options": ["The bank is across the street.", "The bank is among the street.", "The bank is above the street."], "answer": "The bank is across the street."}, {"options": ["He drew a line across the page.", "He drew a line along the page.", "He drew a line about the page."], "answer": "He drew a line across the page."}] },
            { word: "Against", pure_example: "He is leaning against the wall. (သူ နံရံကို မှီထားပါတယ်။)", notes: "<h3>1. Physical Contact (မှီထားခြင်း)</h3><p>နံရံ သို့မဟုတ် အရာတစ်ခုကို အားပြု၍ မှီထားခြင်း သို့မဟုတ် ထိကပ်နေခြင်း။</p><h3>2. Opposition (ဆန့်ကျင်ခြင်း)</h3><p>အယူအဆ၊ စည်းကမ်း သို့မဟုတ် ပြိုင်ပွဲတစ်ခုတွင် ဆန့်ကျင်ဘက်ဖြစ်နေခြင်း။ (e.g., Against the rules.)</p><h3>3. Competition (ယှဉ်ပြိုင်ခြင်း)</h3><p>တစ်ဖက်နှင့်တစ်ဖက် ယှဉ်ပြိုင်ကစားရာတွင် သုံးသည်။ (e.g., Playing against a champion.)</p><h3>4. Protection (ကာကွယ်ခြင်း)</h3><p>ဘေးအန္တရာယ်တစ်ခုခုကို ကာကွယ်ရန် သုံးသည်။ (e.g., Injection against flu.)</p>", exercises: [{"options": ["He is leaning against the wall.", "He is leaning along the wall.", "He is leaning above the wall."], "answer": "He is leaning against the wall."}, {"options": ["Are you against this plan?", "Are you across this plan?", "Are you around this plan."], "answer": "Are you against this plan?"}, {"options": ["They are playing against a strong team.", "They are playing along a strong team.", "They are playing about a strong team."], "answer": "They are playing against a strong team."}] },
            { word: "Along", pure_example: "We walked along the beach. (ကျွန်တော်တို့ ကမ်းခြေတစ်လျှောက် လမ်းလျှောက်ခဲ့ကြပါတယ်။)", notes: "<h3>1. Parallel Movement (တစ်လျှောက်)</h3><p>လမ်း၊ မြစ် သို့မဟုတ် အရာတစ်ခု၏ အလျားအတိုင်း ဘေးမှ ယှဉ်လျက်သွားခြင်း။</p><h3>2. Position (တစ်လျှောက်ရှိနေရာ)</h3><p>အလျားလိုက် တန်းစီလျက် ရှိနေသော အနေအထား။ (e.g., Houses along the river.)</p><h3>3. Progress (တိုးတက်မှု)</h3><p>အစီအစဉ် သို့မဟုတ် အလုပ်တစ်ခု ရှေ့သို့ရောက်ရှိနေခြင်း။ (e.g., Getting along well.)</p>", exercises: [{"options": ["We walked along the beach.", "We walked across the beach.", "We walked against the beach."], "answer": "We walked along the beach."}, {"options": ["Trees are planted along the road.", "Trees are planted among the road.", "Trees are planted above the road."], "answer": "Trees are planted along the road."}, {"options": ["The boat moved along the river.", "The boat moved about the river.", "The boat moved across the river."], "answer": "The boat moved along the river."}] },
            { word: "Among", pure_example: "She sat among her friends. (သူမဟာ သူမရဲ့ သူငယ်ချင်းတွေကြားမှာ ထိုင်နေပါတယ်။)", notes: "<h3>1. In a Group (အကြား/အလယ်)</h3><p>လူ သို့မဟုတ် အရာဝတ္ထု (၃) ခုနှင့်အထက် ရှိသော အုပ်စုတစ်ခု၏ အလယ် သို့မဟုတ် အကြားတွင် ရှိနေခြင်း။</p><h3>2. Distribution (ခွဲဝေခြင်း)</h3><p>အုပ်စုဝင်များကြားထဲတွင် နှံ့စပ်အောင် လုပ်ဆောင်ခြင်း။ (e.g., Divide it among yourselves.)</p><h3>3. Inclusion (ပါဝင်ခြင်း)</h3><p>အစုအဝေးတစ်ခု၏ အစိတ်အပိုင်းဖြစ်နေခြင်း။ (e.g., He was among the survivors.)</p>", exercises: [{"options": ["She sat among her friends.", "She sat between her friends.", "She sat along her friends."], "answer": "She sat among her friends."}, {"options": ["Divide the sweets among the children.", "Divide the sweets between the children.", "Divide the sweets against the children."], "answer": "Divide the sweets among the children."}, {"options": ["I found a letter among the books.", "I found a letter along the books.", "I found a letter above the books."], "answer": "I found a letter among the books."}] },
            { word: "Around", pure_example: "The earth moves around the sun. (ကမ္ဘာဟာ နေကို ပတ်ပြီး သွားနေပါတယ်။)", notes: "<h3>1. Circular Movement (ပတ်ပတ်လည်)</h3><p>ဗဟိုချက်တစ်ခုကို ဝန်းရံ၍ လှည့်ပတ်ခြင်း သို့မဟုတ် ဝန်းရံခြင်း။</p><h3>2. Approximate Time/Place (ဝန်းကျင်)</h3><p>အချိန် သို့မဟုတ် နေရာတစ်ခု၏ အနီးအနားတွင် ရှိနေခြင်း။ (e.g., Around 6 o'clock.)</p><h3>3. Distribution in Space (ဟိုဟိုဒီဒီ ပျံ့နှံ့ခြင်း)</h3><p>နေရာအမျိုးမျိုးတွင် ရှိနေခြင်း သို့မဟုတ် သွားလာခြင်း။ (e.g., Looking around the house.)</p>", exercises: [{"options": ["The earth moves around the sun.", "The earth moves across the sun.", "The earth moves along the sun."], "answer": "The earth moves around the sun."}, {"options": ["I will meet you around 5 PM.", "I will meet you among 5 PM.", "I will meet you against 5 PM."], "answer": "I will meet you around 5 PM."}, {"options": ["He lives somewhere around here.", "He lives somewhere among here.", "He lives somewhere along here."], "answer": "He lives somewhere around here."}] },
            { word: "At", pure_example: "I am at the bus stop. (ကျွန်တော် ဘတ်စ်ကားမှတ်တိုင်မှာ ရှိနေပါတယ်။)", notes: "<h3>1. Specific Point (နေရာအတိအကျ)</h3><p>နေရာတစ်ခု၏ တိကျသော အမှတ်အသားကို ပြသည်။</p><h3>2. Specific Time (အချိန်အတိအကျ)</h3><p>နာရီအချိန်၊ ပွဲတော် သို့မဟုတ် အမှတ်အသားတစ်ခုကို ပြသည်။ (e.g., At noon, At Christmas.)</p><h3>3. Activity (လုပ်ဆောင်ချက်)</h3><p>တစ်စုံတစ်ခုကို လုပ်ဆောင်နေသော နေရာကို ပြသည်။ (e.g., At work, At school.)</p><h3>4. Direction/Target (ဦးတည်ချက်)</h3><p>တစ်ခုခုကို ပစ်မှတ်ထားခြင်း။ (e.g., Look at me, Throw at the wall.)</p>", exercises: [{"options": ["I am at the bus stop.", "I am on the bus stop.", "I am in the bus stop."], "answer": "I am at the bus stop."}, {"options": ["The movie starts at 8 PM.", "The movie starts in 8 PM.", "The movie starts on 8 PM."], "answer": "The movie starts at 8 PM."}, {"options": ["She is good at English.", "She is good in English.", "She is good on English."], "answer": "She is good at English."}] },
            { word: "Behind", pure_example: "The cat is behind the sofa. (ကြောင်လေးဟာ ဆိုဖာရဲ့ အနောက်ဘက်မှာ ရှိနေပါတယ်။)", notes: "<h3>1. Position (အနောက်ဘက်)</h3><p>အရာတစ်ခု၏ ကွယ်ရာ သို့မဟုတ် နောက်ဘက်တွင် ရှိနေခြင်း။</p><h3>2. Lagging (နောက်ကျကျန်ခြင်း)</h3><p>တိုးတက်မှု၊ အချိန်ဇယား သို့မဟုတ် အဆင့်အတန်းတွင် နောက်ကျနေခြင်း။ (e.g., Behind schedule.)</p><h3>3. Support (ထောက်ခံမှု)</h3><p>တစ်စုံတစ်ယောက်ကို ကူညီထောက်ပံ့နေခြင်း။ (e.g., I am behind you 100%.)</p><h3>4. Cause (အကြောင်းရင်း)</h3><p>ဖြစ်ရပ်တစ်ခု၏ နောက်ကွယ်မှ အကြောင်းတရား။ (e.g., The motive behind the crime.)</p>", exercises: [{"options": ["The cat is behind the sofa.", "The cat is below the sofa.", "The cat is beneath the sofa."], "answer": "The cat is behind the sofa."}, {"options": ["The sun went behind the clouds.", "The sun went below the clouds.", "The sun went beneath the clouds."], "answer": "The sun went behind the clouds."}, {"options": ["We are behind schedule.", "We are below schedule.", "We are beneath schedule."], "answer": "We are behind schedule."}] },
            { word: "Below", pure_example: "Please sign your name below the line. (ကျေးဇူးပြုပြီး မျဉ်းကြောင်းရဲ့ အောက်ဘက်မှာ လက်မှတ်ထိုးပေးပါ။)", notes: "<h3>1. Lower Position (အောက်ဘက်)</h3><p>အဆင့် သို့မဟုတ် တည်နေရာ ပို၍နိမ့်သော နေရာတွင် ရှိနေခြင်း (ထိကပ်ရန်မလိုပါ)။</p><h3>2. Measurements (အတိုင်းအတာ)</h3><p>အပူချိန်၊ အဆင့် သို့မဟုတ် ကိန်းဂဏန်းတစ်ခုထက် နိမ့်ကျနေခြင်း။ (e.g., Below zero, Below average.)</p><h3>3. Rank/Status (အဆင့်အတန်း)</h3><p>အာဏာ သို့မဟုတ် ဂုဏ်သိက္ခာ နိမ့်ကျခြင်း။ (e.g., A Captain is below a Major.)</p>", exercises: [{"options": ["Please sign your name below the line.", "Please sign your name beneath the line.", "Please sign your name behind the line."], "answer": "Please sign your name below the line."}, {"options": ["The temperature is below zero.", "The temperature is behind zero.", "The temperature is beneath zero."], "answer": "The temperature is below zero."}, {"options": ["He lives in the apartment below us.", "He lives in the apartment beneath us.", "He lives in the apartment behind us."], "answer": "He lives in the apartment below us."}] },
            { word: "Beneath", pure_example: "They found gold beneath the floor. (သူတို့ ကြမ်းပြင်အောက်မှာ ရွှေတွေကို တွေ့ခဲ့ကြပါတယ်။)", notes: "<h3>1. Underneath (အောက်တည့်တည့်)</h3><p>အရာတစ်ခု၏ အောက်ခြေတွင် တိုက်ရိုက်ရှိနေခြင်း သို့မဟုတ် ဖုံးအုပ်ခြင်း ခံထားရသော အခြေအနေကို ပြသည်။ (e.g., Beneath the surface.)</p><h3>2. Lower Status (အဆင့်အတန်းနိမ့်ကျခြင်း)</h3><p>ဂုဏ်သိက္ခာ သို့မဟုတ် အဆင့်အတန်းအရ တစ်စုံတစ်ယောက်နှင့် မထိုက်တန်သော အပြုအမူမျိုးကို ဖော်ပြရာတွင် သုံးသည်။ (e.g., Beneath her dignity.)</p>", exercises: [{"options": ["They found gold beneath the floor.", "They found gold among the floor.", "They found gold across the floor."], "answer": "They found gold beneath the floor."}, {"options": ["Sit beneath the tree shadow.", "Sit behind the tree shadow.", "Sit between the tree shadow."], "answer": "Sit beneath the tree shadow."}, {"options": ["The valley lies beneath the mountain.", "The valley lies among the mountain.", "The valley lies across the mountain."], "answer": "The valley lies beneath the mountain."}] },
            { word: "Beside", pure_example: "Sit beside me. (ကျွန်တော့်ဘေးမှာ ထိုင်ပါ။)", notes: "<h3>1. Next To (ဘေးတွင်)</h3><p>အရာတစ်ခု သို့မဟုတ် တစ်စုံတစ်ယောက်၏ ဘေးကပ်လျက်တွင် ရှိနေခြင်းကို ပြသည်။ (e.g., Standing beside the tree.)</p><h3>2. Comparison (နှိုင်းယှဉ်ချက်)</h3><p>တစ်ခုနှင့်တစ်ခု ယှဉ်ကြည့်လျှင် ကွာခြားမှုကို ပြရန် သုံးသည်။ (e.g., My work is nothing beside yours.)</p>", exercises: [{"options": ["Sit beside me.", "Sit besides me.", "Sit along me."], "answer": "Sit beside me."}, {"options": ["The bank is beside the hotel.", "The bank is between the hotel.", "The bank is among the hotel."], "answer": "The bank is beside the hotel."}, {"options": ["Who is standing beside you?", "Who is standing against you?", "Who is standing across you?"], "answer": "Who is standing beside you?"}] },
            { word: "Between", pure_example: "I sat between Tom and Jerry. (ကျွန်တော် တွမ်နဲ့ ဂျယ်ရီကြားမှာ ထိုင်ခဲ့ပါတယ်။)", notes: "<h3>1. Middle of Two (နှစ်ခုကြား)</h3><p>အရာနှစ်ခု သို့မဟုတ် လူနှစ်ဦး၏ အကြားတွင် ရှိနေခြင်း သို့မဟုတ် ဖြစ်ပေါ်ခြင်းကို ပြသည်။ (e.g., Between 2 and 3 o'clock.)</p><h3>2. Connection/Relationship (ဆက်နွယ်မှု)</h3><p>အရာနှစ်ခုကြားရှိ ဆက်စပ်မှု သို့မဟုတ် ခြားနားမှုကို ပြသည်။ (e.g., The difference between A and B.)</p>", exercises: [{"options": ["I sat between Tom and Jerry.", "I sat among Tom and Jerry.", "I sat beside Tom and Jerry."], "answer": "I sat between Tom and Jerry."}, {"options": ["The ball is between the boxes.", "The ball is among the boxes.", "The ball is across the boxes."], "answer": "The ball is between the boxes."}, {"options": ["Choose between blue and red.", "Choose among blue and red.", "Choose along blue and red."], "answer": "Choose between blue and red."}] },
            { word: "Beyond", pure_example: "The village is beyond the hill. (ရွာဟာ တောင်ကုန်းရဲ့ ဟိုဘက်မှာ ရှိပါတယ်။)", notes: "<h3>1. Past/Further Side (ဟိုဘက်တွင်)</h3><p>သတ်မှတ်ထားသော နေရာ သို့မဟုတ် အပိုင်းအခြားတစ်ခု၏ တစ်ဖက်ခြမ်းတွင် ရှိနေခြင်းကို ပြသည်။ (e.g., Beyond the mountains.)</p><h3>2. Limit/Capability (အတိုင်းအတာထက်ကျော်လွန်ခြင်း)</h3><p>နားလည်နိုင်စွမ်း သို့မဟုတ် လုပ်ဆောင်နိုင်စွမ်းထက် ကျော်လွန်နေခြင်းကို ဖော်ပြရာတွင် သုံးသည်။ (e.g., Beyond my understanding.)</p>", exercises: [{"options": ["The village is beyond the hill.", "The village is above the hill.", "The village is across the hill."], "answer": "The village is beyond the hill."}, {"options": ["The truth is beyond doubt.", "The truth is among doubt.", "The truth is against doubt."], "answer": "The truth is beyond doubt."}, {"options": ["Look beyond the horizon.", "Look behind the horizon.", "Look below the horizon."], "answer": "Look beyond the horizon."}] },
            { word: "By", pure_example: "I live by the sea. (ကျွန်တော် ပင်လယ်နားမှာ နေပါတယ်။)", notes: "<h3>1. Nearness/Proximity (အနီး)</h3><p>ဘေးတွင် သို့မဟုတ် အနီးအနားတွင် ရှိနေခြင်းကို ပြသည်။ (e.g., A house by the lake.)</p><h3>2. Agent/Doer (ပြုလုပ်သူ)</h3><p>အလုပ်တစ်ခုကို မည်သူက လုပ်ဆောင်သည်ကို ပြရန် (Passive voice တွင် အသုံးများသည်။) (e.g., Written by Shakespeare.)</p><h3>3. Method/Means (နည်းလမ်း)</h3><p>မည်သည့်နည်းလမ်းဖြင့် လုပ်ဆောင်သည်ကို ပြသည်။ (e.g., Go by bus, Pay by credit card.)</p><h3>4. Time Limit (နောက်ဆုံးအချိန်)</h3><p>သတ်မှတ်ထားသော အချိန်ထက် နောက်မကျစေဘဲ လုပ်ဆောင်ရမည့် အချိန်ကို ပြသည်။ (e.g., By Friday.)</p>", exercises: [{"options": ["I live by the sea.", "I live at the sea.", "I live on the sea."], "answer": "I live by the sea."}, {"options": ["Go to work by car.", "Go to work with car.", "Go to work in car."], "answer": "Go to work by car."}, {"options": ["The letter was written by him.", "The letter was written from him.", "The letter was written with him."], "answer": "The letter was written by him."}] },
            { word: "Down", pure_example: "Go down the stairs. (လှေကားအောက်ကို ဆင်းသွားပါ။)", notes: "<h3>1. Lower Position/Movement (အောက်သို့)</h3><p>အမြင့်မှ အနိမ့်သို့ သွားခြင်း သို့မဟုတ် အောက်ဘက်တွင် ရှိနေခြင်းကို ပြသည်။ (e.g., Walk down the hill.)</p><h3>2. Along (တစ်လျှောက်)</h3><p>လမ်းတစ်လျှောက် သွားခြင်းကို ပြရာတွင်လည်း သုံးသည်။ (e.g., Further down the road.)</p>", exercises: [{"options": ["Go down the stairs.", "Go below the stairs.", "Go beneath the stairs."], "answer": "Go down the stairs."}, {"options": ["Sit down on the chair.", "Sit below on the chair.", "Sit beneath on the chair."], "answer": "Sit down on the chair."}, {"options": ["The sun is going down.", "The sun is going below.", "The sun is going beneath."], "answer": "The sun is going down."}] },
            { word: "During", pure_example: "Don't sleep during the class. (အတန်းချိန်အတွင်း အိပ်မပျော်ပါစေနဲ့။)", notes: "<h3>1. Period of Time (အတွင်း)</h3><p>ဖြစ်ရပ်တစ်ခု ဖြစ်ပွားနေသည့် အချိန်ကာလ တစ်လျှောက်လုံး သို့မဟုတ် ထိုကာလအတွင်း တစ်ချိန်ချိန်ကို ပြသည်။ (e.g., During the summer.)</p>", exercises: [{"options": ["Don't sleep during the class.", "Don't sleep between the class.", "Don't sleep among the class."], "answer": "Don't sleep during the class."}, {"options": ["It rained during the night.", "It rained along the night.", "It rained across the night."], "answer": "It rained during the night."}, {"options": ["Stay quiet during the exam.", "Stay quiet among the exam.", "Stay quiet between the exam."], "answer": "Stay quiet during the exam."}] },
            { word: "Except", pure_example: "Everyone went except me. (ကျွန်တော်ကလွဲလို့ လူတိုင်း သွားခဲ့ကြပါတယ်။)", notes: "<h3>1. Exclusion (မှလွဲ၍)</h3><p>အရာအားလုံး သို့မဟုတ် လူအားလုံးထဲမှ တစ်ခု သို့မဟုတ် တစ်ဦးကို ချန်လှပ်ထားခြင်းကို ပြသည်။ (e.g., Everyone except Tom.)</p>", exercises: [{"options": ["Everyone went except me.", "Everyone went beside me.", "Everyone went along me."], "answer": "Everyone went except me."}, {"options": ["I like all fruits except apple.", "I like all fruits besides apple.", "I like all fruits against apple."], "answer": "I like all fruits except apple."}, {"options": ["Open daily except Sunday.", "Open daily behind Sunday.", "Open daily beyond Sunday."], "answer": "Open daily except Sunday."}] },
            { word: "For", pure_example: "This gift is for you. (ဒီလက်ဆောင်က မင်းအတွက်ပါ။)", notes: "<h3>1. Purpose/Benefit (အတွက်)</h3><p>ရည်ရွယ်ချက် သို့မဟုတ် အကျိုးခံစားရသူကို ပြသည်။ (e.g., This is for you.)</p><h3>2. Duration (ကြာချိန်)</h3><p>အချိန်ကာလ မည်မျှကြာသည်ကို ပြသည်။ (e.g., For two hours.)</p><h3>3. Support (ထောက်ခံမှု)</h3><p>တစ်ခုခုကို ထောက်ခံခြင်း သို့မဟုတ် ဘက်တော်သားဖြစ်ခြင်း။ (e.g., Are you for or against it?)</p><h3>4. Reason (အကြောင်းရင်း)</h3><p>အကြောင်းပြချက်ကို ဖော်ပြရာတွင် သုံးသည်။ (e.g., Famous for its beauty.)</p>", exercises: [{"options": ["This gift is for you.", "This gift is to you.", "This gift is from you."], "answer": "This gift is for you."}, {"options": ["I am waiting for the bus.", "I am waiting to the bus.", "I am waiting by the bus."], "answer": "I am waiting for the bus."}, {"options": ["Cook dinner for us.", "Cook dinner to us.", "Cook dinner with us."], "answer": "Cook dinner for us."}] },
            { word: "From", pure_example: "I am from Myanmar. (ကျွန်တော် မြန်မာနိုင်ငံကပါ။)", notes: "<h3>1. Origin/Source (မှ)</h3><p>စတင်ရာနေရာ၊ အချိန် သို့မဟုတ် ရင်းမြစ်ကို ပြသည်။ (e.g., A letter from Japan.)</p><h3>2. Starting Point (အစမှတ်)</h3><p>အချိန် သို့မဟုတ် အကွာအဝေး စတင်သည့် အမှတ်ကို ပြသည်။ (e.g., From 9 to 5.)</p><h3>3. Separation/Distance (ကွာဝေးမှု/ခွဲခွာမှု)</h3><p>အရာနှစ်ခုကြား ကွာဝေးမှု သို့မဟုတ် တစ်ခုမှတစ်ခု ခွဲထုတ်ခြင်းကို ပြသည်။ (e.g., 10 miles from here.)</p>", exercises: [{"options": ["I am from Myanmar.", "I am of Myanmar.", "I am by Myanmar."], "answer": "I am from Myanmar."}, {"options": ["Take it from the table.", "Take it by the table.", "Take it of the table."], "answer": "Take it from the table."}, {"options": ["A letter from my friend.", "A letter of my friend.", "A letter by my friend."], "answer": "A letter from my friend."}] },
            { word: "In", pure_example: "She is in the kitchen. (သူမ မီးဖိုချောင်ထဲမှာ ရှိနေပါတယ်။)", notes: "<h3>1. Inside a Space (နေရာတစ်ခု၏ အတွင်း)</h3><p>အရာဝတ္ထုတစ်ခု သို့မဟုတ် နေရာတစ်ခု၏ အတွင်းပိုင်းတွင် ရှိနေခြင်းကို ပြသည်။ (e.g., The keys are in my pocket.)</p><h3>2. Time - Periods (အချိန်ကာလ)</h3><p>လ၊ ခုနှစ်၊ ရာသီ သို့မဟုတ် နေ့၏ အစိတ်အပိုင်း (Morning/Afternoon/Evening) များတွင် သုံးသည်။ (e.g., In 1995, In the morning.)</p><h3>3. State or Condition (အခြေအနေ)</h3><p>စိတ်ခံစားမှု သို့မဟုတ် ရုပ်ပိုင်းဆိုင်ရာ အခြေအနေတစ်ခုအတွင်း ရောက်ရှိနေခြင်းကို ပြသည်။ (e.g., They are in love.)</p>", exercises: [{"options": ["The keys are in my pocket.", "The keys are at my pocket.", "The keys are on my pocket."], "answer": "The keys are in my pocket."}, {"options": ["I was born in 1995.", "I was born on 1995.", "I was born at 1995."], "answer": "I was born in 1995."}, {"options": ["They are in love.", "They are on love.", "They are at love."], "answer": "They are in love."}] },
            { word: "Inside", pure_example: "What is inside the box? (သေတ္တာထဲမှာ ဘာရှိလဲ။)", notes: "<h3>1. Inner Part (အတွင်းဘက်တည့်တည့်)</h3><p>'In' ထက် ပို၍ အတွင်းကျကျ နေရာကို အလေးပေးလိုသောအခါ သို့မဟုတ် အကာအကွယ်တစ်ခု၏ အတွင်းဘက်ကို ပြောလိုသောအခါ သုံးသည်။ (e.g., Inside the box.)</p>", exercises: [{"options": ["What is inside the box?", "What is besides the box?", "What is beyond the box."], "answer": "What is inside the box?"}, {"options": ["Go inside the house.", "Go into the house.", "Go in the house."], "answer": "Go inside the house."}, {"options": ["The cat is inside the cupboard.", "The cat is among the cupboard.", "The cat is along the cupboard."], "answer": "The cat is inside the cupboard."}] },
            { word: "Into", pure_example: "He jumped into the water. (သူ ရေထဲကို ခုန်ချလိုက်ပါတယ်။)", notes: "<h3>1. Movement Towards (အတွင်းသို့ ဦးတည်ခြင်း)</h3><p>အပြင်ဘက်မှ အတွင်းဘက်သို့ လှုပ်ရှားဝင်ရောက်သွားခြင်းကို ပြသည်။ (e.g., Into the water.)</p><h3>2. Change of State (အသွင်ပြောင်းလဲခြင်း)</h3><p>အခြေအနေတစ်ခုမှ အခြားတစ်ခုသို့ လုံးဝပြောင်းလဲသွားခြင်း။ (e.g., Turned into a butterfly.)</p>", exercises: [{"options": ["He jumped into the water.", "He jumped in the water.", "He jumped inside the water."], "answer": "He jumped into the water."}, {"options": ["Translate this into Burmese.", "Translate this in Burmese.", "Translate this to Burmese."], "answer": "Translate this into Burmese."}, {"options": ["The caterpillar turned into a butterfly.", "The caterpillar turned in a butterfly.", "The caterpillar turned to a butterfly."], "answer": "The caterpillar turned into a butterfly."}] },
            { word: "Of", pure_example: "The color of the sky is blue. (ကောင်းကင်ရဲ့ အရောင်က အပြာရောင်ပါ။)", notes: "<h3>1. Possession (ပိုင်ဆိုင်မှု)</h3><p>တစ်ခုခု သို့မဟုတ် တစ်စုံတစ်ယောက်နှင့် သက်ဆိုင်ကြောင်း ပြသည်။ (e.g., The color of the car.)</p><h3>2. Material (ပါဝင်ပစ္စည်း)</h3><p>အရာဝတ္ထုတစ်ခုကို ဘာနှင့် ပြုလုပ်ထားကြောင်း ပြသည်။ (e.g., Made of wood.)</p><h3>3. Part/Amount (အစိတ်အပိုင်း/ပမာဏ)</h3><p>စုစုပေါင်းမှ အစိတ်အပိုင်း သို့မဟုတ် အတိုင်းအတာကို ပြသည်။ (e.g., A glass of water.)</p>", exercises: [{"options": ["The color of the sky is blue.", "The color from the sky is blue.", "The color off the sky is blue."], "answer": "The color of the sky is blue."}, {"options": ["A table made of wood.", "A table made from wood.", "A table made with wood."], "answer": "A table made of wood."}, {"options": ["A glass of water.", "A glass from water.", "A glass with water."], "answer": "A glass of water."}] },
            { word: "Off", pure_example: "He fell off the bike. (သူ စက်ဘီးပေါ်က ပြုတ်ကျသွားပါတယ်။)", notes: "<h3>1. Movement Away (ခွာထွက်ခြင်း)</h3><p>မျက်နှာပြင်တစ်ခု သို့မဟုတ် နေရာတစ်ခုမှ ဝေးရာသို့ ခွာထွက်ခြင်း။ (e.g., Fell off the bike.)</p><h3>2. Disconnection (ဖြတ်တောက်ခြင်း)</h3><p>လျှပ်စစ်မီး သို့မဟုတ် စက်ပစ္စည်းများကို ပိတ်လိုက်ခြင်း။ (e.g., Turn off the light.)</p>", exercises: [{"options": ["He fell off the bike.", "He fell out of the bike.", "He fell from the bike."], "answer": "He fell off the bike."}, {"options": ["Turn off the light.", "Turn out the light.", "Turn down the light."], "answer": "Turn off the light."}, {"options": ["Keep off the grass.", "Keep out the grass.", "Keep from the grass."], "answer": "Keep off the grass."}] },
            { word: "On", pure_example: "The book is on the table. (စာအုပ်က စားပွဲပေါ်မှာ ရှိပါတယ်။)", notes: "<h3>1. Surface (မျက်နှာပြင်ပေါ်တွင်)</h3><p>အရာတစ်ခု၏ အပေါ်တွင် ထိကပ်လျက် ရှိနေခြင်း။ (e.g., On the table.)</p><h3>2. Days and Dates (နေ့ရက်များ)</h3><p>နေ့ရက်များနှင့် ရက်စွဲများရှေ့တွင် သုံးသည်။ (e.g., On Monday.)</p><h3>3. Electronic Media (အီလက်ထရွန်နစ်)</h3><p>တီဗွီ၊ ဖုန်း သို့မဟုတ် အင်တာနက် သုံးနေခြင်းကို ပြသည်။ (e.g., On the phone.)</p>", exercises: [{"options": ["The book is on the table.", "The book is in the table.", "The book is at the table."], "answer": "The book is on the table."}, {"options": ["I will see you on Monday.", "I will see you in Monday.", "I will see you at Monday."], "answer": "I will see you on Monday."}, {"options": ["He is on the phone.", "He is in the phone.", "He is at the phone."], "answer": "He is on the phone."}] },
            { word: "Out of", pure_example: "Get out of the car. (ကားထဲက ထွက်ပါ။)", notes: "<h3>1. Movement to Outside (အပြင်သို့)</h3><p>အတွင်းဘက်မှ အပြင်ဘက်သို့ ထွက်ခွာခြင်း။ (e.g., Get out of the car.)</p><h3>2. Lack of (မရှိတော့ခြင်း)</h3><p>တစ်ခုခု ကုန်သွားခြင်း သို့မဟုတ် မရှိတော့ခြင်း။ (e.g., Out of coffee.)</p><h3>3. Reason (အကြောင်းရင်း)</h3><p>စိတ်ရင်း သို့မဟုတ် အကြောင်းပြချက်တစ်ခုကြောင့် လုပ်ဆောင်ခြင်း။ (e.g., Out of curiosity.)</p>", exercises: [{"options": ["Get out of the car.", "Get off the car.", "Get from the car."], "answer": "Get out of the car."}, {"options": ["We are out of coffee.", "We are off coffee.", "We are from coffee."], "answer": "We are out of coffee."}, {"options": ["I asked out of curiosity.", "I asked off curiosity.", "I asked from curiosity."], "answer": "I asked out of curiosity."}] },
            { word: "Outside", pure_example: "Wait outside the room. (အခန်းအပြင်မှာ စောင့်ပါ။)", notes: "<h3>1. External (အပြင်ဘက်)</h3><p>အဆောက်အအုံ သို့မဟုတ် နေရာတစ်ခု၏ အပြင်ဘက်တွင် ရှိနေခြင်း။ (e.g., Outside the room.)</p>", exercises: [{"options": ["Wait outside the room.", "Wait out of the room.", "Wait off the room."], "answer": "Wait outside the room."}, {"options": ["The dog is outside.", "The dog is out of.", "The dog is off."], "answer": "The dog is outside."}, {"options": ["It is cold outside.", "It is cold out of.", "It is cold off."], "answer": "It is cold outside."}] },
            { word: "Over", pure_example: "The bridge is over the river. (တံတားက မြစ်အပေါ်မှာ ရှိပါတယ်။)", notes: "<h3>1. Directly Above (အထက်တည့်တည့်)</h3><p>အရာတစ်ခု၏ အပေါ်တည့်တည့်တွင် ရှိနေခြင်း သို့မဟုတ် ဖြတ်သန်းသွားခြင်း။ (e.g., Over the river.)</p><h3>2. Covering (ဖုံးအုပ်ခြင်း)</h3><p>တစ်ခုခုကို အုပ်မိအောင် ပြုလုပ်ခြင်း။ (e.g., Put a cloth over the food.)</p><h3>3. More Than (ထက်ပိုသော)</h3><p>အရေအတွက် သို့မဟုတ် အသက် ကျော်လွန်ခြင်း။ (e.g., Over 18 years old.)</p>", exercises: [{"options": ["The bridge is over the river.", "The bridge is above the river.", "The bridge is on the river."], "answer": "The bridge is over the river."}, {"options": ["Put a cloth over the food.", "Put a cloth above the food.", "Put a cloth on the food."], "answer": "Put a cloth over the food."}, {"options": ["He is over 18 years old.", "He is above 18 years old.", "He is on 18 years old."], "answer": "He is over 18 years old."}] },
            { word: "Since", pure_example: "I have been here since 9 AM. (ကျွန်တော် မနက် ၉ နာရီကတည်းက ဒီမှာ ရှိနေတာပါ။)", notes: "<h3>1. Starting Point in Time (စကတည်းက)</h3><p>အတိတ်က အချိန်တစ်ခုမှ ယခုအချိန်အထိ ဆက်တိုက်ဖြစ်ပျက်နေခြင်းကို ပြသည်။ (e.g., Since 9 AM, Since childhood.)</p>", exercises: [{"options": ["I have been here since 9 AM.", "I have been here for 9 AM.", "I have been here during 9 AM."], "answer": "I have been here since 9 AM."}, {"options": ["It hasn't rained since June.", "It hasn't rained for June.", "It hasn't rained during June."], "answer": "It hasn't rained since June."}, {"options": ["We have known each other since childhood.", "We have known each other for childhood.", "We have known each other during childhood."], "answer": "We have known each other since childhood."}] },
            { word: "Through", pure_example: "We walked through the park. (ကျွန်တော်တို့ ပန်းခြံကို ဖြတ်ပြီး လမ်းလျှောက်ခဲ့ကြပါတယ်။)", notes: "<h3>1. Movement (ဖြတ်သန်း၍)</h3><p>အရာတစ်ခု သို့မဟုတ် နေရာတစ်ခု၏ အတွင်းပိုင်းမှ ဖြတ်ကျော်သွားခြင်းကို ပြသည်။ (e.g., The train went through the tunnel.)</p><h3>2. Method/Means (မှတစ်ဆင့်)</h3><p>တစ်ခုခုကို အသုံးပြု၍ သို့မဟုတ် ကြိုးစားမှုဖြင့် တစ်ခုခုကို ရရှိခြင်း။ (e.g., I got the job through hard work.)</p><h3>3. Time (တစ်လျှောက်လုံး)</h3><p>အချိန်ကာလတစ်ခု၏ အစမှ အဆုံးအထိ ဖြစ်ပျက်ခြင်း။ (e.g., It rained all through the night.)</p>", exercises: [{"options": ["The train went through the tunnel.", "The train went into the tunnel.", "The train went to the tunnel."], "answer": "The train went through the tunnel."}, {"options": ["I got the job through hard work.", "I got the job with hard work.", "I got the job by hard work."], "answer": "I got the job through hard work."}, {"options": ["It rained all through the night.", "It rained all along the night.", "It rained all over the night."], "answer": "It rained all through the night."}] },
            { word: "To", pure_example: "I am going to the market. (ကျွန်တော် ဈေးကို သွားနေပါတယ်။)", notes: "<h3>1. Direction/Destination (ဦးတည်ရာ/ပန်းတိုင်)</h3><p>တစ်နေရာရာသို့ ဦးတည်သွားခြင်း သို့မဟုတ် ပန်းတိုင်ရောက်ရှိခြင်းကို ပြသည်။ (e.g., I'm going to school.)</p><h3>2. Receiver/Recipient (လက်ခံသူ)</h3><p>အရာတစ်ခုခုကို တစ်စုံတစ်ယောက်အား ပေးခြင်း သို့မဟုတ် ပြောခြင်းတွင် သုံးသည်။ (e.g., Give this to him.)</p><h3>3. Time Limit (အချိန်ကန့်သတ်ချက်)</h3><p>အချိန်ကာလတစ်ခု သို့မဟုတ် ကိန်းဂဏန်းတစ်ခုအထိ ဖြစ်ပျက်ခြင်း။ (e.g., Five minutes to ten, from Monday to Friday.)</p><h3>4. Purpose (ရည်ရွယ်ချက်)</h3><p>Infinitive (to + verb) ပုံစံဖြင့် တစ်ခုခုပြုလုပ်ရန် ရည်ရွယ်ချက်ကို ဖော်ပြသည်။ (e.g., I came here to see you.)</p>", exercises: [{"options": ["I'm going to school.", "I'm going at school.", "I'm going in school."], "answer": "I'm going to school."}, {"options": ["Give this to him.", "Give this for him.", "Give this at him."], "answer": "Give this to him."}, {"options": ["I came here to see you.", "I came here for see you.", "I came here seeing you."], "answer": "I came here to see you."}] },
            { word: "Toward", pure_example: "She walked toward the door. (သူမ တံခါးဆီကို ဦးတည်ပြီး လျှောက်သွားခဲ့ပါတယ်။)", notes: "<h3>1. Direction (ဦးတည်ရာ)</h3><p>တစ်စုံတစ်ခုဆီသို့ ဦးတည်ရွေ့လျားခြင်းကို ပြသည်။ ပန်းတိုင်သို့ ရောက်ရှိရန် မလိုဘဲ ထိုဘက်သို့ သွားနေခြင်းကို အလေးပေးသည်။ (e.g., She ran toward the car.)</p><h3>2. Attitude (သဘောထား)</h3><p>တစ်စုံတစ်ယောက် သို့မဟုတ် တစ်စုံတစ်ခုအပေါ် ထားရှိသည့် ခံစားချက် သို့မဟုတ် သဘောထား။ (e.g., His attitude toward his work is positive.)</p><h3>3. Nearness in Time (နီးကပ်သောအချိန်)</h3><p>အချိန်ကာလတစ်ခုသို့ နီးကပ်လာခြင်း။ (e.g., It's getting toward lunchtime.)</p>", exercises: [{"options": ["She ran toward the car.", "She ran at the car.", "She ran into the car."], "answer": "She ran toward the car."}, {"options": ["His attitude toward his work is positive.", "His attitude about his work is positive.", "His attitude for his work is positive."], "answer": "His attitude toward his work is positive."}, {"options": ["It's getting toward lunchtime.", "It's getting to lunchtime.", "It's getting at lunchtime."], "answer": "It's getting toward lunchtime."}] },
            { word: "Under", pure_example: "The cat is under the table. (ကြောင်က စားပွဲအောက်မှာ ရှိနေပါတယ်။)", notes: "<h3>1. Position (အောက်ဘက်)</h3><p>အရာတစ်ခု၏ တည့်တည့်အောက်ဘက်တွင် ရှိနေခြင်း။ (e.g., The ball is under the chair.)</p><h3>2. Less Than (ထက်နည်းသော)</h3><p>အသက်၊ အရေအတွက် သို့မဟုတ် ပမာဏတစ်ခုအောက် လျော့နည်းခြင်း။ (e.g., Children under age five.)</p><h3>3. Authority (လက်အောက်)</h3><p>တစ်စုံတစ်ယောက်၏ အုပ်ချုပ်မှု သို့မဟုတ် ညွှန်ကြားမှုအောက်တွင် ရှိခြင်း။ (e.g., We work under a great manager.)</p><h3>4. Condition (အခြေအနေ)</h3><p>ဖိအား သို့မဟုတ် အခြေအနေတစ်ခု၏ ရိုက်ခတ်မှုအောက်တွင် ရှိနေခြင်း။ (e.g., Under pressure, Under repair.)</p>", exercises: [{"options": ["The ball is under the chair.", "The ball is below the chair.", "The ball is beneath the chair."], "answer": "The ball is under the chair."}, {"options": ["Children under age five.", "Children below age five.", "Children less age five."], "answer": "Children under age five."}, {"options": ["We work under a great manager.", "We work below a great manager.", "We work by a great manager."], "answer": "We work under a great manager."}] },
            { word: "Until", pure_example: "I will wait until 5 o'clock. (ကျွန်တော် ၅ နာရီအထိ စောင့်ပါမယ်။)", notes: "<h3>1. Time Up To (အချိန်အထိ)</h3><p>သတ်မှတ်ထားသော အချိန်တစ်ခုအထိ ဖြစ်ပျက်နေခြင်း သို့မဟုတ် အခြေအနေတစ်ခု ဆက်လက်ရှိနေခြင်း။ (e.g., We played until it got dark.)</p><h3>2. Negative Meaning (မတိုင်မီအထိ)</h3><p>အချိန်တစ်ခု မရောက်မချင်း တစ်ခုခု မဖြစ်ပျက်သေးခြင်းကို ပြသည်။ (e.g., He didn't leave until 10 PM.)</p>", exercises: [{"options": ["We played until it got dark.", "We played for it got dark.", "We played while it got dark."], "answer": "We played until it got dark."}, {"options": ["He didn't leave until 10 PM.", "He didn't leave since 10 PM.", "He didn't leave for 10 PM."], "answer": "He didn't leave until 10 PM."}, {"options": ["Wait until the rain stops.", "Wait during the rain stops.", "Wait since the rain stops."], "answer": "Wait until the rain stops."}] },
            { word: "Up", pure_example: "He climbed up the ladder. (သူ လှေကားပေါ်ကို တက်သွားပါတယ်။)", notes: "<h3>1. Higher Position (အထက်သို့)</h3><p>နိမ့်ရာမှ မြင့်ရာသို့ ရွေ့လျားခြင်း သို့မဟုတ် အထက်ပိုင်းတွင် ရှိနေခြင်း။ (e.g., Look up at the sky.)</p><h3>2. Along/Further (တစ်လျှောက်)</h3><p>လမ်း သို့မဟုတ် မြစ် တစ်လျှောက် အဝေးသို့ သွားခြင်း။ (e.g., They walked up the street.)</p><h3>3. Completion (အကုန်အစင်)</h3><p>အလုပ်တစ်ခုကို အပြီးသတ်ခြင်း သို့မဟုတ် အရာတစ်ခုကို အကုန်သုံးလိုက်ခြင်း။ (e.g., Finish up your dinner.)</p>", exercises: [{"options": ["Look up at the sky.", "Look on at the sky.", "Look in at the sky."], "answer": "Look up at the sky."}, {"options": ["They walked up the street.", "They walked on the street.", "They walked along the street."], "answer": "They walked up the street."}, {"options": ["Finish up your dinner.", "Finish off your dinner.", "Finish out your dinner."], "answer": "Finish up your dinner."}] },
            { word: "With", pure_example: "I went there with my friend. (ကျွန်တော် အဲဒီကို သူငယ်ချင်းနဲ့အတူ သွားခဲ့ပါတယ်။)", notes: "<h3>1. Accompaniment (အတူတကွ)</h3><p>တစ်စုံတစ်ယောက်နှင့် အတူရှိနေခြင်း သို့မဟုတ် အတူသွားခြင်း။ (e.g., I'll be with you in a minute.)</p><h3>2. Instrument (အသုံးပြု၍)</h3><p>ကိရိယာတစ်ခုခုကို သုံးပြီး လုပ်ဆောင်ခြင်း။ (e.g., Slice the bread with a knife.)</p><h3>3. Having (ပါဝင်ခြင်း)</h3><p>အင်္ဂါရပ် သို့မဟုတ် အစိတ်အပိုင်းတစ်ခုခု ပါရှိခြင်း။ (e.g., A man with a beard.)</p><h3>4. Feeling/Manner (ခံစားချက်/ပုံစံ)</h3><p>စိတ်ခံစားမှုတစ်ခု သို့မဟုတ် ပုံစံတစ်ခုနှင့် လုပ်ဆောင်ခြင်း။ (e.g., Handled with care.)</p>", exercises: [{"options": ["I'll be with you in a minute.", "I'll be at you in a minute.", "I'll be for you in a minute."], "answer": "I'll be with you in a minute."}, {"options": ["Slice the bread with a knife.", "Slice the bread by a knife.", "Slice the bread through a knife."], "answer": "Slice the bread with a knife."}, {"options": ["Handled with care.", "Handled by care.", "Handled for care."], "answer": "Handled with care."}] },
            { word: "Within", pure_example: "You must finish it within an hour. (ခင်ဗျား ဒါကို တစ်နာရီအတွင်း အပြီးသတ်ရပါမယ်။)", notes: "<h3>1. Inside Limits (အတိုင်းအတာအတွင်း)</h3><p>သတ်မှတ်ထားသော အချိန်၊ အကွာအဝေး သို့မဟုတ် အတိုင်းအတာတစ်ခု မကျော်လွန်ခင်။ (e.g., Within 24 hours, Within walking distance.)</p><h3>2. Inside a Place (အတွင်းပိုင်း)</h3><p>အဆောက်အအုံ သို့မဟုတ် နယ်နိမိတ်တစ်ခု၏ အတွင်းဘက်။ (e.g., Within the house.)</p><h3>3. Inner Mind (စိတ်အတွင်း)</h3><p>လူတစ်ဦး၏ အတွင်းစိတ် သို့မဟုတ် အတွင်းပိုင်း၌ ရှိနေခြင်း။ (e.g., Look within yourself.)</p>", exercises: [{"options": ["Within 24 hours.", "Inside 24 hours.", "In 24 hours."], "answer": "Within 24 hours."}, {"options": ["Within walking distance.", "In walking distance.", "At walking distance."], "answer": "Within walking distance."}, {"options": ["Look within yourself.", "Look inside yourself.", "Look in yourself."], "answer": "Look within yourself."}] },
            { word: "Without", pure_example: "I can't live without water. (ကျွန်တော် ရေမပါဘဲ မနေနိုင်ပါဘူး။)", notes: "<h3>1. Lack (မပါဘဲ)</h3><p>တစ်စုံတစ်ခု သို့မဟုတ် တစ်စုံတစ်ယောက် မရှိဘဲ၊ မပါဘဲ။ (e.g., Coffee without sugar.)</p><h3>2. Not Doing (မပြုလုပ်ဘဲ)</h3><p>လုပ်ဆောင်ချက်တစ်ခုကို မလုပ်ဘဲ ကျော်လွန်သွားခြင်း။ (e.g., She left without saying a word.)</p>", exercises: [{"options": ["Coffee without sugar.", "Coffee no sugar.", "Coffee except sugar."], "answer": "Coffee without sugar."}, {"options": ["She left without saying a word.", "She left no saying a word.", "She left not saying a word."], "answer": "She left without saying a word."}, {"options": ["I can't live without water.", "I can't live besides water.", "I can't live instead water."], "answer": "I can't live without water."}] }
        ],
        testLessons: [
            {
                "title": "Lesson 1: Place (In, On, At)",
                "questions": [
                    {"q": "The cat is sitting ___ the chair.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "I live ___ a small apartment.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "Meet me ___ the bus stop.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "There is a picture ___ the wall.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "He is waiting ___ the entrance.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "The keys are ___ the drawer.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "She is standing ___ the corner of the street.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "I left my phone ___ the table.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "They are swimming ___ the pool.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "My office is ___ the third floor.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "We stayed ___ a hotel last night.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "The books are ___ the shelf.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "There's a fly ___ my soup.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "He sat ___ the desk to work.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "I saw him ___ the party.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "The bird is ___ the cage.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "Put the vase ___ the mantelpiece.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "She works ___ the hospital.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "Is there any milk ___ the fridge?", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "I'll meet you ___ the airport.", "options": ["at", "in", "on"], "answer": "at"}
                ]
            },
            {
                "title": "Lesson 2: Time (At, On, In, During)",
                "questions": [
                    {"q": "I'll see you ___ 5 o'clock.", "options": ["at", "on", "in"], "answer": "at"},
                    {"q": "My birthday is ___ July.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "We have a meeting ___ Monday.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "It's very cold ___ winter.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "I woke up ___ midnight.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "She usually works out ___ the morning.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "The store closes ___ 9 PM.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "We went on vacation ___ August.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "I'll be there ___ a few minutes.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "He fell asleep ___ the movie.", "options": ["during", "in", "on"], "answer": "during"},
                    {"q": "They got married ___ June 12th.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "I like to read ___ the weekend.", "options": ["at", "on", "in"], "answer": "at"},
                    {"q": "The concert starts ___ sunset.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "It rained heavily ___ the night.", "options": ["during", "on", "at"], "answer": "during"},
                    {"q": "I have an appointment ___ Tuesday afternoon.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "We moved here ___ 2015.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "I'll finish this ___ an hour.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "She cried ___ the sad scene.", "options": ["during", "in", "at"], "answer": "during"},
                    {"q": "The bank is closed ___ Sundays.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "I drink coffee ___ breakfast.", "options": ["at", "in", "on"], "answer": "at"}
                ]
            },
            {
                "title": "Lesson 3: Direction (To, Into, Onto)",
                "questions": [
                    {"q": "We are going ___ the park.", "options": ["to", "into", "onto"], "answer": "to"},
                    {"q": "He jumped ___ the water.", "options": ["into", "onto", "to"], "answer": "into"},
                    {"q": "Put the cat ___ the bed.", "options": ["onto", "into", "to"], "answer": "onto"},
                    {"q": "She walked ___ the door.", "options": ["towards", "into", "onto"], "answer": "towards"},
                    {"q": "I sent a letter ___ my friend.", "options": ["to", "into", "onto"], "answer": "to"},
                    {"q": "Drive ___ the city center.", "options": ["towards", "into", "onto"], "answer": "towards"},
                    {"q": "The car crashed ___ a tree.", "options": ["into", "onto", "to"], "answer": "into"},
                    {"q": "Move the chair ___ the corner.", "options": ["to", "into", "onto"], "answer": "to"},
                    {"q": "The bird flew ___ the branch.", "options": ["onto", "into", "to"], "answer": "onto"},
                    {"q": "He ran ___ the finish line.", "options": ["towards", "into", "onto"], "answer": "towards"},
                    {"q": "Welcome ___ our home.", "options": ["to", "into", "onto"], "answer": "to"},
                    {"q": "Please step ___ the elevator.", "options": ["into", "onto", "to"], "answer": "into"},
                    {"q": "The leaf fell ___ the ground.", "options": ["onto", "into", "to"], "answer": "onto"},
                    {"q": "Look ___ the stars above.", "options": ["towards", "at", "into"], "answer": "towards"},
                    {"q": "I'm going ___ school.", "options": ["to", "into", "onto"], "answer": "to"},
                    {"q": "Dive ___ the deep end.", "options": ["into", "onto", "to"], "answer": "into"},
                    {"q": "Climb ___ the roof.", "options": ["onto", "into", "to"], "answer": "onto"},
                    {"q": "They are heading ___ the mountains.", "options": ["towards", "into", "onto"], "answer": "towards"},
                    {"q": "Give the book ___ me.", "options": ["to", "into", "onto"], "answer": "to"},
                    {"q": "Pour the milk ___ the glass.", "options": ["into", "onto", "to"], "answer": "into"}
                ]
            },
            {
                "title": "Lesson 4: Manner (By, With)",
                "questions": [
                    {"q": "This book was written ___ Charles Dickens.", "options": ["by", "with", "from"], "answer": "by"},
                    {"q": "Cut the bread ___ a knife.", "options": ["with", "by", "for"], "answer": "with"},
                    {"q": "I go to work ___ bus.", "options": ["by", "with", "in"], "answer": "by"},
                    {"q": "She is staying ___ her parents.", "options": ["with", "by", "at"], "answer": "with"},
                    {"q": "The house was destroyed ___ fire.", "options": ["by", "with", "from"], "answer": "by"},
                    {"q": "Clean the window ___ a cloth.", "options": ["with", "by", "for"], "answer": "with"},
                    {"q": "I'll be there ___ 10 o'clock.", "options": ["by", "with", "at"], "answer": "by"},
                    {"q": "He fought the dragon ___ a sword.", "options": ["with", "by", "for"], "answer": "with"},
                    {"q": "This cake was made ___ my sister.", "options": ["by", "with", "for"], "answer": "by"},
                    {"q": "I am bored ___ this game.", "options": ["with", "by", "for"], "answer": "with"},
                    {"q": "They traveled ___ train.", "options": ["by", "with", "on"], "answer": "by"},
                    {"q": "Open the door ___ this key.", "options": ["with", "by", "in"], "answer": "with"},
                    {"q": "I'll finish this project ___ Friday.", "options": ["by", "with", "at"], "answer": "by"},
                    {"q": "She is happy ___ her new job.", "options": ["with", "by", "about"], "answer": "with"},
                    {"q": "The letter was sent ___ airmail.", "options": ["by", "with", "on"], "answer": "by"},
                    {"q": "Stir the soup ___ a spoon.", "options": ["with", "by", "in"], "answer": "with"},
                    {"q": "Stand ___ me.", "options": ["by", "with", "at"], "answer": "by"},
                    {"q": "I agree ___ you.", "options": ["with", "by", "to"], "answer": "with"},
                    {"q": "We learn ___ doing.", "options": ["by", "with", "for"], "answer": "by"},
                    {"q": "He is gifted ___ a great voice.", "options": ["with", "by", "of"], "answer": "with"}
                ]
            },
            {
                "title": "Lesson 5: Purpose (For, From)",
                "questions": [
                    {"q": "This gift is ___ you.", "options": ["for", "from", "of"], "answer": "for"},
                    {"q": "I am ___ New York.", "options": ["from", "for", "at"], "answer": "from"},
                    {"q": "We stayed home ___ the rain.", "options": ["because of", "for", "from"], "answer": "because of"},
                    {"q": "I've been waiting ___ an hour.", "options": ["for", "from", "since"], "answer": "for"},
                    {"q": "Take a cookie ___ the jar.", "options": ["from", "for", "off"], "answer": "from"},
                    {"q": "He was late ___ the traffic.", "options": ["because of", "for", "from"], "answer": "because of"},
                    {"q": "This tool is used ___ digging.", "options": ["for", "from", "with"], "answer": "for"},
                    {"q": "I received a letter ___ my aunt.", "options": ["from", "for", "by"], "answer": "from"},
                    {"q": "She won the prize ___ her hard work.", "options": ["for", "because of", "from"], "answer": "for"},
                    {"q": "I can't see ___ the fog.", "options": ["because of", "for", "from"], "answer": "because of"},
                    {"q": "I am looking ___ my keys.", "options": ["for", "from", "at"], "answer": "for"},
                    {"q": "The wind blows ___ the north.", "options": ["from", "for", "off"], "answer": "from"},
                    {"q": "We are sorry ___ the delay.", "options": ["for", "from", "about"], "answer": "for"},
                    {"q": "He is tired ___ the journey.", "options": ["from", "for", "because of"], "answer": "from"},
                    {"q": "I did it ___ you.", "options": ["for", "from", "because of"], "answer": "for"},
                    {"q": "The water comes ___ the tap.", "options": ["from", "for", "out"], "answer": "from"},
                    {"q": "The match was cancelled ___ snow.", "options": ["because of", "for", "from"], "answer": "because of"},
                    {"q": "I have a message ___ John.", "options": ["for", "from", "about"], "answer": "for"},
                    {"q": "She is suffering ___ a cold.", "options": ["from", "for", "with"], "answer": "from"},
                    {"q": "I bought this shirt ___ $20.", "options": ["for", "from", "with"], "answer": "for"}
                ]
            },
            {
                "title": "Lesson 6: Relation (About, With, Of)",
                "questions": [
                    {"q": "Tell me ___ your trip.", "options": ["about", "with", "of"], "answer": "about"},
                    {"q": "I am thinking ___ you.", "options": ["of", "about", "with"], "answer": "of"},
                    {"q": "She is covered ___ mud.", "options": ["with", "about", "of"], "answer": "with"},
                    {"q": "What is the name ___ this song?", "options": ["of", "about", "with"], "answer": "of"},
                    {"q": "I'm worried ___ the exam.", "options": ["about", "of", "with"], "answer": "about"},
                    {"q": "Fill the glass ___ water.", "options": ["with", "of", "about"], "answer": "with"},
                    {"q": "He is a friend ___ mine.", "options": ["of", "about", "with"], "answer": "of"},
                    {"q": "We talked ___ the weather.", "options": ["about", "with", "of"], "answer": "about"},
                    {"q": "I am proud ___ my son.", "options": ["of", "about", "with"], "answer": "of"},
                    {"q": "He is angry ___ me.", "options": ["with", "about", "of"], "answer": "with"},
                    {"q": "It's a story ___ a king.", "options": ["about", "of", "with"], "answer": "about"},
                    {"q": "The table is made ___ wood.", "options": ["of", "with", "from"], "answer": "of"},
                    {"q": "I am familiar ___ this place.", "options": ["with", "about", "of"], "answer": "with"},
                    {"q": "There is a lot ___ noise.", "options": ["of", "about", "with"], "answer": "of"},
                    {"q": "I am sure ___ it.", "options": ["of", "about", "with"], "answer": "of"},
                    {"q": "She is obsessed ___ cats.", "options": ["with", "about", "of"], "answer": "with"},
                    {"q": "Don't forget ___ the meeting.", "options": ["about", "of", "with"], "answer": "about"},
                    {"q": "He is the captain ___ the team.", "options": ["of", "about", "with"], "answer": "of"},
                    {"q": "I am satisfied ___ the results.", "options": ["with", "of", "about"], "answer": "with"},
                    {"q": "I have a dream ___ flying.", "options": ["of", "about", "with"], "answer": "of"}
                ]
            },
            {
                "title": "Lesson 7: Position (Between, Among)",
                "questions": [
                    {"q": "I am sitting ___ my two friends.", "options": ["between", "among", "beside"], "answer": "between"},
                    {"q": "He is popular ___ his classmates.", "options": ["among", "between", "beside"], "answer": "among"},
                    {"q": "Come and sit ___ me.", "options": ["beside", "among", "between"], "answer": "beside"},
                    {"q": "The pharmacy is ___ the bank.", "options": ["next to", "among", "between"], "answer": "next to"},
                    {"q": "There is a secret ___ us.", "options": ["between", "among", "beside"], "answer": "between"},
                    {"q": "I found my keys ___ the papers.", "options": ["among", "between", "beside"], "answer": "among"},
                    {"q": "She stood ___ the window.", "options": ["beside", "among", "between"], "answer": "beside"},
                    {"q": "My house is ___ yours.", "options": ["next to", "among", "between"], "answer": "next to"},
                    {"q": "The ball fell ___ the two cars.", "options": ["between", "among", "beside"], "answer": "between"},
                    {"q": "He was hidden ___ the trees.", "options": ["among", "between", "beside"], "answer": "among"},
                    {"q": "Put the lamp ___ the bed.", "options": ["beside", "among", "between"], "answer": "beside"},
                    {"q": "The school is ___ the park.", "options": ["next to", "among", "between"], "answer": "next to"},
                    {"q": "Choose ___ these three options.", "options": ["among", "between", "beside"], "answer": "among"},
                    {"q": "The coffee shop is ___ the library.", "options": ["next to", "among", "between"], "answer": "next to"},
                    {"q": "A river flows ___ the two mountains.", "options": ["between", "among", "beside"], "answer": "between"},
                    {"q": "There is a thief ___ us.", "options": ["among", "between", "beside"], "answer": "among"},
                    {"q": "I parked my car ___ the garage.", "options": ["beside", "among", "between"], "answer": "beside"},
                    {"q": "The remote is ___ the sofa.", "options": ["next to", "among", "between"], "answer": "next to"},
                    {"q": "The difference ___ the two is small.", "options": ["between", "among", "beside"], "answer": "between"},
                    {"q": "She felt lonely ___ the crowd.", "options": ["among", "between", "beside"], "answer": "among"}
                ]
            },
            {
                "title": "Lesson 8: Movement (Through, Across)",
                "questions": [
                    {"q": "We walked ___ the forest.", "options": ["through", "across", "along"], "answer": "through"},
                    {"q": "He swam ___ the river.", "options": ["across", "through", "along"], "answer": "across"},
                    {"q": "They strolled ___ the beach.", "options": ["along", "through", "across"], "answer": "along"},
                    {"q": "The bullet went ___ the wall.", "options": ["through", "across", "along"], "answer": "through"},
                    {"q": "We drove ___ the bridge.", "options": ["across", "through", "along"], "answer": "across"},
                    {"q": "Follow the path ___ the river.", "options": ["along", "through", "across"], "answer": "along"},
                    {"q": "I looked ___ the window.", "options": ["through", "across", "along"], "answer": "through"},
                    {"q": "She ran ___ the street.", "options": ["across", "through", "along"], "answer": "across"},
                    {"q": "Flowers grow ___ the fence.", "options": ["along", "through", "across"], "answer": "along"},
                    {"q": "The water flows ___ the pipe.", "options": ["through", "across", "along"], "answer": "through"},
                    {"q": "They sailed ___ the ocean.", "options": ["across", "through", "along"], "answer": "across"},
                    {"q": "Walk ___ the corridor.", "options": ["along", "through", "across"], "answer": "along"},
                    {"q": "I can see ___ the glass.", "options": ["through", "across", "along"], "answer": "through"},
                    {"q": "He lives ___ the road.", "options": ["across", "through", "along"], "answer": "across"},
                    {"q": "We cycled ___ the canal.", "options": ["along", "through", "across"], "answer": "along"},
                    {"q": "The light shines ___ the curtains.", "options": ["through", "across", "along"], "answer": "through"},
                    {"q": "He stepped ___ the line.", "options": ["across", "through", "along"], "answer": "across"},
                    {"q": "Trees are planted ___ the road.", "options": ["along", "through", "across"], "answer": "along"},
                    {"q": "The thread passes ___ the needle.", "options": ["through", "across", "along"], "answer": "through"},
                    {"q": "We flew ___ the clouds.", "options": ["through", "across", "along"], "answer": "through"}
                ]
            },
            {
                "title": "Lesson 9: Idioms & Collocations",
                "questions": [
                    {"q": "I am ___ a hurry.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "We are ___ strike.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "He is good ___ math.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "I believe ___ ghosts.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "She is ___ diet.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "Don't be late ___ school.", "options": ["for", "to", "at"], "answer": "for"},
                    {"q": "I'm afraid ___ spiders.", "options": ["of", "from", "with"], "answer": "of"},
                    {"q": "Pay ___ cash.", "options": ["in", "with", "by"], "answer": "in"},
                    {"q": "It depends ___ the weather.", "options": ["on", "of", "in"], "answer": "on"},
                    {"q": "I'm interested ___ art.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "She is married ___ a doctor.", "options": ["to", "with", "by"], "answer": "to"},
                    {"q": "Listen ___ the music.", "options": ["to", "at", "in"], "answer": "to"},
                    {"q": "I'm looking forward ___ the party.", "options": ["to", "for", "at"], "answer": "to"},
                    {"q": "He died ___ old age.", "options": ["of", "from", "by"], "answer": "of"},
                    {"q": "I'm sorry ___ being late.", "options": ["for", "about", "with"], "answer": "for"},
                    {"q": "They arrived ___ the station.", "options": ["at", "in", "to"], "answer": "at"},
                    {"q": "Congratulations ___ your success.", "options": ["on", "for", "with"], "answer": "on"},
                    {"q": "I'm tired ___ waiting.", "options": ["of", "from", "with"], "answer": "of"},
                    {"q": "She is famous ___ her singing.", "options": ["for", "with", "of"], "answer": "for"},
                    {"q": "Wait ___ me!", "options": ["for", "to", "at"], "answer": "for"}
                ]
            },
            {
                "title": "Lesson 10: Mixed Challenge",
                "questions": [
                    {"q": "The keys are ___ the table.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "I'll meet you ___ noon.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "He walked ___ the room.", "options": ["into", "to", "onto"], "answer": "into"},
                    {"q": "This is a gift ___ her.", "options": ["for", "from", "with"], "answer": "for"},
                    {"q": "I am proud ___ you.", "options": ["of", "with", "about"], "answer": "of"},
                    {"q": "We went ___ the tunnel.", "options": ["through", "across", "along"], "answer": "through"},
                    {"q": "She is ___ work right now.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "I live ___ London.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "The book is ___ the shelf.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "I'll be there ___ Monday.", "options": ["on", "in", "at"], "answer": "on"},
                    {"q": "He jumped ___ the pool.", "options": ["into", "onto", "to"], "answer": "into"},
                    {"q": "I'm afraid ___ heights.", "options": ["of", "from", "with"], "answer": "of"},
                    {"q": "She is looking ___ her lost dog.", "options": ["for", "at", "to"], "answer": "for"},
                    {"q": "The bridge goes ___ the river.", "options": ["across", "through", "along"], "answer": "across"},
                    {"q": "I am interested ___ history.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "Meet me ___ the corner.", "options": ["at", "in", "on"], "answer": "at"},
                    {"q": "I'll finish ___ ten minutes.", "options": ["in", "on", "at"], "answer": "in"},
                    {"q": "This was made ___ hand.", "options": ["by", "with", "from"], "answer": "by"},
                    {"q": "I agree ___ your opinion.", "options": ["with", "to", "for"], "answer": "with"},
                    {"q": "Tell me ___ your day.", "options": ["about", "of", "with"], "answer": "about"}
                ]
            }
        ],
        
        currentView: 'main',
        lessonIdx: 0,
        exIdx: 0,
        testIdx: 0,
        testScore: 0,
        currentTestIdx: 0,
        currentTestQuestions: [],

        start: () => {
            ui.get('prepositions-section').style.display = 'flex';
            prepositions.showView('main');
        },

        back: () => {
            const v = prepositions.currentView;
            if (v === 'main') ui.get('prepositions-section').style.display = 'none';
            else if (v === 'learn-list' || v === 'test-menu') prepositions.showView('main');
            else if (v === 'lesson') prepositions.showView('learn-list');
            else if (v === 'test' || v === 'result') prepositions.showView('test-menu');
        },

        showView: (view) => {
            prepositions.currentView = view;
            const views = ['main-menu', 'learn-list', 'test-menu', 'lesson-view', 'test-view', 'result-view'];
            views.forEach(v => ui.get(`prep-${v}`).style.display = 'none');
            
            const targetId = view === 'main' ? 'main-menu' : (view === 'lesson' ? 'lesson-view' : (view === 'test' ? 'test-view' : (view === 'result' ? 'result-view' : view)));
            const displayMode = (targetId === 'main-menu' || targetId === 'learn-list' || targetId === 'test-menu') ? 'grid' : 'block';
            ui.get(`prep-${targetId}`).style.display = displayMode;
            
            const titles = { 'main': 'PREPOSITIONS', 'learn-list': 'LEARN LIST', 'test-menu': 'TEST LESSONS', 'lesson': 'LEARN', 'test': 'PRACTICE', 'result': 'COMPLETE' };
            ui.get('prep-title').textContent = titles[view] || 'PREPOSITIONS';
            ui.get('prep-back-btn').textContent = view === 'main' ? '← BACK' : '← MENU';
        },

        showLearnList: () => {
            prepositions.showView('learn-list');
            const container = ui.get('prep-list-container');
            const progress = JSON.parse(localStorage.getItem('prep_learn_progress') || '{}');
            
            container.innerHTML = prepositions.lessons.map((l, i) => {
                const isDone = progress[i];
                return `<button class="tactile-button ${isDone ? 'option-correct' : ''}" onclick="prepositions.loadLesson(${i})">
                    ${l.word} ${isDone ? '✓' : ''}
                </button>`;
            }).join('');
        },

        loadLesson: (idx) => {
            prepositions.lessonIdx = idx;
            prepositions.exIdx = 0;
            const lesson = prepositions.lessons[idx];
            
            ui.get("prep-current-word").textContent = `${idx + 1}. ${lesson.word.toUpperCase()}`;
            ui.get("prep-lesson-content").innerHTML = lesson.notes;
            ui.get("prep-pure-example").innerHTML = lesson.pure_example || "No example available.";
            
            prepositions.showView("lesson");
            prepositions.loadExercise();
        },

        loadExercise: () => {
            const ex = prepositions.lessons[prepositions.lessonIdx].exercises[prepositions.exIdx];
            ui.get('prep-ex-question').textContent = `Select the correct sentence (${prepositions.exIdx + 1}/3):`;
            const container = ui.get('prep-ex-options');
            container.innerHTML = ex.options.map(opt => `
                <button class="tactile-button" onclick="prepositions.handleExClick(this, '${opt}')">${opt}</button>
            `).join('');
            ui.get('prep-ex-confirm').style.display = 'inline-flex';
            ui.get('prep-ex-next').style.display = 'none';
            container.classList.remove('locked');
            prepositions.selectedEx = null;
        },

        handleExClick: (btn, choice) => {
            const container = ui.get('prep-ex-options');
            if (container.classList.contains('locked')) return;
            Array.from(container.children).forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            prepositions.selectedEx = choice;
        },

        confirmExercise: () => {
            if (!prepositions.selectedEx) return;
            const container = ui.get('prep-ex-options');
            container.classList.add('locked');
            const correct = prepositions.lessons[prepositions.lessonIdx].exercises[prepositions.exIdx].answer;
            
            Array.from(container.children).forEach(btn => {
                if (btn.textContent === correct) btn.classList.add('option-correct');
                else if (btn.classList.contains('active')) btn.classList.add('option-incorrect');
            });

            ui.get('prep-ex-confirm').style.display = 'none';
            ui.get('prep-ex-next').style.display = 'inline-flex';
        },

        nextExercise: () => {
            prepositions.exIdx++;
            prepositions.selectedEx = null;
            if (prepositions.exIdx < 3) {
                prepositions.loadExercise();
            } else {
                const progress = JSON.parse(localStorage.getItem('prep_learn_progress') || '{}');
                progress[prepositions.lessonIdx] = true;
                localStorage.setItem('prep_learn_progress', JSON.stringify(progress));
                prepositions.showLearnList();
            }
        },

        showTestMenu: () => {
            prepositions.showView('test-menu');
            const container = ui.get('prep-test-list');
            const progress = JSON.parse(localStorage.getItem('prep_test_progress') || '{}');
            
            container.innerHTML = prepositions.testLessons.map((l, i) => {
                const isDone = progress[i];
                return `<button class="tactile-button ${isDone ? 'option-correct' : ''}" onclick="prepositions.startTest(${i})">
                    ${l.title} ${isDone ? '✓' : ''}
                </button>`;
            }).join('');
        },

        startTest: (idx) => {
            prepositions.currentTestIdx = idx;
            prepositions.testIdx = 0;
            prepositions.testScore = 0;
            prepositions.currentTestQuestions = [...prepositions.testLessons[idx].questions].sort(() => 0.5 - Math.random());
            prepositions.showView('test');
            prepositions.loadTestQuestion();
        },

        loadTestQuestion: () => {
            const q = prepositions.currentTestQuestions[prepositions.testIdx];
            ui.get('prep-test-progress').textContent = `${prepositions.testIdx + 1} / 20`;
            ui.get('prep-test-fill').style.width = `${((prepositions.testIdx + 1) / 20) * 100}%`;
            ui.get('prep-test-question').textContent = q.q;
            
            const container = ui.get('prep-test-options');
            container.innerHTML = q.options.map(opt => `
                <button class="tactile-button" onclick="prepositions.handleTestClick(this, '${opt}')">${opt}</button>
            `).join('');
            
            ui.get('prep-test-confirm').style.display = 'inline-flex';
            ui.get('prep-test-next').style.display = 'none';
            container.classList.remove('locked');
            prepositions.selectedTest = null;
        },

        handleTestClick: (btn, choice) => {
            const container = ui.get('prep-test-options');
            if (container.classList.contains('locked')) return;
            Array.from(container.children).forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            prepositions.selectedTest = choice;
        },

        confirmTest: () => {
            if (!prepositions.selectedTest) return;
            const container = ui.get('prep-test-options');
            container.classList.add('locked');
            const correct = prepositions.currentTestQuestions[prepositions.testIdx].answer;
            
            if (prepositions.selectedTest === correct) {
                prepositions.testScore++;
            }

            Array.from(container.children).forEach(btn => {
                if (btn.textContent === correct) btn.classList.add('option-correct');
                else if (btn.classList.contains('active')) btn.classList.add('option-incorrect');
            });

            ui.get('prep-test-confirm').style.display = 'none';
            ui.get('prep-test-next').style.display = 'inline-flex';
        },

        nextTest: () => {
            prepositions.testIdx++;
            if (prepositions.testIdx < 20) {
                prepositions.loadTestQuestion();
            } else {
                if (prepositions.testScore >= 16) {
                    const progress = JSON.parse(localStorage.getItem('prep_test_progress') || '{}');
                    progress[prepositions.currentTestIdx] = true;
                    localStorage.setItem('prep_test_progress', JSON.stringify(progress));
                }
                prepositions.showResult();
            }
        },

        showResult: () => {
            prepositions.showView('result');
            ui.get('prep-final-score').textContent = `${prepositions.testScore} / 20`;
            ui.get('prep-result-msg').textContent = prepositions.testScore >= 16 ? "EXCELLENT! You've mastered this lesson." : "Good effort! Try to get at least 16 to mark it as done.";
        }
    };

    const sentences = {
        data: {
            basic: [
                {
                    title: "Lesson 1: To Be (Present)",
                    sentences: ["I am a student", "You are my friend", "He is a doctor", "She is very tall", "It is a big cat", "We are in school", "They are very happy", "I am a teacher", "You are very kind", "He is at home", "She is a nurse", "It is a blue car", "We are fast runners", "They are good kids", "I am hungry now", "You are a singer", "He is my brother", "She is my sister", "It is a sunny day", "We are best friends"]
                },
                {
                    title: "Lesson 2: Simple Actions",
                    sentences: ["I walk to school", "She drinks cold water", "He eats a red apple", "They play in the park", "We read a big book", "The bird sings a song", "I jump very high", "You run to the door", "He sleeps in the bed", "She writes a long letter", "They swim in the pool", "We sit on the grass", "I see a small mouse", "You hear a loud noise", "He kicks the soccer ball", "She draws a pretty flower", "They cook a nice meal", "We clean the house", "I open the window", "The dog barks at me"]
                },
                {
                    title: "Lesson 3: My Family",
                    sentences: ["This is my mother", "That is my father", "I love my grandmother", "My grandfather is old", "I have one brother", "She has two sisters", "My baby is cute", "This is my family", "My aunt is nice", "My uncle is tall", "We visit our cousin", "My parents are kind", "I help my mother", "He plays with his brother", "She talks to her sister", "They live with their parents", "This is my home", "We eat dinner together", "My family is small", "I love my home"]
                },
                {
                    title: "Lesson 4: At Home",
                    sentences: ["The chair is brown", "The table is big", "I have a soft bed", "The lamp is bright", "The door is open", "The window is closed", "My room is clean", "The kitchen is small", "I sit on the sofa", "The TV is loud", "I see the mirror", "The floor is cold", "Put it in the box", "The wall is white", "Use the blue plate", "Drink from the glass", "Wash your dirty hands", "Look at the clock", "The rug is soft", "Close the heavy door"]
                },
                {
                    title: "Lesson 5: Colors and Shapes",
                    sentences: ["The sky is blue", "The grass is green", "The sun is yellow", "This apple is red", "I see a white cloud", "The cat is black", "The ball is orange", "I like the purple flower", "Draw a big circle", "This is a square box", "The star is bright", "Look at the triangle", "My shirt is pink", "The car is gray", "I have a brown hat", "The paper is white", "Color the heart red", "The moon is round", "This is a long line", "I like all colors"]
                }
            ],
            negation: [
                {
                    title: "Lesson 1: Not with Be",
                    sentences: ["I am not sad", "You are not late", "He is not hungry", "She is not a doctor", "It is not cold today", "We are not tired", "They are not at home", "I am not a teacher", "You are not my brother", "He is not very old", "She is not my sister", "It is not a dog", "We are not in school", "They are not happy", "I am not angry", "You are not a singer", "He is not tall", "She is not busy", "It is not yellow", "We are not lost"]
                },
                {
                    title: "Lesson 2: Don't with Verbs",
                    sentences: ["I do not like milk", "You do not run fast", "They do not eat meat", "We do not go there", "I do not play games", "You do not hear me", "They do not want tea", "We do not see it", "I do not need help", "You do not know him", "They do not walk far", "We do not drink juice", "I do not sleep late", "You do not write well", "They do not sing loud", "We do not dance often", "I do not swim well", "You do not cook dinner", "They do not read books", "We do not work here"]
                },
                {
                    title: "Lesson 3: Doesn't with Verbs",
                    sentences: ["He does not like fish", "She does not play piano", "It does not rain here", "He does not go home", "She does not want candy", "It does not look good", "He does not hear you", "She does not see me", "It does not bark much", "He does not work hard", "She does not study math", "It does not cost much", "He does not drive fast", "She does not wear hats", "It does not taste sweet", "He does not feel well", "She does not need money", "It does not move fast", "He does not speak loud", "She does not live here"]
                },
                {
                    title: "Lesson 4: Cannot/Can't",
                    sentences: ["I cannot fly a plane", "You cannot touch the sky", "He cannot swim across", "She cannot speak Spanish", "It cannot climb trees", "We cannot see the wind", "They cannot come today", "I cannot lift this box", "You cannot go inside", "He cannot find his keys", "She cannot cook a meal", "It cannot run away", "We cannot hear the music", "They cannot wait long", "I cannot read that sign", "You cannot buy this car", "He cannot play guitar", "She cannot ride a bike", "It cannot jump high", "We cannot stay here"]
                },
                {
                    title: "Lesson 5: No and Never",
                    sentences: ["I have no money", "He has no friends", "She has no time", "There is no milk left", "I never eat breakfast", "He never goes to bed", "She never wears a coat", "They never play soccer", "I see no birds here", "He says no words", "She has no blue pen", "There are no books here", "I never drink coffee", "He never swims in winter", "She never speaks to me", "They never visit us", "I have no more bread", "He has no red car", "She has no big house", "I never walk to work"]
                }
            ],
            questions: [
                {
                    title: "Lesson 1: Yes/No with Be",
                    sentences: ["Are you happy", "Is he a doctor", "Is she your friend", "Is it cold outside", "Are we late", "Are they at home", "Am I a good student", "Are you hungry", "Is he your brother", "Is she a nurse", "Is it a big cat", "Are we in the park", "Are they busy now", "Is it a sunny day", "Are you ready", "Is he a teacher", "Is she very tall", "Are they tired", "Is it a blue car", "Are we best friends"]
                },
                {
                    title: "Lesson 2: Yes/No with Do",
                    sentences: ["Do you like apples", "Does he play soccer", "Does she speak English", "Do they live here", "Do we have time", "Does it rain often", "Do you want water", "Does he drive a car", "Does she sing well", "Do they know you", "Do you hear that", "Does he need help", "Does she have a cat", "Do they work hard", "Do you see the bird", "Does he go to school", "Does she cook dinner", "Do they read books", "Do you sleep early", "Does it taste good"]
                },
                {
                    title: "Lesson 3: What Questions",
                    sentences: ["What is your name", "What is this color", "What do you see", "What does he want", "What is in the box", "What is the time", "What do they eat", "What does she like", "What color is the sky", "What is that noise", "What do you need", "What does he say", "What are they doing", "What is your favorite food", "What do we do now", "What is in your bag", "What does she have", "What is the date", "What do you hear", "What is this book about"]
                },
                {
                    title: "Lesson 4: Where Questions",
                    sentences: ["Where is my pen", "Where do you live", "Where is the cat", "Where does he go", "Where are my shoes", "Where is the bathroom", "Where do they play", "Where does she work", "Where is the park", "Where are the keys", "Where do we go now", "Where is your school", "Where does he live", "Where is the milk", "Where are they from", "Where is the nearest shop", "Where do you sleep", "Where is her house", "Where is his car", "Where is the dog hiding"]
                },
                {
                    title: "Lesson 5: Can Questions",
                    sentences: ["Can you help me", "Can he swim well", "Can she speak English", "Can they come here", "Can we go out", "Can it fly", "Can you see the moon", "Can he run fast", "Can she play piano", "Can they hear us", "Can I have a glass", "Can you open the door", "Can he drive a car", "Can she cook rice", "Can they dance well", "Can we sit here", "Can you hear the music", "Can he jump high", "Can she ride a bike", "Can I go now"]
                }
            ]
        },
        
        currentCategory: 'basic',
        currentLessonIdx: 0,
        currentList: [],
        currentIndex: 0,
        score: 0,
        placedWords: [],
        correctSentence: "",
        view: 'main',

        start: () => {
            ui.get('sentences-section').style.display = 'flex';
            sentences.showView('main');
        },

        back: () => {
            if (sentences.view === 'main') {
                ui.get('sentences-section').style.display = 'none';
            } else if (sentences.view === 'lessons') {
                sentences.showView('main');
            } else if (sentences.view === 'practice' || sentences.view === 'result') {
                sentences.showView('lessons');
            }
        },

        showView: (v) => {
            sentences.view = v;
            const views = ['category-selection', 'lesson-selection', 'practice-area', 'result-screen'];
            views.forEach(id => ui.get(`sentences-${id}`).style.display = 'none');
            
            if (v === 'main') {
                ui.get('sentences-category-selection').style.display = 'grid';
                ui.get('sentences-title').textContent = 'SENTENCE BUILDER';
                ui.get('sentences-back-btn').textContent = '← BACK';
            } else if (v === 'lessons') {
                ui.get('sentences-lesson-selection').style.display = 'grid';
                ui.get('sentences-title').textContent = sentences.currentCategory.toUpperCase();
                ui.get('sentences-back-btn').textContent = '← MENU';
            } else if (v === 'practice') {
                ui.get('sentences-practice-area').style.display = 'block';
                ui.get('sentences-title').textContent = sentences.data[sentences.currentCategory][sentences.currentLessonIdx].title;
                ui.get('sentences-back-btn').textContent = '← LESSONS';
            } else if (v === 'result') {
                ui.get('sentences-result-screen').style.display = 'block';
                ui.get('sentences-title').textContent = 'COMPLETE';
                ui.get('sentences-back-btn').textContent = '← MENU';
            }
        },

        showLessons: (cat) => {
            sentences.currentCategory = cat;
            const container = ui.get('sentences-lesson-selection');
            container.innerHTML = sentences.data[cat].map((lesson, i) => `
                <button class="tactile-button" onclick="sentences.initLesson(${i})">${lesson.title}</button>
            `).join('');
            sentences.showView('lessons');
        },

        initLesson: (idx) => {
            sentences.currentLessonIdx = idx;
            const lesson = sentences.data[sentences.currentCategory][idx];
            sentences.currentList = [...lesson.sentences].sort(() => 0.5 - Math.random());
            sentences.currentIndex = 0;
            sentences.score = 0;
            sentences.showView('practice');
            sentences.nextQuestion();
        },

        nextQuestion: () => {
            if (sentences.currentIndex >= 20) {
                sentences.showResult();
                return;
            }
            const targetArea = ui.get('sentences-target-area');
            targetArea.parentElement.style.borderColor = 'var(--button-border)';
            targetArea.parentElement.style.background = 'var(--accent-color)';

            sentences.correctSentence = sentences.currentList[sentences.currentIndex];
            sentences.placedWords = [];
            sentences.renderQuestion();
            
            ui.get('sentences-check-btn').style.display = 'inline-flex';
            ui.get('sentences-next-btn').style.display = 'none';
            targetArea.classList.remove('locked');
            
            const progress = ((sentences.currentIndex + 1) / 20) * 100;
            ui.get('sentences-progress-fill').style.width = `${progress}%`;
            ui.get('sentences-progress-text').textContent = `${sentences.currentIndex + 1} / 20`;
            
            sentences.currentIndex++;
        },

        renderQuestion: () => {
            const words = sentences.correctSentence.split(' ');
            const shuffled = [...words].sort(() => 0.5 - Math.random());
            
            const poolContainer = ui.get('sentences-pool');
            poolContainer.innerHTML = shuffled.map((word, i) => `
                <button class="word-chip" onclick="sentences.placeWord(this, '${word}')">${word}</button>
            `).join('');

            sentences.updateTargetArea();
        },

        placeWord: (btn, word) => {
            btn.classList.add('used');
            sentences.placedWords.push(word);
            sentences.updateTargetArea();
        },

        updateTargetArea: () => {
            const targetArea = ui.get('sentences-target-area');
            if (sentences.placedWords.length === 0) {
                targetArea.innerHTML = '<p class="hero-text placeholder-msg">Tap words below to build the sentence</p>';
            } else {
                targetArea.innerHTML = sentences.placedWords.map((word, i) => `
                    <button class="word-chip-placed" onclick="sentences.removeWord(${i})">${word}</button>
                `).join('');
            }
        },

        removeWord: (index) => {
            if (ui.get('sentences-target-area').classList.contains('locked')) return;
            const removedWord = sentences.placedWords.splice(index, 1)[0];
            
            const chips = document.querySelectorAll('.word-chip');
            for (let chip of chips) {
                if (chip.textContent === removedWord && chip.classList.contains('used')) {
                    chip.classList.remove('used');
                    break; 
                }
            }
            sentences.updateTargetArea();
        },

        reset: () => {
            if (ui.get('sentences-target-area').classList.contains('locked')) return;
            sentences.placedWords = [];
            const chips = document.querySelectorAll('.word-chip');
            chips.forEach(c => c.classList.remove('used'));
            sentences.updateTargetArea();
        },

        check: () => {
            if (sentences.placedWords.length === 0) return;
            const current = sentences.placedWords.join(' ');
            const target = sentences.correctSentence;
            
            const targetArea = ui.get('sentences-target-area');
            targetArea.classList.add('locked');
            
            if (current === target) {
                sentences.score++;
                targetArea.parentElement.style.borderColor = '#008800';
                targetArea.parentElement.style.background = '#eeffee';
            } else {
                targetArea.parentElement.style.borderColor = '#cc0000';
                targetArea.parentElement.style.background = '#ffeeee';
                const msg = document.createElement('p');
                msg.className = 'hero-text';
                msg.style.color = '#cc0000';
                msg.style.marginTop = '10px';
                msg.textContent = `Correct: ${sentences.correctSentence}`;
                targetArea.appendChild(msg);
            }

            ui.get('sentences-check-btn').style.display = 'none';
            ui.get('sentences-next-btn').style.display = 'inline-flex';
        },

        showResult: () => {
            sentences.showView('result');
            ui.get('sentences-final-score').textContent = `${sentences.score} / 20`;
            ui.get('sentences-result-msg').textContent = sentences.score === 20 ? "PERFECT! Excellent sentence structure." : "Good effort! Keep practicing.";
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
            
            const pt = ui.get('user-profile-trigger');
            if (pt) {
                pt.style.display = 'flex'; pt.onclick = ui.togglePopup;
                const photo = ui.get('user-photo');
                if (user.photo_url && photo) { photo.src = user.photo_url; photo.style.display = 'block'; }
                else if (photo) { photo.style.display = 'none'; pt.innerHTML = '<span style="font-size: 1.2rem;">👤</span>'; }
            }
            if (ui.get('edit-name')) ui.get('edit-name').value = user.first_name;
            ui.switchView('blogs');
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
            // Apply Saved Theme
            const savedTheme = localStorage.getItem('theme') || 'light';
            if (savedTheme === 'dark') document.body.classList.add('dark-mode');
            
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
    window.prepositions = prepositions;
    window.sentences = sentences;
    window.days = days;
    window.numbers = numbers;
    window.auth = auth;

    document.addEventListener('DOMContentLoaded', auth.init);

})();
