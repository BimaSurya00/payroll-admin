# Frontend Implementation Plan: Leave & Overtime Management

## 📋 Project Overview

**Backend API**: Go-Fiber Boilerplate 
**Implementation**: Leave Management & Overtime Management modules
**Authentication**: JWT Bearer Token

---


### Step 1.2: Create API Service

**File**: `src/services/api.js`

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 1.3: Create Leave Service

**File**: `src/services/leaveService.js`

```javascript
import api from './api';

export const leaveService = {
  // Get leave balances
  getMyBalances: (year = new Date().getFullYear()) =>
    api.get(`/leave/balances/my?year=${year}`),

  // Create leave request
  createRequest: (data) =>
    api.post('/leave/requests', data),

  // Get my leave requests
  getMyRequests: (page = 1, perPage = 15) =>
    api.get(`/leave/requests/my?page=${page}&per_page=${perPage}`),

  // Get request by ID
  getRequestById: (id) =>
    api.get(`/leave/requests/${id}`),

  // Admin: Get pending requests
  getPendingRequests: () =>
    api.get('/leave/requests/pending'),

  // Admin: Approve request
  approveRequest: (id, note = '') =>
    api.put(`/leave/requests/${id}/approve`, { approvalNote: note }),

  // Admin: Reject request
  rejectRequest: (id, reason) =>
    api.put(`/leave/requests/${id}/reject`, { rejectionReason: reason }),
};
```

### Step 1.4: Create Overtime Service

**File**: `src/services/overtimeService.js`

```javascript
import api from './api';

export const overtimeService = {
  // Get active policies
  getPolicies: () =>
    api.get('/overtime/policies'),

  // Create overtime request
  createRequest: (data) =>
    api.post('/overtime/requests', data),

  // Get my overtime requests
  getMyRequests: (page = 1, perPage = 15) =>
    api.get(`/overtime/requests/my?page=${page}&per_page=${perPage}`),

  // Clock in
  clockIn: (id, notes = '') =>
    api.post(`/overtime/requests/${id}/clock-in`, { notes }),

  // Clock out
  clockOut: (id, notes = '') =>
    api.post(`/overtime/requests/${id}/clock-out`, { notes }),

  // Admin: Get pending requests
  getPendingRequests: () =>
    api.get('/overtime/requests/pending'),

  // Admin: Approve request
  approveRequest: (id) =>
    api.put(`/overtime/requests/${id}/approve`),

  // Admin: Reject request
  rejectRequest: (id, reason) =>
    api.put(`/overtime/requests/${id}/reject`, { rejectionReason: reason }),

  // Admin: Calculate pay
  calculatePay: (employeeId, startDate, endDate) =>
    api.get(`/overtime/calculation/${employeeId}?start_date=${startDate}&end_date=${endDate}`),
};
```

---

## 🏖️ PHASE 2: Leave Module (3-4 hours)

### Step 2.1: Create Leave Balance Card Component

**File**: `src/components/leave/LeaveBalanceCard.jsx`

```jsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const LeaveBalanceCard = ({ balance }) => {
  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          {balance.leaveTypeName}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography color="text.secondary">
            Total: {balance.balance} hari
          </Typography>
          <Typography color="text.secondary">
            Digunakan: {balance.used} hari
          </Typography>
          <Typography color="text.secondary">
            Pending: {balance.pending} hari
          </Typography>
          <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
            Tersisa: {balance.available} hari
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LeaveBalanceCard;
```

### Step 2.2: Create Leave Request Form Modal

**File**: `src/components/leave/LeaveRequestForm.jsx`

```jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DatePicker,
} from '@mui/material';

const LeaveRequestForm = ({ open, onClose, leaveTypes, onSubmit }) => {
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: null,
    endDate: null,
    reason: '',
    emergencyContact: '',
  });

  const handleSubmit = async () => {
    try {
      await onSubmit({
        ...formData,
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD'),
      });
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajukan Cuti</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Tipe Cuti</InputLabel>
          <Select
            value={formData.leaveTypeId}
            onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
          >
            {leaveTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name} ({type.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <DatePicker
          label="Tanggal Mulai"
          value={formData.startDate}
          onChange={(newValue) => setFormData({ ...formData, startDate: newValue })}
          sx={{ mt: 2, width: '100%' }}
        />

        <DatePicker
          label="Tanggal Selesai"
          value={formData.endDate}
          onChange={(newValue) => setFormData({ ...formData, endDate: newValue })}
          sx={{ mt: 2, width: '100%' }}
        />

        <TextField
          fullWidth
          label="Alasan"
          multiline
          rows={4}
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          sx={{ mt: 2 }}
        />

        <TextField
          fullWidth
          label="Kontak Darurat"
          value={formData.emergencyContact}
          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={handleSubmit} variant="contained">
          Ajukan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveRequestForm;
```

