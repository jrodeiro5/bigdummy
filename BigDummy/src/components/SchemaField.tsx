import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Database } from 'lucide-react';
import { NestedFieldDialog } from './NestedFieldDialog';

interface SchemaFieldProps {
  name: string;
  type: string;
  isNested?: boolean;
  availableKeys?: string[];
}

export const SchemaField: React.FC<SchemaFieldProps> = ({
  name,
  type,
  isNested = false,
  availableKeys = [],
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: name,
    data: {
      type: 'field',
      name,
      fieldType: type,
      isNested,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (isNested) {
      e.preventDefault();
      setIsDialogOpen(true);
    }
  };

  const handleNestedFieldSelect = (key: string, value: string) => {
    // The drag data will be updated with nested field information
    if (attributes['data-draggable']) {
      const dragData = JSON.parse(attributes['data-draggable']);
      dragData.nestedKey = key;
      dragData.nestedValue = value;
      attributes['data-draggable'] = JSON.stringify(dragData);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        onClick={handleClick}
        className="flex items-center p-2 hover:bg-gray-100 cursor-move rounded"
      >
        <Database className="w-4 h-4 mr-2" />
        <span className="text-sm">{name}</span>
        <span className="text-xs text-gray-500 ml-2">({type})</span>
        {isNested && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded ml-2">
            Nested
          </span>
        )}
      </div>

      {isNested && (
        <NestedFieldDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSelect={handleNestedFieldSelect}
          fieldName={name}
          availableKeys={availableKeys}
        />
      )}
    </>
  );
};