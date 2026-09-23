import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatRupiah } from '../../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryDonutChart = ({ categories = [], totalAmount = 0 }) => {
  if (!categories || categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
        Belum ada data pengeluaran bulan ini
      </div>
    );
  }

  const data = {
    labels: categories.map(c => c.category_name),
    datasets: [
      {
        data: categories.map(c => c.total_amount),
        backgroundColor: categories.map(c => c.color || '#3B82F6'),
        borderColor: '#FFFFFF',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false // We render custom legend matching the mockup
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return ` ${label}: ${formatRupiah(value)}`;
          }
        }
      }
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
      {/* Donut Chart with Center Text */}
      <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto' }}>
        <Doughnut data={data} options={options} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          width: '130px'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>
            {formatRupiah(totalAmount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
            Total
          </div>
        </div>
      </div>

      {/* Custom Legend matching mockup */}
      <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {categories.map((cat, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: cat.color || '#3B82F6',
                display: 'inline-block'
              }} />
              <span style={{ color: '#475569', fontWeight: 500 }}>{cat.category_name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 600, color: '#1E293B' }}>{formatRupiah(cat.total_amount)}</span>
              <span style={{ color: '#94A3B8', fontSize: '0.75rem', width: '32px', textAlign: 'right' }}>
                {cat.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDonutChart;
