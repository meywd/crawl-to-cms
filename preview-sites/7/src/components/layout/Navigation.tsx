import React from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="site-navigation">
      <div className="container">
        <ul className="nav-menu">
        <li><Link to="/">Home</Link></li>

        </ul>
      </div>
    </nav>
  );
}
