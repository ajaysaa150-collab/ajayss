# Brew & Bloom Café

A modern, full-stack artisanal café web application with:
- **Interactive Menu & Ordering**: Filter categories, add customized items to cart, select takeaway/dine-in, and manage orders.
- **Table Reservation System**: Reserve tables with real-time seating selection, party size, date/time picker, and confirmation codes.
- **Firebase Authentication & Firestore Persistence**: Google Sign-In and email authentication with persistent user profiles, table reservations, and order history.
- **Google Veo AI Video Animator**: Animate coffee and café moments into cinematic 16:9 widescreen or 9:16 portrait video clips using Google's Veo model (`veo-3.1-fast-generate-preview`).
- **Manager / Admin Portal**: Comprehensive management for reservations, inventory status, and operational controls.

---

## Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend & Serverless**: Express, `@google/genai` SDK
- **Database & Auth**: Firebase Authentication (Google Sign-In, Email/Password), Cloud Firestore
- **Deployment**: Ready for Vercel, Docker, or Node.js environments

---

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   The application will start at `http://localhost:3000`.

---

## Deploying to Vercel

1. Push this repository to GitHub: `https://github.com/ajaysaa150-collab/ajayss.git`
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `ajayss` repository.
4. Framework Preset will automatically detect **Vite**.
5. Configure Environment Variables in Vercel Project Settings:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
6. Click **Deploy**.

Vercel will build the frontend via `vercel.json` and deploy serverless endpoints from `/api`.
