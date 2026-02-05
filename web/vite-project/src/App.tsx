import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkflowOrchestrator } from './components/WorkflowUIOrchestrator';
// import { WorkflowOrchestrator } from './components/WorkflowOrchestrator';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/workflow/new" replace />} />
          <Route path="/workflow/:id" element={<WorkflowOrchestrator />} />
          <Route path="/workflow/:id/:state" element={<WorkflowOrchestrator />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
