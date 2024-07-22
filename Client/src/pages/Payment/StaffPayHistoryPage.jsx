import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, Typography, Box, TextField } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../../../components/sidebar';

const Backend = () => {
  const [payments, setPayments] = useState([]);
  const [status, setStatus] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('id');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('http://localhost:3001/pay/');
        if (Array.isArray(response.data)) {
          setPayments(response.data);
        } else {
          setStatus({ message: 'Failed to fetch payment history', error: true });
        }
      } catch (error) {
        setStatus({ message: 'Failed to fetch payment history', error: true });
      }
    };

    fetchPayments();
  }, []);

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleSearchCriteriaChange = (e) => {
    setSearchCriteria(e.target.value);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = filterStatus ? payment.status?.toLowerCase() === filterStatus.toLowerCase() : true;
    const matchesSearch = searchQuery ? (
      searchCriteria === 'id' ? payment.id.toString().toLowerCase().includes(searchQuery) :
      searchCriteria === 'name' ? payment.cardholderName.toLowerCase().includes(searchQuery) :
      searchCriteria === 'date' ? (payment.date && new Date(payment.date).toLocaleDateString().toLowerCase().includes(searchQuery)) :
      searchCriteria === 'month' ? (payment.date && (new Date(payment.date).getMonth() + 1).toString() === searchQuery) :
      searchCriteria === 'day' ? (payment.date && new Date(payment.date).getDate().toString() === searchQuery) :
      searchCriteria === 'year' ? (payment.date && new Date(payment.date).getFullYear().toString() === searchQuery) : true
    ) : true;
    return matchesStatus && matchesSearch;
  });

  const generatePdf = (payment) => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(22);
    doc.setTextColor(34, 139, 34); // Green color
    doc.setFont("helvetica", "bold");
    doc.text('EcoHaven', doc.internal.pageSize.width / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black color

    // Add payment details
    autoTable(doc, {
      startY: 30,
      body: [
        ['Payment ID:', payment.id],
        ['Cardholder Name:', payment.cardholderName],
        ['Amount:', `$${payment.amount}`],
        ['Date:', payment.date ? new Date(payment.date).toLocaleDateString() : 'Invalid Date'],
        ['Status:', payment.status]
      ],
      theme: 'plain',
      styles: { fontSize: 12, cellPadding: 2 },
      margin: { top: 30 }
    });

    // Add refunds section
    if (payment.refunds && payment.refunds.length > 0) {
      doc.setFontSize(16);
      doc.text('Refunds', 14, doc.lastAutoTable.finalY + 10);
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Refund ID', 'Status', 'Reason']],
        body: payment.refunds.map(refund => [refund.id, refund.status, refund.reason]),
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 4 },
        headStyles: { fillColor: [22, 160, 133] }, // Custom header color
      });
    } else {
      doc.setFontSize(12);
      doc.text('No refunds', 14, doc.lastAutoTable.finalY + 10);
    }

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(34, 139, 34); // Green color
    doc.text('EcoHaven', 14, doc.internal.pageSize.height - 10);
    doc.text('https://www.ecohaven.com', 150, doc.internal.pageSize.height - 10);

    doc.save(`payment_${payment.id}.pdf`);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flex: 1, padding: 4 }}>
     <h2 style={{marginTop:'10px'}}>Customer Payment Records</h2>
        {status && (
          <Typography color={status.error ? 'error' : 'success'}>
            {status.message}
          </Typography>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Select
            value={filterStatus}
            onChange={handleFilterChange}
            displayEmpty
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="Paid">Complete</MenuItem>
            <MenuItem value="Unpaid">Incomplete</MenuItem>
          </Select>
          <Select
            value={searchCriteria}
            onChange={handleSearchCriteriaChange}
            displayEmpty
            sx={{ minWidth: 120, ml: 2 }}
          >
            <MenuItem value="id">ID</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="day">Day</MenuItem>
            <MenuItem value="year">Year</MenuItem>
          </Select>
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ ml: 2, flex: 1 }}
          />
        </Box>

        <TableContainer component={Paper} elevation={3} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Payment ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Cardholder Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Refunds</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.id}</TableCell>
                  <TableCell>{payment.cardholderName}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>{payment.date ? new Date(payment.date).toLocaleDateString() : 'Invalid Date'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: payment.status?.toLowerCase() === 'paid' ? 'green' : 'red',
                          mr: 1,
                        }}
                      />
                      {payment.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {payment.refunds && payment.refunds.length > 0 ? (
                      <ul>
                        {payment.refunds.map(refund => (
                          <li key={refund.id}>
                            Status: {refund.status}, Reason: {refund.reason}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'No refunds'
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="contained" color="success" onClick={() => generatePdf(payment)}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Backend;
