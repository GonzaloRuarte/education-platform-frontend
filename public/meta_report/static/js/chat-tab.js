/**
 * Chat Tab Module
 * Handles chat interaction with the assistant
 */
(function () {
  let chatMessages = null;
  let chatInput = null;
  let chatForm = null;
  let chatSubmit = null;
  let isWaiting = false;

  /**
   * Add a message to the chat
   */
  function addMessage(text, isUser = false) {
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message chat-message-${isUser ? 'user' : 'assistant'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'chat-message-content';
    
    const textP = document.createElement('p');
    textP.textContent = text;
    
    contentDiv.appendChild(textP);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Send message to server
   */
  async function sendMessage(message) {
    if (!message.trim() || isWaiting) return;

    // Add user message
    addMessage(message, true);
    
    // Clear input
    if (chatInput) {
      chatInput.value = '';
    }

    // Set waiting state
    isWaiting = true;
    if (chatSubmit) {
      chatSubmit.disabled = true;
      chatSubmit.classList.add('chat-submit-loading');
    }
    if (chatInput) {
      chatInput.disabled = true;
    }

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Add assistant response
      if (data.response) {
        addMessage(data.response, false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.', false);
    } finally {
      // Reset waiting state
      isWaiting = false;
      if (chatSubmit) {
        chatSubmit.disabled = false;
        chatSubmit.classList.remove('chat-submit-loading');
      }
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
      }
    }
  }

  /**
   * Initialize the Chat tab
   */
  function initChatTab() {
    console.log("Chat tab initialized");
    
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    chatForm = document.getElementById('chat-form');
    chatSubmit = document.getElementById('chat-submit');

    if (chatForm) {
      chatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (chatInput && chatInput.value.trim()) {
          sendMessage(chatInput.value);
        }
      });
    }

    // Focus input when tab is active
    if (chatInput) {
      chatInput.focus();
    }
  }

  // Initialize when the chat tab becomes active
  window.addEventListener("tabChanged", (event) => {
    if (event.detail.tabId === "chat") {
      if (!window.__chatTabInitialized) {
        initChatTab();
        window.__chatTabInitialized = true;
      } else if (chatInput) {
        // Focus input when returning to tab
        chatInput.focus();
      }
    }
  });

  // Also initialize immediately if chat tab is already active on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      const chatTab = document.querySelector('[data-tab-content="chat"]');
      if (chatTab && chatTab.classList.contains("active")) {
        initChatTab();
        window.__chatTabInitialized = true;
      }
    });
  } else {
    const chatTab = document.querySelector('[data-tab-content="chat"]');
    if (chatTab && chatTab.classList.contains("active")) {
      initChatTab();
      window.__chatTabInitialized = true;
    }
  }
})();
