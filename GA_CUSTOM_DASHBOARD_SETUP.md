# Google Analytics Custom Dashboard Setup Guide

## Overview
This guide will help you set up custom dashboards in Google Analytics to track the specific metrics you need:
- User logins and signups
- Header menu clicks (Sticker Crafts, Loadouts, Skin Table, Resell Tracker)
- Weapon menu clicks (side menu navigation)

Your tracking ID: ****

---

## Events Being Tracked

Your SkinVault app now tracks the following custom events:

### 1. **Authentication Events**
- **Event Name**: `login`
  - **Category**: `authentication`
  - **Label**: `user_login_email`
  - **Tracks**: When a user successfully logs in

- **Event Name**: `sign_up`
  - **Category**: `authentication`
  - **Label**: `user_signup_email`
  - **Tracks**: When a user successfully creates an account

### 2. **Navigation Events**
- **Event Name**: `header_menu_click`
  - **Category**: `navigation`
  - **Menu Location**: `header`
  - **Labels**: 
    - `Sticker Crafts`
    - `Loadouts`
    - `Skin Table`
    - `Resell Tracker`
  - **Tracks**: Clicks on main header menu items

- **Event Name**: `weapon_menu_click`
  - **Category**: `navigation`
  - **Menu Location**: `side_menu`
  - **Labels**: Weapon names (e.g., `AK-47`, `AWP`, `M4A4`, etc.)
  - **Tracks**: Clicks on weapon items in the category pages

---

## Step-by-Step: Creating Custom Dashboards

