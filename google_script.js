const TOKEN = "8738017008:AAE8pb--I9oZoMrzZaKNLS97UThQeFk5LZk";
const ADMIN_ID = "6172408005";
const store = PropertiesService.getScriptProperties();

// --- HANDLES COMMANDS FROM TELEGRAM ---
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  // Handle Button Clicks (Callback Queries)
  if (data.callback_query) {
    handleCallback(data.callback_query);
    return;
  }

  if (!data.message) return;
  const text = data.message.text;
  const chatId = data.message.chat.id.toString();

  if (chatId !== ADMIN_ID) return;

  // Handle Photos (Blog Posts)
  if (data.message.photo) {
    const photo = data.message.photo[data.message.photo.length - 1];
    const fileId = photo.file_id;
    const caption = data.message.caption || "";
    const fileResponse = UrlFetchApp.fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
    const filePath = JSON.parse(fileResponse.getContentText()).result.file_path;
    const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

    let posts = JSON.parse(store.getProperty('blog_posts') || "[]");
    posts.unshift({
      id: Date.now().toString(),
      image: imageUrl,
      caption: caption,
      date: new Date().toLocaleDateString()
    });
    store.setProperty('blog_posts', JSON.stringify(posts.slice(0, 20)));
    return sendMessage(chatId, "✅ *Blog Post Published!*", mainMenuMarkup());
  }

  if (text === "/start" || text === "Menu") {
    sendMenu(chatId);
  } else if (text === "/manage_blog") {
    sendBlogManager(chatId);
  }
}

function sendMenu(chatId) {
  const text = "🛠 *TEM ENGLISH ADMIN*\nSelect an action from the dashboard below:";
  sendWithKeyboard(chatId, text, mainMenuMarkup());
}

function mainMenuMarkup() {
  return {
    inline_keyboard: [
      [{ text: "👥 List Students", callback_data: "list_students" }, { text: "📢 Broadcast", callback_data: "prep_broadcast" }],
      [{ text: "📝 Manage Blog", callback_data: "manage_blog" }, { text: "🗑 Clear Students", callback_data: "confirm_clear" }]
    ]
  };
}

function handleCallback(query) {
  const chatId = query.message.chat.id.toString();
  const data = query.data;
  const messageId = query.message.message_id;

  if (data === "list_students") {
    const students = JSON.parse(store.getProperty('students') || "[]");
    let list = "👥 *STUDENTS:*\n\n" + (students.length ? students.map((s, i) => `${i+1}. ${s.name}`).join("\n") : "None");
    editMessage(chatId, messageId, list, mainMenuMarkup());
  } 
  else if (data === "manage_blog") {
    const posts = JSON.parse(store.getProperty('blog_posts') || "[]");
    if (!posts.length) return editMessage(chatId, messageId, "📭 No blog posts found.", mainMenuMarkup());
    
    let text = "📝 *MANAGE BLOG*\nLast 5 posts (Tap to delete):";
    let keyboard = posts.slice(0, 5).map(p => [{ text: `🗑 ${p.caption.substring(0, 20)}...`, callback_data: `del_post_${p.id}` }]);
    keyboard.push([{ text: "⬅️ Back", callback_data: "back_to_menu" }]);
    editMessage(chatId, messageId, text, { inline_keyboard: keyboard });
  }
  else if (data.startsWith("del_post_")) {
    const postId = data.replace("del_post_", "");
    let posts = JSON.parse(store.getProperty('blog_posts') || "[]");
    posts = posts.filter(p => p.id !== postId);
    store.setProperty('blog_posts', JSON.stringify(posts));
    editMessage(chatId, messageId, "✅ Post Deleted.", mainMenuMarkup());
  }
  else if (data === "back_to_menu") {
    editMessage(chatId, messageId, "🛠 *TEM ENGLISH ADMIN*", mainMenuMarkup());
  }
  else if (data === "prep_broadcast") {
    editMessage(chatId, messageId, "📢 *BROADCAST*\nTo send a message to everyone, type:\n`/broadcast [your message]`", mainMenuMarkup());
  }
}

// --- UTILITIES ---

function sendWithKeyboard(chatId, text, keyboard) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
    reply_markup: JSON.stringify(keyboard)
  };
  UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload) });
}

function editMessage(chatId, messageId, text, keyboard) {
  const url = `https://api.telegram.org/bot${TOKEN}/editMessageText`;
  const payload = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: "Markdown",
    reply_markup: JSON.stringify(keyboard)
  };
  UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload) });
}

function sendMessage(chatId, text, keyboard) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = { chat_id: chatId, text: text, parse_mode: "Markdown", reply_markup: keyboard ? JSON.stringify(keyboard) : null };
  UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload) });
}

// --- HANDLES LOGIN & UPDATES FROM WEBSITE ---
function doGet(e) {
  const params = e.parameter;
  const type = params.type || 'login';
  let students = JSON.parse(store.getProperty('students') || "[]");

  if (type === 'login') {
    if (!params.id) return ContentService.createTextOutput("No ID").setMimeType(ContentService.MimeType.TEXT);
    if (!students.some(s => String(s.id) === String(params.id))) {
      students.push({ id: String(params.id), name: params.first_name, username: params.username || 'N/A', photo_url: params.photo_url || '' });
      store.setProperty('students', JSON.stringify(students));
      sendMessage(ADMIN_ID, `🔔 *New Student Joined!* \n👤 ${params.first_name}`);
    }
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } 
  
  if (type === 'get_students') {
    return ContentService.createTextOutput(JSON.stringify(students.map(s => ({ name: s.name, photo: s.photo_url || '' })))).setMimeType(ContentService.MimeType.JSON);
  }

  if (type === 'get_blog_posts') {
    return ContentService.createTextOutput(store.getProperty('blog_posts') || "[]").setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput("Unknown Request").setMimeType(ContentService.MimeType.TEXT);
}
