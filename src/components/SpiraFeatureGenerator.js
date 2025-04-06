import React, { useState } from 'react';

const SpiraFeatureGenerator = () => {
  const [testcaseId, setTestcaseId] = useState('');
  const [featureFile, setFeatureFile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testCaseName, setTestCaseName] = useState('');

  const handleGenerateFeatureFile = async () => {
    if (!testcaseId.trim()) {
      alert('Please enter a Spira Testcase ID');
      return;
    }

    setIsLoading(true);
    setFeatureFile(''); // Clear previous content
    setTestCaseName(''); // Reset name

    try {
      const response = await fetch('http://localhost:8080/api/generateFeatureFile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testcaseId }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to generate feature file');
      }

      const data = await response.text();
      const formattedFeature = data
      .replace(/\\n/g, '\n')          // Convert newline escapes
      .replace(/\\t/g, '    ')        // Convert tabs to 4 spaces
      .replace(/\\"/g, '"')           // Remove escaped quotes
      .replace(/\\u003c/g, '<')       // Convert unicode <
      .replace(/\\u003e/g, '>')       // Convert unicode >
      .replace(/\\u0026/g, '&')       // Convert unicode &
      .replace(/^"|"$/g, '')          // Remove surrounding quotes
      .replace(/\\(.)/g, '$1')        // Remove all remaining escape characters
      .replace(/\n{3,}/g, '\n\n')     // Normalize multiple newlines
      .trim();

      setFeatureFile(formattedFeature);

      // Extract the most relevant name for the file
      const nameFromTag = formattedFeature.match(/@(\w+)/)?.[1];
      const nameFromScenario = formattedFeature.match(/Scenario(?: Outline)?:\s*(.*?)(?:\n|$)/)?.[1];
      const cleanName = (nameFromTag || nameFromScenario || `Testcase_${testcaseId}`)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/(^_+|_+$)/g, '');

      setTestCaseName(cleanName || `testcase_${testcaseId}`);
    } catch (error) {
      console.error('Error generating feature file:', error);
      setFeatureFile(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!featureFile || featureFile.startsWith('Error:')) {
      alert('No valid feature file to copy');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(featureFile);
      alert('Feature file copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy feature file');
    }
  };

  const handleDownload = () => {
    if (!featureFile || featureFile.startsWith('Error:')) {
      alert('No valid feature file to download');
      return;
    }

    try {
      const blob = new Blob([featureFile], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${testCaseName || `testcase_${testcaseId}`}.feature`;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download feature file');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Spira Testcase to Feature File</h2>
      
      <div style={styles.inputContainer}>
        <label style={styles.label}>Enter Spira Testcase ID</label>
        <input
          type="text"
          value={testcaseId}
          onChange={(e) => setTestcaseId(e.target.value)}
          placeholder="e.g., TC12345"
          style={styles.input}
          disabled={isLoading}
        />
        <button 
          onClick={handleGenerateFeatureFile} 
          style={isLoading ? styles.buttonDisabled : styles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span style={styles.spinner}></span>
              Generating...
            </>
          ) : 'Generate Feature File'}
        </button>
      </div>

      <div style={styles.outputContainer}>
        <div style={styles.buttonGroup}>
          <button 
            onClick={handleCopyToClipboard}
            style={(!featureFile || featureFile.startsWith('Error:')) ? styles.actionButtonDisabled : styles.actionButton}
            disabled={!featureFile || featureFile.startsWith('Error:') || isLoading}
          >
            Copy to Clipboard
          </button>
          <button 
            onClick={handleDownload}
            style={(!featureFile || featureFile.startsWith('Error:')) ? styles.actionButtonDisabled : styles.actionButton}
            disabled={!featureFile || featureFile.startsWith('Error:') || isLoading}
          >
            Download {testCaseName ? `"${testCaseName}.feature"` : 'Feature File'}
          </button>
        </div>
        <label style={styles.label}>Feature File Output:</label>
        <textarea
          value={featureFile}
          readOnly
          placeholder={isLoading ? 'Generating feature file...' : 'The generated feature file will appear here...'}
          style={styles.output}
          rows={15}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  inputContainer: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
    transition: 'border 0.3s',
  },
  button: {
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
    color: '#666666',
    border: 'none',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '4px',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    marginRight: '8px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: '#fff',
    animation: 'spin 1s ease-in-out infinite',
  },
  outputContainer: {
    marginTop: '30px',
  },
  output: {
    width: '100%',
    padding: '15px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontFamily: 'monospace',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: '300px',
    backgroundColor: '#fefefe',
    lineHeight: '1.5',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  actionButton: {
    backgroundColor: '#5cb85c',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    flex: 1,
  },
  actionButtonDisabled: {
    backgroundColor: '#cccccc',
    color: '#666666',
    border: 'none',
    padding: '10px 20px',
    fontSize: '14px',
    borderRadius: '4px',
    cursor: 'not-allowed',
    flex: 1,
  },
};

// Add CSS animation for spinner
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`, styleSheet.cssRules.length);

export default SpiraFeatureGenerator;