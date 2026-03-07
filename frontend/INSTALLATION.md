# 📦 GigShield AI - Installation Guide

## ✨ What You Have

A complete React application with:
- ✅ Worker registration & onboarding
- ✅ Premium quote calculation
- ✅ Policy activation
- ✅ Dashboard & claims tracking
- ✅ Admin analytics
- ✅ Full API integration
- ✅ Tailwind CSS styling
- ✅ Responsive design

---

## 🎯 Step-by-Step Installation

### Prerequisites
- **Node.js 14+** (Download from nodejs.org)
- **VS Code** (Download from code.visualstudio.com)
- **Backend API** running on http://localhost:8000

### Installation Steps

#### Step 1: Prepare the Folder
1. Download the `gigshield-ai-project` folder
2. Move it to your desired location (Desktop, Documents, etc.)

#### Step 2: Open in VS Code
1. Open VS Code
2. Click **File → Open Folder**
3. Select the `gigshield-ai-project` folder
4. Click **Select Folder**

#### Step 3: Open Terminal
1. In VS Code, press **Ctrl + `** (backtick key)
2. Or go to **View → Terminal**
3. Terminal should open at the bottom

#### Step 4: Install Dependencies
Type this command and press Enter:
```bash
npm install
```

**What it does:**
- Downloads React, Tailwind, Recharts, and other packages
- Creates `node_modules` folder
- May take 2-5 minutes

**You'll see:**
```
added 1200+ packages in 2m
```

#### Step 5: Verify Backend is Running
Open this in your browser:
```
http://localhost:8000/docs
```

You should see Swagger API docs. If not, start your backend first!

#### Step 6: Start Frontend
In terminal, type:
```bash
npm start
```

**What it does:**
- Starts development server
- Opens browser automatically
- Hot-reload enabled (changes auto-refresh)

**You'll see:**
```
Compiled successfully!
Open http://localhost:3000 in your browser
```

#### Step 7: Test the App
1. Browser opens at http://localhost:3000
2. You should see the landing page
3. Click **"Get Started"** to test registration
4. Fill in the form with test data:
   - Name: Rajesh Kumar
   - Phone: 9876543210 (exactly 10 digits)
   - Platform: Zomato
   - City: Mumbai
   - Work Zone: Bandra
   - Daily Earning: 500

---

## 📁 What Each File Does

```
gigshield-ai-project/
│
├── 📄 package.json
│   └─ Lists all dependencies and scripts
│
├── 📄 tailwind.config.js
│   └─ Tailwind CSS configuration
│
├── 📄 postcss.config.js
│   └─ CSS processing configuration
│
├── 📄 README.md
│   └─ Project documentation
│
├── 📄 SETUP_GUIDE.md
│   └─ Setup instructions
│
├── 📂 public/
│   └── index.html
│       └─ Main HTML file (don't edit)
│
└── 📂 src/
    ├── App.jsx (⭐ MAIN FILE)
    │   └─ Contains all pages and components
    ├── index.js
    │   └─ React entry point
    └── index.css
        └─ Tailwind CSS imports
```

---

## 🔌 API Configuration

The app connects to backend at:
```
http://localhost:8000
```

If your backend runs on a different port, edit `src/App.jsx`:

Find this line (around line 9):
```javascript
const API = "http://localhost:8000";
```

Change `8000` to your port number.

---

## ✅ Verification Checklist

After installation, verify:

- [ ] Node.js is installed (`node -v` in terminal)
- [ ] VS Code opened successfully
- [ ] `npm install` completed without errors
- [ ] Backend running on http://localhost:8000/docs
- [ ] `npm start` runs without errors
- [ ] Browser opens at http://localhost:3000
- [ ] Landing page displays correctly
- [ ] Navigation buttons work
- [ ] Registration form appears

---

## 🚨 Common Issues & Solutions

### Issue: "npm: command not found"
**Solution:** Node.js not installed
- Download and install from nodejs.org
- Restart terminal
- Try again

### Issue: "Cannot find module 'react'"
**Solution:** Dependencies not installed
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"
**Solution:** Another app using port 3000
```bash
# Use different port
PORT=3001 npm start
```

### Issue: Backend not connecting
**Solution:** 
1. Check backend is running: http://localhost:8000/docs
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try registration and look for failed requests
5. Check API URL in src/App.jsx

### Issue: Styles not loading (no colors/styling)
**Solution:**
```bash
npm run build
npm start
```

---

## 📱 Testing Different Pages

Click buttons at bottom to test different pages:

| Button | Page | Test |
|--------|------|------|
| Landing | Homepage | View features |
| Register | Sign up form | Fill form, submit |
| Policies | Quote page | After registration |
| Dashboard | Worker hub | After policy created |
| Claims | Track claims | View claim history |
| Admin | Analytics | Platform metrics |

---

## 🎨 Customization

### Change Primary Color
Find in `src/App.jsx`:
```javascript
from-sky-500 to-teal-500  // Change these colors
```

Replace with Tailwind colors:
```javascript
from-blue-500 to-purple-500  // Example
```

### Add New Page
1. Create function like `const NewPageName = () => (...)` in App.jsx
2. Add to main return statement
3. Add button in navigation

---

## 📊 Project Stats

- **Lines of Code:** ~1000
- **Components:** 6 full pages
- **API Endpoints:** 6 integrated
- **Styling:** Tailwind CSS
- **Icons:** Lucide React (50+ icons)
- **Charts:** Recharts

---

## 🎓 Learning Resources

- **React:** reactjs.org
- **Tailwind CSS:** tailwindcss.com
- **JavaScript:** javascript.info
- **Fetch API:** developer.mozilla.org

---

## 🚀 Deployment (Optional)

### Build for Production
```bash
npm run build
```

Creates optimized version in `build/` folder

### Deploy to Vercel (Free)
1. Push to GitHub
2. Connect to Vercel
3. Auto-deploys on push

### Deploy to Netlify (Free)
1. Install Netlify CLI
2. Run `netlify deploy`

---

## ✨ Next Steps

1. ✅ Complete installation (this guide)
2. ✅ Test all pages
3. ✅ Integrate real backend
4. ✅ Customize colors/branding
5. ✅ Deploy to production

---

## 📞 Support

If stuck:
1. Check terminal for error messages
2. Open browser DevTools (F12)
3. Check Console tab for errors
4. Read error messages carefully
5. Google the error message

---

**You're all set! Enjoy building GigShield AI! 🎉**
