# Rica Quick Port Reference

## 🚀 Active Services

| Port | Service | URL | Description |
|------|---------|-----|-------------|
| **3000** | Rica UI | http://localhost:3000 | Main dashboard interface |
| **3001** | Rica API | http://localhost:3001 | Backend API server |
| **2020** | Activepieces | http://localhost:2020 | Automation workflows |
| **2021** | Code Server | http://localhost:2021 | VS Code in browser |
| **2022** | Ollama | http://localhost:2022 | AI model server (DeepSeek) |

## 🆓 Available Ports

| Port | Status | Reserved For |
|------|--------|--------------|
| **2023** | 🟢 Free | Future integration |
| **2024** | 🟢 Free | Future integration |

## 📊 Port History

### October 5, 2025 - Port Reorganization
- **Removed:** OpenCTI (2020), OpenBAS (2021)
- **Moved:** Activepieces (2022→2020), Code Server (2023→2021), Ollama (2024→2022)
- **Result:** Clean sequential mapping + 2 freed ports

## 🔧 Quick Commands

### Start All Services
```bash
docker-compose up -d
```

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f
```

### Stop All Services
```bash
docker-compose down
```

### Test Services
```bash
# Activepieces
curl http://localhost:2020/api/v1/flags

# Code Server
curl http://localhost:2021/healthz

# Ollama
curl http://localhost:2022/api/version
```

## 🌐 Access URLs

### From Rica UI
- **Auto Tab** → Activepieces (2020)
- **Project Tab** → Code Server (2021)
- **Starry AI** → Ollama (2022)

### Direct Browser Access
- Activepieces: http://localhost:2020
- Code Server: http://localhost:2021
- Rica Dashboard: http://localhost:3000

## 📝 Notes

- All ports use **localhost** in development
- Production may use different domains
- Health checks run every 60 seconds
- Sequential ports (2020-2022) for easy management

---

**Last Updated:** October 5, 2025
**Status:** ✅ Active and Verified
