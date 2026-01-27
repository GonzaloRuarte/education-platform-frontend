/**
 * Tab Management Module
 * Handles tab switching and state persistence for the Reporte META+ application
 */
(function () {
  const TAB_STORAGE_KEY = "reporteMeta.activeTab.v1";
  const CONFIG_URL = "/config";
  let chatEnabled = false;

  // Check if localStorage is available
  const storageAvailable = (() => {
    try {
      if (typeof window === "undefined") {
        return false;
      }
      return "localStorage" in window && window.localStorage !== null;
    } catch (error) {
      console.info("Local storage unavailable:", error);
      return false;
    }
  })();

  /**
   * Load the last active tab from localStorage
   */
  function loadActiveTab() {
    if (!storageAvailable) {
      return null;
    }
    try {
      const tabId = window.localStorage.getItem(TAB_STORAGE_KEY);
      return tabId && typeof tabId === "string" ? tabId.trim() : null;
    } catch (error) {
      console.warn("Failed to load active tab:", error);
      return null;
    }
  }

  /**
   * Load server config to decide which tabs to show
   */
  async function loadConfig() {
    try {
      const response = await fetch(CONFIG_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      chatEnabled = Boolean(data.chat_enabled);
    } catch (error) {
      console.warn("Failed to load config, defaulting chat to disabled:", error);
      chatEnabled = false;
    }
  }

  /**
   * Remove chat tab button and content when disabled
   */
  function removeChatTab() {
    const chatButton = document.querySelector('.tab-button[data-tab="chat"]');
    if (chatButton) {
      chatButton.remove();
    }
    const chatContent = document.querySelector('[data-tab-content="chat"]');
    if (chatContent) {
      chatContent.remove();
    }
  }

  /**
   * Save the active tab to localStorage
   */
  function saveActiveTab(tabId) {
    if (!storageAvailable || !tabId) {
      return;
    }
    try {
      window.localStorage.setItem(TAB_STORAGE_KEY, tabId);
    } catch (error) {
      console.warn("Failed to save active tab:", error);
    }
  }

  /**
   * Switch to the specified tab
   */
  function switchToTab(tabId) {
    // Update button states
    const buttons = document.querySelectorAll(".tab-button");
    buttons.forEach((button) => {
      if (button.dataset.tab === tabId) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    });

    // Update content visibility
    const contents = document.querySelectorAll(".tab-content");
    contents.forEach((content) => {
      if (content.dataset.tabContent === tabId) {
        content.classList.add("active");
      } else {
        content.classList.remove("active");
      }
    });

    // Persist selection
    saveActiveTab(tabId);

    // Dispatch custom event for tab change
    window.dispatchEvent(
      new CustomEvent("tabChanged", {
        detail: { tabId },
      })
    );
  }

  /**
   * Initialize tab system
   */
  function initializeTabs() {
    const buttons = document.querySelectorAll(".tab-button");
    
    // Attach click handlers
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabId = button.dataset.tab;
        if (tabId) {
          switchToTab(tabId);
        }
      });
    });

    // Restore last active tab or use first button's tab
    const storedTab = loadActiveTab();
    const validTabs = Array.from(buttons).map((btn) => btn.dataset.tab);
    
    if (storedTab && validTabs.includes(storedTab)) {
      switchToTab(storedTab);
    } else if (buttons.length > 0) {
      const firstTab = buttons[0].dataset.tab;
      if (firstTab) {
        switchToTab(firstTab);
      }
    }
  }

  async function bootstrapTabs() {
    await loadConfig();
    if (!chatEnabled) {
      removeChatTab();
    }
    initializeTabs();
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrapTabs);
  } else {
    bootstrapTabs();
  }

  // Export to window for external access if needed
  window.TabManager = {
    switchToTab,
  };
})();
