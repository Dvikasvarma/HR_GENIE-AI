/* chatbot.js — Standardized AI HRMS Chatbot Logic */

const Chatbot = {
  initialized: false,
  isOpen: false,
  userName: "there",

  init(userName = "there") {
    if (this.initialized) return;
    this.userName = userName || "there";
    this.createElements();
    this.addEventListeners();
    this.initialized = true;
    
    // Add welcome message after a short delay
    setTimeout(() => {
      this.addBotMessage(`Hi ${this.userName}! 👋 I'm your Smart AI HR Assistant. How can I help you today?`);
    }, 1000);
  },

  createElements() {
    const wrapper = document.createElement('div');
    wrapper.className = 'chatbot-wrapper';
    wrapper.innerHTML = `
      <div class="chatbot-window" id="chatbotWindow">
        <div class="chatbot-header">
          <div class="chatbot-header-title">
            <i class="fas fa-robot"></i> Smart AI HRMS
          </div>
          <button class="chatbot-close" id="chatbotCloseBtn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="chatbot-messages" id="chatbotMessages"></div>
        <div class="chat-chips" id="chatbotChips">
          <button class="chat-chip" onclick="Chatbot.sendQuickReply('Apply for Leave')">Apply for Leave</button>
          <button class="chat-chip" onclick="Chatbot.sendQuickReply('Check Leave Status')">Check Status</button>
          <button class="chat-chip" onclick="Chatbot.sendQuickReply('View HR Policies')">HR Policies</button>
        </div>
        <div class="chatbot-input-area">
          <input type="text" id="chatbotInput" placeholder="Ask me anything..." autocomplete="off">
          <button class="chatbot-send-btn" id="chatbotSendBtn">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <button class="chatbot-toggle-btn" id="chatbotToggleBtn">
        <i class="fas fa-comment-dots"></i>
      </button>
    `;
    document.body.appendChild(wrapper);
  },

  addEventListeners() {
    const toggleBtn = document.getElementById('chatbotToggleBtn');
    const closeBtn = document.getElementById('chatbotCloseBtn');
    const input = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSendBtn');

    toggleBtn.addEventListener('click', () => this.toggle());
    closeBtn.addEventListener('click', () => this.toggle());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    sendBtn.addEventListener('click', () => this.sendMessage());
  },

  toggle() {
    const win = document.getElementById('chatbotWindow');
    const icon = document.querySelector('#chatbotToggleBtn i');
    this.isOpen = !this.isOpen;
    
    win.classList.toggle('open', this.isOpen);
    
    if (this.isOpen) {
      icon.className = 'fas fa-times';
      document.getElementById('chatbotInput').focus();
    } else {
      icon.className = 'fas fa-comment-dots';
    }
  },

  sendQuickReply(text) {
    document.getElementById('chatbotInput').value = text;
    this.sendMessage();
  },

  async sendMessage() {
    const input = document.getElementById('chatbotInput');
    const msgText = input.value.trim();
    if (!msgText) return;

    this.addUserMessage(msgText);
    input.value = "";
    
    const loadingId = this.showLoading();

    try {
      const prompt = `You are a smart, empathetic, ego-free HR Assistant for our company. 
      Guidelines:
      1. Empathy: Treat the user (${this.userName}) like a friend. Any reason for leave (movie, vacation, rest) is valid and approved without judgment.
      2. Leaves: They have 12 Casual Leaves and 5 Sick Leaves. If they ask to apply, tell them it's approved and ask them to apply in the 'My Track' tab.
      3. Other queries: Guide salary/pay to 'My Finance', policies to 'My Policy', office/desk to 'My Campus'.
      4. Tone: Very short (1-2 sentences), sweet, and helpful. Do not use markdown like ** or ## in your response, use simple text.
      
      User Question: ${msgText}`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      this.removeLoading(loadingId);

      if (data.reply) {
        this.addBotMessage(data.reply);
      } else if (data.error) {
        this.addBotMessage("Sorry, I'm having trouble connecting to my brain right now. Please try again!");
      } else {
        this.addBotMessage("I'm sorry, I couldn't process that request. Can you try rephrasing it?");
      }
    } catch (error) {
      this.removeLoading(loadingId);
      this.addBotMessage("Oops! Something went wrong. I'll be back shortly.");
      console.error("Chatbot Error:", error);
    }
  },

  addUserMessage(text) {
    const container = document.getElementById('chatbotMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg user';
    msgDiv.innerText = text;
    container.appendChild(msgDiv);
    this.scrollToBottom();
  },

  addBotMessage(text) {
    const container = document.getElementById('chatbotMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg bot';
    msgDiv.innerText = text;
    container.appendChild(msgDiv);
    this.scrollToBottom();
  },

  showLoading() {
    const container = document.getElementById('chatbotMessages');
    const loadingDiv = document.createElement('div');
    const id = 'loading-' + Date.now();
    loadingDiv.id = id;
    loadingDiv.className = 'chat-msg bot';
    loadingDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    container.appendChild(loadingDiv);
    this.scrollToBottom();
    return id;
  },

  removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  },

  scrollToBottom() {
    const container = document.getElementById('chatbotMessages');
    container.scrollTop = container.scrollHeight;
  }
};

// Auto-initialize if userEmail is found, but wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  // Check for common profile name elements to get user name
  let userName = "there";
  const nameEl = document.getElementById('profile-name') || document.getElementById('sidebar-profile-name');
  if (nameEl && nameEl.innerText !== "..." && nameEl.innerText !== "") {
    userName = nameEl.innerText.split(' ')[0];
  }
  
  Chatbot.init(userName);
});
