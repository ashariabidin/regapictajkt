# APICTA 2026 Jakarta - Smart Registration Platform

A competition registration and management platform for APICTA 2026 in Jakarta, featuring "AI-enhanced" and "Smart EventTech" branding.

## Features

- **Registration Forms**: EXCO, Jury, Official, Participant, and EC Committee registration
- **Dashboards**: Executive Dashboard with metrics and visualizations, Operational Dashboard with workflow tracking
- **Data Management**: Registration data table with detailed views
- **Accreditation**: QR code generation for digital accreditation
- **AI Features**: Simulated attendance prediction and document verification

## Tech Stack

### Backend
- Flask (Python) with RESTful API
- PostgreSQL/MySQL database
- File upload support
- QR code generation

### Frontend
- React with Vite
- Tailwind CSS for styling
- Chart.js for visualizations
- State management with React Context

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL or MySQL

### Backend Setup

1. Navigate to backend directory:
```bash
cd apicta-2026/backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure database:
   - Create a database named `apicta_2026`
   - Update `config.py` with your database credentials

5. Initialize database:
```bash
python init_db.py
```

6. Run the backend server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd apicta-2026/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Database Configuration

Edit `backend/config.py` to configure your database:

```python
DB_CONFIG = {
    'host': 'localhost',
    'user': 'your_username',
    'password': 'your_password',
    'database': 'apicta_2026'
}
```

## API Endpoints

### Registrations
- `POST /api/register/exco` - Register EXCO delegate
- `POST /api/register/jury` - Register judge
- `POST /api/register/official` - Register official delegate
- `POST /api/register/participant` - Register participant/team
- `POST /api/register/committee` - Register committee member
- `GET /api/registrations` - Get all registrations
- `GET /api/registrations/<id>` - Get registration details
- `PUT /api/registrations/<id>/status` - Update registration status

### Dashboards
- `GET /api/dashboard/executive` - Get executive dashboard metrics
- `GET /api/dashboard/operational` - Get operational dashboard metrics

### Accreditation
- `POST /api/accreditation/generate-qr` - Generate QR code for registrant
- `GET /api/accreditation/qr/<registration_id>` - Get QR code image

### AI Features
- `POST /api/ai/sync-verification` - Trigger AI verification sync

## File Structure

```
apicta-2026/
├── backend/
│   ├── app.py              # Flask application
│   ├── config.py           # Configuration settings
│   ├── models.py           # Database models
│   ├── routes/             # API routes
│   │   ├── registrations.py
│   │   ├── dashboard.py
│   │   └── accreditation.py
│   ├── services/           # Business logic
│   │   ├── qr_service.py
│   │   └── ai_service.py
│   ├── uploads/            # Uploaded files storage
│   ├── init_db.py          # Database initialization
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context for state
│   │   ├── services/       # API services
│   │   ├── App.jsx         # Main App component
│   │   └── main.jsx        # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Usage

1. Access the application through your browser at `http://localhost:5173`
2. Use the sidebar navigation to access different sections
3. Fill out registration forms for different user types
4. View metrics and data on dashboards
5. Generate QR codes for accreditation

## Color Scheme

- Primary: Dark Blue (#0a2b4e)
- Secondary: White (#ffffff)
- Accent: Pink/Red (#e91e63)

## License

MIT License
