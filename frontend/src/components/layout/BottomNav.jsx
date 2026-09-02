import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../common/Icons';
import './BottomNav.css';

export const BottomNav = () => {
  const navItems = [
    { to: '/', label: 'Início', icon: 'house' },
    { to: '/search', label: 'Pesquisa', icon: 'search' },
    { to: '/profile', label: 'Meu perfil', icon: 'circle-user-round' },
    { to: '/menu', label: 'Menu', icon: 'menu' },
  ];

  return (
    <nav className="fixed-bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
          end={item.to === '/'}
        >
          {({ isActive }) => (
            <>
              <div className="bottom-nav-icon-box">
                <Icon
                  name={item.icon}
                  size={20}
                  color={isActive ? 'var(--green-leaf)' : 'var(--foreground-secondary)'}
                />
              </div>
              <span className="bottom-nav-label">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
