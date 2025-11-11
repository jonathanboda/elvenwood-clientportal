import React, { useState } from 'react';
import { X, UploadCloud, Upload } from 'lucide-react';

interface UploadVersionModalProps {
  latestVersionNumber: number;
  onClose: () => void;
  onConfirm: (changelog: string[], fileUrl: string) => void;
}

const UploadVersionModal: React.FC<UploadVersionModalProps> = ({ latestVersionNumber, onClose, onConfirm }) => {
  const [changelog, setChangelog] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrorMessage('Invalid file type. Please upload JPG, PNG, PDF, or WebP.');
        setFile(null);
        setFileName('');
        return;
      }

      // Validate file size (max 10MB for design files - matches backend limit)
      const maxSize = 10 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setErrorMessage('File is too large. Maximum size is 10MB.');
        setFile(null);
        setFileName('');
        return;
      }

      setErrorMessage('');
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleConfirm = async () => {
    if (!file || changelog.trim() === '') {
        setErrorMessage('Please provide a file and a changelog.');
        return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Upload failed');
      }

      const data = await response.json();
      const changelogItems = changelog.split('\n').filter(line => line.trim() !== '');

      setSuccessMessage('File uploaded successfully!');
      setTimeout(() => {
        onConfirm(changelogItems, data.data.url);
      }, 1500);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-light-bg dark:bg-dark-bg-secondary rounded-lg shadow-xl w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-light-bg-secondary dark:hover:bg-dark-border transition-colors">
          <X size={20} className="text-light-text-secondary dark:text-dark-text-secondary" />
        </button>

        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">Upload New Version</h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            You are uploading Version {latestVersionNumber + 1}.
        </p>

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-md bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm">
            {successMessage}
          </div>
        )}

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Design File</label>
                 <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-light-bg-secondary dark:bg-dark-bg border-2 border-light-border dark:border-dark-border border-dashed rounded-md appearance-none cursor-pointer hover:border-brand-accent">
                    <UploadCloud className="w-8 h-8 text-light-text-secondary dark:text-dark-text-secondary"/>
                    <span className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {fileName ? fileName : 'Drag & drop or click to select a file'}
                    </span>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                </label>
            </div>
            <div>
                <label htmlFor="changelog" className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">Changelog</label>
                <textarea
                    id="changelog"
                    rows={4}
                    value={changelog}
                    onChange={(e) => setChangelog(e.target.value)}
                    placeholder="Describe the changes in this version. (One change per line)"
                    className="w-full bg-light-bg-secondary dark:bg-dark-bg p-2 rounded-md border border-light-border dark:border-dark-border focus:ring-brand-accent focus:border-brand-accent"
                />
            </div>
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
            disabled={isUploading}
            className="px-4 py-2 rounded-lg bg-brand-accent text-white hover:opacity-90 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={16}/> {isUploading ? 'Uploading...' : 'Upload Version'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadVersionModal;