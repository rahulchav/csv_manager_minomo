# 📊 CSV Manager

CSV Manager is an intuitive and powerful tool for managing CSV files in a clean, table-like interface. Uploaded CSV files are treated as **batches**, with a rich UI that allows you to view, edit, and export data seamlessly. The app is mobile responsive and designed for both productivity and clarity.

## 🚀 Features

- Table-style UI representation of CSV files
- CSV import and export support
- Add/edit/delete rows
- Click-to-edit cells with keyboard navigation
- Dark and light mode toggle
- Fully responsive on mobile and desktop

---

## 📁 Areas & Feature Checklist

### 1. ⚙️ Architecture
- ✅ Built using [Wasp](https://wasp-lang.dev/) (OpenSaaS framework)
- ✅ PostgreSQL database
- ✅ [ShadCN UI](https://ui.shadcn.dev/) component system

---

### 2. 🧩 Database
- ✅ Tables for `CsvFile` and `CsvRow`
- ✅ Correct foreign key relationship between files and rows
- ✅ Proper migration scripts for development and production

---

### 3. 📋 Table Features
- ✅ Column reordering using drag-and-drop (DnD)
- ✅ Row selection with checkboxes
- ✅ Global search and per-column filtering
- ✅ Click-to-edit with arrow key navigation
- ✅ Sortable columns (ascending, descending, and default/original)
- ✅ Column visibility toggling (show/hide)
- ✅ Pagination with infinite scroll support
- ✅ Robust UI with edit tracking

---

### 4. ✨ Additional Features
- ✅ Dark mode / Light mode toggle
- ✅ Delete CSV batch with confirmation modal
- ✅ Add new row with auto-indexing
- ✅ Export selected or all rows back to CSV

---

## 🛠️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/rahulchav/csv_manager_minomo.git

# 2. Navigate to the project directory
cd csv_manager_minomo

# 3. Update your PostgreSQL database connection string
#    Open the .env file and replace the placeholder with your actual DB URL

# 4. Install dependencies
npm install

# 5. Run database migrations
wasp db migrate-dev

# 6. Start the development server
wasp start