### Step 2.3: Create Leave Request List

**File**: `src/components/leave/LeaveRequestList.jsx`

```jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
} from '@mui/material';

const STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

const LeaveRequestList = ({ requests }) => {
  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" sx={{ p: 2 }}>
        Riwayat Pengajuan Cuti
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Tipe Cuti</TableCell>
            <TableCell>Tanggal</TableCell>
            <TableCell>Durasi</TableCell>
            <TableCell>Alasan</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.leaveType.name}</TableCell>
              <TableCell>
                {request.startDate} s/d {request.endDate}
              </TableCell>
              <TableCell>{request.totalDays} hari</TableCell>
              <TableCell>{request.reason}</TableCell>
              <TableCell>
                <Chip
                  label={request.status}
                  color={STATUS_COLORS[request.status]}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default LeaveRequestList;
```

### Step 2.4: Create Profile Page with Leave Tab

**File**: `src/pages/ProfilePage.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab, Box, Button, Container } from '@mui/material';
import LeaveBalanceCard from '../components/leave/LeaveBalanceCard';
import LeaveRequestForm from '../components/leave/LeaveRequestForm';
import LeaveRequestList from '../components/leave/LeaveRequestList';
import { leaveService } from '../services/leaveService';

const ProfilePage = () => {
  const [tabValue, setTabValue] = useState('1');
  const [balances, setBalances] = useState([]);
  const [requests, setRequests] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    fetchBalances();
    fetchRequests();
  }, []);

  const fetchBalances = async () => {
    try {
      const response = await leaveService.getMyBalances();
      setBalances(response.data.data.balances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await leaveService.getMyRequests();
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmitRequest = async (data) => {
    try {
      await leaveService.createRequest(data);
      fetchRequests();
      fetchBalances();
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Info Pribadi" value="1" />
            <Tab label="Cuti & Izin" value="2" />
            <Tab label="Histori" value="3" />
          </TabList>
        </Box>

        <TabPanel value="2">
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={() => setOpenForm(true)}
            >
              Ajukan Cuti Baru
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
            {balances.map((balance) => (
              <LeaveBalanceCard key={balance.leaveTypeId} balance={balance} />
            ))}
          </Box>

          <LeaveRequestList requests={requests} />
        </TabPanel>
      </TabContext>

      <LeaveRequestForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        leaveTypes={[]} // Fetch from API
        onSubmit={handleSubmitRequest}
      />
    </Container>
  );
};

export default ProfilePage;
```

---

## ⏰ PHASE 3: Overtime Module (3-4 hours)

### Step 3.1: Create Overtime Request Form

**File**: `src/components/overtime/OvertimeRequestForm.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TimePicker,
} from '@mui/material';
import { overtimeService } from '../../services/overtimeService';

const OvertimeRequestForm = ({ open, onClose, date, onSubmit }) => {
  const [formData, setFormData] = useState({
    overtimeDate: date,
    startTime: null,
    endTime: null,
    reason: '',
    overtimePolicyId: '',
  });
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await overtimeService.getPolicies();
      setPolicies(response.data.data);
      if (response.data.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          overtimePolicyId: response.data.data[0].id,
        }));
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      await onSubmit({
        ...formData,
        startTime: formData.startTime.format('HH:mm'),
        endTime: formData.endTime.format('HH:mm'),
        overtimeDate: formData.format('YYYY-MM-DD'),
      });
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajukan Lembur</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Kebijakan Lembur</InputLabel>
          <Select
            value={formData.overtimePolicyId}
            onChange={(e) => setFormData({ ...formData, overtimePolicyId: e.target.value })}
          >
            {policies.map((policy) => (
              <MenuItem key={policy.id} value={policy.id}>
                {policy.name} ({policy.rateMultiplier}x)
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TimePicker
          label="Jam Mulai"
          value={formData.startTime}
          onChange={(newValue) => setFormData({ ...formData, startTime: newValue })}
          sx={{ mt: 2, width: '100%' }}
        />

        <TimePicker
          label="Jam Selesai"
          value={formData.endTime}
          onChange={(newValue) => setFormData({ ...formData, endTime: newValue })}
          sx={{ mt: 2, width: '100%' }}
        />

        <TextField
          fullWidth
          label="Alasan"
          multiline
          rows={4}
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          sx={{ mt: 2 }}
          helperText="Minimum 10 karakter"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={handleSubmit} variant="contained">
          Ajukan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OvertimeRequestForm;
```

