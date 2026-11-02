import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { VehicleRegistry } from './components/VehicleRegistry';
import { FuelManagement } from './components/FuelManagement';
import { RepairManagement } from './components/RepairManagement';
import { ConsumptionAnalytics } from './components/ConsumptionAnalytics';
import { BackupRestore } from './components/BackupRestore';
import { PrintForm6 } from './components/PrintForm6';
import { PrintFuelSummary } from './components/PrintFuelSummary';
import { VehicleDetailModal } from './components/VehicleDetailModal';
import {
  Vehicle,
  FuelLog,
  RepairRecord,
  SystemSettings,
} from './types';
import {
  loadVehicles,
  saveVehicles,
  loadFuelLogs,
  saveFuelLogs,
  loadRepairs,
  saveRepairs,
  loadSettings,
  saveSettings,
} from './utils/storage';

export default function App() {
  // Primary datasets
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadVehicles());
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(() => loadFuelLogs());
  const [repairs, setRepairs] = useState<RepairRecord[]>(() => loadRepairs());
  const [settings, setSettings] = useState<SystemSettings>(() => loadSettings());

  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Print Views
  const [printForm6Record, setPrintForm6Record] = useState<RepairRecord | null>(null);
  const [printFuelParams, setPrintFuelParams] = useState<{
    month: string;
    fiscalYear: number;
    department: string;
    fuelCategory: string;
  } | null>(null);

  // Vehicle Detail Modal
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);

  // Direct modal trigger from Quick Add in Navbar
  const [directAddType, setDirectAddType] = useState<'vehicle' | 'fuel' | 'repair' | null>(null);

  // Persist state changes
  useEffect(() => {
    saveVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    saveFuelLogs(fuelLogs);
  }, [fuelLogs]);

  useEffect(() => {
    saveRepairs(repairs);
  }, [repairs]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Refresh datasets from storage (e.g. after JSON restore or demo reset)
  const handleReloadFromStorage = () => {
    setVehicles(loadVehicles());
    setFuelLogs(loadFuelLogs());
    setRepairs(loadRepairs());
    setSettings(loadSettings());
  };

  // Handlers for Vehicles
  const handleAddVehicle = (newVeh: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created: Vehicle = {
      ...newVeh,
      id: `veh-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVehicles(prev => [created, ...prev]);
  };

  const handleUpdateVehicle = (updatedVeh: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === updatedVeh.id ? updatedVeh : v));
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Handlers for Fuel Logs
  const handleAddFuelLog = (newLog: Omit<FuelLog, 'id' | 'createdAt'>) => {
    const created: FuelLog = {
      ...newLog,
      id: `fuel-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setFuelLogs(prev => [created, ...prev]);

    // Also update vehicle's current odometer if new log has higher odometer
    if (newLog.endOdometer > 0) {
      setVehicles(prev => prev.map(v => {
        if (v.id === newLog.vehicleId && newLog.endOdometer > v.currentOdometer) {
          return { ...v, currentOdometer: newLog.endOdometer, updatedAt: new Date().toISOString() };
        }
        return v;
      }));
    }
  };

  const handleUpdateFuelLog = (updatedLog: FuelLog) => {
    setFuelLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const handleDeleteFuelLog = (id: string) => {
    setFuelLogs(prev => prev.filter(l => l.id !== id));
  };

  // Handlers for Repairs
  const handleAddRepair = (newRep: Omit<RepairRecord, 'id' | 'createdAt'>) => {
    const created: RepairRecord = {
      ...newRep,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRepairs(prev => [created, ...prev]);
  };

  const handleUpdateRepair = (updatedRep: RepairRecord) => {
    setRepairs(prev => prev.map(r => r.id === updatedRep.id ? updatedRep : r));
  };

  const handleDeleteRepair = (id: string) => {
    setRepairs(prev => prev.filter(r => r.id !== id));
  };

  // Quick Action Handler from Navbar
  const handleQuickAdd = (type: 'vehicle' | 'fuel' | 'repair') => {
    if (type === 'vehicle') {
      setActiveTab('vehicles');
      setDirectAddType('vehicle');
    } else if (type === 'fuel') {
      setActiveTab('fuel');
      setDirectAddType('fuel');
    } else if (type === 'repair') {
      setActiveTab('repairs');
      setDirectAddType('repair');
    }
  };

  // Render Print Form 6 View if active
  if (printForm6Record) {
    return (
      <div className="min-h-screen bg-slate-100 py-6 px-4">
        <PrintForm6
          repair={printForm6Record}
          settings={settings}
          onBack={() => setPrintForm6Record(null)}
        />
      </div>
    );
  }

  // Render Print Monthly Fuel Summary View if active
  if (printFuelParams) {
    const filteredForPrint = fuelLogs.filter(f => {
      const matchYear = f.fiscalYear === printFuelParams.fiscalYear;
      const matchMonth = printFuelParams.month === 'all' || f.date.split('-')[1] === printFuelParams.month;
      const matchDept = printFuelParams.department === 'all' || f.department === printFuelParams.department;
      const matchCat = printFuelParams.fuelCategory === 'all' || f.fuelCategory === printFuelParams.fuelCategory;
      return matchYear && matchMonth && matchDept && matchCat;
    });

    return (
      <div className="min-h-screen bg-slate-100 py-6 px-4">
        <PrintFuelSummary
          logs={filteredForPrint}
          settings={settings}
          month={printFuelParams.month}
          fiscalYear={printFuelParams.fiscalYear}
          department={printFuelParams.department}
          fuelCategory={printFuelParams.fuelCategory}
          onBack={() => setPrintFuelParams(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setDirectAddType(null);
        }}
        onQuickAdd={handleQuickAdd}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            vehicles={vehicles}
            fuelLogs={fuelLogs}
            repairs={repairs}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setDirectAddType(null);
            }}
            onSelectVehicle={(veh) => setSelectedVehicleForDetail(veh)}
            onOpenRepairForm6={(rep) => setPrintForm6Record(rep)}
          />
        )}

        {activeTab === 'vehicles' && (
          <VehicleRegistry
            vehicles={vehicles}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onSelectVehicle={(veh) => setSelectedVehicleForDetail(veh)}
            openCreateModalDirectly={directAddType === 'vehicle'}
            onCloseCreateModalDirectly={() => setDirectAddType(null)}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelManagement
            fuelLogs={fuelLogs}
            vehicles={vehicles}
            onAddFuelLog={handleAddFuelLog}
            onUpdateFuelLog={handleUpdateFuelLog}
            onDeleteFuelLog={handleDeleteFuelLog}
            onOpenPrintSummary={(month, fiscalYear, department, fuelCategory) => {
              setPrintFuelParams({ month, fiscalYear, department, fuelCategory });
            }}
            openCreateModalDirectly={directAddType === 'fuel'}
            onCloseCreateModalDirectly={() => setDirectAddType(null)}
          />
        )}

        {activeTab === 'repairs' && (
          <RepairManagement
            repairs={repairs}
            vehicles={vehicles}
            settings={settings}
            onAddRepair={handleAddRepair}
            onUpdateRepair={handleUpdateRepair}
            onDeleteRepair={handleDeleteRepair}
            onOpenForm6={(rep) => setPrintForm6Record(rep)}
            openCreateModalDirectly={directAddType === 'repair'}
            onCloseCreateModalDirectly={() => setDirectAddType(null)}
          />
        )}

        {activeTab === 'analytics' && (
          <ConsumptionAnalytics
            vehicles={vehicles}
            fuelLogs={fuelLogs}
            onSelectVehicle={(veh) => setSelectedVehicleForDetail(veh)}
          />
        )}

        {activeTab === 'backup' && (
          <BackupRestore
            settings={settings}
            onUpdateSettings={setSettings}
            onDataChanged={handleReloadFromStorage}
            vehiclesCount={vehicles.length}
            fuelLogsCount={fuelLogs.length}
            repairsCount={repairs.length}
          />
        )}
      </main>

      {/* Vehicle Detail Ledger Modal */}
      {selectedVehicleForDetail && (
        <VehicleDetailModal
          vehicle={selectedVehicleForDetail}
          fuelLogs={fuelLogs}
          repairs={repairs}
          onClose={() => setSelectedVehicleForDetail(null)}
          onOpenForm6={(rep) => setPrintForm6Record(rep)}
        />
      )}

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <strong>{settings.municipalityName}</strong> · ระบบควบคุมยานพาหนะ เครื่องจักร และเครื่องมือ (คุมน้ำมัน & ซ่อมแบบ 6)
          </div>
          <div className="flex items-center gap-4">
            <span>ทำงานแบบ Offline ในเครื่อง 100%</span>
            <span>·</span>
            <a
              href="https://www.facebook.com/profile.php?id=61558331771664"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline font-medium"
            >
              คลังระบบ อปท.
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
