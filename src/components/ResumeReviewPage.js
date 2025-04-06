// src/components/ResumeReviewPage.js
import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
function ResumeReviewPage() {
  const [name, setName] = useState('');
  const [roleApplied, setRoleApplied] = useState('');
  const [overallExperience, setOverallExperience] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [frontEndSkills, setFrontEndSkills] = useState({
    selenium: false,
    playwright: false,
  });
  const [backEndSkills, setBackEndSkills] = useState({
    postman: false,
    restassured: false,
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown options
  const roleOptions = [
    'QA Automation Engineer',
    'QA Manual Engineer',
    'QA Architect',
  ];
  const experienceOptions = [
    'Less than 1 year',
    '1-3 years',
    '3-5 years',
    'More than 5 years',
  ];
  const relevantExperienceOptions = [
    'Less than 1 year relevant experience',
    '1-2 years relevant experience',
    '2-5 years relevant experience',
    'More than 5 years relevant experience',
  ];

  // Checkbox change handlers
  const handleFrontEndSkillChange = (e) => {
    const { name, checked } = e.target;
    setFrontEndSkills((prev) => ({ ...prev, [name]: checked }));
  };
  const handleBackEndSkillChange = (e) => {
    const { name, checked } = e.target;
    setBackEndSkills((prev) => ({ ...prev, [name]: checked }));
  };

  // File upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  // Download the feedback as a PDF using jsPDF's html() method.
  // We use a ref to capture the rendered feedback container.
  const feedbackRef = useRef(null);
  const handleDownloadPDF = () => {
    if (!feedback.trim()) {
      alert('No feedback to download!');
      return;
    }

    const doc = new jsPDF();
    let yPos = 10; // Initial Y position for text content

    // Split the processed feedback into lines
    const lines = processedFeedback.split('\n');
    let currentText = [];
    let tableData = [];
    let tableHeaders = [];
    let isTableSection = false;

    lines.forEach((line) => {
      // Check if the line is part of a Markdown table
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line
          .split('|')
          .map((cell) => cell.trim())
          .filter((cell) => cell);

        // Skip the separator line (e.g., |---|)
        if (cells.some((cell) => cell.includes('---'))) {
          return;
        }

        if (!isTableSection) {
          // First line of the table (headers)
          tableHeaders = cells;
          isTableSection = true;
        } else {
          // Subsequent table rows
          tableData.push(cells);
        }
      } else {
        if (isTableSection) {
          // End of table section, add the table to the PDF
          doc.autoTable({
            head: [tableHeaders],
            body: tableData,
            startY: yPos,
            theme: 'grid',
            styles: { fontSize: 10 },
          });
          yPos = doc.lastAutoTable.finalY + 10; // Update Y position after table
          isTableSection = false;
          tableHeaders = [];
          tableData = [];
        }

        // Collect non-table text
        currentText.push(line);
      }
    });

    // Add any remaining text after the last table
    if (currentText.length > 0) {
      doc.text(currentText.join('\n'), 10, yPos);
      currentText = [];
    }

    // Add any remaining table data if the feedback ends with a table
    if (tableHeaders.length > 0) {
      doc.autoTable({
        head: [tableHeaders],
        body: tableData,
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 10 },
      });
    }

    doc.save(`${name}_Resume_Review.pdf`);
  };

  /**
   * Extracts the markdown table from the LLM feedback.
   * If the feedback is enclosed in triple backticks, it returns the content inside.
   */
  function extractTable(feedbackText) {
    const trimmed = feedbackText.trim();
    if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
      return trimmed.substring(3, trimmed.length - 3).trim();
    }
    return trimmed;
  }

  // Submit resume review
  async function handleReview() {
    if (!name.trim() || !roleApplied || !overallExperience || !relevantExperience) {
      alert('Please fill in all the required fields.');
      return;
    }
    if (!resumeFile) {
      alert('Please upload a resume (PDF, DOC, or DOCX).');
      return;
    }
    setIsLoading(true);
    try {
      const selectedFrontEnd = Object.keys(frontEndSkills).filter((skill) => frontEndSkills[skill]);
      const selectedBackEnd = Object.keys(backEndSkills).filter((skill) => backEndSkills[skill]);

      // Build FormData for multipart/form-data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('roleApplied', roleApplied);
      formData.append('presentExperience', overallExperience);
      formData.append('relevantExperience', relevantExperience);
      formData.append('frontEndSkills', JSON.stringify(selectedFrontEnd));
      formData.append('backEndSkills', JSON.stringify(selectedBackEnd));
      formData.append('resumeFile', resumeFile);

      const response = await fetch('http://98.70.54.50:8080/api/resumeReview', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errMsg = await response.text();
        alert('Review failed: ' + errMsg);
        return;
      }
      const result = await response.text();
      setFeedback(result);
    } catch (err) {
      console.error(err);
      alert('Error reviewing resume: ' + err);
    } finally {
      setIsLoading(false);
    }
  }

  // Process the feedback to extract table content and convert literal "\n" into actual newlines.
  const processedFeedback = extractTable(feedback.replace(/\\n/g, "\n"));

  return (
    <div className="resume-review-page">
      <h2>Resume Review</h2>

      <form className="resume-review-form" onSubmit={(e) => e.preventDefault()}>
        {/* Name */}
        <div className="form-group">
          <label className="form-label">Name:</label>
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter candidate name"
          />
        </div>

        {/* Role Applied For */}
        <div className="form-group">
          <label className="form-label">Role Applied For:</label>
          <select
            className="form-select"
            value={roleApplied}
            onChange={(e) => setRoleApplied(e.target.value)}
          >
            <option value="">Select Role</option>
            {roleOptions.map((role, idx) => (
              <option key={idx} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Overall Experience */}
        <div className="form-group">
          <label className="form-label">Overall Experience:</label>
          <select
            className="form-select"
            value={overallExperience}
            onChange={(e) => setOverallExperience(e.target.value)}
          >
            <option value="">Select Overall Experience</option>
            {experienceOptions.map((exp, idx) => (
              <option key={idx} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>

        {/* Relevant Experience */}
        <div className="form-group">
          <label className="form-label">Relevant Experience:</label>
          <select
            className="form-select"
            value={relevantExperience}
            onChange={(e) => setRelevantExperience(e.target.value)}
          >
            <option value="">Select Relevant Experience</option>
            {relevantExperienceOptions.map((exp, idx) => (
              <option key={idx} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>

        {/* Front End Skills */}
        <div className="form-group">
          <label className="form-label">Front End Skills:</label>
          <div className="form-checks">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="selenium"
                checked={frontEndSkills.selenium}
                onChange={handleFrontEndSkillChange}
              />
              Selenium
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="playwright"
                checked={frontEndSkills.playwright}
                onChange={handleFrontEndSkillChange}
              />
              Playwright
            </label>
          </div>
        </div>

        {/* Back End Skills */}
        <div className="form-group">
          <label className="form-label">Back End Skills:</label>
          <div className="form-checks">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="postman"
                checked={backEndSkills.postman}
                onChange={handleBackEndSkillChange}
              />
              Postman
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="restassured"
                checked={backEndSkills.restassured}
                onChange={handleBackEndSkillChange}
              />
              RestAssured
            </label>
          </div>
        </div>

        {/* File Upload */}
        <div className="form-group">
          <label className="form-label">Upload Resume (PDF, DOC, DOCX):</label>
          <input
            className="form-input"
            type="file"
            accept=".pdf, .doc, .docx"
            onChange={handleFileChange}
          />
          {resumeFile && (
            <p className="file-name">Selected File: {resumeFile.name}</p>
          )}
        </div>

        {/* Review Button */}
        <div className="form-group">
          <button className="form-button" onClick={handleReview} disabled={isLoading}>
            {isLoading ? 'Reviewing...' : 'Review Resume'}
          </button>
        </div>
      </form>

      <div className="section">
        <h4>Feedback</h4>
        <div className="feedback-toolbar">
          <button className="download-button" onClick={handleDownloadPDF}>
            Download PDF
          </button>
        </div>
        {/* Hidden container for PDF generation */}
        <div className="feedback-container" ref={feedbackRef}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            p: ({ node, ...props }) => <p className="md-content" {...props} />,
          }}
        >
          {processedFeedback}
        </ReactMarkdown>

        </div>
      </div>
    </div>
  );
}

export default ResumeReviewPage;
