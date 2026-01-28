# Backend API

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
copy .env.example .env
```

4. Initialize database:
```bash
python -m app.database.init_db
```

5. Run server:
```bash
uvicorn app.main:app --reload
```

6. Access Swagger UI:
```
http://localhost:8000/docs
```

## Default Credentials

Username: admin
Password: admin123

## Testing

```bash
pytest
```
