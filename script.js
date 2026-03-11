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
        test: [
            { q: "The keys are ___ the table.", options: ["in", "on", "at"], answer: "on" },
            { q: "I will see you ___ Monday.", options: ["in", "on", "at"], answer: "on" },
            { q: "She has been living here ___ 2015.", options: ["for", "since", "from"], answer: "since" },
            { q: "He is good ___ playing the guitar.", options: ["at", "in", "on"], answer: "at" },
            { q: "Let's meet ___ the coffee shop.", options: ["in", "on", "at"], answer: "at" },
            { q: "The cat hid ___ the bed.", options: ["under", "over", "above"], answer: "under" },
            { q: "We walked ___ the park.", options: ["through", "between", "over"], answer: "through" },
            { q: "She sat ___ him during the movie.", options: ["beside", "besides", "along"], answer: "beside" },
            { q: "I have been waiting ___ three hours.", options: ["for", "since", "during"], answer: "for" },
            { q: "He jumped ___ the pool.", options: ["into", "onto", "in"], answer: "into" }
        ],
        
        currentView: 'main',
        lessonIdx: 0,
        exIdx: 0,
        testIdx: 0,
        testScore: 0,

        start: () => {
            ui.get('prepositions-section').style.display = 'flex';
            prepositions.showView('main');
        },

        back: () => {
            if (prepositions.currentView === 'main') {
                ui.get('prepositions-section').style.display = 'none';
            } else if (prepositions.currentView === 'lesson' || prepositions.currentView === 'learn-list' || prepositions.currentView === 'test' || prepositions.currentView === 'result') {
                prepositions.showView('main');
            }
        },

        showView: (view) => {
            prepositions.currentView = view;
            const views = ['main-menu', 'learn-list', 'lesson-view', 'test-view', 'result-view'];
            views.forEach(v => ui.get(`prep-${v}`).style.display = 'none');
            ui.get(`prep-${view === 'main' ? 'main-menu' : view}`).style.display = view === 'main' ? 'grid' : 'block';
            
            ui.get('prep-title').textContent = view === 'main' ? 'PREPOSITIONS' : view.toUpperCase().replace('-', ' ');
            ui.get('prep-back-btn').textContent = view === 'main' ? '← BACK' : '← MENU';
        },

        showLearnList: () => {
            prepositions.showView('learn-list');
            const container = ui.get('prep-list-container');
            container.innerHTML = prepositions.lessons.map((l, i) => `
                <button class="tactile-button" onclick="prepositions.loadLesson(${i})">${l.word}</button>
            `).join('');
        },

        loadLesson: (idx) => {
            prepositions.lessonIdx = idx;
            prepositions.exIdx = 0;
            const lesson = prepositions.lessons[idx];
            ui.get('prep-lesson-content').innerHTML = lesson.notes;
            prepositions.showView('lesson-view');
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
            if (prepositions.exIdx < 3) prepositions.loadExercise();
            else prepositions.showView('learn-list');
        },

        startTest: () => {
            prepositions.testIdx = 0;
            prepositions.testScore = 0;
            prepositions.showView('test-view');
            prepositions.loadTestQuestion();
        },

        loadTestQuestion: () => {
            const q = prepositions.test[prepositions.testIdx];
            ui.get('prep-test-progress').textContent = `${prepositions.testIdx + 1} / ${prepositions.test.length}`;
            ui.get('prep-test-fill').style.width = `${((prepositions.testIdx + 1) / prepositions.test.length) * 100}%`;
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
            const correct = prepositions.test[prepositions.testIdx].answer;
            
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
            if (prepositions.testIdx < prepositions.test.length) {
                prepositions.loadTestQuestion();
            } else {
                prepositions.showResult();
            }
        },

        showResult: () => {
            prepositions.showView('result');
            ui.get('prep-final-score').textContent = `${prepositions.testScore} / ${prepositions.test.length}`;
            ui.get('prep-result-msg').textContent = prepositions.testScore === prepositions.test.length ? "PERFECT! You're a preposition master." : "Great effort! Keep practicing.";
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
    window.days = days;
    window.numbers = numbers;
    window.auth = auth;

    document.addEventListener('DOMContentLoaded', auth.init);

})();
