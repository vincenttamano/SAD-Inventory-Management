import { useState, useEffect } from 'react';
import { Plus, Search, X, Calendar, Package } from 'lucide-react';
import { InventoryItem, SimpleUsageRecord } from '../types';
import { initializeInventory, saveInventory } from '../utils/mockData';

export function Usage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [usageHistory, setUsageHistory] = useState<SimpleUsageRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{ itemId: string; quantity: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [procedure, setProcedure] = useState('');
  const [patientConsent, setPatientConsent] = useState(false);
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    setInventory(initializeInventory());
    loadUsageHistory();
  }, []);

  const loadUsageHistory = () => {
    const stored = localStorage.getItem('dentalClinicUsageHistory');
    if (stored) {
      const parsed = JSON.parse(stored) as SimpleUsageRecord[];
      setUsageHistory(
        parsed.map((record) => ({
          ...record,
          procedure: record.procedure || 'Not specified',
          patientConsent: record.patientConsent ?? false,
          patientName: record.patientName || 'Anonymous Patient',
        }))
      );
    }
  };

  const saveUsageHistory = (history: SimpleUsageRecord[]) => {
    localStorage.setItem('dentalClinicUsageHistory', JSON.stringify(history));
    setUsageHistory(history);
  };

  const handleAddItem = (itemId: string) => {
    const exists = selectedItems.find(item => item.itemId === itemId);
    if (!exists) {
      setSelectedItems([...selectedItems, { itemId, quantity: 1 }]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setSelectedItems(selectedItems.map(item => 
      item.itemId === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item');
      return;
    }

    if (!procedure.trim()) {
      alert('Please enter the procedure');
      return;
    }

    if (patientConsent && !patientName.trim()) {
      alert('Please enter patient name or uncheck consent to keep name hidden');
      return;
    }

    // Update inventory quantities
    const updatedInventory = inventory.map(item => {
      const usedItem = selectedItems.find(si => si.itemId === item.id);
      if (usedItem) {
        return {
          ...item,
          quantity: Math.max(0, item.quantity - usedItem.quantity),
        };
      }
      return item;
    });

    // Create usage record
    const newRecord: SimpleUsageRecord = {
      id: Date.now().toString(),
      date: date,
      procedure: procedure.trim(),
      patientConsent,
      patientName: patientConsent ? patientName.trim() : 'Anonymous Patient',
      items: selectedItems.map(si => {
        const item = inventory.find(i => i.id === si.itemId)!;
        return {
          itemId: si.itemId,
          itemName: item.productName,
          quantity: si.quantity,
          unit: item.unit,
        };
      }),
    };

    // Save updates
    setInventory(updatedInventory);
    saveInventory(updatedInventory);
    saveUsageHistory([newRecord, ...usageHistory]);

    // Reset form
    setSelectedItems([]);
    setDate(new Date().toISOString().split('T')[0]);
    setProcedure('');
    setPatientConsent(false);
    setPatientName('');
    setIsModalOpen(false);
  };

  const filteredInventory = inventory.filter(item =>
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalItemsUsed = () => {
    return usageHistory.reduce((total, record) => {
      return total + record.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  };

  const getUniqueProductsUsed = () => {
    const uniqueItems = new Set<string>();
    usageHistory.forEach(record => {
      record.items.forEach(item => uniqueItems.add(item.itemId));
    });
    return uniqueItems.size;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Usage Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Record items used and view history</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          <span>Record Usage</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Records</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{usageHistory.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Items Used</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{getTotalItemsUsed()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Unique Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{getUniqueProductsUsed()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Usage History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Procedure
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items Used
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageHistory.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-xs sm:text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-xs sm:text-sm text-gray-900">{record.procedure || 'Not specified'}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-xs sm:text-sm text-gray-900">
                      {record.patientConsent ? record.patientName : 'Anonymous (name hidden)'}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-xs sm:text-sm text-gray-900">
                      {record.items.length} item{record.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-3 sm:px-6 py-4">
                    <div className="space-y-1">
                      {record.items.map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-600">
                          {item.itemName}: {item.quantity} {item.unit}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {usageHistory.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No usage records yet
            </div>
          )}
        </div>
      </div>

      {/* Record Usage Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Record Usage</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close record usage modal"
                title="Close"
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="Usage date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procedure
                </label>
                <input
                  type="text"
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  placeholder="e.g., Tooth extraction"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={patientConsent}
                    onChange={(e) => setPatientConsent(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Patient consents to recording their name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  disabled={!patientConsent}
                  placeholder={patientConsent ? 'Enter patient name' : 'Name hidden (no consent)'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
                {!patientConsent && (
                  <p className="mt-1 text-xs text-gray-500">This usage will be saved as Anonymous Patient.</p>
                )}
              </div>

              {/* Selected Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Items
                </label>
                <div className="space-y-2 mb-4">
                  {selectedItems.map(({ itemId, quantity }) => {
                    const item = inventory.find(i => i.id === itemId);
                    if (!item) return null;

                    return (
                      <div key={itemId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-500">{item.category}</p>
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => handleQuantityChange(itemId, parseInt(e.target.value))}
                          aria-label={`Quantity for ${item.productName}`}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-sm text-gray-600">{item.unit}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(itemId)}
                          aria-label={`Remove ${item.productName}`}
                          title={`Remove ${item.productName}`}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Items
                </label>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredInventory.map(item => {
                    const isSelected = selectedItems.some(si => si.itemId === item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          isSelected ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => !isSelected && handleAddItem(item.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">{item.quantity} {item.unit}</p>
                            {isSelected && (
                              <p className="text-xs text-blue-600">Selected</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Save Usage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}