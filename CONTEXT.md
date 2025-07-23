 Project Summary: SkinVault
🧱 Tech Stack
Layer	Tool / Framework
Frontend	React + Vite
State Mgmt	Zustand or Context API
Styling	TailwindCSS
Routing	React Router
Backend/Auth	Supabase (DB + Auth)
Hosting	Vercel / Netlify (TBD)
DB Sync	External Script → Supabase
Image Hosting	GitHub or CDN

🔁 Development Flow
Follow the steps in order for optimal development progress. Features are grouped logically.

1. 📁 Project Setup
Initialize project with Vite + React

Install TailwindCSS, React Router, Zustand (or Context), etc.

Create basic routing and layout

Setup environment config for Supabase

2. 🌐 Global Layout & Navigation
✅ Build the following layout:
Top Nav

Logo

Sticker Crafts, Loadouts, Login/Profile

Sidebar (Persistent)

Lists Categories → on expand: Weapons → on click: show Skins

Main View Area

Displays selected content (Skins, Crafts, Loadouts, etc.)

Footer

Placeholder sections (e.g., About, Legal, Contact)

3. 🔐 Authentication
Setup Supabase email/password login

Auth-aware routing and view toggling:

Show login button if not logged in

Show profile access if logged in

Admin user check (via role or email list)

4. 🏠 Home Page
Display info section (about the app)

Latest 3 official Loadouts

Latest 3 official Sticker Crafts

Each with "View all" → navigate to respective section

5. 📦 Skins Browser
Sidebar Navigation
Show Categories → expandable into Weapons

Weapon Page
Card-based layout of all Skins for selected weapon

Shows: image, name, price range, stattrak, souvenir, rarity color

Skin Detail Page
Large image

Name, description

Price per float (wears_extended)

Crates & collections

StatTrak, Souvenir, rarity badge

Favorite (♥) toggle if logged in

6. 💾 Favorites System
Logged-in users can ♥ skins

Favorited skins shown in profile page

No sorting/filtering required

7. 🧪 Loadouts
Overview Page
Two sections:

User Loadouts (if logged in)

First card: “Create new loadout”

Official Loadouts

“Show more” → go to full page with all loadouts (no filters yet)

Loadout Detail / Editor
Two tabs: T-Side / CT-Side

Only weapons where t_side / ct_side = true (from weapons)

Knives + Gloves → their own 2 grouped slots

After selecting group: show respective skins

For each slot:

Click → choose skin

Select float value OR none (then price range shown)

Budget field (optional): shows total cost and overage

No auto-save — Save button required

Allow user to copy official loadouts for editing

8. ✏️ Sticker Crafts
Overview Page
Card view:

Name + preview image

Detail Page
Two images:

In-game screenshot

Sticker placement screenshot

Related skin (with link to its detail page)

External link to third-party craft view

Up to 5 sticker entries:

Name, image, price, last updated, link

9. 📋 Resell Tracker
User selects a skin → enters buy price

Saved entry shows:

Current market price (from wears_extended)

Difference (profit/loss)

Stored in user profile → accessible via profile tab

User can remove entries

10. 🔍 Global Search
Accessible via top nav

Search across all Skins

Result = list of skin cards (same as weapon page)

Clicking = navigate to skin detail page

11. 👤 Profile Page
Basic data display (email only, no avatar or username)

Tabs:

Favorites

User Loadouts

Resell Tracker

12. 🛠️ Admin Area
Access
Restricted to admin user (check by email or role)

Admin Loadouts
Same builder interface as user

Title + description required

Save = visible as “Official Loadout”

Admin Sticker Crafts
Form with:

Name

Description

2 images (overview & placement)

Skin reference (from DB)

Up to 5 stickers: name, image, price, last update, external link

External craft link

Edit = same as create with data pre-filled

✅ UX & Behavior
Mobile-first responsive design

Lazy loading for large datasets (skins)

Toaster notifications for:

Save success

Errors (e.g., login, fetch failure)

All content in English only

Admin-created entries go live immediately

No autosave

No notifications/price alerts (planned for future)

🧩 Data Recap (Supabase Tables Already existing)
-- 1. Categories
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
-- 2. Script State
CREATE TABLE script_state (
    key TEXT PRIMARY KEY,  -- z.B. 'state'
    wear_index INTEGER,
    timestamp TIMESTAMPTZ,
    doc_index INTEGER
);
-- 3. Weapons
CREATE TABLE weapons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
-- 4. Skins
CREATE TABLE skins (
    id TEXT PRIMARY KEY,
    stattrak BOOLEAN,
    rarity TEXT,
    pattern TEXT,
    category TEXT,
    image TEXT,
    max_float FLOAT,
    min_float FLOAT,
    name TEXT,
    rarity_color TEXT,
    description TEXT,
    weapon TEXT,
    souvenir BOOLEAN,
    last_price_update TIMESTAMPTZ,
    crates JSONB,            -- Array of Objekte
    collections JSONB,       -- Array of Objekte
    wears_extended JSONB     -- Array von { wear, enabled, price }
);
-- 5. User Favorites
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skin_id TEXT REFERENCES skins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, skin_id)
);

