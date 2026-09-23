import React from 'react';
import { Menu, Calendar, ChevronDown } from 'lucide-react';
import { MONTH_NAMES } from '../../utils/constants';
import './Header.css';

const Header = ({
  title,
  subtitle,
  selectedMonth = 9,
  selectedYear = 2026,
  onMonthChange,
  showMonthFilter = false,
  onToggleSidebar,
  actions
}) => {
  return (
    <header className="app-header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>
        <div className="header-title-box">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        {showMonthFilter && (
          <div className="month-filter-badge">
            <Calendar size={16} className="calendar-icon" />
            <select
              value={`${selectedMonth}-${selectedYear}`}
              onChange={(e) => {
                const [m, y] = e.target.value.split('-').map(Number);
                if (onMonthChange) onMonthChange(m, y);
              }}
              className="month-select"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m.value} value={`${m.value}-2026`}>
                  {m.label} 2026
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="dropdown-arrow" />
          </div>
        )}

        {actions && <div className="header-actions">{actions}</div>}
      </div>
    </header>
  );
};

export default Header;
