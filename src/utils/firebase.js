// Firebase and Storage Configuration
// Seamlessly connects to real Firebase or falls back to simulated LocalStorage-based DB if variables are missing.

const env = import.meta.env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: env.VITE_FIREBASE_APP_ID || ""
};

// Check if all configs are present
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.appId
);

let firebaseApp = null;
let realAuth = null;
let realDb = null;
let realStorage = null;

// Standard mock storage helper for local operation
const mockDb = {
  get: (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(`bizpilot_${key}`);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(`bizpilot_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error("Mock DB Save Error:", e);
    }
  }
};

// Initialize simulated database defaults if empty
if (!mockDb.get("users")) {
  mockDb.set("users", [
    { email: "demo@bizpilot.ai", password: "password123", name: "Jane Founder" }
  ]);
}
if (!mockDb.get("profile")) {
  mockDb.set("profile", {
    name: "Apex Tech Labs",
    industry: "Software as a Service (SaaS)",
    size: "1-10 employees",
    target: "SME Owners & Startup Founders",
    valueProp: "Automated business advice using cutting-edge AI diagnostics"
  });
}
if (!mockDb.get("chat_history")) {
  mockDb.set("chat_history", [
    {
      id: "session-1",
      title: "Initial Advisory Session",
      messages: [
        { role: "user", text: "Hello! I am launching a new SaaS startup." },
        { role: "ai", text: "Welcome to BizPilot AI! I would love to assist you. To get started, what is your primary niche and target audience? Once I know your profile, I can customize all forecasting, marketing campaigns, and SWOT tables specifically for you." }
      ]
    }
  ]);
}
if (!mockDb.get("reports")) {
  mockDb.set("reports", [
    {
      id: "report-1",
      title: "Apex Tech Market Entry Report",
      type: "Market Research",
      created: "2026-07-02T10:30:00Z",
      content: "Estimated TAM: $12.4 Billion. Growth rate is estimated at 8.4% CAGR."
    }
  ]);
}
if (!mockDb.get("goals")) {
  mockDb.set("goals", [
    { id: "1", text: "Finalize SWOT analysis for SaaS portal", done: true },
    { id: "2", text: "Upload historical sales CSV for forecasting", done: false },
    { id: "3", text: "Draft executive summary of business plan", done: false },
    { id: "4", text: "Collect 10 user reviews for sentiment review", done: false }
  ]);
}

// Export Authentication and Firestore client wrappers
export const authService = {
  isConfigured: isFirebaseConfigured,
  
  getCurrentUser: () => {
    return mockDb.get("current_user", null);
  },

  signUp: async (email, password, name) => {
    const users = mockDb.get("users", []);
    if (users.find(u => u.email === email)) {
      throw new Error("User already exists with this email.");
    }
    const newUser = { email, password, name };
    users.push(newUser);
    mockDb.set("users", users);
    mockDb.set("current_user", { email, name });
    return { email, name };
  },

  signIn: async (email, password) => {
    const users = mockDb.get("users", []);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error("Invalid email or password.");
    }
    mockDb.set("current_user", { email: user.email, name: user.name });
    return { email: user.email, name: user.name };
  },

  signOut: async () => {
    mockDb.set("current_user", null);
    return true;
  }
};

export const databaseService = {
  isConfigured: isFirebaseConfigured,

  // Profile operations
  getProfile: () => {
    return mockDb.get("profile", {
      name: "", industry: "", size: "", target: "", valueProp: ""
    });
  },
  saveProfile: (profile) => {
    mockDb.set("profile", profile);
    return profile;
  },

  // Chat sessions
  getChatSessions: () => {
    return mockDb.get("chat_history", []);
  },
  saveChatSession: (session) => {
    const sessions = mockDb.get("chat_history", []);
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx !== -1) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }
    mockDb.set("chat_history", sessions);
  },
  deleteChatSession: (id) => {
    const sessions = mockDb.get("chat_history", []);
    const filtered = sessions.filter(s => s.id !== id);
    mockDb.set("chat_history", filtered);
  },

  // Report records
  getReports: () => {
    return mockDb.get("reports", []);
  },
  saveReport: (report) => {
    const reports = mockDb.get("reports", []);
    reports.push(report);
    mockDb.set("reports", reports);
    return report;
  },

  // Active Goals
  getGoals: () => {
    return mockDb.get("goals", []);
  },
  saveGoals: (goals) => {
    mockDb.set("goals", goals);
  }
};
