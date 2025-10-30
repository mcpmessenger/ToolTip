---
name: Proactive Scraping System Debug
about: Debug the proactive scraping system for tooltip previews
title: "[DEBUG] Proactive Scraping - Internal Buttons Not Showing Click Results"
labels: ["bug", "high-priority", "proactive-scraping"]
assignees: []
---

## 🎯 **Problem Description**

The proactive scraping system is not working correctly for internal buttons. When hovering over buttons that open panels/modals, the tooltip still shows the homepage instead of the actual result of clicking the button.

## 🔍 **Current Behavior**
- **External links** (like "View Documentation" → GitHub): ✅ Working - Shows actual external page
- **Internal buttons** (like demo buttons → open panels): ❌ Not working - Still shows homepage

## 🏗️ **Technical Details**

### **Architecture:**
```
Frontend (React) → Backend (Node.js + Playwright) → Proactive Scraping Service
```

### **Key Components:**
- `backend/src/services/proactiveScrapingService.ts` - Core scraping engine
- `src/components/ProactiveHoverGif.tsx` - New tooltip component
- `src/pages/Dashboard.tsx` - Toggle system for proactive mode

## 🐛 **Debugging Challenges**

### **Issue #1: Backend API Not Responding**
- Proactive scraping API calls are timing out
- PowerShell commands to test API are hanging
- Backend health check works, but proactive scraping endpoint doesn't respond

### **Issue #2: Frontend Not Using Proactive Mode**
- Dashboard still using old `HoverGif` instead of `ProactiveHoverGif`
- Network tab shows `HoverGif.tsx` requests, not proactive requests
- Toggle button exists but may not be properly switching components

### **Issue #3: Internal Button Detection**
- System can't detect when internal buttons open panels/modals
- Screenshots show no change when clicking internal buttons
- Enhanced detection logic added but not tested

## 🧪 **Testing Steps**

### **Step 1: Verify Backend API**
```bash
curl -X POST http://localhost:3001/api/proactive-scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:8082"}'
```

### **Step 2: Check Frontend Toggle**
- Look for green/gray toggle button next to settings
- Verify it switches between "Proactive Mode" and "Standard Mode"
- Check browser console for errors

### **Step 3: Test Internal Button Detection**
- Enable proactive mode
- Hover over internal buttons (like ⚡ Simple GIF Demo)
- Check if scanning starts and panels are detected

## 📊 **Expected vs Actual Behavior**

### **Expected:**
- Hover over button → Shows actual panel/modal that opens
- First hover: "Scanning page for clickable elements..."
- After scanning: Shows real click results
- Subsequent hovers: Instant cached results

### **Actual:**
- Hover over button → Shows homepage (useless)
- No scanning appears to happen
- Toggle button may not be working

## 🔧 **Files to Check**

### **Backend:**
- `backend/src/services/proactiveScrapingService.ts`
- `backend/src/routes/proactiveScraping.ts`
- `backend/src/index.ts`

### **Frontend:**
- `src/components/ProactiveHoverGif.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/UniversalTooltipDemo.tsx`

## 📝 **Additional Context**

This is a critical feature for the tooltip system. The goal is to show users exactly what happens when they click any button, not just the current page state. The proactive scraping system should:

1. **Scan the page** for all clickable elements
2. **Click each element** and capture the result
3. **Store screenshots** with element identifiers
4. **Show real previews** on hover

## 🚀 **Success Criteria**

- [ ] Backend API responds to proactive scraping requests
- [ ] Frontend toggle switches between modes correctly
- [ ] Internal buttons show actual panel/modal content on hover
- [ ] External links show actual external pages on hover
- [ ] Cached results display instantly on subsequent hovers

---

**Priority**: High  
**Complexity**: Medium  
**Status**: In Progress
