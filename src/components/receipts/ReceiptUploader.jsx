import { useState, useCallback } from 'react';
import { Upload, Loader2, Camera, FileImage } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";

export default function ReceiptUploader({ onReceiptProcessed, isProcessing, setIsProcessing }) {
  const [isDragging, setIsDragging] = useState(false);

  const processReceipt = async (file) => {
    setIsProcessing(true);
    try {
      // Upload the file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Extract data from the receipt using AI
      const extractedData = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this receipt image and extract the following information:
        - Vendor/Store name
        - Total amount (just the number)
        - Date of purchase (in YYYY-MM-DD format)
        - Best category from: office_supplies, travel, meals_entertainment, utilities, software_subscriptions, professional_services, insurance, vehicle, home_office, medical, education, charitable, other
        
        Be precise with the amount - look for the total or grand total.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            vendor: { type: "string" },
            amount: { type: "number" },
            date: { type: "string" },
            category: { type: "string" }
          }
        }
      });

      onReceiptProcessed({
        ...extractedData,
        receipt_url: file_url,
        tax_year: new Date(extractedData.date || new Date()).getFullYear()
      });
    } catch (error) {
      console.error('Error processing receipt:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processReceipt(file);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processReceipt(file);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 text-center",
        isDragging 
          ? "border-emerald-400 bg-emerald-50" 
          : "border-slate-200 hover:border-slate-300 bg-slate-50/50",
        isProcessing && "pointer-events-none opacity-60"
      )}
    >
      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Processing Receipt...</p>
            <p className="text-sm text-slate-500 mt-1">Extracting data with AI</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <FileImage className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Drop your receipt here</p>
              <p className="text-sm text-slate-500 mt-1">or click to browse</p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => document.getElementById('receipt-upload').click()}
              >
                <Upload className="w-4 h-4" />
                Upload Image
              </Button>
            </div>
          </div>
          <input
            id="receipt-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}
    </div>
  );
}