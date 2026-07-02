import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up upload directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Helper function to initialize Gemini API
const getGeminiClient = (req) => {
  // Check for API key in headers first, then environment variable
  const apiKey = req.headers['x-api-key'] || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Simple Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY)
  });
});

// 1. Business Chat Assistant Endpoint
app.post('/api/chat', async (req, res) => {
  const { message, history, profile } = req.body;
  const genAI = getGeminiClient(req);

  if (!genAI) {
    // Return mock responsive data if Gemini is not configured
    return res.json({
      reply: `[Demo Mode] Greetings! I see you are interested in optimizing your business. To get live insights, please configure your Gemini API Key in Settings. 
      
Here is a strategic suggestion based on your business:
- Focus on your core value proposition.
- Conduct a customer feedback loop early.
- Keep a close eye on customer acquisition cost (CAC) and customer lifetime value (LTV).`,
      isDemo: true
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Inject business profile system prompt
    const profileContext = profile 
      ? `You are BizPilot AI, an elite business consultant. The user's business is:
Company: ${profile.name || 'N/A'}
Industry: ${profile.industry || 'N/A'}
Size: ${profile.size || 'N/A'}
Target Customer: ${profile.target || 'N/A'}
Core Value: ${profile.valueProp || 'N/A'}
Always frame your advice considering this company context.`
      : `You are BizPilot AI, an elite business consultant. Provide strategic, data-driven, actionable, and financial-focused business advice.`;

    const chatSession = model.startChat({
      history: history ? history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }]
      })) : [],
      systemInstruction: profileContext
    });

    const result = await chatSession.sendMessage(message);
    const text = result.response.text();
    res.json({ reply: text });
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ error: 'Failed to generate response from Gemini API.' });
  }
});

