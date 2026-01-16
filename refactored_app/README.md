# Bed Information System (Refactored)

A modern, fast, and feature-rich Hospital Bed Information System built with **FastAPI** (Backend) and **Vanilla JS/TailwindCSS** (Frontend).

## 🚀 Features

### Core Management
- **Bed Management**: Real-time tracking of bed status (Occupied, Empty, Surgery, etc.).
- **Patient Admission/Discharge**: Full workflow for admitting new patients and discharging them.
- **Shift Notes**: Digital notebook for nurses to handover information (Create, Edit, Delete).

### Monitoring & Vitals
- **Real-time Vitals**: Monitors Temperature, Pulse, and Blood Pressure.
- **IoT Simulator**: Simulates devices sending vital signs every 5 seconds.
- **Smart Alerts**: Visual warnings for fever (> 38°C).
- **Trends & Reporting**: Interactive dual-axis charts (Temp vs Pulse) and CSV Export.

### Administration
- **Admin Panel**: Dedicated interface for managing user accounts (Nurses, Admins, Patients).
- **Role-Based Access**: Strict permission control (Admin: 0, Nurse: 1, Patient: 2).

---

## 🛠 Installation & Setup

### Prerequisites
- [Anaconda](https://www.anaconda.com/) or Miniconda
- Python 3.9+

### 1. Environment Setup
Open your terminal/Anaconda Prompt and run:

```bash
# Create environment
conda create -n bed_system python=3.9

# Activate environment
conda activate bed_system

# Install dependencies
pip install fastapi "uvicorn[standard]" sqlalchemy jinja2 python-multipart python-jose[cryptography] passlib[bcrypt] requests
```

### 2. Initialize Database
The system uses SQLite by default. The database will be automatically created on the first run.

If you need to seed initial data (Admin user, dummy patients), run:
```bash
python seed_data.py
python create_admin.py
```

---

## ▶️ How to Run

### Option 1: One-Click Start (Windows)
Double-click `start_system.bat` in this folder.  
It will automatically launch the Server and the IoT Simulator in separate windows.

### Option 2: Manual Start
1. **Start Server**:
   ```bash
   python run.py
   ```
2. **Start IoT Simulator** (in a new terminal):
   ```bash
   python iot_simulator.py
   ```

**Access the system at:** [http://127.0.0.1:8001](http://127.0.0.1:8001)

---

## 🔑 Default Accounts

| Role | Username | Password | Permission |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin` | 0 |
| **Nurse** | `jeff01478` | `123456` | 1 |
| **Nurse** | `def456` | `def654` | 1 |
| **Patient** | `abc123` | `abc321` | 2 |

---

## 📂 Project Structure

```
refactored_app/
├── app/
│   ├── routers/        # API Routes (auth, nurse, patient, admin)
│   ├── templates/      # HTML Templates (Jinja2)
│   ├── auth.py         # Authentication Logic (JWT)
│   ├── database.py     # Database Connection
│   ├── main.py         # App Entry Point
│   ├── models.py       # SQLAlchemy Models
│   └── websockets.py   # WebSocket Manager
├── iot_simulator.py    # Mock Device Script
├── run.py              # Server Helper Script
├── seed_data.py        # Data Seeding Script
├── create_admin.py     # Admin Creation Script
└── start_system.bat    # Launcher
```

---

## 📝 Notes
- **Database**: The database is stored in `bed_system.db`. Delete this file if you want to reset everything and re-run `seed_data.py`.
- **Simulator**: The `iot_simulator.py` generates fake data. In a real deployment, this would be replaced by actual MQTT/HTTP calls from hardware.
