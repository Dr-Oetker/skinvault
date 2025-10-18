# Google Analytics Quick Reference Card

## 🎯 Your Setup

**Tracking ID**: `G-MYL66ZC2LR`

**Dashboard URL**: [https://analytics.google.com](https://analytics.google.com)

---

## 📊 What's Being Tracked

| Event | What It Tracks | Where to Find in GA |
|-------|---------------|---------------------|
| **login** | User logins | Events → "login" |
| **sign_up** | New account creation | Events → "sign_up" |
| **header_menu_click** | Header menu navigation | Events → "header_menu_click" |
| **weapon_menu_click** | Weapon selection clicks | Events → "weapon_menu_click" |

---

## ⚡ Quick Actions

### See What's Happening Right Now
1. Go to GA → **Reports** → **Realtime**
2. View active users and events

### See User Authentication Stats
1. Go to GA → **Reports** → **Engagement** → **Events**
2. Look for `login` and `sign_up` events
3. Click event name for detailed breakdown

### See Most Popular Features
1. Go to GA → **Reports** → **Engagement** → **Events**
2. Look for `header_menu_click`
3. Check event labels to see which features are most clicked

### See Most Popular Weapons
1. Go to GA → **Reports** → **Engagement** → **Events**
2. Look for `weapon_menu_click`
3. Sort by event count to see top weapons

---

## 🔍 Common Queries

**"How many signups did I get today?"**
- Events → `sign_up` → Filter by "Today"

**"What's my most popular feature?"**
- Events → `header_menu_click` → Sort by count

**"Which weapons do users view most?"**
- Events → `weapon_menu_click` → Sort by count

**"How many users logged in this week?"**
- Events → `login` → Filter by "Last 7 days"

---

## 📅 Recommended Check-ins

### Daily (5 min)
- Quick check of **Realtime** report
- Active users count
- Any unusual activity

### Weekly (15 min)
- Review **Events** report
- Check signup trends
- Identify most popular features/weapons

### Monthly (30 min)
- Create/review custom dashboards
- Analyze trends over time
- Compare to previous month
- Adjust app strategy based on data

---

## 🚨 Troubleshooting

**Events not showing up?**
1. Check browser console for "📊" messages
2. Disable ad blockers
3. Wait 24-48 hours for historical data
4. Test in Real-time reports first

**Need help with dashboards?**
- See `GA_CUSTOM_DASHBOARD_SETUP.md`

---

## 📱 Mobile App

To check GA on mobile:
1. Download "Google Analytics" app from App Store/Play Store
2. Sign in with your Google account
3. Select your property (G-MYL66ZC2LR)
4. View real-time and reports on the go

---

## 💡 Pro Tips

1. **Set up email alerts** for daily signup counts
2. **Compare time periods** to track growth
3. **Export data** to spreadsheets for deeper analysis
4. **Mark events as conversions** for better tracking
5. **Use Exploration** for custom analysis

---

## 📚 Full Documentation

- **Custom Dashboard Setup**: `GA_CUSTOM_DASHBOARD_SETUP.md`
- **Implementation Details**: `ANALYTICS_IMPLEMENTATION_SUMMARY.md`

---

**Everything is ready! Your analytics are live and tracking.** 🎉

