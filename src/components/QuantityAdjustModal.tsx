import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { InventoryItem } from '../types';

interface QuantityAdjustModalProps {
  item: InventoryItem;
  onSave: (item: InventoryItem, newQuantity: number) => void;
  onClose: () => void;
}

export function QuantityAdjustModal({ item, onSave, onClose }: QuantityAdjustModalProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity !== item.quantity) {
      setShowConfirmation(true);
    } else {
      onClose();
    }
  };

  const handleConfirm = () => {
    onSave(item, quantity);
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Adjust Quantity
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Product</p>
              <p className="font-medium text-gray-900">{item.productName}</p>
              <p className="text-xs text-gray-500 mt-1">{item.category}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Current Quantity: {item.quantity} {item.unit}
              </label>
              
              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition"
                >
                  <Minus className="w-6 h-6" />
                </button>
                
                <div className="text-center">
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, Number(e.target.value)))}
                    className="w-24 text-center text-2xl font-bold px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">{item.unit}</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="p-3 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {quantity !== item.quantity && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {quantity > item.quantity ? (
                      <>Adding <strong>+{quantity - item.quantity}</strong> {item.unit}</>
                    ) : (
                      <>Removing <strong>-{item.quantity - quantity}</strong> {item.unit}</>
                    )}
                  </p>
                </div>
              )}
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
                Update Quantity
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Quantity Change</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to update the quantity of <strong>{item.productName}</strong> from{' '}
              <strong>{item.quantity}</strong> to <strong>{quantity}</strong> {item.unit}?
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
