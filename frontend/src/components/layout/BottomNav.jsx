import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Icon } from '../common/Icons';
import './BottomNav.css';

export const BottomNav = () => {
  const { isAdmin } = useContext(AuthContext);

  const navItems = [
    { to: '/', label: 'Início', icon: 'house' },
    { to: '/search', label: 'Pesquisa', icon: 'search' },
    { to: '/profile', label: 'Meu perfil', icon: 'circle-user-round' },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: 'shield-check' }] : []),
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
