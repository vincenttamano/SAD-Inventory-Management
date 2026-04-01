import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { InventoryItem } from '../types';

interface AddEditModalProps {
  item: InventoryItem | null;
  onSave: (item: InventoryItem) => void;
  onClose: () => void;
}

export function AddEditModal({ item, onSave, onClose }: AddEditModalProps) {
  const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
    productName: '',
    quantity: 0,
    unit: 'pieces',
    expiryDate: '',
    category: 'Consumables',
    lowStockThreshold: 10,
    dateCreated: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (item) {
      setFormData({
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        expiryDate: item.expiryDate,
        category: item.category,
        lowStockThreshold: item.lowStockThreshold,
        dateCreated: item.dateCreated,
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: item?.id || Date.now().toString(),
      dateCreated: item?.dateCreated || new Date().toISOString().split('T')[0],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'lowStockThreshold' ? Number(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                required
                value={formData.productName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-sm sm:text-base"
              >
                <option value="Anesthetics">Anesthetics</option>
                <option value="PPE">PPE</option>
                <option value="Restorative">Restorative</option>
                <option value="Disinfectants">Disinfectants</option>
                <option value="Instruments">Instruments</option>
                <option value="Consumables">Consumables</option>
                <option value="Preventive">Preventive</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                required
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                required
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white text-sm sm:text-base"
              >
                <option value="pieces">Pieces</option>
                <option value="boxes">Boxes</option>
                <option value="bottles">Bottles</option>
                <option value="syringes">Syringes</option>
                <option value="packs">Packs</option>
                <option value="tubes">Tubes</option>
                <option value="kg">Kg</option>
                <option value="liters">Liters</option>
              </select>
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                required
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
              />
            </div>

            <div>
              <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                id="lowStockThreshold"
                name="lowStockThreshold"
                required
                min="0"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              {item ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}