### Step 3.2: Create Overtime Clock In/Out Button

**File**: `src/components/overtime/OvertimeClockInButton.jsx`

```jsx
import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { overtimeService } from '../../services/overtimeService';

const OvertimeClockInButton = ({ requestId, status, onRefresh }) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClockIn = async () => {
    setLoading(true);
    try {
      await overtimeService.clockIn(requestId, notes);
      onRefresh();
      setOpen(false);
    } catch (error) {
      console.error('Error clocking in:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    try {
      await overtimeService.clockOut(requestId, notes);
      onRefresh();
      setOpen(false);
    } catch (error) {
      console.error('Error clocking out:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'APPROVED') {
    return (
      <>
        <Button
          variant="contained"
          color="success"
          onClick={() => setOpen(true)}
          sx={{ mr: 1 }}
        >
          Clock In Lembur
        </Button>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Catatan Clock In</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Catatan (opsional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleClockIn} variant="contained" disabled={loading}>
              Mulai Lembur
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Clock Out button when clocked in
  return null;
};

export default OvertimeClockInButton;
```

### Step 3.3: Create Attendance Page with Overtime Tab

**File**: `src/pages/AttendancePage.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab, Box, Container } from '@mui/material';
import OvertimeRequestForm from '../components/overtime/OvertimeRequestForm';
import OvertimeClockInButton from '../components/overtime/OvertimeClockInButton';
import { overtimeService } from '../services/overtimeService';

const AttendancePage = () => {
  const [tabValue, setTabValue] = useState('1');
  const [requests, setRequests] = useState([]);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await overtimeService.getMyRequests();
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSubmitRequest = async (data) => {
    try {
      await overtimeService.createRequest(data);
      fetchRequests();
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const today = new Date().format('YYYY-MM-DD');

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Clock In/Out" value="1" />
            <Tab label="Lembur" value="2" />
            <Tab label="Histori" value="3" />
          </TabList>
        </Box>

        <TabPanel value="2">
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              onClick={() => setOpenForm(true)}
            >
              Ajukan Lembur Hari Ini
            </Button>
          </Box>

          {/* List of overtime requests */}
          {requests.map((request) => (
            <Box key={request.id} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
              <Typography variant="subtitle1">
                {request.overtimeDate} | {request.startTime} - {request.endTime}
              </Typography>
              <Typography variant="body2">
                {request.totalHours} jam | {request.status}
              </Typography>
              {request.status === 'APPROVED' && (
                <OvertimeClockInButton
                  requestId={request.id}
                  status={request.status}
                  onRefresh={fetchRequests}
                />
              )}
            </Box>
          ))}
        </TabPanel>
      </TabContext>

      <OvertimeRequestForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        date={today}
        onSubmit={handleSubmitRequest}
      />
    </Container>
  );
};

export default AttendancePage;
```

---

## 👔 PHASE 4: Admin Approval Pages (2-3 hours)

### Step 4.1: Create Leave Approval Page

**File**: `src/pages/admin/LeaveApprovalPage.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Container,
  Typography,
} from '@mui/material';
import { leaveService } from '../../services/leaveService';

const LeaveApprovalPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openReject, setOpenReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await leaveService.getPendingRequests();
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.approveRequest(id);
      fetchPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async () => {
    try {
      await leaveService.rejectRequest(selectedRequest.id, rejectionReason);
      setOpenReject(false);
      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Approval Cuti & Izin
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Karyawan</TableCell>
              <TableCell>Jabatan</TableCell>
              <TableCell>Tipe Cuti</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Durasi</TableCell>
              <TableCell>Alasan</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.employeeName}</TableCell>
                <TableCell>{request.employeePosition}</TableCell>
                <TableCell>{request.leaveType.name}</TableCell>
                <TableCell>
                  {request.startDate} s/d {request.endDate}
                </TableCell>
                <TableCell>{request.totalDays} hari</TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleApprove(request.id)}
                    sx={{ mr: 1 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => {
                      setSelectedRequest(request);
                      setOpenReject(true);
                    }}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openReject} onClose={() => setOpenReject(false)}>
        <DialogTitle>Tolak Pengajuan Cuti</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Alasan Penolakan"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Minimum 10 karakter"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReject(false)}>Batal</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Tolak
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveApprovalPage;
```

### Step 4.2: Create Overtime Approval Page

