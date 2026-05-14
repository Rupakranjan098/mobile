export const DASHBOARD_DATA = {
  stats: [
    { label: 'Total Sales', value: '₹ 1,25,000', trend: '+ 12.5%', type: 'sales' },
    { label: 'Total Invoices', value: '128', trend: '+ 8.3%', type: 'invoices' },
    { label: 'GST Collected', value: '₹ 18,750', trend: '+ 10.2%', type: 'gst' },
    { label: 'Outstanding', value: '₹ 32,500', trend: '- 5.4%', type: 'outstanding' },
  ],
  salesChart: [
    { day: 'Mon', value: 30000 },
    { day: 'Tue', value: 45000 },
    { day: 'Wed', value: 38000 },
    { day: 'Thu', value: 52000 },
    { day: 'Fri', value: 48000 },
    { day: 'Sat', value: 60000 },
    { day: 'Sun', value: 42300 },
  ]
};

export const INVOICES = [
  { id: 'INV-2024-128', customer: 'Rahul Enterprises', date: '24 May 2024', amount: '₹ 7,080.00', status: 'Paid' },
  { id: 'INV-2024-127', customer: 'Sharma Store', date: '23 May 2024', amount: '₹ 2,360.00', status: 'Unpaid' },
  { id: 'INV-2024-126', customer: 'Kumar Traders', date: '22 May 2024', amount: '₹ 15,340.00', status: 'Paid' },
  { id: 'INV-2024-125', customer: 'Patel & Sons', date: '21 May 2024', amount: '₹ 3,540.00', status: 'Overdue' },
  { id: 'INV-2024-124', customer: 'AI Electronics', date: '20 May 2024', amount: '₹ 1,650.00', status: 'Paid' },
];

export const PRODUCTS = [
  { id: 1, name: 'Wireless Headphone', hsn: '85183000', price: '₹ 2,500.00', stock: 120, status: 'In Stock' },
  { id: 2, name: 'Portable Speaker', hsn: '91021200', price: '₹ 1,200.00', stock: 85, status: 'In Stock' },
  { id: 3, name: 'Smart Watch', hsn: '85182100', price: '₹ 3,999.00', stock: 15, status: 'Low Stock' },
  { id: 4, name: 'USB-C Cable', hsn: '85444290', price: '₹ 299.00', stock: 200, status: 'In Stock' },
  { id: 5, name: 'Power Bank 10000mAh', hsn: '85076000', price: '₹ 999.00', stock: 0, status: 'Out of Stock' },
];
