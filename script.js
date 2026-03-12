// Tem English - Ultimate Stability & Professional Grade
// 100% Robustness & Device Responsive

(function() {
    "use strict";

    const BOT_USERNAME = "Tem_english_bot"; 
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwreCxhjscVkc24maOmCWBGQkeNNhNmZpng3ntxs34ssV-WjDRlPp9V3-tSTwTY454lMw/exec";

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
            { word: "About", notes: `<h3>1. Subject Matter (အကြောင်းအရာ)</h3><p>တစ်ခုခု သို့မဟုတ် တစ်စုံတစ်ယောက်၏ အကြောင်းကို ဖော်ပြရာတွင် သုံးသည်။</p><h3>2. Approximation (ခန့်မှန်းခြေ)</h3><p>အရေအတွက်၊ အချိန် သို့မဟုတ် အတိုင်းအတာတစ်ခုကို အတိအကျမဟုတ်ဘဲ နီးစပ်ရာ ခန့်မှန်းပြောဆိုရာတွင် သုံးသည်။</p><h3>3. Movement in Area (ဟိုဟိုဒီဒီ)</h3><p>နေရာတစ်ခုအတွင်း ဦးတည်ချက်မရှိဘဲ လှုပ်ရှားသွားလာခြင်းကို ပြသည်။</p>`, exercises: [{"options": ["I am thinking about my future.", "I am thinking on my future.", "I am thinking at my future."], "answer": "I am thinking about my future."}, {"options": ["It is about 10 miles from here.", "It is above 10 miles from here.", "It is across 10 miles from here."], "answer": "It is about 10 miles from here."}, {"options": ["Stop running about the room.", "Stop running against the room.", "Stop running among the room."], "answer": "Stop running about the room."}] },
            { word: "Above", notes: `<h3>1. Higher Position (အထက်ဘက်)</h3><p>အရာဝတ္ထုတစ်ခု၏ အပေါ်ဘက် တည့်တည့် သို့မဟုတ် မြင့်သောနေရာတွင် ရှိနေခြင်း (ထိကပ်မနေရပါ)။</p><h3>2. Superiority/Rank (အဆင့်အတန်း)</h3><p>အရေအတွက်၊ အရည်အချင်း သို့မဟုတ် အဆင့်အတန်း ပိုမိုမြင့်မားခြင်းကို ပြသည်။</p>`, exercises: [{"options": ["The plane is flying above the clouds.", "The plane is flying on the clouds.", "The plane is flying about the clouds."], "answer": "The plane is flying above the clouds."}, {"options": ["His work is above average.", "His work is about average.", "His work is across average."], "answer": "His work is above average."}, {"options": ["He lives in the flat above us.", "He lives in the flat across us.", "He lives in the flat along us."], "answer": "He lives in the flat above us."}] },
            { word: "Across", notes: `<h3>1. Movement (ဖြတ်သန်းခြင်း)</h3><p>တစ်ဖက်မှ အခြားတစ်ဖက်သို့ ဖြတ်ကျော်သွားခြင်း။</p><h3>2. Opposite Side (တစ်ဖက်ခြမ်း)</h3><p>လမ်း သို့မဟုတ် မြစ်၏ တစ်ဖက်တစ်ချက်တွင် ရှိနေခြင်း။</p>`, exercises: [{"options": ["We walked across the bridge.", "We walked along the bridge.", "We walked against the bridge."], "answer": "We walked across the bridge."}, {"options": ["The bank is across the street.", "The bank is among the street.", "The bank is above the street."], "answer": "The bank is across the street."}, {"options": ["He drew a line across the page.", "He drew a line along the page.", "He drew a line about the page."], "answer": "He drew a line across the page."}] },
            { word: "Against", notes: `<h3>1. Opposition (ဆန့်ကျင်ခြင်း)</h3><p>အယူအဆ၊ စည်းကမ်း သို့မဟုတ် ပြိုင်ပွဲတစ်ခုတွင် ဆန့်ကျင်ဘက်ဖြစ်နေခြင်း။</p><h3>2. Physical Contact (မှီထားခြင်း)</h3><p>နံရံ သို့မဟုတ် အရာတစ်ခုကို အားပြု၍ မှီထားခြင်း သို့မဟုတ် ထိကပ်နေခြင်း။</p>`, exercises: [{"options": ["He is leaning against the wall.", "He is leaning along the wall.", "He is leaning above the wall."], "answer": "He is leaning against the wall."}, {"options": ["Are you against this plan?", "Are you across this plan?", "Are you around this plan."], "answer": "Are you against this plan?"}, {"options": ["They are playing against a strong team.", "They are playing along a strong team.", "They are playing about a strong team."], "answer": "They are playing against a strong team."}] },
            { word: "Along", notes: `<h3>1. Parallel Movement (တစ်လျှောက်)</h3><p>လမ်း၊ မြစ် သို့မဟုတ် အရာတစ်ခု၏ အလျားအတိုင်း ဘေးမှ ယှဉ်လျက်သွားခြင်း။</p><h3>2. Position (တစ်လျှောက်ရှိနေရာ)</h3><p>အလျားလိုက် တန်းစီလျက် ရှိနေသော အနေအထား။</p>`, exercises: [{"options": ["We walked along the beach.", "We walked across the beach.", "We walked against the beach."], "answer": "We walked along the beach."}, {"options": ["Trees are planted along the road.", "Trees are planted among the road.", "Trees are planted above the road."], "answer": "Trees are planted along the road."}, {"options": ["The boat moved along the river.", "The boat moved about the river.", "The boat moved across the river."], "answer": "The boat moved along the river."}] },
            { word: "Among", notes: `<h3>1. In a Group (အကြား/အလယ်)</h3><p>လူ သို့မဟုတ် အရာဝတ္ထု (၃) ခုနှင့်အထက် ရှိသော အုပ်စုတစ်ခု၏ အလယ် သို့မဟုတ် အကြားတွင် ရှိနေခြင်း။</p><h3>2. Distribution (ခွဲဝေခြင်း)</h3><p>အုပ်စုဝင်များကြားထဲတွင် နှံ့စပ်အောင် လုပ်ဆောင်ခြင်း။</p>`, exercises: [{"options": ["She sat among her friends.", "She sat between her friends.", "She sat along her friends."], "answer": "She sat among her friends."}, {"options": ["Divide the sweets among the children.", "Divide the sweets between the children.", "Divide the sweets against the children."], "answer": "Divide the sweets among the children."}, {"options": ["I found a letter among the books.", "I found a letter along the books.", "I found a letter above the books."], "answer": "I found a letter among the books."}] },
            { word: "Around", notes: `<h3>1. Circular Movement (ပတ်ပတ်လည်)</h3><p>ဗဟိုချက်တစ်ခုကို ဝန်းရံ၍ လှည့်ပတ်ခြင်း။</p><h3>2. Approximate Time/Place (ဝန်းကျင်)</h3><p>အချိန် သို့မဟုတ် နေရာတစ်ခု၏ အနီးအနားတွင် ရှိနေခြင်း။</p>`, exercises: [{"options": ["The earth moves around the sun.", "The earth moves across the sun.", "The earth moves along the sun."], "answer": "The earth moves around the sun."}, {"options": ["I will meet you around 5 PM.", "I will meet you among 5 PM.", "I will meet you against 5 PM."], "answer": "I will meet you around 5 PM."}, {"options": ["He lives somewhere around here.", "He lives somewhere among here.", "He lives somewhere along here."], "answer": "He lives somewhere around here."}] },
            { word: "At", notes: `<h3>1. Specific Point (နေရာအတိအကျ)</h3><p>နေရာတစ်ခု၏ တိကျသော အမှတ်အသားကို ပြသည်။</p><h3>2. Specific Time (အချိန်အတိအကျ)</h3><p>နာရီအချိန် သို့မဟုတ် အမှတ်အသားတစ်ခုကို ပြသည်။</p><h3>3. Activity (လုပ်ဆောင်ချက်)</h3><p>တစ်စုံတစ်ခုကို လုပ်ဆောင်နေသော နေရာကို ပြသည်။</p>`, exercises: [{"options": ["I am at the bus stop.", "I am on the bus stop.", "I am in the bus stop."], "answer": "I am at the bus stop."}, {"options": ["The movie starts at 8 PM.", "The movie starts in 8 PM.", "The movie starts on 8 PM."], "answer": "The movie starts at 8 PM."}, {"options": ["She is good at English.", "She is good in English.", "She is good on English."], "answer": "She is good at English."}] },
            { word: "Behind", notes: `<h3>1. Position (အနောက်ဘက်)</h3><p>အရာတစ်ခု၏ ကွယ်ရာ သို့မဟုတ် နောက်ဘက်တွင် ရှိနေခြင်း။</p><h3>2. Lagging (နောက်ကျကျန်ခြင်း)</h3><p>တိုးတက်မှု သို့မဟုတ် အချိန်ဇယားတွင် နောက်ကျနေခြင်း။</p>`, exercises: [{"options": ["The cat is behind the sofa.", "The cat is below the sofa.", "The cat is beneath the sofa."], "answer": "The cat is behind the sofa."}, {"options": ["The sun went behind the clouds.", "The sun went below the clouds.", "The sun went beneath the clouds."], "answer": "The sun went behind the clouds."}, {"options": ["We are behind schedule.", "We are below schedule.", "We are beneath schedule."], "answer": "We are behind schedule."}] },
            { word: "Below", notes: `<h3>1. Lower Position (အောက်ဘက်)</h3><p>အဆင့် သို့မဟုတ် တည်နေရာ ပို၍နိမ့်သော နေရာတွင် ရှိနေခြင်း။</p><h3>2. Measurements (အတိုင်းအတာ)</h3><p>အပူချိန် သို့မဟုတ် ကိန်းဂဏန်းတစ်ခုထက် နိမ့်ကျနေခြင်း။</p>`, exercises: [{"options": ["Please sign your name below the line.", "Please sign your name beneath the line.", "Please sign your name behind the line."], "answer": "Please sign your name below the line."}, {"options": ["The temperature is below zero.", "The temperature is behind zero.", "The temperature is beneath zero."], "answer": "The temperature is below zero."}, {"options": ["He lives in the apartment below us.", "He lives in the apartment beneath us.", "He lives in the apartment behind us."], "answer": "He lives in the apartment below us."}] },
            { word: "Beneath", notes: `<h3>1. Underneath (အောက်ခြေ)</h3><p>တိုက်ရိုက်အောက်တွင် ရှိနေခြင်း သို့မဟုတ် တစ်ခုခုဖြင့် ဖုံးအုပ်ခံထားရခြင်း (Below ထက် ပို၍ လေးနက်သော စာပေသုံး)။</p><h3>2. Status/Worth (တန်ဖိုးမရှိခြင်း)</h3><p>တစ်စုံတစ်ယောက်၏ ဂုဏ်သိက္ခာနှင့် မထိုက်တန်ဟု ယူဆခြင်း။</p>`, exercises: [{"options": ["They sat beneath the shade of the tree.", "They sat behind the shade of the tree.", "They sat among the shade of the tree."], "answer": "They sat beneath the shade of the tree."}, {"options": ["The ground was hard beneath our feet.", "The ground was hard below our feet.", "The ground was hard around our feet."], "answer": "The ground was hard beneath our feet."}, {"options": ["It is beneath his dignity to lie.", "It is below his dignity to lie.", "It is behind his dignity to lie."], "answer": "It is beneath his dignity to lie."}] },
            { word: "Beside", notes: `<h3>1. Next To (ဘေးကပ်လျက်)</h3><p>တစ်စုံတစ်ခု၏ ဘေးတွင် ကပ်လျက်ရှိနေခြင်း။</p><h3>2. Comparison (နှိုင်းယှဉ်ချက်)</h3><p>အရာတစ်ခုနှင့် တစ်ခုကို ယှဉ်တွဲကြည့်ခြင်း။</p>`, exercises: [{"options": ["Come and sit beside me.", "Come and sit besides me.", "Come and sit behind me."], "answer": "Come and sit beside me."}, {"options": ["The house is beside the river.", "The house is among the river.", "The house is around the river."], "answer": "The house is beside the river."}, {"options": ["Who is that standing beside Tom?", "Who is that standing against Tom?", "Who is that standing across Tom?"], "answer": "Who is that standing beside Tom?"}] },
            { word: "Between", notes: `<h3>1. Middle of Two (နှစ်ခုကြား)</h3><p>လူ သို့မဟုတ် အရာဝတ္ထု (၂) ခု၏ အလယ်တွင် ရှိနေခြင်း။</p><h3>2. Choice (ရွေးချယ်မှု)</h3><p>အရာနှစ်ခုအနက်မှ တစ်ခုကို ရွေးချယ်ခြင်း။</p>`, exercises: [{"options": ["I sat between my parents.", "I sat among my parents.", "I sat around my parents."], "answer": "I sat between my parents."}, {"options": ["There is a secret between us.", "There is a secret among us.", "There is a secret around us."], "answer": "There is a secret between us."}, {"options": ["Choose between the red and blue one.", "Choose among the red and blue one.", "Choose along the red and blue one."], "answer": "Choose between the red and blue one."}] },
            { word: "Beyond", notes: `<h3>1. Farther Side (ကျော်လွန်၍)</h3><p>နေရာ သို့မဟုတ် ကန့်သတ်ချက်တစ်ခု၏ တစ်ဖက်ခြမ်းတွင် ရှိနေခြင်း။</p><h3>2. Impossible to Do (မဖြစ်နိုင်ခြင်း)</h3><p>နားလည်နိုင်စွမ်း သို့မဟုတ် လုပ်နိုင်စွမ်းထက် ကျော်လွန်နေခြင်း။</p>`, exercises: [{"options": ["The village is beyond the hills.", "The village is behind the hills.", "The village is beneath the hills."], "answer": "The village is beyond the hills."}, {"options": ["His behavior is beyond belief.", "His behavior is behind belief.", "His behavior is below belief."], "answer": "His behavior is beyond belief."}, {"options": ["The cost is beyond our budget.", "The cost is below our budget.", "The cost is beneath our budget."], "answer": "The cost is beyond our budget."}] },
            { word: "By", notes: `<h3>1. Nearness (အနီး)</h3><p>ဘေးတွင် သို့မဟုတ် အနားတွင် ရှိနေခြင်း။</p><h3>2. Agent (ပြုလုပ်သူ)</h3><p>Passive voice တွင် လုပ်ဆောင်သူကို ပြရန်သုံးသည်။</p><h3>3. Method (နည်းလမ်း)</h3><p>တစ်ခုခုကို လုပ်ဆောင်သော နည်းလမ်း သို့မဟုတ် သွားလာသော ယာဉ်။</p>`, exercises: [{"options": ["I live by the sea.", "I live at the sea.", "I live on the sea."], "answer": "I live by the sea."}, {"options": ["This book was written by him.", "This book was written from him.", "This book was written at him."], "answer": "This book was written by him."}, {"options": ["We traveled by train.", "We traveled in train.", "We traveled with train."], "answer": "We traveled by train."}] },
            { word: "Down", notes: `<h3>1. Movement (အောက်သို့)</h3><p>အပေါ်မှ အောက်သို့ နိမ့်ဆင်းသွားခြင်း။</p><h3>2. Position (အောက်ဘက်တွင်ရှိသော)</h3><p>လမ်း သို့မဟုတ် မြစ်၏ အောက်ဘက် အစိတ်အပိုင်း။</p>`, exercises: [{"options": ["The sun is going down.", "The sun is going below.", "The sun is going beneath."], "answer": "The sun is going down."}, {"options": ["He walked down the stairs.", "He walked below the stairs.", "He walked beneath the stairs."], "answer": "He walked down the stairs."}, {"options": ["Tears ran down her face.", "Tears ran below her face.", "Tears ran beneath her face."], "answer": "Tears ran down her face."}] },
            { word: "During", notes: `<h3>1. Period of Time (အတွင်း)</h3><p>အချိန်ကာလတစ်ခု စတင်သည်မှ ပြီးဆုံးသည်အထိ အတောအတွင်း ဖြစ်ပျက်ခြင်း။</p>`, exercises: [{"options": ["I slept during the movie.", "I slept for the movie.", "I slept at the movie."], "answer": "I slept during the movie."}, {"options": ["Don't talk during the test.", "Don't talk for the test.", "Don't talk at the test."], "answer": "Don't talk during the test."}, {"options": ["It rained during the night.", "It rained for the night.", "It rained at the night."], "answer": "It rained during the night."}] },
            { word: "Except", notes: `<h3>1. Exclusion (ချွင်းချက်)</h3><p>တစ်ခု သို့မဟုတ် တစ်စုံတစ်ယောက်ကို ချန်လှပ်ထားခြင်း။</p>`, exercises: [{"options": ["I like all fruit except apples.", "I like all fruit besides apples.", "I like all fruit against apples."], "answer": "I like all fruit except apples."}, {"options": ["The shop is open every day except Sunday.", "The shop is open every day beyond Sunday.", "The shop is open every day behind Sunday."], "answer": "The shop is open every day except Sunday."}, {"options": ["Everyone was there except me.", "Everyone was there along me.", "Everyone was there around me."], "answer": "Everyone was there except me."}] },
            { word: "For", notes: `<h3>1. Purpose (ရည်ရွယ်ချက်)</h3><p>တစ်ခုခုကို ရရှိရန် သို့မဟုတ် လုပ်ဆောင်ရန် ရည်ရွယ်ခြင်း။</p><h3>2. Benefit (အကျိုးကျေးဇူး)</h3><p>တစ်စုံတစ်ယောက်အတွက် ရည်စူးခြင်း။</p><h3>3. Duration (ကြာချိန်)</h3><p>အချိန် မည်မျှကြာသည်ကို ပြသည်။</p>`, exercises: [{"options": ["This gift is for you.", "This gift is from you.", "This gift is to you."], "answer": "This gift is for you."}, {"options": ["I have lived here for five years.", "I have lived here during five years.", "I have lived here since five years."], "answer": "I have lived here for five years."}, {"options": ["What is this tool for?", "What is this tool about?", "What is this tool against?"], "answer": "What is this tool for."}] },
            { word: "From", notes: `<h3>1. Origin (မူလအရပ်)</h3><p>စတင်ရာနေရာ သို့မဟုတ် ဇာတိကို ပြသည်။</p><h3>2. Starting Point (စတင်ချိန်)</h3><p>အချိန် သို့မဟုတ် အခြေအနေတစ်ခု စတင်ရာ အမှတ်အသား။</p><h3>3. Cause (အကြောင်းရင်း)</h3><p>တစ်ခုခုကြောင့် ဖြစ်ပေါ်လာရခြင်း။</p>`, exercises: [{"options": ["I am from Myanmar.", "I am at Myanmar.", "I am in Myanmar."], "answer": "I am from Myanmar."}, {"options": ["The shop is open from 9 AM.", "The shop is open at 9 AM.", "The shop is open for 9 AM."], "answer": "The shop is open from 9 AM."}, {"options": ["Take the keys from the table.", "Take the keys off the table.", "Take the keys by the table."], "answer": "Take the keys from the table."}] },
            { word: "In", notes: `<h3>1. Inside a Space (နေရာတစ်ခု၏ အတွင်း)</h3><p>အရာဝတ္ထုတစ်ခု သို့မဟုတ် နေရာတစ်ခု၏ အတွင်းပိုင်းတွင် ရှိနေခြင်းကို ပြသည်။</p><h3>2. Time - Periods (အချိန်ကာလ)</h3><p>လ၊ ခုနှစ်၊ ရာသီ သို့မဟုတ် နေ့၏ အစိတ်အပိုင်း (Morning/Afternoon/Evening) များတွင် သုံးသည်။</p><h3>3. State or Condition (အခြေအနေ)</h3><p>စိတ်ခံစားမှု သို့မဟုတ် ရုပ်ပိုင်းဆိုင်ရာ အခြေအနေတစ်ခုအတွင်း ရောက်ရှိနေခြင်းကို ပြသည်။</p>`, exercises: [{"options": ["The keys are in my pocket.", "The keys are at my pocket.", "The keys are on my pocket."], "answer": "The keys are in my pocket."}, {"options": ["I was born in 1995.", "I was born on 1995.", "I was born at 1995."], "answer": "I was born in 1995."}, {"options": ["They are in love.", "They are on love.", "They are at love."], "answer": "They are in love."}] },
            { word: "Inside", notes: `<h3>1. Inner Part (အတွင်းဘက်တည့်တည့်)</h3><p>'In' ထက် ပို၍ အတွင်းကျကျ နေရာကို အလေးပေးလိုသောအခါ သို့မဟုတ် အကာအကွယ်တစ်ခု၏ အတွင်းဘက်ကို ပြောလိုသောအခါ သုံးသည်။</p>`, exercises: [{"options": ["What is inside the box?", "What is besides the box?", "What is beyond the box."], "answer": "What is inside the box?"}, {"options": ["Go inside the house.", "Go into the house.", "Go in the house."], "answer": "Go inside the house."}, {"options": ["The cat is inside the cupboard.", "The cat is among the cupboard.", "The cat is along the cupboard."], "answer": "The cat is inside the cupboard."}] },
            { word: "Into", notes: `<h3>1. Movement Towards (အတွင်းသို့ ဦးတည်ခြင်း)</h3><p>အပြင်ဘက်မှ အတွင်းဘက်သို့ လှုပ်ရှားဝင်ရောက်သွားခြင်းကို ပြသည်။</p><h3>2. Change of State (အသွင်ပြောင်းလဲခြင်း)</h3><p>အခြေအနေတစ်ခုမှ အခြားတစ်ခုသို့ လုံးဝပြောင်းလဲသွားခြင်း။</p>`, exercises: [{"options": ["He jumped into the water.", "He jumped in the water.", "He jumped inside the water."], "answer": "He jumped into the water."}, {"options": ["Translate this into Burmese.", "Translate this in Burmese.", "Translate this to Burmese."], "answer": "Translate this into Burmese."}, {"options": ["The caterpillar turned into a butterfly.", "The caterpillar turned in a butterfly.", "The caterpillar turned to a butterfly."], "answer": "The caterpillar turned into a butterfly."}] },
            { word: "Of", notes: `<h3>1. Possession (ပိုင်ဆိုင်မှု)</h3><p>တစ်ခုခု သို့မဟုတ် တစ်စုံတစ်ယောက်နှင့် သက်ဆိုင်ကြောင်း ပြသည်။</p><h3>2. Material (ပါဝင်ပစ္စည်း)</h3><p>အရာဝတ္ထုတစ်ခုကို ဘာနှင့် ပြုလုပ်ထားကြောင်း ပြသည်။</p><h3>3. Part/Amount (အစိတ်အပိုင်း/ပမာဏ)</h3><p>စုစုပေါင်းမှ အစိတ်အပိုင်း သို့မဟုတ် အတိုင်းအတာကို ပြသည်။</p>`, exercises: [{"options": ["The color of the sky is blue.", "The color from the sky is blue.", "The color off the sky is blue."], "answer": "The color of the sky is blue."}, {"options": ["A table made of wood.", "A table made from wood.", "A table made with wood."], "answer": "A table made of wood."}, {"options": ["A glass of water.", "A glass from water.", "A glass with water."], "answer": "A glass of water."}] },
            { word: "Off", notes: `<h3>1. Movement Away (ခွာထွက်ခြင်း)</h3><p>မျက်နှာပြင်တစ်ခု သို့မဟုတ် နေရာတစ်ခုမှ ဝေးရာသို့ ခွာထွက်ခြင်း။</p><h3>2. Disconnection (ဖြတ်တောက်ခြင်း)</h3><p>လျှပ်စစ်မီး သို့မဟုတ် စက်ပစ္စည်းများကို ပိတ်လိုက်ခြင်း။</p>`, exercises: [{"options": ["He fell off the bike.", "He fell out of the bike.", "He fell from the bike."], "answer": "He fell off the bike."}, {"options": ["Turn off the light.", "Turn out the light.", "Turn down the light."], "answer": "Turn off the light."}, {"options": ["Keep off the grass.", "Keep out the grass.", "Keep from the grass."], "answer": "Keep off the grass."}] },
            { word: "On", notes: `<h3>1. Surface (မျက်နှာပြင်ပေါ်တွင်)</h3><p>အရာတစ်ခု၏ အပေါ်တွင် ထိကပ်လျက် ရှိနေခြင်း။</p><h3>2. Days and Dates (နေ့ရက်များ)</h3><p>တနင်္လာ၊ အင်္ဂါ စသည့် နေ့ရက်များနှင့် ရက်စွဲများရှေ့တွင် သုံးသည်။</p><h3>3. Electronic Media (အီလက်ထရွန်နစ်)</h3><p>တီဗွီ၊ ဖုန်း သို့မဟုတ် အင်တာနက် သုံးနေခြင်းကို ပြသည်။</p>`, exercises: [{"options": ["The book is on the table.", "The book is in the table.", "The book is at the table."], "answer": "The book is on the table."}, {"options": ["I will see you on Monday.", "I will see you in Monday.", "I will see you at Monday."], "answer": "I will see you on Monday."}, {"options": ["He is on the phone.", "He is in the phone.", "He is at the phone."], "answer": "He is on the phone."}] },
            { word: "Out of", notes: `<h3>1. Movement to Outside (အပြင်သို့)</h3><p>အတွင်းဘက်မှ အပြင်ဘက်သို့ ထွက်ခွာခြင်း။</p><h3>2. Lack of (မရှိတော့ခြင်း)</h3><p>တစ်ခုခု ကုန်သွားခြင်း သို့မဟုတ် မရှိတော့ခြင်း။</p><h3>3. Reason (အကြောင်းရင်း)</h3><p>စိတ်ရင်း သို့မဟုတ် အကြောင်းပြချက်တစ်ခုကြောင့် လုပ်ဆောင်ခြင်း။</p>`, exercises: [{"options": ["Get out of the car.", "Get off the car.", "Get from the car."], "answer": "Get out of the car."}, {"options": ["We are out of coffee.", "We are off coffee.", "We are from coffee."], "answer": "We are out of coffee."}, {"options": ["I asked out of curiosity.", "I asked off curiosity.", "I asked from curiosity."], "answer": "I asked out of curiosity."}] },
            { word: "Outside", notes: `<h3>1. External (အပြင်ဘက်)</h3><p>အဆောက်အအုံ သို့မဟုတ် နေရာတစ်ခု၏ အပြင်ဘက်တွင် ရှိနေခြင်း။</p>`, exercises: [{"options": ["Wait outside the room.", "Wait out of the room.", "Wait off the room."], "answer": "Wait outside the room."}, {"options": ["The dog is outside.", "The dog is out of.", "The dog is off."], "answer": "The dog is outside."}, {"options": ["It is cold outside.", "It is cold out of.", "It is cold off."], "answer": "It is cold outside."}] },
            { word: "Over", notes: `<h3>1. Directly Above (အထက်တည့်တည့်)</h3><p>အရာတစ်ခု၏ အပေါ်တည့်တည့်တွင် ရှိနေခြင်း သို့မဟုတ် ဖြတ်သန်းသွားခြင်း။</p><h3>2. Covering (ဖုံးအုပ်ခြင်း)</h3><p>တစ်ခုခုကို အုပ်မိအောင် ပြုလုပ်ခြင်း။</p><h3>3. More Than (ထက်ပိုသော)</h3><p>အရေအတွက် သို့မဟုတ် အသက် ကျော်လွန်ခြင်း။</p>`, exercises: [{"options": ["The bridge is over the river.", "The bridge is above the river.", "The bridge is on the river."], "answer": "The bridge is over the river."}, {"options": ["Put a cloth over the food.", "Put a cloth above the food.", "Put a cloth on the food."], "answer": "Put a cloth over the food."}, {"options": ["He is over 18 years old.", "He is above 18 years old.", "He is on 18 years old."], "answer": "He is over 18 years old."}] },
            { word: "Since", notes: `<h3>1. Starting Point in Time (စကတည်းက)</h3><p>အတိတ်က အချိန်တစ်ခုမှ ယခုအချိန်အထိ ဆက်တိုက်ဖြစ်ပျက်နေခြင်းကို ပြသည်။</p>`, exercises: [{"options": ["I have been here since 9 AM.", "I have been here for 9 AM.", "I have been here during 9 AM."], "answer": "I have been here since 9 AM."}, {"options": ["It hasn't rained since June.", "It hasn't rained for June.", "It hasn't rained during June."], "answer": "It hasn't rained since June."}, {"options": ["We have known each other since childhood.", "We have known each other for childhood.", "We have known each other during childhood."], "answer": "We have known each other since childhood."}] },
            { word: "Through", notes: `<h3>1. Moving Inside (ဖြတ်သန်း၍)</h3><p>ဘေးပတ်လည် ပိတ်ဆို့နေသော အရာတစ်ခု (ဥပမာ- တော၊ လိုဏ်ခေါင်း) အတွင်းမှ ဖြတ်သွားခြင်း။</p><h3>2. Method/Means (နည်းလမ်း)</h3><p>တစ်ခုခုကို အသုံးချ၍ သို့မဟုတ် ကြိုးစားမှုဖြင့် ရရှိခြင်း။</p>`, exercises: [{"options": ["The train went through the tunnel.", "The train went across the tunnel.", "The train went along the tunnel."], "answer": "The train went through the tunnel."}, {"options": ["Success comes through hard work.", "Success comes along hard work.", "Success comes across hard work."], "answer": "Success comes through hard work."}, {"options": ["I looked through the window.", "I looked across the window.", "I looked along the window."], "answer": "I looked through the window."}] },
            { word: "To", notes: `<h3>1. Direction/Destination (ဆီသို့)</h3><p>သွားမည့် ဦးတည်ရာ သို့မဟုတ် ပန်းတိုင်ကို ပြသည်။</p><h3>2. Recipient (လက်ခံသူ)</h3><p>တစ်ခုခုကို လက်ခံရရှိသူကို ပြသည်။</p><h3>3. Comparison (နှိုင်းယှဉ်ချက်)</h3><p>တစ်ခုနှင့်တစ်ခု နှိုင်းယှဉ်ရာတွင် သုံးသည်။</p>`, exercises: [{"options": ["I am going to school.", "I am going at school.", "I am going in school."], "answer": "I am going to school."}, {"options": ["Give this to him.", "Give this from him.", "Give this for him."], "answer": "Give this to him."}, {"options": ["I prefer tea to coffee.", "I prefer tea than coffee.", "I prefer tea for coffee."], "answer": "I prefer tea to coffee."}] },
            { word: "Toward", notes: `<h3>1. In the Direction of (ဘက်သို့)</h3><p>တိကျသော ပန်းတိုင်ထက် ဦးတည်ချက်ကိုသာ အလေးပေးပြောဆိုခြင်း (ဆီသို့ ဦးတည်၍)။</p>`, exercises: [{"options": ["He walked toward the door.", "He walked to the door.", "He walked at the door."], "answer": "He walked toward the door."}, {"options": ["The bus is headed toward the city.", "The bus is headed to the city.", "The bus is headed at the city."], "answer": "The bus is headed toward the city."}, {"options": ["She turned toward me.", "She turned to me.", "She turned at me."], "answer": "She turned toward me."}] },
            { word: "Under", notes: `<h3>1. Lower Position (အောက်တည့်တည့်)</h3><p>အရာတစ်ခု၏ အောက်ဘက်တွင် ရှိနေခြင်း (ဖုံးအုပ်ခံထားရသည့် သဘောပါဝင်သည်)။</p><h3>2. Less Than (ထက်နည်းသော)</h3><p>အရေအတွက် သို့မဟုတ် ဈေးနှုန်း နိမ့်ကျခြင်း။</p><h3>3. Control (လက်အောက်)</h3><p>ဥပဒေ သို့မဟုတ် အုပ်ချုပ်မှုအောက်တွင် ရှိခြင်း။</p>`, exercises: [{"options": ["The cat is under the table.", "The cat is below the table.", "The cat is beneath the table."], "answer": "The cat is under the table."}, {"options": ["Children under 12 are free.", "Children below 12 are free.", "Children beneath 12 are free."], "answer": "Children under 12 are free."}, {"options": ["Everything is under control.", "Everything is below control.", "Everything is beneath control."], "answer": "Everything is under control."}] },
            { word: "Until", notes: `<h3>1. Up to a Time (တိုင်အောင်)</h3><p>အချိန်တစ်ခု ရောက်သည်အထိ အခြေအနေတစ်ခု ဆက်ဖြစ်နေခြင်း။</p>`, exercises: [{"options": ["Wait until I come back.", "Wait since I come back.", "Wait for I come back."], "answer": "Wait until I come back."}, {"options": ["The shop is open until 9 PM.", "The shop is open since 9 PM.", "The shop is open for 9 PM."], "answer": "The shop is open until 9 PM."}, {"options": ["Keep going until you see the sign.", "Keep going since you see the sign.", "Keep going for you see the sign."], "answer": "Keep going until you see the sign."}] },
            { word: "Up", notes: `<h3>1. Higher Position (အထက်သို့)</h3><p>နိမ့်သောနေရာမှ မြင့်သောနေရာသို့ ဦးတည်ခြင်း။</p><h3>2. Along (တစ်လျှောက်)</h3><p>လမ်း သို့မဟုတ် မြစ်တစ်လျှောက် သွားခြင်း။</p>`, exercises: [{"options": ["Go up the stairs.", "Go on the stairs.", "Go above the stairs."], "answer": "Go up the stairs."}, {"options": ["Prices are going up.", "Prices are going on.", "Prices are going over."], "answer": "Prices are going up."}, {"options": ["He walked up the street.", "He walked on the street.", "He walked over the street."], "answer": "He walked up the street."}] },
            { word: "With", notes: `<h3>1. Accompaniment (နှင့်အတူ)</h3><p>လူ သို့မဟုတ် အရာတစ်ခုနှင့် အတူရှိနေခြင်း။</p><h3>2. Instrument (ဖြင့်)</h3><p>ကိရိယာတစ်ခုခုကို အသုံးပြု၍ လုပ်ဆောင်ခြင်း။</p><h3>3. Having (ပါရှိခြင်း)</h3><p>လက္ခဏာ သို့မဟုတ် အရာဝတ္ထုတစ်ခု ပါဝင်နေခြင်း။</p>`, exercises: [{"options": ["I went with my friends.", "I went by my friends.", "I went from my friends."], "answer": "I went with my friends."}, {"options": ["Write with a pen.", "Write by a pen.", "Write from a pen."], "answer": "Write with a pen."}, {"options": ["The girl with blue eyes.", "The girl of blue eyes.", "The girl by blue eyes."], "answer": "The girl with blue eyes."}] },
            { word: "Within", notes: `<h3>1. Inside Limits (အတွင်း၌)</h3><p>သတ်မှတ်ထားသော အချိန်၊ အကွာအဝေး သို့မဟုတ် အတိုင်းအတာ၏ အတွင်း၌ ဖြစ်ပျက်ခြင်း။</p>`, exercises: [{"options": ["Please reply within 24 hours.", "Please reply in 24 hours.", "Please reply inside 24 hours."], "answer": "Please reply within 24 hours."}, {"options": ["He lives within walking distance.", "He lives in walking distance.", "He lives inside walking distance."], "answer": "He lives within walking distance."}, {"options": ["Keep within the rules.", "Keep in the rules.", "Keep inside the rules."], "answer": "Keep within the rules."}] },
            { word: "Without", notes: `<h3>1. Lacking (မပါဘဲ)</h3><p>တစ်ခုခု သို့မဟုတ် တစ်စုံတစ်ယောက် မရှိဘဲ လုပ်ဆောင်ခြင်း။</p>`, exercises: [{"options": ["I can't live without you.", "I can't live except you.", "I can't live beside you."], "answer": "I can't live without you."}, {"options": ["He left without saying a word.", "He left except saying a word.", "He left beside saying a word."], "answer": "He left without saying a word."}, {"options": ["Coffee without sugar.", "Coffee except sugar.", "Coffee beside sugar."], "answer": "Coffee without sugar."}] }
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
            
            ui.get('prep-current-word').textContent = lesson.word.toUpperCase();
            ui.get('prep-lesson-content').innerHTML = lesson.notes;
            
            // Extract a pure example from notes (first blockquote)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = lesson.notes;
            const firstQuote = tempDiv.querySelector('blockquote');
            ui.get('prep-pure-example').innerHTML = firstQuote ? firstQuote.innerHTML : "No example available.";
            
            prepositions.showView('lesson');
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