// 2. SWOT Analysis Generator Endpoint
app.post('/api/swot', async (req, res) => {
  const { idea, profile } = req.body;
  const genAI = getGeminiClient(req);

  if (!genAI) {
    return res.json({
      strengths: ["Unique value proposition in the market", "Low initial overhead costs", "Direct-to-consumer digital channels"],
      weaknesses: ["Brand awareness is currently low", "Limited initial seed funding", "Dependent on third-party supply chain"],
      opportunities: ["Unserved customer segments in nearby cities", "Leverage organic content marketing and social commerce", "Integrate AI automation tools for efficiency"],
      threats: ["Established competitors with larger budgets", "Rapidly changing consumer preferences", "Economic slowdown impacting discretionary spending"],
      summary: "This is a demo SWOT analysis. Enter your Gemini API Key in the Settings page for a custom, detailed breakdown of your business idea.",
      isDemo: true
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Perform a highly detailed SWOT analysis for a new business idea: "${idea}". 
Business context profile: ${JSON.stringify(profile || {})}.
Please return the SWOT analysis in JSON format containing 4 arrays (strengths, weaknesses, opportunities, threats) and a short strategic summary. 
Your output MUST be a valid JSON block and nothing else, like:
{
  "strengths": ["s1", "s2"],
  "weaknesses": ["w1", "w2"],
  "opportunities": ["o1", "o2"],
  "threats": ["t1", "t2"],
  "summary": "overall strategic roadmap summary"
}`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    // Strip markdown formatting if Gemini wrapped it in ```json ... ```
    if (rawText.startsWith('```json')) {
      rawText = rawText.substring(7, rawText.length - 3).trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.substring(3, rawText.length - 3).trim();
    }
    
    const parsedData = JSON.parse(rawText);
    res.json(parsedData);
  } catch (error) {
    console.error('Gemini SWOT Error:', error);
    res.status(500).json({ error: 'Failed to generate SWOT analysis.' });
  }
});

// 3. Competitor Analysis Endpoint
app.post('/api/competitor', async (req, res) => {
  const { companyName, industry } = req.body;
  const genAI = getGeminiClient(req);

  if (!genAI) {
    return res.json({
      competitors: [
        { name: "Incumbent Corp", share: "45%", strengths: "Global reach, huge capital reserves", weaknesses: "Slow product iterations, outdated UI", strategy: "Compete on pricing and local agility" },
        { name: "SaaSify Ltd", share: "20%", strengths: "Modern product suite, quick support", weaknesses: "High churn rate, limited integrations", strategy: "Offer a superior integration ecosystem" },
        { name: "EcoStart App", share: "10%", strengths: "Strong brand ethos, high NPS", weaknesses: "Expensive pricing tiers, niche focus", strategy: "Highlight value and modular features" }
      ],
      insights: "Demo competitor insights. Configure Gemini to scan real-time competitor dynamics in your specific industry.",
      isDemo: true
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Conduct a competitor analysis for a company named "${companyName}" operating in the "${industry}" industry.
Identify 3 real or realistic competitors. Return the analysis as a JSON object with:
1. "competitors": an array of objects, each containing "name", "share" (estimated market share), "strengths", "weaknesses", and "strategy" (how our company should compete).
2. "insights": a string containing strategic consulting advice based on this competitive map.

Your response must be a single, valid JSON block with no markdown wrappers. For example:
{
  "competitors": [
    { "name": "Comp A", "share": "15%", "strengths": "xyz", "weaknesses": "abc", "strategy": "def" }
  ],
  "insights": "Strategic analysis text"
}`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.substring(7, rawText.length - 3).trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.substring(3, rawText.length - 3).trim();
    }
    const parsedData = JSON.parse(rawText);
    res.json(parsedData);
  } catch (error) {
    console.error('Competitor Analysis Error:', error);
    res.status(500).json({ error: 'Failed to generate competitor analysis.' });
  }
});

// 4. Market Research Endpoint
app.post('/api/market-research', async (req, res) => {
  const { industry, targetAudience } = req.body;
  const genAI = getGeminiClient(req);

  if (!genAI) {
    return res.json({
      marketSize: "$12.4 Billion (Global)",
      growthRate: "8.4% CAGR",
      trends: [
        "Increasing demand for AI-assisted workflows",
        "Migration toward decentralized cloud platforms",
        "Focus on data privacy and local compliance regulations"
      ],
      segments: [
        { name: "SMEs & Startups", priority: "High", needs: "Affordable solutions, ease of use, swift setups" },
        { name: "Enterprise Owners", priority: "Medium", needs: "Robust scalability, custom integrations, compliance keys" }
      ],
      summary: "Demo market research summary. Update your Gemini API key in Settings to receive extensive, up-to-date market reports.",
      isDemo: true
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Conduct market research for the "${industry}" industry targeting "${targetAudience}".
Please return a JSON response containing:
1. "marketSize": String estimating market size.
2. "growthRate": String representing CAGR or growth metric.
3. "trends": Array of 3-4 current industry trends.
4. "segments": Array of target customer segment objects, each with "name", "priority" (e.g. High/Medium/Low), and "needs" (key pain points).
5. "summary": Short overall summary of industry opportunities.

Your output must be a single, valid JSON block with no markdown wrappers.
{
  "marketSize": "$X Billion",
  "growthRate": "X%",
  "trends": ["t1", "t2"],
  "segments": [{ "name": "seg1", "priority": "High", "needs": "needs description" }],
  "summary": "industry summary"
}`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.substring(7, rawText.length - 3).trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.substring(3, rawText.length - 3).trim();
    }
    const parsedData = JSON.parse(rawText);
    res.json(parsedData);
  } catch (error) {
    console.error('Market Research Error:', error);
    res.status(500).json({ error: 'Failed to generate market research.' });
  }
});

// 5. Business Plan Generator Endpoint
app.post('/api/business-plan', async (req, res) => {
  const { idea, details, profile } = req.body;
  const genAI = getGeminiClient(req);

  if (!genAI) {
    return res.json({
      executiveSummary: "BizPilot AI is the premiere business consulting partner...",
      problemStatement: "Startups lack fast, data-backed strategy support...",
      solution: "Provide an automated dashboard combining Gemini AI and real-time trackers...",
      targetMarket: "100 Million SMEs and early-stage startup founders globally...",
      revenueModel: "Subscription model: Pro tier at $29/mo, Enterprise starting at $199/mo.",
      marketingStrategy: "Content marketing, organic product hunts, and partnership integrations.",
      financialProjections: "Projecting profitability by Month 8 with 12,000 active monthly subscribers.",
      roadmap: "Phase 1: Dashboard launch. Phase 2: RAG-based knowledge bases. Phase 3: Integration syncs.",
      isDemo: true
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Write a comprehensive, professional Business Plan for a business idea: "${idea}". 
Additional inputs: "${details}".
Business context: ${JSON.stringify(profile || {})}.

Return a JSON object containing:
{
  "executiveSummary": "text",
  "problemStatement": "text",
  "solution": "text",
  "targetMarket": "text",
  "revenueModel": "text",
  "marketingStrategy": "text",
  "financialProjections": "text",
  "roadmap": "text"
}
Output MUST be a single, valid JSON block without markdown formatting.`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.substring(7, rawText.length - 3).trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.substring(3, rawText.length - 3).trim();
    }
    const parsedData = JSON.parse(rawText);
    res.json(parsedData);
  } catch (error) {
    console.error('Business Plan Error:', error);
    res.status(500).json({ error: 'Failed to generate business plan.' });
  }
});

// 6. Customer Sentiment Analysis Endpoint
app.post('/api/sentiment', async (req, res) => {
  const { text } = req.body;
  const genAI = getGeminiClient(req);

  if (!genAI) {
    return res.json({
      positive: 60,
      negative: 25,
      neutral: 15,
      recommendations: [
        "Enhance customer response times on critical negative feedback points.",
        "Highlight positive reviews regarding ease-of-use in promotional campaigns.",
        "Address concerns surrounding billing questions by updating the FAQs."
      ],
      isDemo: true
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Analyze the sentiment of the following customer feedback/reviews:
"${text}"

Return a JSON response specifying the percentages of Positive, Negative, and Neutral comments, along with 3 actionable recommendations to improve scores.
Your JSON must strictly fit this schema:
{
  "positive": 60,
  "negative": 25,
  "neutral": 15,
  "recommendations": ["rec1", "rec2", "rec3"]
}
Only output the JSON block.`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().trim();
    if (rawText.startsWith('```json')) {
      rawText = rawText.substring(7, rawText.length - 3).trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.substring(3, rawText.length - 3).trim();
    }
    const parsedData = JSON.parse(rawText);
    res.json(parsedData);
  } catch (error) {
    console.error('Sentiment Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze customer sentiment.' });
  }
});

// 7. Sales Prediction CSV parser endpoint
app.post('/api/predict-sales', upload.single('csvFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a CSV file.' });
  }

  try {
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Simple robust CSV parser
    const lines = fileContent.split(/\r?\n/);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const columns = line.split(',');
      if (columns.length >= 2) {
        const date = columns[0].replace(/['"]+/g, '').trim();
        const value = parseFloat(columns[1].replace(/['"]+/g, '').trim());
        if (date && !isNaN(value)) {
          data.push({ date, sales: value });
        }
      }
    }

    // Clean up file
    fs.unlinkSync(filePath);

    if (data.length === 0) {
      return res.status(400).json({ error: 'No valid data found in CSV file. Ensure format is: Date,Sales' });
    }

    // Sort data chronologically if possible
    // Perform simple Linear Regression for forecasting
    const n = data.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i].sales;
      sumXY += i * data[i].sales;
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    const intercept = (sumY - slope * sumX) / n;

    // Project next 4 periods
    const forecast = [];
    const lastDate = new Date(data[n - 1].date);
    const isValidDate = !isNaN(lastDate.getTime());

    for (let i = 1; i <= 4; i++) {
      const projectedIndex = n - 1 + i;
      const salesVal = Math.round(slope * projectedIndex + intercept);
      
      let nextDateStr = `Period ${n + i}`;
      if (isValidDate) {
        const nextDate = new Date(lastDate);
        nextDate.setMonth(lastDate.getMonth() + i);
        nextDateStr = nextDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      }

      forecast.push({
        date: nextDateStr,
        sales: salesVal > 0 ? salesVal : 0,
        isForecast: true
      });
    }

    // Combine original and forecast
    const chartData = [
      ...data.map(item => ({ ...item, isForecast: false })),
      ...forecast
    ];

    // Generate insights using Gemini if available
    let insights = "No API key configured for custom insights. The trend indicates a positive growth slope of " + slope.toFixed(2) + " units per period.";
    const genAI = getGeminiClient(req);
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Here is historical sales data (last ${n} periods) and a projected 4-period sales trend:
Historical data: ${JSON.stringify(data.slice(-6))}
Projected data: ${JSON.stringify(forecast)}
Trend slope calculated: ${slope.toFixed(2)} units per period.
Please write a short, highly professional, 2-3 paragraph business intelligence report on these sales projections, highlighting potential issues (e.g. slowing momentum) or opportunities. Make it consulting-driven.`;

        const result = await model.generateContent(prompt);
        insights = result.response.text().trim();
      } catch (err) {
        console.error('Gemini Insights inside CSV Error:', err);
      }
    }

    res.json({
      chartData,
      slope,
      intercept,
      insights
    });
  } catch (error) {
    console.error('CSV Process Error:', error);
    res.status(500).json({ error: 'Failed to process CSV file.' });
  }
});

// 8. Pitch & Marketing Generator Endpoint
app.post('/api/pitch-campaign', async (req, res) => {
  const { type, idea, target, profile } = req.body;
  const genAI = getGeminiClient(req);

  if (!genAI) {
    if (type === 'pitch') {
      return res.json({
        content: `### Investor Pitch Deck Outline (Demo Mode)

1. **Title**: BizPilot AI - Elite AI Consultant for SMEs
2. **Problem**: Business owners waste hundreds of hours generating reports and forecasting sales manually.
3. **Value Proposition**: Real-time sales calculations, visual business plan modules, and SWOT matrices in one platform.
4. **Market Sizing**: 100 Million SMBs worldwide (TAM: $12B).
5. **Business Model**: Subscription-based SaaS ($29/month).`,
        isDemo: true
      });
    } else {
      return res.json({
        content: `### Marketing Campaign Blueprint (Demo Mode)

- **Campaign Name**: "Navigate Smarter"
- **Primary Channels**: LinkedIn Ads, Google Search, organic SaaS forums.
- **Copy Angle**: "Save 20 hours a week on business planning with BizPilot AI."
- **Key Call to Action (CTA)**: "Generate your free SWOT analysis in 3 clicks."
- **KPI to Track**: Customer Acquisition Cost (CAC) and sign-up conversion rate.`,
        isDemo: true
      });
    }
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = type === 'pitch'
      ? `Generate a structured, professional 5-slide Investor Pitch Outline for the business idea: "${idea}" targeting "${target}". Business context: ${JSON.stringify(profile || {})}. Make it punchy, clear, and highly attractive to venture capitalists.`
      : `Generate a structured Marketing Campaign Strategy for the business idea: "${idea}" targeting "${target}". Business context: ${JSON.stringify(profile || {})}. Include channels, key messaging, content pillars, and metrics to monitor.`;

    const result = await model.generateContent(prompt);
    res.json({ content: result.response.text() });
  } catch (error) {
    console.error('Pitch/Campaign Error:', error);
    res.status(500).json({ error: 'Failed to generate campaign/pitch content.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
