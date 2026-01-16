# 醫療床位資訊系統 (重構版)

這是一個現代化、快速且功能豐富的醫院床位資訊系統，使用 **FastAPI** (後端) 與 **Vanilla JS/TailwindCSS** (前端) 打造。

## 🚀 功能特色

### 核心管理功能
- **床位管理**：即時追蹤所有床位的狀態 (使用中、空床、手術中、看診中)。
- **入院/出院流程**：完整的病人入院登記與出院結算標準作業流程。
- **護理師交班筆記**：提供護理師使用的數位交班筆記本，支援新增、編輯與刪除功能。

### 監控與生命徵象
- **即時生命徵象**：監控體溫 (Temperature)、脈搏 (Pulse) 與血壓 (Blood Pressure)。
- **IoT 模擬器**：內建模擬程式，每 5 秒自動發送模擬的生理數據。
- **智慧警示**：當體溫超過 38°C 時，介面會出現明顯的紅色發燒警示。
- **趨勢圖與報表**：提供互動式雙軸圖表 (體溫 vs 脈搏)，並支援歷史紀錄 CSV 匯出。

### 系統管理
- **管理後台**：專屬的管理員介面，可管理所有用戶帳號 (護理師、管理員、病人)。
- **權限分級存取**：嚴格的權限控管機制 (管理員: 0, 護理師: 1, 病人: 2)。

---

## 🛠 安裝與設定

### 前置需求
- [Anaconda](https://www.anaconda.com/) 或 Miniconda
- Python 3.9 以上版本

### 1. 環境設定
請開啟您的終端機 (Terminal) 或 Anaconda Prompt 並執行以下指令：

```bash
# 建立虛擬環境
conda create -n bed_system python=3.9

# 啟動虛擬環境
conda activate bed_system

# 安裝必要套件
pip install fastapi "uvicorn[standard]" sqlalchemy jinja2 python-multipart python-jose[cryptography] passlib[bcrypt] requests
```

### 2. 初始化資料庫
系統預設使用 SQLite 資料庫。第一次執行時會自動建立資料庫檔案。

如果您需要寫入預設的測試資料 (包含管理員帳號、範例病人)，請執行：
```bash
python seed_data.py
python create_admin.py
```

---

## ▶️ 如何執行系統

### 方法 1：一鍵啟動 (Windows 推薦)
直接雙擊資料夾中的 `start_system.bat` 檔案。
系統會自動開啟兩個視窗，分別執行「網頁伺服器」與「IoT 模擬器」。

### 方法 2：手動啟動
1. **啟動伺服器**：
   ```bash
   python run.py
   ```
2. **啟動 IoT 模擬器** (請開啟另一個終端機視窗)：
   ```bash
   python iot_simulator.py
   ```

**系統網址：** [http://127.0.0.1:8001](http://127.0.0.1:8001)

---

## 🔑 預設帳號列表

| 角色 | 帳號 (Username) | 密碼 (Password) | 權限代碼 |
| :--- | :--- | :--- | :--- |
| **管理員 (Admin)** | `admin` | `admin` | 0 |
| **護理師 (Nurse)** | `jeff01478` | `123456` | 1 |
| **護理師 (Nurse)** | `def456` | `def654` | 1 |
| **病人 (Patient)** | `abc123` | `abc321` | 2 |

---

## 📂 專案結構說明

```
refactored_app/
├── app/
│   ├── routers/        # API 路由 (auth, nurse, patient, admin)
│   ├── templates/      # HTML 網頁模板 (Jinja2)
│   ├── auth.py         # 認證邏輯 (JWT Token)
│   ├── database.py     # 資料庫連線設定
│   ├── main.py         # 程式進入點
│   ├── models.py       # SQLAlchemy 資料庫模型
│   └── websockets.py   # WebSocket 管理器 (即時連線)
├── iot_simulator.py    # IoT 裝置模擬程式
├── run.py              # 伺服器啟動腳本
├── seed_data.py        # 測試資料產生腳本
├── create_admin.py     # 管理員建立腳本
└── start_system.bat    # Windows 一鍵啟動腳本
```

---

## 📝 備註
- **資料庫檔案**：所有資料儲存於 `bed_system.db`。若您想重置整個系統，只需刪除此檔案並重新執行 `seed_data.py` 即可。
- **模擬器**：`iot_simulator.py` 用於產生假資料以展示即時更新功能。在實際場域中，此部分將被真實的硬體感測器取代。
