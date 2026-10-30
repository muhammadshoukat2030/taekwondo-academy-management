import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Printer, X } from 'lucide-react';

export const DualSlipReceipt = ({ receipt, onClose }) => {
  const { colors } = useTheme();

  const formattedDate = new Date(receipt.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const renderSingleSlip = (copyType) => (
    <div className="flex-1 p-5 border-2 border-gray-900 bg-white text-black text-xs font-sans relative flex flex-col justify-between">
      {/* Academy Header */}
      <div>
        <div className="text-center pb-2 border-b-2 border-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-gray-700">
              Receipt No: <span className="text-sm font-black text-black">#{receipt.receiptNo}</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black text-white">
              {copyType}
            </span>
            <span className="text-[10px] font-mono font-bold text-gray-700">
              Date: {formattedDate}
            </span>
          </div>

          <h2 className="text-base font-black tracking-tight uppercase mt-1">
            AL MURTAZA SHAH TAEKWONDO
          </h2>
          <div className="text-xs font-bold font-urdu">
            المurtضٰی شاہ تائیکوانڈو کوہاٹ
          </div>
          <p className="text-[10px] text-gray-700 mt-0.5">
            Abdur Rehman Plaza, Markaz Road, Chogi No.7, Kohat
          </p>
          <p className="text-[10px] font-bold text-gray-900">
            Contact No: 0335-9117230
          </p>
        </div>

        {/* Student Identification Details */}
        <div className="py-2.5 space-y-1.5 border-b border-gray-300 text-[11px]">
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">Student Name:</span>
            <span className="font-black text-black uppercase">{receipt.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">Father's Name:</span>
            <span className="font-semibold text-black">{receipt.fatherName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">Cell / Phone No:</span>
            <span className="font-mono font-bold">{receipt.cellNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">Address:</span>
            <span className="truncate max-w-[200px]">{receipt.address || 'Kohat'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">Fee Month:</span>
            <span className="font-mono font-bold text-blue-900">{receipt.billingMonthYear || receipt.monthYear}</span>
          </div>
        </div>

        {/* Itemized Dues Breakdown Table */}
        <div className="py-2">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-gray-400 text-gray-700 font-bold">
                <th className="py-1">Description / تفصیل</th>
                <th className="py-1 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-1 text-gray-800">Monthly Academy Fee</td>
                <td className="py-1 text-right font-mono font-bold">PKR {receipt.monthlyFee}</td>
              </tr>
              {receipt.admissionFee > 0 && (
                <tr>
                  <td className="py-1 text-gray-800">Admission / Reg Fee</td>
                  <td className="py-1 text-right font-mono font-bold">PKR {receipt.admissionFee}</td>
                </tr>
              )}
              {receipt.previousBalance > 0 || receipt.previousArrears > 0 ? (
                <tr>
                  <td className="py-1 text-rose-700 font-semibold">Previous Arrears (Baqaya)</td>
                  <td className="py-1 text-right font-mono font-bold text-rose-700">
                    PKR {receipt.previousBalance || receipt.previousArrears}
                  </td>
                </tr>
              ) : null}
              <tr className="border-t-2 border-gray-900 font-black text-xs">
                <td className="py-1.5">Total Payable Due</td>
                <td className="py-1.5 text-right font-mono font-black">PKR {receipt.totalPayable}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cash Received & Balance Boxes */}
        <div className="grid grid-cols-2 gap-2 my-2">
          <div className="p-2 border-2 border-gray-900 bg-gray-50 text-center rounded">
            <div className="text-[10px] font-black uppercase text-gray-700">AMOUNT RECEIVED</div>
            <div className="text-base font-black font-mono text-black mt-0.5">
              PKR {receipt.amountReceived !== undefined ? receipt.amountReceived : receipt.receivedAmount}
            </div>
            <div className="text-[9px] text-gray-600 font-urdu">وصول شدہ رقم</div>
          </div>

          <div className="p-2 border-2 border-gray-900 bg-gray-50 text-center rounded">
            <div className="text-[10px] font-black uppercase text-gray-700">REMAINING BALANCE</div>
            <div className="text-base font-black font-mono text-rose-700 mt-0.5">
              PKR {receipt.remainingBalance !== undefined ? receipt.remainingBalance : receipt.balanceRemaining}
            </div>
            <div className="text-[9px] text-gray-600 font-urdu">بقیہ واجب الادا</div>
          </div>
        </div>
      </div>

      {/* Signature & Validation Footer */}
      <div className="pt-4 border-t border-gray-400 mt-2">
        <div className="flex justify-between items-end text-[10px]">
          <div>
            <span className="text-gray-600">Payment:</span> <span className="font-bold">{receipt.paymentMethod || 'Cash'}</span>
            <div className="text-[9px] text-gray-500 mt-0.5">Fee once deposited is non-refundable</div>
          </div>

          <div className="text-center">
            <div className="font-serif font-bold text-xs text-blue-900 border-b border-gray-900 pb-0.5">
              Murtaza Hassan Bangash
            </div>
            <div className="text-[9px] font-bold text-gray-700 mt-0.5">
              Instructor TKD Signature / مهر
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 lg:p-5 overflow-y-auto">
      <div
        className="border max-w-4xl w-full p-3.5 lg:p-4 rounded-xl shadow-xl relative my-auto transition-all"
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border
        }}
      >
        <div
          className="flex items-center justify-between pb-2.5 mb-3 border-b no-print"
          style={{ borderColor: colors.border }}
        >
          <div>
            <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>
              Official Printable Two-Part Dual Slip Receipt #{receipt.receiptNo}
            </h3>
            <p className="text-[11px]" style={{ color: colors.textSecondary }}>
              Perforated split slip with identical Office Copy & Student Copy
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition hover:scale-102 active:scale-95"
              style={{ backgroundColor: colors.primary }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dual Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border transition hover:opacity-80"
              style={{
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
                color: colors.textSecondary
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg receipt-print-page overflow-x-auto w-full">
          <div className="flex flex-col md:flex-row gap-3 relative min-w-[520px] md:min-w-0">
            {renderSingleSlip('OFFICE COPY')}

            <div className="hidden md:flex flex-col items-center justify-center px-1">
              <div className="h-full border-r-2 border-dashed border-gray-400 relative">
                <span className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 bg-white px-2 text-[9px] font-mono text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  ✂ Cut Here (Perforated) ✂
                </span>
              </div>
            </div>

            {renderSingleSlip('STUDENT COPY')}
          </div>
        </div>
      </div>
    </div>
  );
};
