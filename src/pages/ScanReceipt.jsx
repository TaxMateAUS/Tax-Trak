import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ReceiptUploader from '../components/receipts/ReceiptUploader';
import ExpenseForm from '../components/receipts/ExpenseForm';
import { CheckCircle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ScanReceipt() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Expense.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses']);
      setShowSuccess(true);
      setExtractedData(null);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  });

  const handleReceiptProcessed = (data) => {
    setExtractedData(data);
  };

  const handleSave = (data) => {
    createMutation.mutate(data);
  };

  const handleCancel = () => {
    setExtractedData(null);
  };

  const handleAddAnother = () => {
    setShowSuccess(false);
    setExtractedData(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Scan Receipt</h1>
        <p className="text-slate-500 mt-2">Upload a receipt and we'll extract the details automatically</p>
      </div>

      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-semibold text-emerald-900 mb-2">Expense Saved!</h2>
            <p className="text-emerald-700 mb-6">Your expense has been added to your records</p>
            <Button onClick={handleAddAnother} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Receipt
            </Button>
          </motion.div>
        ) : extractedData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl border border-slate-200 p-8"
          >
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Receipt Scanned Successfully</h2>
                <p className="text-sm text-slate-500">Review and edit the extracted details below</p>
              </div>
            </div>
            <ExpenseForm
              initialData={extractedData}
              onSave={handleSave}
              onCancel={handleCancel}
              isSaving={createMutation.isPending}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ReceiptUploader
              onReceiptProcessed={handleReceiptProcessed}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="bg-slate-50 rounded-2xl p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Tips for best results</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            Ensure the receipt is flat and well-lit
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            Include the entire receipt in the photo
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            Make sure the text is legible and not blurry
          </li>
        </ul>
      </div>
    </div>
  );
}