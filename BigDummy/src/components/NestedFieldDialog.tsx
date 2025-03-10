import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface NestedFieldDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (key: string, value: string) => void;
  fieldName: string;
  availableKeys: string[];
}

export const NestedFieldDialog: React.FC<NestedFieldDialogProps> = ({
  isOpen,
  onClose,
  onSelect,
  fieldName,
  availableKeys,
}) => {
  const [selectedKey, setSelectedKey] = useState('');
  const [valueType, setValueType] = useState<'string' | 'number'>('string');
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelect(selectedKey, value);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Configure {fieldName}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Key
              </label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2"
                required
              >
                <option value="">Select a key...</option>
                {availableKeys.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="string"
                    checked={valueType === 'string'}
                    onChange={(e) => setValueType(e.target.value as 'string')}
                    className="mr-2"
                  />
                  String
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="number"
                    checked={valueType === 'number'}
                    onChange={(e) => setValueType(e.target.value as 'number')}
                    className="mr-2"
                  />
                  Number
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value
              </label>
              <input
                type={valueType === 'number' ? 'number' : 'text'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md border border-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Add Field
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};