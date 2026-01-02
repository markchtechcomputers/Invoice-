'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, Scan, Upload, FileText } from 'lucide-react';

interface ScannerProps {
  onScanComplete: (data: {
    invoiceNumber: string;
    lpoNumber: string;
    supplierName: string;
    image: string;
  }) => void;
}

export default function Scanner({ onScanComplete }: ScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<{
    invoiceNumber: string;
    lpoNumber: string;
    supplierName: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setImage(imageSrc);
        setIsScanning(false);
        processImage(imageSrc);
      }
    }
  }, [webcamRef]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setImage(imageSrc);
        processImage(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageSrc: string) => {
    setIsProcessing(true);
    
    // Simulate OCR processing (replace with actual Tesseract.js)
    setTimeout(() => {
      const mockData = {
        invoiceNumber: `INV-${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`,
        lpoNumber: `LPO-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
        supplierName: ['Tech Supplies Ltd', 'Office Depot', 'Global Traders', 'Premium Suppliers'][
          Math.floor(Math.random() * 4)
        ],
      };
      
      setExtractedData(mockData);
      setIsProcessing(false);
    }, 2000);
  };

  const confirmExtraction = () => {
    if (image && extractedData) {
      onScanComplete({
        ...extractedData,
        image
      });
      resetScanner();
    }
  };

  const resetScanner = () => {
    setImage(null);
    setExtractedData(null);
    setIsScanning(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Invoice Scanner</h3>
            <p className="text-gray-600">Capture or upload invoice for processing</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </button>
          <button
            onClick={() => setIsScanning(!isScanning)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            {isScanning ? 'Stop Camera' : 'Use Camera'}
          </button>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,.pdf"
        onChange={handleFileUpload}
      />

      {/* Camera Preview */}
      {isScanning && (
        <div className="mb-6">
          <div className="relative rounded-lg overflow-hidden bg-gray-900">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-lg pointer-events-none" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={capture}
                className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
              >
                <Scan className="h-5 w-5" />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Position invoice within frame and click scan button
          </p>
        </div>
      )}

      {/* Captured Image Preview */}
      {image && !isScanning && (
        <div className="mb-6">
          <div className="flex items-start space-x-6">
            <div className="flex-1">
              <div className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium">Captured Invoice</span>
                </div>
                <img
                  src={image}
                  alt="Captured invoice"
                  className="w-full h-48 object-contain rounded"
                />
              </div>
            </div>

            {/* Extracted Data Form */}
            <div className="flex-1 bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Extracted Information</h4>
              
              {isProcessing ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Processing image and extracting data...</p>
                </div>
              ) : extractedData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      value={extractedData.invoiceNumber}
                      onChange={(e) => setExtractedData({
                        ...extractedData,
                        invoiceNumber: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      LPO Number
                    </label>
                    <input
                      type="text"
                      value={extractedData.lpoNumber}
                      onChange={(e) => setExtractedData({
                        ...extractedData,
                        lpoNumber: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      value={extractedData.supplierName}
                      onChange={(e) => setExtractedData({
                        ...extractedData,
                        supplierName: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="pt-4 flex space-x-3">
                    <button
                      onClick={confirmExtraction}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                    >
                      Confirm & Save
                    </button>
                    <button
                      onClick={resetScanner}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Rescan
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tips for better scanning:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure good lighting on the invoice</li>
          <li>• Position camera directly above the document</li>
          <li>• Make sure text is clear and not blurred</li>
          <li>• Supported formats: PDF, JPG, PNG</li>
        </ul>
      </div>
    </div>
  );
    }
