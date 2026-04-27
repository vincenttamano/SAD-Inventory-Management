import { InventoryItem, ExpenseData } from '../types';

export const mockInventoryItems: InventoryItem[] = [
  {
    id: '1',
    productName: 'Anesthetic Solution',
    quantity: 5,
    unit: 'bottles',
    expiryDate: '2027-06-15',
    category: 'Anesthetics',
    lowStockThreshold: 10,
    price: 25.50,
    dateCreated: '2024-01-15',
  },
  {
    id: '2',
    productName: 'Disposable Gloves',
    quantity: 150,
    unit: 'boxes',
    expiryDate: '2026-12-31',
    category: 'PPE',
    lowStockThreshold: 50,
    price: Math.floor(Math.random() * 50) + 5,
    dateCreated: '2024-01-20',
  },
  {
    id: '3',
    productName: 'Dental Composite',
    quantity: 8,
    unit: 'syringes',
    expiryDate: '2026-09-20',
    category: 'Restorative',
    lowStockThreshold: 50,
    price: Math.floor(Math.random() * 50) + 5,
    dateCreated: '2024-02-05',
  },
  {
    id: '4',
    productName: 'Surgical Masks',
    quantity: 25,
    unit: 'boxes',
    expiryDate: '2027-03-10',
    category: 'PPE',
    lowStockThreshold: 50,
    price: Math.floor(Math.random() * 50) + 5,
    dateCreated: '2024-02-10',
  },
  {
    id: '5',
    productName: 'Hydrogen Peroxide',
    quantity: 12,
    unit: 'bottles',
    expiryDate: '2026-08-05',
    category: 'Disinfectants',
    lowStockThreshold: 10,
    price: 25.50,
    dateCreated: '2024-03-01',
  },
  {
    id: '6',
    productName: 'Dental Burs',
    quantity: 45,
    unit: 'pieces',
    expiryDate: '2028-01-15',
    category: 'Instruments',
    lowStockThreshold: 20,
    price: 5.75,
    dateCreated: '2024-03-15',
  },
  {
    id: '7',
    productName: 'Cotton Rolls',
    quantity: 80,
    unit: 'packs',
    expiryDate: '2027-11-30',
    category: 'Consumables',
    lowStockThreshold: 50,
    price: Math.floor(Math.random() * 50) + 5,
    dateCreated: '2024-04-01',
  },
  {
    id: '8',
    productName: 'Fluoride Varnish',
    quantity: 6,
    unit: 'tubes',
    expiryDate: '2026-07-22',
    category: 'Preventive',
    lowStockThreshold: 10,
    price: 25.50,
    dateCreated: '2024-04-15',
  },
];

export const mockExpenseData: ExpenseData[] = [
  { month: 'Jan', amount: 15000 },
  { month: 'Feb', amount: 18000 },
  { month: 'Mar', amount: 16500 },
  { month: 'Apr', amount: 19000 },
  { month: 'May', amount: 17500 },
  { month: 'Jun', amount: 21000 },
  { month: 'Jul', amount: 20000 },
  { month: 'Aug', amount: 22500 },
  { month: 'Sep', amount: 19500 },
  { month: 'Oct', amount: 23000 },
  { month: 'Nov', amount: 21500 },
  { month: 'Dec', amount: 24000 },
];

export const initializeInventory = (): InventoryItem[] => {
  const stored = localStorage.getItem('dentalInventory');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('dentalInventory', JSON.stringify(mockInventoryItems));
  return mockInventoryItems;
};

export const saveInventory = (items: InventoryItem[]): void => {
  localStorage.setItem('dentalInventory', JSON.stringify(items));
};