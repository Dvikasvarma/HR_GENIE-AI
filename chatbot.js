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

    // Check if the user is requesting to apply for leave
    const appliedLeave = this.applyLeaveDirectly(msgText);
    if (appliedLeave) {
      this.removeLoading(loadingId);
      const confirmMsg = `✅ Leave Applied & Approved!\n\n` +
        `• Type: ${appliedLeave.type}\n` +
        `• Duration: ${appliedLeave.duration} (${appliedLeave.from} to ${appliedLeave.to})\n` +
        `• Reason: ${appliedLeave.reason}\n` +
        `• Status: Approved\n\n` +
        `Your leave request has been submitted and is now recorded in your 'My Track' tab!`;
      this.addBotMessage(confirmMsg);
      return;
    }

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
      const fallback = this.getSmartFallback(msgText);
      this.addBotMessage(fallback);
      console.warn("Chatbot network error, using smart fallback:", error);
    }
  },

  applyLeaveDirectly(text) {
    const t = (text || "").toLowerCase();
    const applyWords = ["apply", "need", "want", "take", "request", "grant", "give", "book", "submit"];
    const leaveWords = ["leave", "leaves", "day off", "days off", "holiday"];

    const isApply = applyWords.some(w => t.includes(w));
    const isLeave = leaveWords.some(w => t.includes(w));

    if (!isApply || !isLeave) return null;

    // Detect number of days
    let days = 1;
    const match = t.match(/(\d+)\s*(?:day|days)/);
    if (match) {
      days = parseInt(match[1], 10);
    } else if (t.includes("two days") || t.includes("2 days")) {
      days = 2;
    } else if (t.includes("three days") || t.includes("3 days")) {
      days = 3;
    } else if (t.includes("one day") || t.includes("a day")) {
      days = 1;
    }

    // Detect leave type
    let type = "Casual Leave";
    if (t.includes("sick") || t.includes("fever") || t.includes("health") || t.includes("doctor") || t.includes("unwell")) {
      type = "Sick Leave";
    } else if (t.includes("earned") || t.includes("vacation") || t.includes("annual")) {
      type = "Earned Leave";
    }

    // Detect reason
    let reason = "Personal reasons";
    if (t.includes("because of") || t.includes("due to") || t.includes("reason:") || t.includes("for ")) {
      const parts = t.split(/because of|due to|reason:|for\s+/i);
      if (parts[1]) {
        let r = parts[1].replace(/leave|days|\d+/gi, '').trim();
        if (r.length > 2) {
          reason = r.charAt(0).toUpperCase() + r.slice(1);
        }
      }
    }

    // Dates starting tomorrow
    const start = new Date();
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + (days - 1));

    const fromDateStr = start.toISOString().split('T')[0];
    const toDateStr = end.toISOString().split('T')[0];
    const userEmail = localStorage.getItem("userEmail") || "vikas@gmail.com";

    const leaveItem = {
      id: "LV-" + Math.floor(1000 + Math.random() * 9000),
      email: userEmail,
      from: fromDateStr,
      to: toDateStr,
      duration: `${days} ${days === 1 ? 'Day' : 'Days'}`,
      durationDates: `${fromDateStr} to ${toDateStr} (${days} ${days === 1 ? 'day' : 'days'})`,
      type: type,
      reason: reason,
      status: "Approved",
      appliedOn: new Date().toLocaleDateString('en-GB')
    };

    // Save to localStorage
    try {
      let stored = JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
      stored.unshift(leaveItem);
      localStorage.setItem('hrms_leaves', JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent('leaveApplied', { detail: leaveItem }));
    } catch (e) {
      console.warn("Storage warning:", e);
    }

    // Sync to backend asynchronously
    fetch('/api/powerautomate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'postLeave', payload: leaveItem })
    }).catch(() => {});

    return leaveItem;
  },

  getSmartFallback(query) {
    const q = (query || "").toLowerCase();
    if (q.includes("leave") || q.includes("vacation") || q.includes("holiday") || q.includes("sick")) {
      return `You have 12 Casual Leaves and 5 Sick Leaves available. Your leave request is pre-approved! Please submit your dates in the 'My Track' tab to record it.`;
    }
    if (q.includes("status") || q.includes("track") || q.includes("applied")) {
      return `You can monitor the live status of all your leave and OD requests directly inside the 'My Track' section.`;
    }
    if (q.includes("salary") || q.includes("pay") || q.includes("finance") || q.includes("tax") || q.includes("slip")) {
      return `Your latest payslips, tax deductions, and financial summaries are available under the 'My Finance' module.`;
    }
    if (q.includes("policy") || q.includes("rule") || q.includes("handbook") || q.includes("guideline")) {
      return `You can check company guidelines, working hours, and workplace policies in the 'My Policy' tab.`;
    }
    if (q.includes("attendance") || q.includes("punch") || q.includes("present") || q.includes("absent")) {
      return `Your attendance records and shift timings are maintained in the 'My Track' tab under the Attendance history.`;
    }
    if (q.includes("profile") || q.includes("name") || q.includes("qualification") || q.includes("address")) {
      return `You can view and update your personal information and educational details in 'My Profile'.`;
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return `Hi ${this.userName}! How can I help you today? You can ask me about leaves, attendance, payroll, or HR policies.`;
    }
    return `I am your AI HR Assistant! Feel free to ask about leave applications, payslips in 'My Finance', or HR guidelines in 'My Policy'.`;
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
