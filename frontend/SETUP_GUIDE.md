# 🚀 GigShield AI - Complete Setup Guide

## Step 1: Copy Files to VS Code

1. **Download the entire `gigshield-ai-project` folder**
2. **Open VS Code**
3. **File → Open Folder** → Select `gigshield-ai-project`
4. The folder structure should look like:

```
gigshield-ai-project/
├── .gitignore
├── README.md
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── public/
│   └── index.html
└── src/
    ├── App.jsx
    ├── index.css
    └── index.js
```

## Step 2: Install Dependencies

1. **Open Terminal in VS Code** (Ctrl+` or View → Terminal)
2. **Run:**
   ```bash
   npm install
   ```
3. **Wait for installation to complete** (may take 2-3 minutes)

## Step 3: Check Backend is Running

Make sure the backend API is running on `http://localhost:8000`

Test it by opening this in your browser:
```
http://localhost:8000/docs
```

You should see the Swagger API documentation.

## Step 4: Start Frontend

In the VS Code terminal, run:
```bash
npm start
```

The frontend will automatically open at `http://localhost:3000`

## ✅ What You Should See

### Landing Page
- Beautiful hero section
- Feature cards
- "Get Started" button

### Registration Page
- Form for worker details
- Phone number validation
- Platform selection (Zomato/Swiggy)

### Quote Page
- Risk level assessment
- Premium calculation
- Coverage details

### Dashboard
- Policy status
- Recent claims
- Quick actions

### Claims Status
- List of all claims
- Status tracking
- Amount details

### Admin Analytics
- Worker metrics
- Policy statistics
- Claims overview

## 🔧 Available Commands

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Eject (advanced, don't use unless needed)
npm eject
```

## 📋 File Descriptions

### Core Files
- **App.jsx** - Main React component with all pages
- **index.js** - React entry point
- **index.html** - HTML template

### Configuration
- **package.json** - Dependencies and scripts
- **tailwind.config.js** - Tailwind CSS setup
- **postcss.config.js** - PostCSS configuration

### Styling
- **index.css** - Tailwind CSS imports and base styles

## 🔌 API Connection

The app connects to backend at:
```
http://localhost:8000
```

If your backend runs on different port, edit the API constant in `src/App.jsx`:

```javascript
const API = "http://localhost:YOUR_PORT";
```

## ✨ Features Implemented

✅ Worker Registration with validation
✅ Premium Quote Calculation
✅ Policy Activation
✅ Worker Dashboard
✅ Claims Tracking
✅ Admin Analytics
✅ Real-time API integration
✅ Error handling
✅ Loading states
✅ Responsive design

## 🐛 Troubleshooting

### "Cannot find module 'react'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 is already in use"
```bash
PORT=3001 npm start
```

### Backend not connecting
1. Check backend is running: `http://localhost:8000/docs`
2. Open DevTools (F12) → Network tab
3. Look for API calls and check error messages

### Styles not loading
```bash
npm install -D tailwindcss postcss autoprefixer
npm run build
```

## 📝 Customization

### Change Background Color
Edit the `bg-white` classes in `src/App.jsx`

### Modify Colors
Edit `tailwind.config.js` theme colors

### Add New Pages
Add new component functions in `App.jsx` and add route buttons

## 📦 Dependencies

All required packages are in `package.json`:
- react@18.2.0
- react-dom@18.2.0
- recharts@2.10.0
- lucide-react@0.263.1
- tailwindcss@3.3.0

## 🎯 Next Steps

1. ✅ Copy files to VS Code
2. ✅ Run `npm install`
3. ✅ Ensure backend is running
4. ✅ Run `npm start`
5. ✅ Test all pages
6. ✅ Deploy when ready

## 💡 Tips

- Use browser DevTools to debug API calls
- Check console for error messages
- Test registration form with valid phone (10 digits)
- Try different risk zones to see quote variations

## 🆘 Need Help?

Check these files:
- `README.md` - Project overview
- `src/App.jsx` - Code is well-commented
- Browser Console (F12) - Error messages

---

**Ready to launch GigShield AI!** 🚀
