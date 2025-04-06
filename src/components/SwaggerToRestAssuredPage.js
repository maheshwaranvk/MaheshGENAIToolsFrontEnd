import React, { useState, useRef } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-textmate';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-text';

function GenerateCodePage() {
  const [swaggerFile, setSwaggerFile] = useState(null);
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [apiDetails, setApiDetails] = useState('');
  const [featureFile, setFeatureFile] = useState('');
  const [apiClass, setApiClass] = useState('');
  const [pojos, setPojos] = useState('');
  const [stepDefinition, setStepDefinition] = useState('');
  const [testTypes, setTestTypes] = useState({
    positive: false,
    negative: false,
    edge: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  const handleTestTypeChange = (e) => {
    const { name, checked } = e.target;
    setTestTypes((prev) => ({ ...prev, [name]: checked }));
  };

  async function handleParseSwagger() {
    if (!swaggerFile && !swaggerUrl.trim()) {
      alert('Please provide a Swagger file or URL');
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (swaggerFile) {
        formData.append('file', swaggerFile);
      } else {
        alert('URL parsing not implemented; please upload a file.');
        return;
      }
      const response = await fetch('http://localhost:8080/api/parseSwagger', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errMsg = await response.text();
        alert('Parse failed: ' + errMsg);
        return;
      }
      const details = await response.text();
      setApiDetails(details);
    } catch (err) {
      console.error(err);
      alert('Error parsing swagger: ' + err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenerateTests() {
    if (!apiDetails.trim()) {
      alert('No API details found. Parse the Swagger first.');
      return;
    }
    setIsLoading(true);
    try {
      const selectedTestTypes = Object.keys(testTypes).filter((key) => testTypes[key]);
      const requestBody = { apiDetails, testTypes: selectedTestTypes };
      const response = await fetch('http://localhost:8080/api/generateCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errMsg = await response.text();
        alert('Generate Tests failed: ' + errMsg);
        return;
      }

      const resData = await response.json();
      if (resData.error) {
        alert('Error: ' + resData.error);
        return;
      }

      setFeatureFile(cleanCode(resData.featureFile));
      setApiClass(cleanCode(resData.apiClass));
      setPojos(cleanCode(resData.pojos));
      setStepDefinition(cleanCode(resData.stepDefinition));
    } catch (err) {
      console.error(err);
      alert('Error generating tests: ' + err);
    } finally {
      setIsLoading(false);
    }
  }

  const cleanCode = (code) => {
    if (!code) return '';
    return code.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => alert('Copied to clipboard'))
      .catch((err) => alert('Failed to copy: ' + err));
  };

  const getJavaClassName = (code) => {
    const match = code.match(/public\s+class\s+(\w+)/);
    return match ? `${match[1]}.java` : 'GeneratedFile.java';
  };

  const getFeatureFileName = (featureCode) => {
    if (!featureCode) return 'GeneratedFeature.feature';

    const match = featureCode.match(/Feature:\s+([A-Za-z]+)/i);
    if (match) {
      return `${match[1].toLowerCase()}.feature`; // Convert to lowercase for filenames
    }
    return 'GeneratedFeature.feature';
  };

  const downloadFile = (content, fileName) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="main-content">
      <h2>Generate Rest-Assured Code</h2>

      <div className="section">
        <label>Upload Swagger File: </label>
        <input
          type="file"
          ref={fileInputRef}
          accept=".yml,.yaml,.json"
          onChange={(e) => setSwaggerFile(e.target.files[0])}
        />
        <br />
        <button onClick={handleParseSwagger} disabled={isLoading}>
          {isLoading ? 'Parsing...' : 'Parse Swagger'}
        </button>
      </div>

      <div className="section">
        <h4>Parsed API Details</h4>
        <textarea
          rows="5"
          style={{ width: '100%' }}
          value={apiDetails}
          onChange={(e) => setApiDetails(e.target.value)}
        />
        <br /><br />
        <label>Test Type: </label>
        <div className="test-type-container">
          <label>
            <input
              type="checkbox"
              name="positive"
              checked={testTypes.positive}
              onChange={handleTestTypeChange}
            /> Positive
          </label>
          <label>
            <input
              type="checkbox"
              name="negative"
              checked={testTypes.negative}
              onChange={handleTestTypeChange}
            /> Negative
          </label>
          <label>
            <input
              type="checkbox"
              name="edge"
              checked={testTypes.edge}
              onChange={handleTestTypeChange}
            /> Edge
          </label>
        </div>
        <br />
        <button onClick={handleGenerateTests} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Tests'}
        </button>
      </div>

      {isLoading && <div className="loading-spinner"></div>}

      {featureFile && (
        <div className="section">
          <h4>Generated Feature File (Gherkin)</h4>
          <AceEditor
            mode="text"
            theme="textmate"
            name="featureEditor"
            width="100%"
            height="200px"
            fontSize={14}
            value={featureFile}
            onChange={(newValue) => setFeatureFile(newValue)}
            editorProps={{ $blockScrolling: true }}
            setOptions={{ useWorker: false }}
          />
          <div style={{ marginTop: '5px' }}>
            <button onClick={() => copyToClipboard(featureFile)}>Copy</button>
            <button
              onClick={() => downloadFile(featureFile, getFeatureFileName(featureFile))}
              style={{ marginLeft: '10px' }}
            >
              Download
            </button>
          </div>
        </div>
      )}

      {apiClass && (
        <div className="section">
          <h4>Generated API Class (Java)</h4>
          <AceEditor
            mode="java"
            theme="textmate"
            name="apiEditor"
            width="100%"
            height="300px"
            fontSize={14}
            value={apiClass}
            onChange={(newValue) => setApiClass(newValue)}
            editorProps={{ $blockScrolling: true }}
            setOptions={{ useWorker: false }}
          />
          <div style={{ marginTop: '5px' }}>
            <button onClick={() => copyToClipboard(apiClass)}>Copy</button>
            <button
              onClick={() => downloadFile(apiClass, getJavaClassName(apiClass))}
              style={{ marginLeft: '10px' }}
            >
              Download
            </button>
          </div>
        </div>
      )}

      {pojos && (
        <div className="section">
          <h4>Generated POJOs (Java)</h4>
          <AceEditor
            mode="java"
            theme="textmate"
            name="pojosEditor"
            width="100%"
            height="300px"
            fontSize={14}
            value={pojos}
            onChange={(newValue) => setPojos(newValue)}
            editorProps={{ $blockScrolling: true }}
            setOptions={{ useWorker: false }}
          />
          <div style={{ marginTop: '5px' }}>
            <button onClick={() => copyToClipboard(pojos)}>Copy</button>
            <button
              onClick={() => downloadFile(pojos, getJavaClassName(pojos))}
              style={{ marginLeft: '10px' }}
            >
              Download
            </button>
          </div>
        </div>
      )}

      {stepDefinition && (
        <div className="section">
          <h4>Generated Step Definitions (Java)</h4>
          <AceEditor
            mode="java"
            theme="textmate"
            name="stepsEditor"
            width="100%"
            height="300px"
            fontSize={14}
            value={stepDefinition}
            onChange={(newValue) => setStepDefinition(newValue)}
            editorProps={{ $blockScrolling: true }}
            setOptions={{ useWorker: false }}
          />
          <div style={{ marginTop: '5px' }}>
            <button onClick={() => copyToClipboard(stepDefinition)}>Copy</button>
            <button
              onClick={() => downloadFile(stepDefinition, getJavaClassName(stepDefinition))}
              style={{ marginLeft: '10px' }}
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerateCodePage;
