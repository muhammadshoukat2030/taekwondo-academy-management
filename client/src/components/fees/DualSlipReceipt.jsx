import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAcademy } from '../../context/AcademyContext.jsx';
import { Printer, X, MessageSquare, Scissors } from 'lucide-react';

export const DualSlipReceipt = ({ receipt, onClose }) => {
  const { colors } = useTheme();
  const { settings } = useAcademy();

  const formattedDate = new Date(receipt.date || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = new Date(receipt.date || Date.now()).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleWhatsAppShare = () => {
    const rawPhone = (receipt.cellNo || '').replace(/[^0-9]/g, '');
    const targetPhone = rawPhone.startsWith('0') ? '92' + rawPhone.substring(1) : (rawPhone || '923359117230');
    const studentName = receipt.studentName || 'Student';
    const amountRcvd = receipt.amountReceived !== undefined ? receipt.amountReceived : receipt.receivedAmount;
    const remaining = receipt.remainingBalance !== undefined ? receipt.remainingBalance : receipt.balanceRemaining;
    const isPaid = remaining === 0;

    const message = `*AL MURTAZA SHAH TAEKWONDO ACADEMY*
*OFFICIAL FEE RECEIPT #${receipt.receiptNo}*
----------------------------------------
*Student Name:* ${studentName}
*Father Name:* ${receipt.fatherName || '-'}
*Belt Rank:* ${receipt.currentBelt || receipt.beltRank || 'Taekwondo Trainee'}
*Billing Month:* ${receipt.billingMonthYear || receipt.monthYear || '-'}
*Date & Time:* ${formattedDate} at ${formattedTime}
----------------------------------------
*Monthly Fee:* PKR ${receipt.monthlyFee || 1000}
${receipt.admissionFee > 0 ? `*Admission Fee:* PKR ${receipt.admissionFee}\n` : ''}${receipt.previousBalance > 0 ? `*Previous Arrears:* PKR ${receipt.previousBalance}\n` : ''}*Total Payable Due:* PKR ${receipt.totalPayable || 0}
*Amount Received:* PKR ${amountRcvd || 0}
*Remaining Baqaya:* PKR ${remaining || 0}
*Payment Method:* ${receipt.paymentMethod || 'Cash'}
*Status:* ${isPaid ? 'PAID (مکمل ادا شدہ)' : 'PARTIAL (نامکمل - بقیہ واجب الادا)'}
----------------------------------------
_Payment received with thanks._
_Al Murtaza Shah Taekwondo, Abdur Rehman Plaza, Markaz Road, Chogi No.7, Kohat_
_Helpline: 0335-9117230_`;

    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const renderSingleSlip = (copyType) => (
    <div className="flex-1 p-4 sm:p-5 border-2 border-gray-900 bg-white text-black text-xs font-sans relative flex flex-col justify-between">
      {/* Academy Header */}
      <div>
        <div className="text-center pb-2 border-b-2 border-gray-900">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-gray-700">
              Receipt: <span className="text-sm font-black text-black">#{receipt.receiptNo}</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black text-white">
              {copyType}
            </span>
            <div className="text-right text-[9.5px] font-mono font-bold text-gray-700 leading-tight">
              <div>{formattedDate}</div>
              <div className="text-gray-500 font-normal">{formattedTime}</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-1">
            <img
              src="/mtkd-logo.png"
              alt="Logo"
              className="w-10 h-10 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight uppercase leading-tight">
                {settings?.academyName || 'AL MURTAZA SHAH TAEKWONDO ACADEMY'}
              </h2>
              <div className="text-[10px] font-semibold text-gray-700 font-urdu leading-tight">
                المurtضٰی شاہ تائیکوانڈو اکیڈمی کوہاٹ
              </div>
            </div>
          </div>

          <div className="text-[9px] font-bold text-blue-900 uppercase tracking-wide mt-1">
            Affiliated with Khyber Pakhtunkhwa Taekwondo Association
          </div>

          <p className="text-[9.5px] text-gray-700 mt-0.5">
            {settings?.address || 'Abdur Rehman Plaza, Markaz Road, Chogi No.7, Kohat'}
          </p>
          <p className="text-[9.5px] font-bold text-gray-900">
            Official Contact: {settings?.phone || '0335-9117230'}
          </p>
        </div>

        {/* Student Identification Details */}
        <div className="py-2 space-y-1 border-b border-gray-300 text-[11px]">
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">Student Name:</span>
            <span className="font-black text-black uppercase">{receipt.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">Father's Name:</span>
            <span className="font-semibold text-black">{receipt.fatherName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">Belt Rank:</span>
            <span className="font-bold text-blue-900">{receipt.currentBelt || receipt.beltRank || 'White Belt'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-gray-700">Cell / Phone No:</span>
            <span className="font-mono font-bold">{receipt.cellNo}</span>
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
                <td className="py-1 text-gray-800">Monthly Academy Tuition Fee</td>
                <td className="py-1 text-right font-mono font-bold">PKR {receipt.monthlyFee}</td>
              </tr>
              {receipt.admissionFee > 0 && (
                <tr>
                  <td className="py-1 text-gray-800">Admission / Registration Fee</td>
                  <td className="py-1 text-right font-mono font-bold">PKR {receipt.admissionFee}</td>
                </tr>
              )}
              {(receipt.previousBalance > 0 || receipt.previousArrears > 0) && (
                <tr>
                  <td className="py-1 text-rose-700 font-semibold">Previous Arrears (Baqaya)</td>
                  <td className="py-1 text-right font-mono font-bold text-rose-700">
                    PKR {receipt.previousBalance || receipt.previousArrears}
                  </td>
                </tr>
              )}
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
      <div className="pt-3 border-t border-gray-400 mt-2">
        <div className="flex justify-between items-end text-[10px]">
          <div>
            <div>
              <span className="text-gray-600">Payment:</span> <span className="font-bold">{receipt.paymentMethod || 'Cash'}</span>
            </div>
            <div className="text-[8.5px] text-gray-500 mt-0.5">Fee once deposited is non-refundable</div>
            <div className="mt-4 pt-1 border-t border-dotted border-gray-400 text-center w-28">
              <span className="text-[8.5px] text-gray-600">Student/Parent Sign</span>
            </div>
          </div>

          <div className="text-center">
            <div className="font-serif font-bold text-xs text-blue-900 border-b border-gray-900 pb-0.5">
              Murtaza Hassan Bangash
            </div>
            <div className="text-[9px] font-bold text-gray-700 mt-0.5">
              Head Instructor Signature / مهر
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
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
              Official Twin-Slip Receipt #{receipt.receiptNo}
            </h3>
            <p className="text-[11px]" style={{ color: colors.textSecondary }}>
              Single A4 Page with Perforated Cut-Line • Office Copy & Student Copy
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition hover:scale-102 active:scale-95"
              title="Share receipt via WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Share WhatsApp</span>
            </button>

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

            {/* Perforated Cut Divider */}
            <div className="hidden md:flex flex-col items-center justify-center px-1">
              <div className="h-full border-r-2 border-dashed border-gray-400 relative flex items-center justify-center">
                <span className="absolute top-1/2 -left-3 -translate-y-1/2 -rotate-90 bg-white px-2 text-[9px] font-mono text-gray-500 uppercase tracking-widest whitespace-nowrap flex items-center gap-1">
                  <Scissors className="w-3 h-3 rotate-90" />
                  <span>Cut Here (Perforated)</span>
                </span>
              </div>
            </div>

            <div className="md:hidden border-b-2 border-dashed border-gray-400 my-2 text-center relative py-1">
              <span className="bg-white px-2 text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                ✂ Cut Here (Perforated) ✂
              </span>
            </div>

            {renderSingleSlip('STUDENT COPY')}
          </div>
        </div>
      </div>
    </div>
  );
};
