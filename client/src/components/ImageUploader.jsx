import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiImage, FiX, FiShield } from 'react-icons/fi';

function ImageUploader({ onUpload, isLoading }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isLoading
  });

  const handleUpload = () => {
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`dropzone text-center ${isDragActive ? 'active' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
              ${isDragActive ? 'bg-primary-500 scale-110' : 'bg-gray-100'}`}>
              <FiUploadCloud className={`text-4xl ${isDragActive ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
              </p>
              <p className="text-gray-500 mt-1">or click to browse</p>
            </div>
            <p className="text-sm text-gray-400">
              Supports: JPG, PNG, GIF, WebP (Max 10MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-contain rounded-lg bg-gray-100"
            />
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="absolute top-2 right-2 w-8 h-8 bg-gray-900/70 hover:bg-gray-900 
                       rounded-full flex items-center justify-center text-white transition-colors"
            >
              <FiX />
            </button>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600">
              <FiImage />
              <span className="text-sm truncate max-w-xs">{file?.name}</span>
              <span className="text-xs text-gray-400">
                ({(file?.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <FiShield className="text-lg" />
                  <span>Detect DeepFake</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
