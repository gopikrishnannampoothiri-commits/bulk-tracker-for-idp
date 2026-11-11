import React, { useState } from 'react';
import {
  BulkOperationsProvider,
  useBulkOperations,
} from './context/BulkOperationsContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AllUsersView } from './components/AllUsersView';
import { BulkOperationsDatatableView } from './components/BulkOperationsDatatableView';
import { DetailedActionView } from './components/DetailedActionView';
import { InlineFixModal } from './components/InlineFixModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { FailureDiagnostic } from './types';

function AppContent() {
  const { currentView } = useBulkOperations();
  const [inlineFixModal, setInlineFixModal] = useState<{
    isOpen: boolean;
    operationId: string | null;
    failure: FailureDiagnostic | null;
  }>({
    isOpen: false,
    operationId: null,
    failure: null,
  });

  const handleOpenInlineFix = (operationId: string, failure: FailureDiagnostic) => {
    setInlineFixModal({
      isOpen: true,
      operationId,
      failure,
    });
  };

  const handleCloseInlineFix = () => {
    setInlineFixModal({
      isOpen: false,
      operationId: null,
      failure: null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Hexnode IDP Navigation Header & Global Utility Tray */}
      <Header />

      {/* Main View Router */}
      <div className="flex-1">
        {currentView === 'dashboard' && <DashboardView />}

        {currentView === 'users' && <AllUsersView />}

        {currentView === 'bulk_operations_datatable' && <BulkOperationsDatatableView />}

        {currentView === 'detailed_action' && (
          <DetailedActionView onOpenInlineFixModal={handleOpenInlineFix} />
        )}
      </div>

      {/* Enterprise Footer */}
      <Footer />

      {/* Inline Fix Diagnostic Modal */}
      <InlineFixModal
        isOpen={inlineFixModal.isOpen}
        operationId={inlineFixModal.operationId}
        failure={inlineFixModal.failure}
        onClose={handleCloseInlineFix}
      />

      {/* Live Toast Alerts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BulkOperationsProvider>
      <AppContent />
    </BulkOperationsProvider>
  );
}
