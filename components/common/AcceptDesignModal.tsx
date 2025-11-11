import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface AcceptDesignModalProps {
  versionNumber: number;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

const AcceptDesignModal: React.FC<AcceptDesignModalProps> = ({ versionNumber, onClose, onConfirm }) => {
  const [note, setNote] = useState('');

  const handleConfirm = () => {
    onConfirm(note);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-light-bg-secondary dark:hover:bg-dark-border transition-colors">
          <X size={20} className="text-light-text-secondary dark:text-dark-text-secondary" />
        </button>

        <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">Approve Version {versionNumber}</h2>
            <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
                Are you sure you want to approve this design version? This will mark the design as complete.
            </p>
        </div>
        
        <div className="mt-6">
            <label htmlFor="approval-note" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Optional Note</label>
            <textarea
                id="approval-note"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a final note for the designer..."
                className="w-full bg-light-bg-secondary dark:bg-dark-bg p-2 rounded-md border border-light-border dark:border-dark-border focus:ring-brand-accent focus:border-brand-accent"
            />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-light-bg-secondary dark:bg-dark-bg text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors"
          >
            Yes, Approve Version
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcceptDesignModal;