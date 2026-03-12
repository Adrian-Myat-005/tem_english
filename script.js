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
            { word: "About", notes: `<h3>1. Subject Matter</h3><p>စကားပြောဆိုမှု သို့မဟုတ် အကြောင်းအရာကို ပြသရန် သုံးသည်။</p><h3>2. Approximation</h3><p>ကိန်းဂဏန်း ခန့်မှန်းခြေကို ပြရန် သုံးသည်။</p>`, exercises: [ { options: ["The pencil is about the table.", "I am reading a book about history.", "He is standing about her."], answer: "I am reading a book about history." }, { options: ["It is about 5 o'clock now.", "The clock is about the wall.", "Put the rug about the floor."], answer: "It is about 5 o'clock now." }, { options: ["She sat about the chair.", "The cat is about the bed.", "Tell me about your trip."], answer: "Tell me about your trip." } ] },
            { word: "Above", notes: `<h3>1. Higher Position</h3><p>ထိမနေဘဲ အပေါ်ဘက်တွင် ရှိနေခြင်း။</p>`, exercises: [ { options: ["I was born above July.", "The sun is above the clouds.", "He is from above Myanmar."], answer: "The sun is above the clouds." }, { options: ["The picture hangs above the sofa.", "I am looking above my glasses.", "He is good above playing guitar."], answer: "The picture hangs above the sofa." }, { options: ["She is married above a doctor.", "I received a letter above my friend.", "The birds are flying above the trees."], answer: "The birds are flying above the trees." } ] },
            { word: "Across", notes: `<h3>1. Movement</h3><p>တစ်ဖက်မှ အခြားတစ်ဖက်သို့ ဖြတ်သွားခြင်း။</p>`, exercises: [ { options: ["He is afraid across spiders.", "He ran across the bridge.", "The keys are across the pocket."], answer: "He ran across the bridge." }, { options: ["The shop is across the street.", "I am interested across coding.", "She is proud across her work."], answer: "The shop is across the street." }, { options: ["He died across a heart attack.", "We walked across the river.", "The glass is full across water."], answer: "We walked across the river." } ] },
            { word: "Against", notes: `<h3>1. Physical Contact</h3><p>နံရံ သို့မဟုတ် အရာတစ်ခုကို အားပြုမှီထားခြင်း။</p>`, exercises: [ { options: ["Don't lean against the glass.", "I am looking against my keys.", "He arrived against time for dinner."], answer: "Don't lean against the glass." }, { options: ["She distributed candy against the kids.", "They argued against politics.", "The rain beat against the window."], answer: "The rain beat against the window." }, { options: ["The cat hid against the bed.", "I have been waiting against three hours.", "Put the ladder against the wall."], answer: "Put the ladder against the wall." } ] },
            { word: "Along", notes: `<h3>1. Parallel</h3><p>အလျားလိုက်အတိုင်း သွားခြင်း။</p>`, exercises: [ { options: ["The bird flew along the house.", "He is standing along front of the mirror.", "We walked along the path."], answer: "We walked along the path." }, { options: ["He parked his car along the building.", "Trees grow along the road.", "The keys slipped along the cracks."], answer: "Trees grow along the road." }, { options: ["He climbed along the ladder.", "The boat moved along the shore.", "She fell along the stairs."], answer: "The boat moved along the shore." } ] },
            { word: "Among", notes: `<h3>1. Group</h3><p>လူ သို့မဟုတ် အရာ ၃ ခုထက်ပိုသော အုပ်စုကြား။</p>`, exercises: [ { options: ["I am waiting among the bus stop.", "He is famous among his friends.", "The train went among the tunnel."], answer: "He is famous among his friends." }, { options: ["Look among the stars.", "The treasure was buried among the sand.", "Divide the cake among the kids."], answer: "Divide the cake among the kids." }, { options: ["The book is written among Spanish.", "A house among the trees.", "I will see you among Monday."], answer: "A house among the trees." } ] },
            { word: "Around", notes: `<h3>1. Circular</h3><p>ပတ်ပတ်လည် ဝန်းရံခြင်း။</p>`, exercises: [ { options: ["He works around a manager.", "The book belongs around me.", "They sat around the fire."], answer: "They sat around the fire." }, { options: ["Walk around the building.", "He prefers tea around coffee.", "I am sick around this weather."], answer: "Walk around the building." }, { options: ["The moon goes around the earth.", "She is capable around passing the test.", "He is fond around chocolate."], answer: "The moon goes around the earth." } ] },
            { word: "At", notes: `<h3>1. Point</h3><p>တိကျသောနေရာ သို့မဟုတ် အချိန်။</p>`, exercises: [ { options: ["I am at London tomorrow.", "I am at the office.", "He jumped at the pool."], answer: "I am at the office." }, { options: ["She sit at him during movie.", "The bird flew at the house.", "Meet me at 5 PM."], answer: "Meet me at 5 PM." }, { options: ["Look at the sky.", "I have been waiting at three hours.", "The train went at the tunnel."], answer: "Look at the sky." } ] },
            { word: "Behind", notes: `<h3>1. Rear</h3><p>အရာတစ်ခု၏ အနောက်ဘက်။</p>`, exercises: [ { options: ["The car is behind the house.", "The book is written behind Spanish.", "He is good behind playing guitar."], answer: "The car is behind the house." }, { options: ["She relies behind her parents.", "Don't hide behind the door.", "I am interested behind coding."], answer: "Don't hide behind the door." }, { options: ["He arrived just behind time.", "She is afraid behind spiders.", "The sun went behind the clouds."], answer: "The sun went behind the clouds." } ] },
            { word: "Below", notes: `<h3>1. Lower</h3><p>အဆင့် သို့မဟုတ် တည်နေရာ ပိုနိမ့်ခြင်း။</p>`, exercises: [ { options: ["Sign your name below the line.", "We are traveling below London.", "They argued below politics."], answer: "Sign your name below the line." }, { options: ["He arrived just below time.", "She relies below her parents.", "The temperature is below zero."], answer: "The temperature is below zero." }, { options: ["I am interested below coding.", "My shoes are below the table.", "He is afraid below spiders."], answer: "My shoes are below the table." } ] },
            { word: "Beneath", notes: `<h3>1. Underneath</h3><p>အောက်ခြေတွင် ဖုံးအုပ်ခံထားရခြင်း။</p>`, exercises: [ { options: ["She apologized beneath being late.", "They found gold beneath the floor.", "The train went beneath the tunnel."], answer: "They found gold beneath the floor." }, { options: ["He parked his car beneath the building.", "I am looking beneath my glasses.", "Sit beneath the tree shadow."], answer: "Sit beneath the tree shadow." }, { options: ["She was born beneath July.", "The store is open beneath 9 AM.", "The valley lies beneath the mountain."], answer: "The valley lies beneath the mountain." } ] },
            { word: "Beside", notes: `<h3>1. Next To</h3><p>ဘေးကပ်လျက် ရှိနေခြင်း။</p>`, exercises: [ { options: ["He walked beside the street.", "Sit beside me.", "The keys slipped beside the cracks."], answer: "Sit beside me." }, { options: ["She distributed candy beside the kids.", "We stayed indoors beside the storm.", "The bank is beside the hotel."], answer: "The bank is beside the hotel." }, { options: ["He will finish work beside Friday.", "Who is standing beside you?", "I can't wait beside the weekend."], answer: "Who is standing beside you?" } ] },
            { word: "Between", notes: `<h3>1. Middle</h3><p>အရာနှစ်ခုကြား။</p>`, exercises: [ { options: ["They live between the street from us.", "She leaned between the wall.", "I sat between Tom and Jerry."], answer: "I sat between Tom and Jerry." }, { options: ["We walked between the river bank.", "The ball is between the boxes.", "There is a fence between the garden."], answer: "The ball is between the boxes." }, { options: ["The temperature is between zero.", "Choose between blue and red.", "The treasure was buried between the sand."], answer: "Choose between blue and red." } ] },
            { word: "Beyond", notes: `<h3>1. Past</h3><p>ကန့်သတ်ချက် သို့မဟုတ် နေရာထက် ကျော်လွန်ခြင်း။</p>`, exercises: [ { options: ["Look beyond the stars.", "This gift is beyond you.", "The village is beyond the hill."], answer: "The village is beyond the hill." }, { options: ["The truth is beyond doubt.", "I received a letter beyond my friend.", "He is standing beyond front of the mirror."], answer: "The truth is beyond doubt." }, { options: ["Put the box beyond the closet.", "Look beyond the horizon.", "The dog ran beyond the house."], answer: "Look beyond the horizon." } ] },
            { word: "By", notes: `<h3>1. Nearness</h3><p>ဘေးတွင် သို့မဟုတ် အနီးတွင်။</p><h3>2. Method</h3>`, exercises: [ { options: ["They waited by the building.", "He climbed by the ladder.", "I live by the sea."], answer: "I live by the sea." }, { options: ["Go to work by car.", "She fell by the stairs.", "Take your shoes by."], answer: "Go to work by car." }, { options: ["He threw the ball by me.", "The letter was written by him.", "Don't throw stones by the dog."], answer: "The letter was written by him." } ] },
            { word: "Down", notes: `<h3>1. Descending</h3><p>အထက်မှ အောက်သို့။</p>`, exercises: [ { options: ["We walked down the beach.", "Go down the stairs.", "She cut the paper down scissors."], answer: "Go down the stairs." }, { options: ["He went to the party down friends.", "I will call you down an hour.", "Sit down on the chair."], answer: "Sit down on the chair." }, { options: ["The sun is going down.", "Everyone was there down John.", "He works as a manager down the company."], answer: "The sun is going down." } ] },
            { word: "During", notes: `<h3>1. Period</h3><p>အချိန်ကာလတစ်ခုအတွင်း။</p>`, exercises: [ { options: ["She is married during a doctor.", "Don't sleep during the class.", "I agree during you completely."], answer: "Don't sleep during the class." }, { options: ["He is addicted during coffee.", "They congratulated her during success.", "It rained during the night."], answer: "It rained during the night." }, { options: ["She insists during paying the bill.", "The book belongs during me.", "Quiet during the exam."], answer: "Quiet during the exam." } ] },
            { word: "Except", notes: `<h3>1. Exclusion</h3><p>တစ်ခုကို ချန်လှပ်ထားခြင်း။</p>`, exercises: [ { options: ["We complained except the noise.", "He died except a heart attack.", "Everyone went except me."], answer: "Everyone went except me." }, { options: ["I like all fruits except apple.", "She suffers except asthma.", "I am familiar except this software."], answer: "I like all fruits except apple." }, { options: ["He was accused except theft.", "Open daily except Sunday.", "She is capable except passing."], answer: "Open daily except Sunday." } ] },
            { word: "For", notes: `<h3>1. Purpose</h3><p>ရည်ရွယ်ချက် သို့မဟုတ် လက်ခံသူ။</p>`, exercises: [ { options: ["I am proud for your achievements.", "The glass is full for water.", "This gift is for you."], answer: "This gift is for you." }, { options: ["Are you satisfied for the result?", "I am waiting for the bus.", "He is famous for his paintings."], answer: "I am waiting for the bus." }, { options: ["Cook dinner for us.", "She is responsible for the project.", "I apologize for the mistake."], answer: "Cook dinner for us." } ] },
            { word: "From", notes: `<h3>1. Origin</h3><p>စတင်ရာနေရာ သို့မဟုတ် အချိန်။</p>`, exercises: [ { options: ["They objected from the new rules.", "I am from Myanmar.", "He prefers tea from coffee."], answer: "I am from Myanmar." }, { options: ["She prevented him from leaving.", "I succeeded from fixing the car.", "Take it from the table."], answer: "Take it from the table." }, { options: ["He believes from ghosts.", "She depends from public transport.", "A letter from my friend."], answer: "A letter from my friend." } ] }
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
            ui.get('prep-lesson-content').innerHTML = lesson.notes;
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
