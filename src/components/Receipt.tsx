import React from 'react';

// Defines the shape of the data needed for a receipt
export interface ReceiptData {
  saleNumber: string;
  cashierName: string;
  items: { name: string; size?: string; qty: number; price: number }[];
  totalAmount: number;
  paymentMethod: string;
  date: string;
}

interface ReceiptProps {
  data: ReceiptData | null;
}

export const Receipt: React.FC<ReceiptProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="receipt-container" id="printable-receipt">
      <div className="receipt-header">
        <h2>TARELLA WEARS</h2>
        <p>Fashion St, Nairobi</p>
        <p>Tel: +254 700 315 777</p>
        <div className="receipt-divider"></div>
        <p>Receipt #: {data.saleNumber}</p>
        <p>Date: {new Date(data.date).toLocaleString()}</p>
        <p>Cashier: {data.cashierName}</p>
        <div className="receipt-divider"></div>
      </div>

      <div className="receipt-body">
        <table className="receipt-table">
          <thead>
            <tr>
              <th className="text-left">Item (Size)</th>
              <th className="text-center">Qty</th>
              <th className="text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx}>
                <td className="text-left">{item.name} {item.size ? `(${item.size})` : ''}</td>
                <td className="text-center">{item.qty}</td>
                <td className="text-right">{(item.price * item.qty).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="receipt-footer">
        <div className="receipt-divider"></div>
        <div className="receipt-total">
          <span>TOTAL:</span>
          <span>KES {data.totalAmount.toLocaleString()}</span>
        </div>
        <div className="receipt-method">
          <span>Paid via: {data.paymentMethod.toUpperCase()}</span>
        </div>
        <div className="receipt-divider"></div>
        <p className="thank-you">Be Different, Be Tarella.</p>
      </div>
    </div>
  );
};
