
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ITreeNode } from './types';
import { 
  insertNode, 
  deleteNode, 
  cloneTree, 
  editNodeValue, 
  treeToYaml, 
  yamlToTreeResult,
  getTraversal,
  getNodesInRange,
  tryFixYamlIndentation
} from './services/treeLogic';
import TreeVisualizer from './components/TreeVisualizer';

const App: React.FC = () => {
  const [root, setRoot] = useState<ITreeNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ id: string; value: number } | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [yamlInput, setYamlInput] = useState<string>('');
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'controls' | 'yaml' | 'traversal'>('controls');
  const [statusMessage, setStatusMessage] = useState<string>('Welcome to TreeYAML Architect');
  
  // Range filter state for Feature Set 1
  const [rangeMin, setRangeMin] = useState<number>(0);
  const [rangeMax, setRangeMax] = useState<number>(100);

  // Handle auto-updating YAML when tree changes (visual -> text)
  useEffect(() => {
    const yaml = treeToYaml(root);
    setYamlInput(yaml);
    setYamlError(null);
  }, [root]);

  const flashStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage('Ready'), 3000);
  };

  const handleAdd = useCallback(() => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    
    setRoot(prev => {
      const newTree = cloneTree(prev);
      const updated = insertNode(newTree, val);
      return updated;
    });
    setInputValue('');
    flashStatus(`Inserted node ${val}`);
  }, [inputValue]);

  const handleDelete = useCallback(() => {
    if (!selectedNode) return;
    setRoot(prev => {
      const newTree = cloneTree(prev);
      return deleteNode(newTree, selectedNode.value);
    });
    setSelectedNode(null);
    flashStatus(`Deleted node ${selectedNode.value}`);
  }, [selectedNode]);

  const handleEdit = useCallback(() => {
    const val = parseInt(inputValue);
    if (isNaN(val) || !selectedNode) return;
    
    setRoot(prev => {
      const newTree = cloneTree(prev);
      return editNodeValue(newTree, selectedNode.id, val);
    });
    setSelectedNode({ ...selectedNode, value: val });
    setInputValue('');
    flashStatus(`Updated node to ${val}`);
  }, [inputValue, selectedNode]);

  const handleClear = useCallback(() => {
    if (confirm('Clear entire tree?')) {
      setRoot(null);
      setSelectedNode(null);
      flashStatus('Tree cleared');
    }
  }, []);

  const handleImportYaml = useCallback(() => {
    const result = yamlToTreeResult(yamlInput);
    if (result.error) {
      setYamlError(result.error);
    } else {
      setRoot(result.tree);
      setYamlError(null);
      flashStatus('YAML synced successfully');
    }
  }, [yamlInput]);

  const handleHeuristicFix = useCallback(() => {
    const fixed = tryFixYamlIndentation(yamlInput);
    setYamlInput(fixed);
    const result = yamlToTreeResult(fixed);
    if (!result.error) {
      setYamlError(null);
      flashStatus('YAML structure repaired');
    } else {
      setYamlError(`Repair incomplete: ${result.error}`);
    }
  }, [yamlInput]);

  const traversalData = useMemo(() => {
    return {
      inorder: getTraversal(root, 'inorder'),
      preorder: getTraversal(root, 'preorder'),
      postorder: getTraversal(root, 'postorder'),
      range: getNodesInRange(root, rangeMin, rangeMax)
    };
  }, [root, rangeMin, rangeMax]);

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-diagram-project text-white"></i>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            TreeYAML Architect
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${yamlError ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></span>
            {yamlError ? 'YAML Error Detected' : statusMessage}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Sidebar / Controls */}
        <div className="w-96 flex flex-col gap-6">
          <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
            <div className="flex border-b border-slate-800 bg-slate-900/80">
              {(['controls', 'yaml', 'traversal'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-bold transition-all ${
                    activeTab === tab 
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 text-slate-300">
              {activeTab === 'controls' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Node Manipulation</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Enter value..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                      />
                      <button
                        onClick={handleAdd}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {selectedNode ? (
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-blue-300">Selected Node: <span className="text-white ml-1">{selectedNode.value}</span></span>
                        <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors">
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleEdit}
                          disabled={!inputValue}
                          className="flex-1 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 disabled:opacity-50 text-amber-400 py-2 rounded-lg font-bold text-xs transition-all active:scale-95"
                        >
                          Update Value
                        </button>
                        <button
                          onClick={handleDelete}
                          className="flex-1 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 py-2 rounded-lg font-bold text-xs transition-all active:scale-95"
                        >
                          Delete Node
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                      <i className="fa-solid fa-arrow-pointer mb-2 block opacity-30"></i>
                      <p className="text-xs italic leading-relaxed">Select a node in the graph to modify its properties.</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800">
                    <button
                      onClick={handleClear}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white py-2 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-eraser"></i>
                      Clear All
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'yaml' && (
                <div className="h-full flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">YAML Schema</label>
                    <div className="flex gap-2">
                      <button
                        onClick={handleHeuristicFix}
                        className="text-[10px] bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded font-bold transition-all"
                        title="Fix common indentation errors like 'duplicated mapping key'"
                      >
                        Auto-Fix Indent
                      </button>
                      <button
                        onClick={handleImportYaml}
                        className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded font-bold transition-all shadow-md shadow-blue-500/10"
                      >
                        Parse & Sync
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 relative flex flex-col gap-2">
                    <textarea
                      value={yamlInput}
                      onChange={(e) => {
                        setYamlInput(e.target.value);
                        if (yamlError) setYamlError(null);
                      }}
                      className={`flex-1 bg-slate-950 border ${yamlError ? 'border-red-500/50 focus:ring-red-500/30' : 'border-slate-800 focus:ring-blue-500/30'} rounded-xl p-4 mono text-[11px] text-blue-300 focus:outline-none focus:ring-4 resize-none leading-relaxed transition-all`}
                      spellCheck={false}
                      placeholder="value: 10\nleft:\n  value: 5"
                    />
                    
                    {yamlError && (
                      <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-3 text-[10px] text-red-300 mono whitespace-pre-wrap leading-tight">
                        <div className="flex items-center gap-2 mb-1 font-bold uppercase tracking-wider text-red-400">
                          <i className="fa-solid fa-circle-exclamation"></i>
                          Indentation/Format Error
                        </div>
                        {yamlError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'traversal' && (
                <div className="space-y-6">
                  {/* Range Printer UI */}
                  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 space-y-3 shadow-inner">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Range Printer (min - max)</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={rangeMin} 
                        onChange={(e) => setRangeMin(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mono focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                      <span className="text-slate-600">to</span>
                      <input 
                        type="number" 
                        value={rangeMax} 
                        onChange={(e) => setRangeMax(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mono focus:ring-1 focus:ring-blue-500 outline-none" 
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1 min-h-[1.5rem]">
                      {traversalData.range.length === 0 ? <span className="text-slate-600 text-[10px] italic">No matches</span> : 
                        traversalData.range.map((v, i) => (
                          <span key={i} className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] mono">{v}</span>
                        ))
                      }
                    </div>
                  </div>

                  <div className="space-y-6 pt-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">In-order (L-Root-R)</label>
                      <div className="flex flex-wrap gap-2">
                        {traversalData.inorder.length === 0 ? <span className="text-slate-700 text-[11px] mono italic">Empty</span> : 
                          traversalData.inorder.map((v, i) => (
                            <span key={i} className="bg-slate-800/80 border border-slate-700/50 text-blue-300 px-2 py-1 rounded text-xs mono">{v}</span>
                          ))
                        }
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Pre-order (Root-L-R)</label>
                      <div className="flex flex-wrap gap-2">
                        {traversalData.preorder.length === 0 ? <span className="text-slate-700 text-[11px] mono italic">Empty</span> : 
                          traversalData.preorder.map((v, i) => (
                            <span key={i} className="bg-slate-800/80 border border-slate-700/50 text-emerald-300 px-2 py-1 rounded text-xs mono">{v}</span>
                          ))
                        }
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Post-order (L-R-Root)</label>
                      <div className="flex flex-wrap gap-2">
                        {traversalData.postorder.length === 0 ? <span className="text-slate-700 text-[11px] mono italic">Empty</span> : 
                          traversalData.postorder.map((v, i) => (
                            <span key={i} className="bg-slate-800/80 border border-slate-700/50 text-amber-300 px-2 py-1 rounded text-xs mono">{v}</span>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main View Area */}
        <div className="flex-1 relative flex flex-col gap-4">
           <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
              <TreeVisualizer 
                data={root} 
                selectedId={selectedNode?.id || null} 
                onNodeClick={(id, value) => setSelectedNode({ id, value })}
              />
              
              <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
                <div className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2 shadow-lg">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                   BST Optimized
                </div>
                <div className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-800 text-[10px] text-slate-300 flex items-center gap-2 shadow-lg">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                   D3 Renderer
                </div>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/60 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-800 text-[10px] text-slate-500 flex gap-6 select-none">
                <span className="flex items-center gap-1"><i className="fa-solid fa-arrows-up-down-left-right text-[8px]"></i> Drag Pan</span>
                <span className="flex items-center gap-1"><i className="fa-solid fa-mouse text-[8px]"></i> Scroll Zoom</span>
                <span className="flex items-center gap-1"><i className="fa-solid fa-hand-pointer text-[8px]"></i> Click Node</span>
              </div>
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 bg-slate-900 border-t border-slate-800 px-8 flex items-center justify-between text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">
         <div className="flex items-center gap-2">
           <span className="text-blue-500/50">Core</span> BinaryTree v1.0.2
         </div>
         <div className="flex gap-8">
            <span className="flex items-center gap-2">React 19</span>
            <span className="flex items-center gap-2">YAML Engine</span>
            <span className="flex items-center gap-2">D3 Integration</span>
         </div>
      </footer>
    </div>
  );
};

export default App;
