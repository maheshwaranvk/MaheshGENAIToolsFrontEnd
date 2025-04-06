import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-button" onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? <FaBars /> : <FaTimes />}
      </button>
      {!isCollapsed && (
        <>
          <h2>GenAI Automation</h2>
          <ul>
            
            <li className="sidebar-item">
              <Link to="/generate" className="sidebar-link">
                Swagger to RestAssured
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/generate-feature-file" className="sidebar-link">
                Spira TC to Feature File
              </Link>
            </li>
            {/* 
            <li className="sidebar-item">
              <Link to="/generate-manual-testcases" className="sidebar-link">
              Generate Manual Test Cases
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/selenium-to-playwright" className="sidebar-link">
                Selenium to Playwright
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/resumeReview" className="sidebar-link">
                Resume Review
              </Link>
            </li> */}
          </ul>
        </>
      )}
    </div>
  );
}

export default Sidebar;
