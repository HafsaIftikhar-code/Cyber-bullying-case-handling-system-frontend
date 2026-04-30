# Cyberbullying Backend API Documentation

## Base URL
```
http://localhost:8081/api
```

## Endpoints Overview

### 1. Health Check
**GET** `/api/test`
- **Description**: Check if the backend is running
- **Response**: `"Backend is running!"`

### 2. Submit Report
**POST** `/api/add`
- **Description**: Submit a new cyberbullying report
- **Request Body**:
```json
{
  "name": "string",
  "platform": "string",
  "severity": "MILD|MODERATE|CRITICAL",
  "description": "string"
}
```
- **Response**: `"Report Added Successfully"` or error message

### 3. Get Next Case (Priority-based)
**GET** `/api/next`
- **Description**: Pull the next case from priority queue (CRITICAL first, then FIFO)
- **Response**: Report object or `204 No Content` if no cases available

### 4. Get All Reports
**GET** `/api/reports`
- **Description**: Get all reports in the system
- **Response**: Array of Report objects

### 5. Get Report by ID
**GET** `/api/reports/{id}`
- **Description**: Get a specific report by ID
- **Parameters**: `id` (integer) - Report ID
- **Response**: Report object or `404 Not Found`

### 6. Delete Report
**DELETE** `/api/reports/{id}`
- **Description**: Delete a report by ID
- **Parameters**: `id` (integer) - Report ID
- **Response**: Success message or error

## Data Models

### Report
```json
{
  "caseId": 1,
  "name": "John Doe",
  "platform": "Instagram",
  "severity": "CRITICAL",
  "description": "Harassment incident details..."
}
```

## Priority Logic
- **CRITICAL** cases are processed first (highest priority)
- **MODERATE/MILD** cases follow FIFO (First In, First Out) order
- Cases are automatically sorted when retrieved

## Frontend Integration

### JavaScript API Calls Examples

#### Submit Report
```javascript
const submitReport = async (name, platform, severity, description) => {
    const response = await fetch('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, platform, severity, description })
    });
    return response.ok;
};
```

#### Get Next Case
```javascript
const getNextCase = async () => {
    const response = await fetch('/api/next');
    if (response.ok) {
        return await response.json();
    }
    return null;
};
```

#### Get All Reports
```javascript
const getAllReports = async () => {
    const response = await fetch('/api/reports');
    if (response.ok) {
        return await response.json();
    }
    return [];
};
```

## Database
- **Type**: H2 (In-memory)
- **Console**: http://localhost:8081/h2-console
- **Credentials**: `sa` / (empty password)
- **JDBC URL**: `jdbc:h2:mem:cyberbullyingdb`

## Running the Application

1. **Start Backend**:
```bash
cd cyberbullying
./mvnw spring-boot:run
```

2. **Access Frontend**:
- Main Page: http://localhost:8081
- User Portal: http://localhost:8081/C2/user.html
- Admin Portal: http://localhost:8081/C2/admin.html

3. **Test APIs**:
```bash
# Health check
curl http://localhost:8081/api/test

# Submit report
curl -X POST http://localhost:8081/api/add \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","platform":"Twitter","severity":"CRITICAL","description":"Test case"}'
```

## CORS Configuration
- All endpoints allow cross-origin requests (`@CrossOrigin(origins = "*")`)
- Frontend can make requests from any domain

## Error Handling
- All endpoints return appropriate HTTP status codes
- Error messages are descriptive
- Network errors are handled gracefully in frontend