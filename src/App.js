import React, { useState } from 'react';
import {WalletSelector} from "@aptos-labs/wallet-adapter-ant-design"

const ReliefChainPlatform = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [userBalance, setUserBalance] = useState(100);
  const [activeTab, setActiveTab] = useState('home');
  const [campaign, setCampaign] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type) => {
    const id = Date.now();
    const notification = { id, message, type };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const connectWallet = () => {
    if (!walletConnected) {
      showNotification('Connecting wallet...', 'info');
      setTimeout(() => {
        setWalletConnected(true);
        showNotification('Wallet connected successfully!', 'success');
      }, 1000);
    } else {
      setWalletConnected(false);
      showNotification('Wallet disconnected', 'info');
    }
  };

  const showDonateModal = () => {
    if (!walletConnected) {
      showNotification('Please connect your wallet first!', 'error');
      return;
    }
    setActiveTab('donations');
  };

  const processDonation = () => {
    if (!walletConnected) {
      showNotification('Please connect your wallet first!', 'error');
      return;
    }
    if (!campaign) {
      showNotification('Please select a campaign!', 'error');
      return;
    }
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      showNotification('Please enter a valid donation amount!', 'error');
      return;
    }
    if (amountNum > userBalance) {
      showNotification('Insufficient balance!', 'error');
      return;
    }
    showNotification('Processing donation...', 'info');
    setTimeout(() => {
      setUserBalance(prev => prev - amountNum);
      setCampaign('');
      setAmount('');
      setMessage('');
      showNotification(`Successfully donated ${amountNum} APT!`, 'success');
    }, 2000);
  };

  const NotificationContainer = () => (
    <div className="fixed top-5 right-5 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`
            px-5 py-3 rounded-lg font-semibold text-white shadow-lg transform transition-all duration-300 translate-x-0
            ${notification.type === 'success' ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : ''}
            ${notification.type === 'error' ? 'bg-gradient-to-r from-red-400 to-pink-500' : ''}
            ${notification.type === 'info' ? 'bg-gradient-to-r from-blue-400 to-purple-500' : ''}
          `}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700 p-5">
      <NotificationContainer />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-2xl border border-white/20">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center mb-6">
            🔗 ReliefChain Platform
          </h1>
          <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white p-6 rounded-2xl flex justify-between items-center shadow-lg">
            <div>
              <h3 className="text-xl mb-2 opacity-90">Account Balance</h3>
              <div className="text-3xl font-bold">{userBalance} APT</div>
            </div>
            <div className="flex gap-3">
              <WalletSelector/>
              <button
                onClick={showDonateModal}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                💰 Donate
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Tabs */}
          <div className="flex mb-8 bg-gray-100 rounded-2xl p-2">
            {[
              { id: 'home', label: '🏠 Home' },
              { id: 'donations', label: '💝 Donations' },
              { id: 'analytics', label: '📊 Analytics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Home */}
          {activeTab === 'home' && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { number: '1,247', label: 'Total Donations', color: 'from-red-400 to-pink-500' },
                  { number: '₹2.4M', label: 'Funds Raised', color: 'from-emerald-400 to-teal-500' },
                  { number: '89', label: 'Active Campaigns', color: 'from-blue-400 to-indigo-500' }
                ].map((stat, index) => (
                  <div key={index} className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl text-center shadow-lg`}>
                    <div className="text-3xl font-bold mb-2">{stat.number}</div>
                    <div className="opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Donations */}
              <h3 className="text-2xl font-bold mb-6">Recent Donations</h3>
              <div className="bg-gray-50 rounded-2xl p-6">
                {[
                  { title: 'Emergency Medical Fund', desc: 'Supporting critical medical care for underprivileged families', amount: '25 APT' },
                  { title: 'Education Initiative', desc: 'Providing educational resources to rural schools', amount: '50 APT' },
                  { title: 'Disaster Relief Fund', desc: 'Emergency aid for flood-affected communities', amount: '75 APT' }
                ].map((donation, index) => (
                  <div key={index} className="flex justify-between items-center py-4 border-b border-gray-200 last:border-b-0">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{donation.title}</h4>
                      <p className="text-gray-600 text-sm">{donation.desc}</p>
                    </div>
                    <div className="text-blue-600 font-bold text-lg">{donation.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Donations */}
          {activeTab === 'donations' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Make a Donation</h3>
              <div className="bg-gray-50 p-8 rounded-2xl">
                <div className="space-y-6">
                  {/* Campaign */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Select Campaign</label>
                    <select
                      value={campaign}
                      onChange={(e) => {
                        console.log('Campaign change event:', e);
                        if (!e || !e.target) return;
                        setCampaign(e.target.value);
                      }}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300"
                    >
                      <option value="">Choose a campaign...</option>
                      <option value="medical">Emergency Medical Fund</option>
                      <option value="education">Education Initiative</option>
                      <option value="disaster">Disaster Relief Fund</option>
                      <option value="environment">Environmental Protection</option>
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Donation Amount (APT)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        console.log('Amount change event:', e);
                        if (!e || !e.target) return;
                        setAmount(e.target.value);
                      }}
                      placeholder="Enter amount"
                      min="1"
                      step="0.01"
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-3">Message (Optional)</label>
                    <textarea
                      value={message}
                      onChange={(e) => {
                        console.log('Message change event:', e);
                        if (!e || !e.target) return;
                        setMessage(e.target.value);
                      }}
                      rows="4"
                      placeholder="Leave a message of support..."
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-300 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={processDonation}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-lg"
                  >
                    🚀 Process Donation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Platform Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                  { number: '94.2%', label: 'Transparency Score', color: 'from-green-400 to-emerald-500' },
                  { number: '2.3s', label: 'Avg. Transaction Time', color: 'from-blue-400 to-cyan-500' },
                  { number: '0.01%', label: 'Platform Fee', color: 'from-purple-400 to-indigo-500' }
                ].map((stat, index) => (
                  <div key={index} className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl text-center shadow-lg`}>
                    <div className="text-3xl font-bold mb-2">{stat.number}</div>
                    <div className="opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="text-gray-600 leading-relaxed">
                  All transactions are recorded on the blockchain for complete transparency. 
                  You can track the impact of your donations in real-time through our advanced analytics dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReliefChainPlatform;
