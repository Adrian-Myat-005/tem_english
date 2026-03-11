const TOKEN = "8738017008:AAE8pb--I9oZoMrzZaKNLS97UThQeFk5LZk";
const ADMIN_ID = "6172408005";
const store = PropertiesService.getScriptProperties();

// --- HANDLES COMMANDS FROM TELEGRAM ---
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  if (!data.message) return;
  const text = data.message.text;
  const chatId = data.message.chat.id.toString();

  if (chatId !== ADMIN_ID) return;

  // Handle Photos (Blog Posts)
  if (data.message.photo) {
    const photo = data.message.photo[data.message.photo.length - 1]; // Get highest resolution
    const fileId = photo.file_id;
    const caption = data.message.caption || "";
    
    // Get file path from Telegram
    const fileResponse = UrlFetchApp.fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
    const filePath = JSON.parse(fileResponse.getContentText()).result.file_path;
    const imageUrl = `https://api.telegram.org/file/bot${TOKEN}/${filePath}`;

    let posts = JSON.parse(store.getProperty('blog_posts') || "[]");
    posts.unshift({
      id: Date.now(),
      image: imageUrl,
      caption: caption,
      date: new Date().toLocaleDateString()
    });
    
    // Keep only last 20 posts to save space
    store.setProperty('blog_posts', JSON.stringify(posts.slice(0, 20)));
    return sendMessage(chatId, "✅ *Blog Post Published!*\nVisible to all students on the website.");
  }

  if (text === "/start") {
    sendMessage(chatId, "🚀 *Tem English Admin Active*\n\n/students - List all\n/remove [id] - Remove student\n/broadcast [msg] - Send to all\n/clear - Reset list");
  } 
  else if (text === "/students") {
    const students = JSON.parse(store.getProperty('students') || "[]");
    if (students.length === 0) return sendMessage(chatId, "📭 No students yet.");
    let list = "👥 *REGISTERED STUDENTS:*\n\n";
    students.forEach((s, i) => list += `${i+1}. ${s.name} (@${s.username || 'N/A'})\nID: \`${s.id}\`\n\n`);
    sendMessage(chatId, list);
  }
  else if (text.startsWith("/remove")) {
    const match = text.match(/\/remove\s+(\d+)/);
    if (!match) {
      return sendMessage(chatId, "⚠️ *Format Error*\nUse: `/remove [id]`\nExample: `/remove 123456`\n\n_Note: Ensure there is a space after the command._");
    }

    const idToRemove = match[1].trim();
    let students = JSON.parse(store.getProperty('students') || "[]");
    const initialCount = students.length;
    
    students = students.filter(s => String(s.id) !== idToRemove);
    
    if (students.length < initialCount) {
      store.setProperty('students', JSON.stringify(students));
      sendMessage(chatId, `✅ *Success*\nRemoved student with ID: \`${idToRemove}\``);
    } else {
      sendMessage(chatId, `❌ *Not Found*\nNo student found with ID: \`${idToRemove}\` in the list.`);
    }
  }
  else if (text.startsWith("/broadcast ")) {
    const msg = text.replace("/broadcast ", "");
    const students = JSON.parse(store.getProperty('students') || "[]");
    students.forEach(s => sendMessage(s.id, `📢 *Message from Tem English:*\n\n${msg}`));
    sendMessage(chatId, `✅ Sent to ${students.length} students.`);
  }
  else if (text === "/clear") {
    store.setProperty('students', "[]");
    sendMessage(chatId, "🗑 List cleared.");
  }
  else {
    sendMessage(chatId, "❓ *Unknown Command*\nTry /start to see the menu.");
  }
}

// --- HANDLES LOGIN & UPDATES FROM WEBSITE ---
function doGet(e) {
  const params = e.parameter;
  const type = params.type || 'login';

  if (!params.id) return ContentService.createTextOutput("No ID").setMimeType(ContentService.MimeType.TEXT);

  let students = JSON.parse(store.getProperty('students') || "[]");

  if (type === 'login') {
    // Robust check for existing students
    const studentExists = students.some(s => String(s.id) === String(params.id));
    
    if (!studentExists) {
      students.push({ 
        id: String(params.id), 
        name: params.first_name, 
        username: params.username || 'N/A',
        photo_url: params.photo_url || ''
      });
      store.setProperty('students', JSON.stringify(students));
      sendMessage(ADMIN_ID, `🔔 *New Student Joined!*\n👤 Name: ${params.first_name}\n🆔 User: @${params.username || 'N/A'}`);
    }
    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } 
  
  if (type === 'get_students') {
    const publicData = students.map(s => ({ 
      name: s.name, 
      photo: s.photo_url || '' 
    }));
    return ContentService.createTextOutput(JSON.stringify(publicData)).setMimeType(ContentService.MimeType.JSON);
  }

  if (type === 'get_blog_posts') {
    const posts = JSON.parse(store.getProperty('blog_posts') || "[]");
    return ContentService.createTextOutput(JSON.stringify(posts)).setMimeType(ContentService.MimeType.JSON);
  }

  if (type === 'update_name') {
    const newName = params.new_name;
    if (!newName) return ContentService.createTextOutput("No Name").setMimeType(ContentService.MimeType.TEXT);

    let updated = false;
    students = students.map(s => {
      if (String(s.id) === String(params.id)) {
        s.name = newName;
        updated = true;
      }
      return s;
    });

    if (updated) {
      store.setProperty('students', JSON.stringify(students));
      return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
    } else {
      return ContentService.createTextOutput("Not Found").setMimeType(ContentService.MimeType.TEXT);
    }
  }

  return ContentService.createTextOutput("Unknown Type").setMimeType(ContentService.MimeType.TEXT);
}

function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}&parse_mode=Markdown`;
  UrlFetchApp.fetch(url);
}