### Step 1: Access Google Analytics
1. Go to [Google Analytics](https://analytics.google.com)
2. Sign in with your Google account
3. Select your property (the one with ID `G-MYL66ZC2LR`)

### Step 2: Navigate to Reports
1. In the left sidebar, click on **Reports**
2. Then click on **Library** at the bottom of the Reports section

### Step 3: Create a New Collection (Dashboard)
1. Click **Create new collection**
2. Name it: **"SkinVault - User Activity"**
3. Click **Create**

---

## Custom Report 1: User Authentication

### Purpose
Track user logins and signups to understand user acquisition and retention.

### Setup Instructions

1. **In your custom collection**, click **Add report**
2. Click **Create a new report** → **Create a detail report**
3. Configure the report:
   - **Report name**: "User Authentication"
   - **Dimensions**: 
     - Primary: `Event name`
     - Secondary: `Event label`
   - **Metrics**:
     - `Event count`
     - `Total users`
   - **Filters**: Add filter
     - Dimension: `Event name`
     - Match type: `contains`
     - Value: `login` OR `sign_up`

4. **Save the report**

### What You'll See
- Total number of logins
- Total number of signups
- Comparison between login and signup events
- Trends over time

---

## Custom Report 2: Header Menu Clicks

### Purpose
Understand which main features users are most interested in.

### Setup Instructions

1. **In your custom collection**, click **Add report**
2. Click **Create a new report** → **Create a detail report**
3. Configure the report:
   - **Report name**: "Header Navigation"
   - **Dimensions**:
     - Primary: `Event label`
   - **Metrics**:
     - `Event count`
     - `Total users`
   - **Filters**: Add filter
     - Dimension: `Event name`
     - Match type: `exactly matches`
     - Value: `header_menu_click`

4. **Save the report**

### What You'll See
- Most clicked header menu items
- Click counts for:
  - Sticker Crafts
  - Loadouts
  - Skin Table
  - Resell Tracker
- User engagement with main features

---

## Custom Report 3: Weapon Menu Clicks

### Purpose
See which weapons users are most interested in viewing.

### Setup Instructions

1. **In your custom collection**, click **Add report**
2. Click **Create a new report** → **Create a detail report**
3. Configure the report:
   - **Report name**: "Weapon Navigation"
   - **Dimensions**:
     - Primary: `Event label`
   - **Metrics**:
     - `Event count`
     - `Total users`
   - **Filters**: Add filter
     - Dimension: `Event name`
     - Match type: `exactly matches`
     - Value: `weapon_menu_click`

4. **Sort by**: Event count (descending)
5. **Save the report**

### What You'll See
- Most popular weapons users click on
- Top 10 weapons by clicks
- User interest in specific weapon categories

---

## Quick Dashboard (Alternative Method)

If you prefer a simpler approach, use the **Exploration** feature:

### Step 1: Create an Exploration
1. In Google Analytics, click **Explore** in the left sidebar
2. Click **Create a new exploration**
3. Choose **Free form** template

### Step 2: Configure Variables
1. **Dimensions**: Add these
   - `Event name`
   - `Event label`
   - `Event category`

2. **Metrics**: Add these
   - `Event count`
   - `Total users`

### Step 3: Build Your Report
1. **Tab 1: Authentication**
   - Drag `Event label` to **ROWS**
   - Drag `Event count` to **VALUES**
   - Add filter: `Event name` contains `login` or `sign_up`

2. **Tab 2: Header Menu**
   - Drag `Event label` to **ROWS**
   - Drag `Event count` to **VALUES**
   - Add filter: `Event name` exactly matches `header_menu_click`

3. **Tab 3: Weapon Clicks**
   - Drag `Event label` to **ROWS**
   - Drag `Event count` to **VALUES**
   - Add filter: `Event name` exactly matches `weapon_menu_click`

4. **Save** your exploration as "SkinVault User Activity"

---

## Real-Time Monitoring

To see events as they happen:

1. Go to **Reports** → **Real-time**
2. You'll see:
   - Users active right now
   - Events being triggered in real-time
   - Which pages users are on

### Testing Your Tracking

1. Open your SkinVault app in production
2. Perform these actions:
   - Log in or create an account
   - Click on header menu items
   - Click on weapon items
3. Check **Real-time** in Google Analytics
4. You should see your events appearing immediately

---

## Key Metrics to Monitor

### Daily Check (Real-time)
- **Active users**: How many users are on your site right now
- **Event count**: Which events are being triggered

### Weekly Check (Reports)
1. **User Authentication**
   - New signups this week
   - Login vs. signup ratio
   - User retention (returning users)

2. **Navigation Patterns**
   - Most popular header menu items
   - Most viewed weapons
   - User journey through your app

### Monthly Analysis
- **Trends**: Are signups increasing?
- **Engagement**: Which features are most used?
- **Popular Content**: Which weapons get the most attention?

---

## Pro Tips

### 1. **Set Up Alerts**
- Go to **Admin** → **Custom alerts**
- Create alert for new signups dropping below a threshold
- Get email notifications for unusual activity

### 2. **Compare Time Periods**
- In any report, use the date picker to compare:
  - This week vs. last week
  - This month vs. last month
- See if your changes are improving engagement

### 3. **Export Data**
- Click **Share** → **Download file** on any report
- Export as CSV or Google Sheets for deeper analysis

### 4. **Create Goals**
- Go to **Admin** → **Data display** → **Events**
- Mark events as **conversions** to track them better:
  - `sign_up` (most important!)
  - `create_loadout`
  - `add_to_tracker`

---

## Troubleshooting

### Events Not Showing Up?

1. **Check Real-time Reports**
   - If events don't appear in real-time, they're not being sent

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Look for "📊" log messages indicating tracking

3. **Verify Tracking ID**
   - Ensure `.env` file has: `VITE_GA_TRACKING_ID=G-MYL66ZC2LR`
   - Or check that the fallback in `analytics.ts` is correct

4. **Check Ad Blockers**
   - Some ad blockers prevent Google Analytics
   - Test in incognito mode or with blockers disabled

### Data Delays

- **Real-time**: Shows immediately (0-2 minutes delay)
- **Standard reports**: 24-48 hours for full processing
- **Historical data**: Can take up to 48 hours to appear

---

## Summary

You now have a complete Google Analytics setup that tracks:

✅ **User Authentication**
- Logins
- Signups

✅ **Navigation**
- Header menu clicks
- Weapon menu clicks

✅ **Simplified Tracking**
- Only the essential metrics you need
- Clean, focused data
- Easy-to-understand reports

### Next Steps

1. Deploy your app to production
2. Wait 24-48 hours for data to accumulate
3. Set up your custom dashboards following this guide
4. Check reports weekly to understand user behavior
5. Optimize your app based on the data

**Your tracking is now live and ready to collect data!** 🎉📊

