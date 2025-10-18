# Migration to REST API Architecture

## ✅ Why Migrate

The Supabase JS client has fundamental issues with state management after tab switching:
- Internal locks get stuck
- IndexedDB state becomes corrupted
- Operations hang indefinitely
- Requires page reloads to recover

**Solution**: Use direct REST API calls for all data operations.

## 🎯 Migration Strategy

### Keep Supabase Client For:
- ✅ **Authentication** (`login`, `logout`, `checkSession`, `signUp`)
  - Auth flow is complex and client handles it well
  - No state corruption issues with auth

### Migrate to REST API For:
- ✅ **All Data Operations** (SELECT, INSERT, UPDATE, DELETE)
  - Simple HTTP requests
  - No state to corrupt
  - Works reliably after tab switching

## 📊 Files to Migrate

### High Priority (Admin/Critical Operations):
1. ✅ **AdminLoadouts.tsx** - DONE
2. ⏳ **AdminStickerCrafts.tsx** - Admin sticker management
3. ⏳ **EditLoadout.tsx** - User loadout editing
4. ⏳ **LoadoutDetail.tsx** - Loadout viewing/editing

### Medium Priority (User Data):
5. ⏳ **Profile.tsx** - User favorites, loadouts, tracker
6. ⏳ **ResellTracker.tsx** - Tracker entries
7. ⏳ **Loadouts.tsx** - Loadout listing
8. ⏳ **CreateLoadout.tsx** - New loadout creation

### Lower Priority (Read-Only):
9. ⏳ **Home.tsx** - Weapon categories
10. ⏳ **Category.tsx** - Weapon listing
11. ⏳ **Weapon.tsx** - Skin listing
12. ⏳ **Skin.tsx** - Skin details
13. ⏳ **SkinTable.tsx** - Skin table view
14. ⏳ **StickerCrafts.tsx** - Sticker craft listing
15. ⏳ **StickerCraftDetail.tsx** - Craft details

## 🔧 Migration Pattern

### Before (Supabase Client):
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('id', value)
  .order('created_at', { ascending: false });
```

### After (REST API):
```typescript
const { data, error } = await selectFrom('table', {
  eq: { id: value },
  order: { column: 'created_at', ascending: false }
});
```

## 📝 Extended API Functions Needed

Current functions cover basic operations. May need to add:
- `in` filter (for multiple IDs)
- `gt`, `lt`, `gte`, `lte` filters (for comparisons)
- `like`, `ilike` filters (for text search)
- Multiple order columns
- `count` option
- RPC calls (if needed)

## 🎯 Expected Benefits

- ✅ No more freezing after tab switch
- ✅ No more page reload requirements
- ✅ Consistent performance
- ✅ Simpler debugging (just HTTP requests)
- ✅ Better error messages
- ✅ Easier timeout handling

## 📈 Migration Order

1. Start with admin pages (highest impact)
2. Then user data operations (medium impact)
3. Finally read-only pages (lowest impact)

Each migration should:
1. Replace Supabase client data calls with REST API
2. Keep auth operations using Supabase client
3. Test thoroughly
4. Commit changes

## ⚠️ Notes

- Keep `src/supabaseClient.ts` for auth operations
- Auth store (`src/store/auth.ts`) still uses Supabase client - this is fine
- Session management still uses Supabase client - this is fine
- Only data operations (CRUD) need migration

