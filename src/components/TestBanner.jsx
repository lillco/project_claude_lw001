import { AlertTriangle } from 'lucide-react';
import { isTestEnvironment } from '../config/environment';

/**
 * TestBanner Component
 * 
 * Displays a prominent banner at the top of the page when running
 * in test environment (lwtest.lillco.de)
 */
export default function TestBanner() {
  if (!isTestEnvironment()) {
    return null;
  }

  return (
    <div 
      className="w-full py-3 px-4 text-white font-semibold text-center shadow-md"
      style={{ backgroundColor: '#F59E0B' }}
    >
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        <span>TESTUMGEBUNG — lwtest.lillco.de</span>
        <AlertTriangle className="w-5 h-5" />
      </div>
    </div>
  );
}
