import React, { useState } from 'react';

const SpiraFeatureGenerator = () => {
  const [testcaseId, setTestcaseId] = useState('');
  const [featureFile, setFeatureFile] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateFeatureFile = async () => {
    if (!testcaseId.trim()) {
      alert('Please enter a Spira Testcase ID');
      return;
    }

    setIsLoading(true);
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
        throw new Error(errorData.message || 'Failed to generate feature file');
      }

      const data = await response.text();
      // Directly set the response data to featureFile state
      const formattedFeature = data
  .replace(/\\n/g, '\n')
  .replace(/\\u003c/g, '<')
  .replace(/\\u003e/g, '>');
      setFeatureFile(formattedFeature); // Pretty print JSON
    } catch (error) {
      console.error('Error generating feature file:', error);
      setFeatureFile(`Error: ${error.message}`); // Display error in textarea
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Spira Testcase to Feature File</h2>
      
      <div style={styles.inputContainer}>
        <label style={styles.label}>Enter your Spira Testcase ID here</label>
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
          style={styles.button}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Feature File'}
        </button>
      </div>

      <div style={styles.outputContainer}>
        <label style={styles.label}>Feature File Output:</label>
        <textarea
          value={featureFile}
          readOnly
          placeholder="The generated feature file will appear here..."
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
  },
  inputContainer: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box',
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
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#3367d6',
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
  },
};

export default SpiraFeatureGenerator;