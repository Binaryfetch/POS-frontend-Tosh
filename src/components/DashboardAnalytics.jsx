import React, { useState, useEffect } from "react";
import { getDistributors, getAllDealers, getInvoiceSummary, getAllInvoices, getAllWallets } from "../api/api";

export default function DashboardAnalytics() {
  const [analytics, setAnalytics] = useState({
    distributors: [],
    dealers: [],
    invoices: [],
    wallets: [],
    summary: null
  });
  const [loading, setLoading] = useState(false);
  const [activeChart, setActiveChart] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [distributorsRes, dealersRes, invoicesRes, walletsRes, summaryRes] = await Promise.all([
        getDistributors(),
        getAllDealers(),
        getAllInvoices(),
        getAllWallets(),
        getInvoiceSummary()
      ]);

      setAnalytics({
        distributors: distributorsRes.data.distributors,
        dealers: dealersRes.data.dealers,
        invoices: invoicesRes.data.invoices,
        wallets: walletsRes.data.wallets,
        summary: summaryRes.data
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate top performers
  const getTopDistributors = () => {
    const distributorStats = analytics.distributors.map(distributor => {
      const distributorInvoices = analytics.invoices.filter(invoice => 
        invoice.fromUser._id === distributor._id || invoice.toUser._id === distributor._id
      );
      const totalPoints = distributorInvoices.reduce((sum, invoice) => sum + invoice.points, 0);
      const wallet = analytics.wallets.find(w => w.userID._id === distributor._id);
      
      return {
        ...distributor,
        totalPoints,
        walletBalance: wallet?.balance || 0,
        invoiceCount: distributorInvoices.length
      };
    });

    return distributorStats
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  };

  const getTopDealers = () => {
    const dealerStats = analytics.dealers.map(dealer => {
      const dealerInvoices = analytics.invoices.filter(invoice => 
        invoice.toUser._id === dealer._id
      );
      const totalPoints = dealerInvoices.reduce((sum, invoice) => sum + invoice.points, 0);
      const wallet = analytics.wallets.find(w => w.userID._id === dealer._id);
      
      return {
        ...dealer,
        totalPoints,
        walletBalance: wallet?.balance || 0,
        invoiceCount: dealerInvoices.length
      };
    });

    return dealerStats
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  };

  const getTopProducts = () => {
    const productStats = {};
    
    analytics.invoices.forEach(invoice => {
      const productId = invoice.productID._id;
      const productName = invoice.productID.name;
      
      if (!productStats[productId]) {
        productStats[productId] = {
          name: productName,
          totalQuantity: 0,
          totalPoints: 0,
          invoiceCount: 0
        };
      }
      
      productStats[productId].totalQuantity += invoice.qty;
      productStats[productId].totalPoints += invoice.points;
      productStats[productId].invoiceCount += 1;
    });

    return Object.values(productStats)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 5);
  };

  const getMonthlyStats = () => {
    const monthlyStats = {};
    
    analytics.invoices.forEach(invoice => {
      const month = new Date(invoice.date).toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          month,
          totalInvoices: 0,
          totalPoints: 0,
          totalQuantity: 0
        };
      }
      
      monthlyStats[month].totalInvoices += 1;
      monthlyStats[month].totalPoints += invoice.points;
      monthlyStats[month].totalQuantity += invoice.qty;
    });

    return Object.values(monthlyStats)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const topDistributors = getTopDistributors();
  const topDealers = getTopDealers();
  const topProducts = getTopProducts();
  const monthlyStats = getMonthlyStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <span className="mr-2">🔄</span>
          Refresh Data
        </button>
      </div>

      {/* Chart Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'distributors', name: 'Top Distributors', icon: '🏢' },
              { id: 'dealers', name: 'Top Dealers', icon: '👥' },
              { id: 'products', name: 'Top Products', icon: '📦' },
              { id: 'trends', name: 'Monthly Trends', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id)}
                className={`py-4 px-1 border-b-2 font-semibold text-sm transition-all duration-200 whitespace-nowrap ${
                  activeChart === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeChart === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">🏢</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-blue-900">{analytics.distributors.length}</h3>
                      <p className="text-sm text-blue-700">Total Distributors</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">👥</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-green-900">{analytics.dealers.length}</h3>
                      <p className="text-sm text-green-700">Total Dealers</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">📄</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-purple-900">{analytics.summary?.totalInvoices || 0}</h3>
                      <p className="text-sm text-purple-700">Total Invoices</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-xl">⭐</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-yellow-900">{(analytics.summary?.totalPoints || 0).toLocaleString()}</h3>
                      <p className="text-sm text-yellow-700">Total Points</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Distributors</h3>
                  <div className="space-y-3">
                    {topDistributors.slice(0, 5).map((distributor, index) => (
                      <div key={distributor._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{distributor.name}</div>
                            <div className="text-sm text-gray-500">{distributor.companyName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary-600">{distributor.totalPoints.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Products</h3>
                  <div className="space-y-3">
                    {topProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.totalQuantity} units sold</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{product.totalPoints.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'distributors' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 10 Distributors by Performance</h3>
              <div className="space-y-4">
                {topDistributors.map((distributor, index) => (
                  <div key={distributor._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{distributor.name}</h4>
                          <p className="text-gray-600">{distributor.companyName}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>📱 {distributor.mobile}</span>
                            <span>📄 {distributor.invoiceCount} invoices</span>
                            <span>💰 {distributor.walletBalance.toLocaleString()} balance</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary-600">{distributor.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">total points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChart === 'dealers' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 10 Dealers by Performance</h3>
              <div className="space-y-4">
                {topDealers.map((dealer, index) => (
                  <div key={dealer._id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{dealer.name}</h4>
                          <p className="text-gray-600">{dealer.companyName}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>📱 {dealer.mobile}</span>
                            <span>📄 {dealer.invoiceCount} invoices</span>
                            <span>💰 {dealer.walletBalance.toLocaleString()} balance</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{dealer.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">total points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChart === 'products' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Products by Performance</h3>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>📦 {product.totalQuantity} units sold</span>
                            <span>📄 {product.invoiceCount} invoices</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{product.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">total points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeChart === 'trends' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Performance Trends</h3>
              <div className="space-y-4">
                {monthlyStats.map((month) => (
                  <div key={month.month} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {new Date(month.month + '-01').toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </h4>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>📄 {month.totalInvoices} invoices</span>
                          <span>📦 {month.totalQuantity} units</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{month.totalPoints.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">total points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
