import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SwaggerToRestAssuredPage from './components/SwaggerToRestAssuredPage';
import SeleniumToPlaywrightPage from './components/SeleniumToPlaywrightPage';
import GenerateManualTestCases from './components/GenerateManualTestCases';
import SpiraFeatureGenerator from './components/SpiraFeatureGenerator';
import ConfigPage from './components/ConfigPage';
import ResumeReviewPage from './components/ResumeReviewPage';


function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/generate-manual-testcases" element={<GenerateManualTestCases />} />
            <Route path="/generate" element={<SwaggerToRestAssuredPage />} />
            <Route path="/generate-feature-file" element={<SpiraFeatureGenerator />} />
            <Route path="/selenium-to-playwright" element={<SeleniumToPlaywrightPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/resumeReview" element={<ResumeReviewPage />} />
            {/* Default route */}
            <Route path="/" element={<SwaggerToRestAssuredPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
