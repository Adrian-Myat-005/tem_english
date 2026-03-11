const TOKEN = "8738017008:AAE8pb--I9oZoMrzZaKNLS97UThQeFk5LZk";
const ADMIN_ID = "6172408005";
const store = PropertiesService.getScriptProperties();

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  if (data.callback_query) {
    handleCallback(data.callback_query);
    return;
  }

  if (!data.message) return;
  const text = data.message.text;
  const chatId = data.message.chat.id.toString();

  if (chatId !== ADMIN_ID) return;

  // Handle Photo Posts
  if (data.message.photo) {
    const photo = data.message.photo[data.message.photo.length - 1];
    const fileResponse = UrlFetchApp.fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${photo.file_id}`);
    const filePath = JSON.parse(fileResponse.getContentText()).result.file_path;
    const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

    savePost(imageUrl, data.message.caption || "No caption");
    return sendMessage(chatId, "✅ *Photo Published!*", adminPanel());
  }

  // Handle Links/Text
  if (text && !text.startsWith("/")) {
    savePost(text, text.includes("youtu") ? "Video Update" : text);
    return sendMessage(chatId, "✅ *Text/Link Published!*", adminPanel());
  }

  if (text === "/start" || text === "🛠 Dashboard") {
    sendMenu(chatId);
  }
}

function savePost(media, caption) {
  let posts = JSON.parse(store.getProperty('blog_posts') || "[]");
  posts.unshift({ id: Date.now().toString(), image: media, caption: caption, date: new Date().toLocaleDateString() });
  store.setProperty('blog_posts', JSON.stringify(posts.slice(0, 20)));
}

function sendMenu(chatId) {
  const text = "💎 *TEM ENGLISH AUTOMATION LAB*\nOne-click controls for your internal environment.";
  const replyKeyboard = {
    keyboard: [[{ text: "🛠 Dashboard" }]],
    resize_keyboard: true,
    persistent: true
  };
  
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
    reply_markup: JSON.stringify({ ...adminPanel(), ...replyKeyboard })
  };
  UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload) });
}

function adminPanel() {
  return {
    inline_keyboard: [
      [{ text: "📝 MANAGE POSTS", callback_data: "manage_blog" }, { text: "👥 STUDENTS", callback_data: "list_students" }],
      [{ text: "📢 BROADCAST", callback_data: "prep_broadcast" }, { text: "♻️ REFRESH SERVER", callback_data: "refresh" }]
    ]
  };
}

function handleCallback(query) {
  const chatId = query.message.chat.id.toString();
  const data = query.data;
  const messageId = query.message.message_id;

  if (data === "manage_blog") {
    const posts = JSON.parse(store.getProperty('blog_posts') || "[]");
    if (!posts.length) return editMessage(chatId, messageId, "📭 Feed is empty.", adminPanel());
    
    let keyboard = posts.slice(0, 8).map(p => [
      { text: `📝 Edit`, callback_data: `edit_post_${p.id}` },
      { text: `🗑 Del: ${p.caption.substring(0, 10)}...`, callback_data: `del_post_${p.id}` }
    ]);
    keyboard.push([{ text: "⬅️ Back", callback_data: "back" }]);
    editMessage(chatId, messageId, "🛠 *POST MANAGER*", { inline_keyboard: keyboard });
  }
  else if (data.startsWith("del_post_")) {
    const id = data.replace("del_post_", "");
    let posts = JSON.parse(store.getProperty('blog_posts') || "[]").filter(p => p.id !== id);
    store.setProperty('blog_posts', JSON.stringify(posts));
    editMessage(chatId, messageId, "✅ Post removed permanently.", adminPanel());
  }
  else if (data.startsWith("edit_post_")) {
    const id = data.replace("edit_post_", "");
    editMessage(chatId, messageId, `✏️ *To Edit this post:*\nSend the new caption followed by the ID:\n\n\`ID: ${id}\`\n\n(Simply copy the ID and paste it after your new text)`, adminPanel());
  }
  else if (data === "list_students") {
    const students = JSON.parse(store.getProperty('students') || "[]");
    let list = "👥 *REGISTERED STUDENTS:*\n\n" + (students.map((s, i) => `${i+1}. ${s.name} (ID: ${s.id})`).join("\n") || "No students.");
    editMessage(chatId, messageId, list, adminPanel());
  }
  else if (data === "back") {
    editMessage(chatId, messageId, "💎 *AUTOMATION LAB*", adminPanel());
  }
}

function editMessage(chatId, messageId, text, keyboard) {
  const url = `https://api.telegram.org/bot${TOKEN}/editMessageText`;
  const payload = { chat_id: chatId, message_id: messageId, text: text, parse_mode: "Markdown", reply_markup: JSON.stringify(keyboard) };
  UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload) });
}

function sendMessage(chatId, text, keyboard) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const payload = { chat_id: chatId, text: text, parse_mode: "Markdown", reply_markup: JSON.stringify(keyboard) };
  UrlFetchApp.fetch(url, { method: "post", contentType: "application/json", payload: JSON.stringify(payload) });
}

function doGet(e) {
  const params = e.parameter;
  const type = params.type || 'login';
  let students = JSON.parse(store.getProperty('students') || "[]");

  if (type === 'get_students') {
    return ContentService.createTextOutput(JSON.stringify(students.map(s => ({ id: s.id, name: s.name, username: s.username, photo: s.photo_url || '' })))).setMimeType(ContentService.MimeType.JSON);
  }
  if (type === 'get_blog_posts') {
    return ContentService.createTextOutput(store.getProperty('blog_posts') || "[]").setMimeType(ContentService.MimeType.JSON);
  }
  if (type === 'login' && params.id) {
    if (!students.some(s => String(s.id) === String(params.id))) {
      students.push({ id: String(params.id), name: params.first_name, username: params.username || 'N/A', photo_url: params.photo_url || '' });
      store.setProperty('students', JSON.stringify(students));
    }
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  }
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}