**File**: `src/pages/admin/OvertimeApprovalPage.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Container,
  Typography,
} from '@mui/material';
import { overtimeService } from '../../services/overtimeService';

const OvertimeApprovalPage = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await overtimeService.getPendingRequests();
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await overtimeService.approveRequest(id);
      fetchPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Approval Lembur
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Karyawan</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Jam</TableCell>
              <TableCell>Durasi</TableCell>
              <TableCell>Policy</TableCell>
              <TableCell>Alasan</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.employeeName}</TableCell>
                <TableCell>{request.overtimeDate}</TableCell>
                <TableCell>{request.startTime} - {request.endTime}</TableCell>
                <TableCell>{request.totalHours} jam</TableCell>
                <TableCell>
                  {request.overtimePolicy.rateMultiplier}x
                </TableCell>
                <TableCell>{request.reason}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleApprove(request.id)}
                  >
                    Approve
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OvertimeApprovalPage;
```

---

## 🔀 PHASE 5: Routing Setup (30 minutes)

### Step 5.1: Configure Routes

**For React Router:**

```jsx
// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AttendancePage from './pages/AttendancePage';
import LeaveApprovalPage from './pages/admin/LeaveApprovalPage';
import OvertimeApprovalPage from './pages/admin/OvertimeApprovalPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Employee Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/leave" element={<LeaveApprovalPage />} />
          <Route path="/admin/overtime" element={<OvertimeApprovalPage />} />
          
          <Route path="/" element={<Navigate to="/profile" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

### Step 5.2: Add Navigation Menu

**File**: `src/components/Navbar.jsx`

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
} from '@mui/material';

const Navbar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('user_role'); // 'USER', 'ADMIN', etc.

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          HR Management System
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" onClick={() => navigate('/profile')}>
            Profil
          </Button>
          <Button color="inherit" onClick={() => navigate('/attendance')}>
            Kehadiran
          </Button>
          
          {userRole === 'ADMIN' && (
            <>
              <Button color="inherit" onClick={() => navigate('/admin/leave')}>
                Approval Cuti
              </Button>
              <Button color="inherit" onClick={() => navigate('/admin/overtime')}>
                Approval Lembur
              </Button>
            </>
          )}
          
          <Button color="inherit" onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
```

---

## 🧪 PHASE 6: Testing & Polish (1-2 hours)

### Testing Checklist:

- [ ] Employee can view leave balances
- [ ] Employee can submit leave request
- [ ] Employee can view leave history
- [ ] Employee can submit overtime request
- [ ] Employee can clock in/out overtime
- [ ] Admin can view pending leave requests
- [ ] Admin can approve/reject leave requests
- [ ] Admin can view pending overtime requests
- [ ] Admin can approve/reject overtime requests
- [ ] Error handling works correctly
- [ ] Loading states display properly
- [ ] Form validation works
- [ ] Auth redirects work

### Polish Items:

- Add loading spinners for API calls
- Add error toast notifications
- Add success confirmations
- Format dates properly (DD/MM/YYYY)
- Format currency properly (IDR)
- Add empty states for no data
- Add responsive design for mobile

---

## 📦 Summary: Files to Create

### Services (2 files):
- `src/services/api.js`
- `src/services/leaveService.js`
- `src/services/overtimeService.js`

### Components - Leave (3 files):
- `src/components/leave/LeaveBalanceCard.jsx`
- `src/components/leave/LeaveRequestForm.jsx`
- `src/components/leave/LeaveRequestList.jsx`

### Components - Overtime (2 files):
- `src/components/overtime/OvertimeRequestForm.jsx`
- `src/components/overtime/OvertimeClockInButton.jsx`

### Pages (4 files):
- `src/pages/ProfilePage.jsx` (with Leave tab)
- `src/pages/AttendancePage.jsx` (with Overtime tab)
- `src/pages/admin/LeaveApprovalPage.jsx`
- `src/pages/admin/OvertimeApprovalPage.jsx`

### Navigation (1 file):
- `src/components/Navbar.jsx`

### Config:
- Update `src/App.js` with routes
- Update `src/index.js` if needed

---

## ⚡ Quick Start Commands

```bash
# Install dependencies
npm install axios @mui/material @emotion/react @emotion/styled dayjs react-datepicker

# Start development server
npm start

# Or for Next.js
npm run dev
```

---

## 🎨 Customization Notes

1. **Styling**: Examples use Material-UI, can be replaced with Tailwind, Bootstrap, or plain CSS
2. **State Management**: Can add Redux/Zustand for complex state
3. **Form Validation**: Add Formik + Yup for advanced validation
4. **Date Formatting**: Use dayjs or date-fns for consistent formatting
5. **Notifications**: Add toast library (react-toastify, notistack)

---

**Estimated Total Time**: 8-12 hours
**Difficulty Level**: Intermediate
**Framework**: React (adaptable to Vue/Next.js)

---

**Last Updated**: January 31, 2026
**Version**: 1.0.0
