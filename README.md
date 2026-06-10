# 键帽配色收藏册

记录机械键盘键帽套装（品牌、配色、材质、购入价等）的全栈 MVP 框架。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + TypeScript + Ant Design 5 + React Router |
| 第三方 | axios、dayjs |
| 后端 | FastAPI + SQLAlchemy 2.0 + Pydantic v2 + uvicorn |
| 数据库 | SQLite `./data/keycaps.db` |

## 目录结构

```
├── backend/          # FastAPI 后端
│   ├── app/
│   └── requirements.txt
├── frontend/         # React 前端
│   └── src/
└── data/             # SQLite 数据库（首次启动自动创建）
```

## 启动

### 1. 后端（端口 8000）

在项目根目录执行：

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API 文档：http://localhost:8000/docs

### 2. 前端（端口 8101）

新开终端，在项目根目录执行：

```bash
cd frontend
npm install
npm run dev
```

访问：http://localhost:8101

## 功能

- **列表页**：Ant Design Table 展示键帽，支持按配色名搜索
- **表单页**：新增 / 编辑键帽（独立路由页）
- **CRUD**：创建、读取、更新、删除
- **Seed**：首次启动自动写入 5 条示例数据

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/keycaps?color_scheme=` | 列表，可选配色搜索 |
| GET | `/api/keycaps/{id}` | 详情 |
| POST | `/api/keycaps` | 新增 |
| PUT | `/api/keycaps/{id}` | 更新 |
| DELETE | `/api/keycaps/{id}` | 删除 |
