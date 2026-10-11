import { useState, useEffect } from 'react';
import { useNavigate } from '../navigation';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Package, LayoutDashboard, ShoppingCart, Users, RefreshCcw, Tag, Receipt, Truck, IndianRupee } from 'lucide-react';
import DashboardTab from './admin/DashboardTab';
import FruitManagement from './admin/FruitManagement';
import OrderManagement from './admin/OrderManagement';
import InventoryManagement from './admin/InventoryManagement';
import CustomerManagement from './admin/CustomerManagement';
import SalesManagement from './admin/SalesManagement';
import ReturnManagement from './admin/ReturnManagement';
import CouponsManagement from './admin/CouponsManagement';
import ExpenseManagement from './admin/ExpenseManagement';
import { ClipboardList } from 'lucide-react';

type Tab = 'dashboard' | 'fruits' | 'orders' | 'inventory' | 'customers' | 'sales' | 'returns' | 'coupons' | 'expenses';

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'fruits' as Tab, label: 'Fruits', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'orders' as Tab, label: 'Orders', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'inventory' as Tab, label: 'Inventory', icon: <Package className="w-4 h-4" /> },
    { id: 'customers' as Tab, label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'sales' as Tab, label: 'Sales', icon: <IndianRupee className="w-4 h-4" /> },
    { id: 'returns' as Tab, label: 'Returns', icon: <RefreshCcw className="w-4 h-4" /> },
    { id: 'coupons' as Tab, label: 'Coupons', icon: <Tag className="w-4 h-4" /> },
    { id: 'expenses' as Tab, label: 'Expenses', icon: <Receipt className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-orange-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-orange-600" />
          Admin Dashboard
        </h1>
        <p className="text-orange-600 mt-1">Manage your fruit shop inventory, sales, returns, and more</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-orange-200 pb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-semibold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-orange-700 border border-orange-200 border-b-white -mb-px shadow-sm'
                : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'fruits' && <FruitManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'inventory' && <InventoryManagement />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'sales' && <SalesManagement />}
        {activeTab === 'returns' && <ReturnManagement />}
        {activeTab === 'coupons' && <CouponsManagement />}
        {activeTab === 'expenses' && <ExpenseManagement />}
      </div>
    </div>
  );
}
