import React, { useState, useEffect } from 'react';
import { Terminal, FileText, GitBranch, Network } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SystemManagementInterface = ({ aceData, holofsState }) => {
  // Core system states
  const [currentPath, setCurrentPath] = useState('/artifacts');
  const [processedFiles, setProcessedFiles] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    aceIntegration: 0,
    holofsStatus: 0,
    dataProcessing: 0
  });

  // ACE system tracking
  const [aceMetrics] = useState({
    priorities: [
      'Natural Formatting Module',
      'Contextual Repair System',
      'Summary Generation',
      'Pipeline Integration',
      'Data Validation'
    ],
    stageTracking: {
      priming: 0,
      comprehension: 0,
      contextClarity: 0,
      elicitationDepth: 0,
      recursion: 0
    },
    processStatus: {
      formatting: false,
      repair: false,
      summary: false,
      pipeline: false,
      validation: false
    }
  });

  // HOLOFS virtual filesystem state
  const [fileSystem] = useState({
    currentDirectory: '/artifacts',
    activeFiles: [],
    mountedSources: [],
    processingQueue: []
  });

  // Simulate system health updates
  useEffect(() => {
    const updateHealth = () => {
      setSystemHealth(prev => ({
        aceIntegration: Math.min(100, prev.aceIntegration + 5),
        holofsStatus: Math.min(100, prev.holofsStatus + 3),
        dataProcessing: Math.min(100, prev.dataProcessing + 4)
      }));
    };
    const interval = setInterval(updateHealth, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <CardTitle>Transcript Processing System Interface</CardTitle>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Active Files: {fileSystem.activeFiles.length}
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              Processed: {processedFiles.length}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-4">
          {/* System Status Overview */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(systemHealth).map(([key, value]) => (
              <div key={key} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="mt-1 h-2 bg-gray-200 rounded">
                  <div 
                    className="h-full bg-green-500 rounded transition-all duration-500" 
                    style={{width: `${value}%`}}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ACE Module Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Network className="w-4 h-4" />
              Module Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {aceMetrics.priorities.map((module, index) => (
                <div key={index} className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm font-medium">{module}</div>
                  <div className="mt-1 h-2 bg-blue-100 rounded">
                    <div 
                      className="h-full bg-blue-500 rounded transition-all duration-500" 
                      style={{width: `${Math.random() * 100}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Processing Alert */}
          {activeSession && (
            <Alert>
              <AlertDescription>
                Active Processing Session: {activeSession}
                <div className="text-sm text-gray-500 mt-1">
                  Processing Pipeline: Formatting → Repair → Summary
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* ACE Stage Progress */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Processing Stage Progress</h3>
            <div className="space-y-2">
              {Object.entries(aceMetrics.stageTracking).map(([stage, progress]) => (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize">{stage.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded">
                    <div 
                      className="h-full bg-green-500 rounded transition-all duration-500" 
                      style={{width: `${progress}%`}}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemManagementInterface;