-- 6. Official Loadouts (Admin-created)
CREATE TABLE official_loadouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. User Loadouts
CREATE TABLE user_loadouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    budget DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Loadout Items (für beide User und Official Loadouts)
CREATE TABLE loadout_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loadout_id UUID, -- Kann auf user_loadouts oder official_loadouts verweisen
    loadout_type TEXT NOT NULL CHECK (loadout_type IN ('user', 'official')),
    side TEXT NOT NULL CHECK (side IN ('t', 'ct')),
    weapon_id TEXT REFERENCES weapons(id) ON DELETE CASCADE,
    skin_id TEXT REFERENCES skins(id) ON DELETE CASCADE,
    float_value FLOAT, -- NULL wenn kein spezifischer Float gewählt
    slot_position INTEGER, -- Für Sortierung/Gruppierung
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(loadout_id, loadout_type, side, weapon_id)
);

-- 9. Sticker Crafts
CREATE TABLE sticker_crafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    skin_id TEXT REFERENCES skins(id) ON DELETE CASCADE,
    ingame_image TEXT, -- URL zum In-Game Screenshot
    placement_image TEXT, -- URL zum Sticker Placement Screenshot
    external_craft_link TEXT, -- Link zu third-party craft view
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Sticker Craft Stickers (bis zu 5 Sticker pro Craft)
CREATE TABLE sticker_craft_stickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    craft_id UUID REFERENCES sticker_crafts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image TEXT, -- URL zum Sticker Bild
    price DECIMAL(10,2),
    external_link TEXT, -- Link zum Sticker
    position INTEGER NOT NULL CHECK (position >= 1 AND position <= 5),
    last_updated TIMESTAMPTZ DEFAULT now(),
    UNIQUE(craft_id, position)
);

-- 11. Resell Tracker
CREATE TABLE resell_tracker (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skin_id TEXT REFERENCES skins(id) ON DELETE CASCADE,
    buy_price DECIMAL(10,2) NOT NULL,
    wear_value FLOAT, -- Spezifischer Wear-Wert falls bekannt
    notes TEXT, -- Optionale Notizen
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes für bessere Performance
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_skin_id ON user_favorites(skin_id);

CREATE INDEX idx_user_loadouts_user_id ON user_loadouts(user_id);
CREATE INDEX idx_user_loadouts_created_at ON user_loadouts(created_at DESC);

CREATE INDEX idx_official_loadouts_created_at ON official_loadouts(created_at DESC);

CREATE INDEX idx_loadout_items_loadout ON loadout_items(loadout_id, loadout_type);
CREATE INDEX idx_loadout_items_side ON loadout_items(side);

CREATE INDEX idx_sticker_crafts_skin_id ON sticker_crafts(skin_id);
CREATE INDEX idx_sticker_crafts_created_at ON sticker_crafts(created_at DESC);

CREATE INDEX idx_sticker_craft_stickers_craft_id ON sticker_craft_stickers(craft_id);

CREATE INDEX idx_resell_tracker_user_id ON resell_tracker(user_id);
CREATE INDEX idx_resell_tracker_skin_id ON resell_tracker(skin_id);

-- RLS (Row Level Security) Policies
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_loadouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resell_tracker ENABLE ROW LEVEL SECURITY;

-- Users können nur ihre eigenen Favorites sehen/bearbeiten
CREATE POLICY "Users can view own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Users können nur ihre eigenen Loadouts sehen/bearbeiten
CREATE POLICY "Users can view own loadouts" ON user_loadouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loadouts" ON user_loadouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loadouts" ON user_loadouts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own loadouts" ON user_loadouts
    FOR DELETE USING (auth.uid() = user_id);

-- Users können nur ihre eigenen Resell Tracker Einträge sehen/bearbeiten
CREATE POLICY "Users can view own resell tracker" ON resell_tracker
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resell tracker" ON resell_tracker
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resell tracker" ON resell_tracker
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resell tracker" ON resell_tracker
    FOR DELETE USING (auth.uid() = user_id);

-- Öffentliche Tabellen (alle können lesen)
ALTER TABLE official_loadouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loadout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_crafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sticker_craft_stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON official_loadouts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON loadout_items FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sticker_crafts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sticker_craft_stickers FOR SELECT USING (true);

-- Admin-only Policies für Official Content (anpassen je nach Admin-Check)
-- Beispiel: Nur bestimmte Email-Adressen können Official Loadouts erstellen
CREATE POLICY "Admin can manage official loadouts" ON official_loadouts
    FOR ALL USING (
        auth.email() = 'admin@skinvault.app' OR 
        auth.email() = 'lenlenkl@gmail.com'
    );

CREATE POLICY "Admin can manage loadout items" ON loadout_items
    FOR ALL USING (
        auth.email() = 'admin@skinvault.app' OR 
        auth.email() = 'lenlenkl@gmail.com'
    );

CREATE POLICY "Admin can manage sticker crafts" ON sticker_crafts
    FOR ALL USING (
        auth.email() = 'admin@skinvault.app' OR 
        auth.email() = 'lenlenkl@gmail.com'
    );

CREATE POLICY "Admin can manage sticker craft stickers" ON sticker_craft_stickers
    FOR ALL USING (
        auth.email() = 'admin@skinvault.app' OR 
        auth.email() = 'lenlenkl@gmail.com'
    );


