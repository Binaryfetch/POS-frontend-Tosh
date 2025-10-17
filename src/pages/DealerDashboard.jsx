import React, { useState, useEffect } from "react";
import { getWalletBalance, getWalletTransactions, getUserInvoices } from "../api/api";
import ProductsView from "../components/ProductsView";
import ContentView from "../components/ContentView";

export default function DealerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceRes, transactionsRes, invoicesRes] = await Promise.all([
        getWalletBalance(),
        getWalletTransactions(),
        getUserInvoices()
      ]);
      setWalletBalance(balanceRes.data.balance);
      setTransactions(transactionsRes.data.transactions);
      setInvoices(invoicesRes.data.invoices);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dealer Dashboard</h1>
            <p className="text-gray-600 text-lg">Welcome to your dealer portal</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600">{walletBalance.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Wallet Balance</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">📦</span>
                <span>Products</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'wallet'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">💰</span>
                <span>Wallet</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                activeTab === 'content'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">📁</span>
                <span>SN News</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Wallet Summary */}
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6 border border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-primary-800">Wallet Balance</h3>
                    <p className="text-primary-700">Your current reward points</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-600">{walletBalance.toLocaleString()}</div>
                    <div className="text-sm text-primary-500">points</div>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📊</div>
                    <p className="text-gray-500">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map(transaction => (
                      <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            <span className="text-sm">
                              {transaction.type === 'Credit' ? '⬆️' : '⬇️'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.type}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ${
                          transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'Credit' ? '+' : '-'}{transaction.points.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'wallet' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">Wallet History</h2>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">💰</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No wallet activity</h3>
                  <p className="text-gray-500">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map(transaction => (
                    <div key={transaction._id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            <span className="text-lg">
                              {transaction.type === 'Credit' ? '⬆️' : '⬇️'}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">{transaction.type} Transaction</h3>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${
                            transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'Credit' ? '+' : '-'}{transaction.points.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        
          {activeTab === 'content' && <ContentView />}
        </div>
      </div>
    </div>
  );
}