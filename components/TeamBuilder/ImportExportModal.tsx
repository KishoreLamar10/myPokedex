'use client';

import { useState } from 'react';
import type { TeamMember } from '@/types/team';
import { exportToShowdown, exportToJSON, generateShareableURL, copyToClipboard, downloadTeamFile } from '@/lib/teamExport';
import { autoParseTeam, validateTeam } from '@/lib/teamImport';

interface ImportExportModalProps {
  team: TeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onImport: (team: TeamMember[]) => void;
}

export function ImportExportModal({ team, isOpen, onClose, onImport }: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'share'>('export');
  const [exportFormat, setExportFormat] = useState<'showdown' | 'json'>('showdown');
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    const content = exportFormat === 'showdown' ? exportToShowdown(team) : exportToJSON(team);
    return content;
  };

  const handleCopy = async () => {
    const content = handleExport();
    const success = await copyToClipboard(content);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadTeamFile(team, exportFormat);
  };

  const handleImport = () => {
    setImportError('');
    try {
      const importedTeam = autoParseTeam(importText);
      const validation = validateTeam(importedTeam);
      
      if (!validation.valid) {
        setImportError(validation.errors.join(', '));
        return;
      }
      
      onImport(importedTeam);
      setImportText('');
      onClose();
    } catch (error) {
      setImportError('Failed to parse team data');
    }
  };

  const shareableURL = generateShareableURL(team);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-900/95 border-2 border-zinc-700 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Team Import/Export</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition text-white text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeTab === 'export'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeTab === 'import'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Import
            </button>
            <button
              onClick={() => setActiveTab('share')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                activeTab === 'share'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Share
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Format</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportFormat('showdown')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      exportFormat === 'showdown'
                        ? 'bg-zinc-700 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Pokémon Showdown
                  </button>
                  <button
                    onClick={() => setExportFormat('json')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                      exportFormat === 'json'
                        ? 'bg-zinc-700 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Team Data</label>
                <textarea
                  value={handleExport()}
                  readOnly
                  className="w-full h-64 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 font-mono resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                >
                  {copySuccess ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-lg bg-zinc-700 text-white font-semibold hover:bg-zinc-600 transition"
                >
                  Download
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">
                  Paste Team Data (Showdown, JSON, or URL)
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste your team here..."
                  className="w-full h-64 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {importError && (
                <div className="p-3 rounded-lg bg-red-900/50 border border-red-700 text-sm text-red-200">
                  {importError}
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="w-full px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Team
              </button>
            </div>
          )}

          {activeTab === 'share' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-2">Shareable URL</label>
                <div className="flex gap-2">
                  <input
                    value={shareableURL}
                    readOnly
                    className="flex-1 p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 font-mono"
                  />
                  <button
                    onClick={async () => {
                      const success = await copyToClipboard(shareableURL);
                      if (success) {
                        setCopySuccess(true);
                        setTimeout(() => setCopySuccess(false), 2000);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  >
                    {copySuccess ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <p className="text-sm text-zinc-400">
                  Share this URL with others to let them import your team directly!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
