# 🧺 Bristol Market Finder

A location-aware app to help people discover local farmers markets and craft markets in and around Bristol. Built using [Supabase](https://supabase.com/) with spatial queries (PostGIS), a clean schema, and full Git-based version control.

---

## 🚀 Features

- 📍 Interactive map of market locations
- 🗓️ Recurring schedules and real-world open confirmations
- ✅ Secure admin tools for organisers to confirm if a market is running
- 🔒 Row-level security for sensitive contact data
- 🔄 Version-controlled schema via Supabase migrations

---

## 📁 Project Structure

```
supabase/
  └── migrations/            # SQL migrations for schema
  └── .supabase/             # Supabase project link config
.env                         # (not committed) stores secrets/keys locally
.gitignore                   # Ignores secrets and build artefacts
```

---

## 🛠️ Getting Started

1. **Clone the repo**

```bash
git clone https://github.com/Cortado-J/market-finder.git
cd market-finder
```

2. **Install the Supabase CLI**

```bash
brew install supabase/tap/supabase
# or follow manual install at https://supabase.com/docs/guides/cli
```

3. **Link to your Supabase project**

```bash
supabase link
```

(Use the `project ref` from the Supabase dashboard)

4. **Push the schema to Supabase**

```bash
supabase db push
```

5. **Start developing!**

---

## 🔄 Rebuild From Scratch

If you ever need to recreate this backend from zero:

```bash
git clone https://github.com/Cortado-J/market-finder.git
cd market-finder
supabase link
supabase db push
```

---

## 📌 Status

✅ Supabase project linked  
✅ Schema migration under version control  
⬜ Seed data  
⬜ Frontend (React/Flutter/etc.)  
⬜ Admin UI for organisers  
⬜ Public map view  

---

## 🧠 Ideas for later

- Geo-clustering on maps
- Auth for organisers with RLS-based edit rights
- Email reminders for unconfirmed markets

---

## 📄 License

MIT (add if appropriate)
