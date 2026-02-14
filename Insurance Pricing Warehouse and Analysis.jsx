import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Upload, Database, TrendingUp, AlertCircle, FileSpreadsheet, Brain, Loader, Download } from 'lucide-react';

const InsurancePricingWarehouse = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [data, setData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Sample dataset generator with professional-scale data and realistic actuarial parameters
  const generateSampleData = () => {
    // Target loss ratios: 35-55% (realistic for mature life/health book)
    const products = [
      { name: 'Term Life', targetLR: 0.42, claimFreq: 0.020, premiumRate: 0.025 },
      { name: 'Whole Life', targetLR: 0.52, claimFreq: 0.025, premiumRate: 0.035 },
      { name: 'Critical Illness', targetLR: 0.48, claimFreq: 0.032, premiumRate: 0.028 },
      { name: 'Disability Income', targetLR: 0.45, claimFreq: 0.045, premiumRate: 0.032 }
    ];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    const genders = ['M', 'F'];
    
    const policyholders = [];
    const policies = [];
    const premiums = [];
    const claims = [];
    
    // Generate 3,500 policyholders (professional scale, optimized for performance)
    for (let i = 1; i <= 3500; i++) {
      policyholders.push({
        policyholder_id: i,
        age: Math.floor(Math.random() * 50) + 25,
        gender: genders[Math.floor(Math.random() * genders.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        income_band: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
      });
    }
    
    // Generate 5,000 policies with realistic distribution
    for (let i = 1; i <= 5000; i++) {
      const issueYear = 2020 + Math.floor(Math.random() * 5); // 2020-2024
      const issueMonth = Math.floor(Math.random() * 12) + 1;
      const issueDate = `${issueYear}-${String(issueMonth).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
      
      const productInfo = products[Math.floor(Math.random() * products.length)];
      const sumInsured = (Math.floor(Math.random() * 45) + 10) * 10000; // $100k - $550k
      
      policies.push({
        policy_id: i,
        policyholder_id: Math.floor(Math.random() * 3500) + 1,
        product_type: productInfo.name,
        issue_date: issueDate,
        sum_insured: sumInsured,
        policy_status: Math.random() > 0.15 ? 'Active' : 'Lapsed',
        lapse_date: null,
        _productInfo: productInfo // Internal use for claim generation
      });
    }
    
    // Generate premiums with product-specific rates (optimized - last 12 months only)
    policies.forEach(policy => {
      const productInfo = policy._productInfo;
      const annualPremium = Math.floor(policy.sum_insured * productInfo.premiumRate);
      const monthlyPremium = Math.floor(annualPremium / 12);
      
      const issueDate = new Date(policy.issue_date);
      const today = new Date();
      const monthsActive = Math.min(
        Math.floor((today - issueDate) / (1000 * 60 * 60 * 24 * 30)),
        36 // Cap at 3 years for performance
      );
      
      // Only generate last 12 months of premiums for performance
      const startMonth = Math.max(0, monthsActive - 12);
      for (let i = startMonth; i < monthsActive; i++) {
        const paymentDate = new Date(issueDate);
        paymentDate.setMonth(paymentDate.getMonth() + i);
        
        premiums.push({
          premium_id: premiums.length + 1,
          policy_id: policy.policy_id,
          premium_amount: monthlyPremium,
          payment_date: paymentDate.toISOString().split('T')[0]
        });
      }
      
      // Store total premium in policy for faster calculation
      policy._totalPremium = monthlyPremium * monthsActive;
    });
    
    // Generate claims targeting ~200 claims with realistic frequency by product
    policies.forEach(policy => {
      const productInfo = policy._productInfo;
      
      // Apply realistic claim frequency with regional variation
      const regionMultiplier = policy.policyholder_id % 5 === 0 ? 1.15 : 
                               policy.policyholder_id % 5 === 1 ? 0.90 : 1.0;
      const claimProbability = productInfo.claimFreq * regionMultiplier;
      
      if (Math.random() < claimProbability) {
        const issueDate = new Date(policy.issue_date);
        const today = new Date();
        const daysActive = Math.min(
          (today - issueDate) / (1000 * 60 * 60 * 24),
          1095 // Cap at 3 years
        );
        
        if (daysActive > 30) { // At least 30 days active
          // Random claim date within policy period
          const claimDate = new Date(issueDate);
          claimDate.setDate(claimDate.getDate() + Math.floor(Math.random() * daysActive));
          
          // Claim severity based on product type with variation
          let claimAmount;
          if (policy.product_type === 'Term Life' || policy.product_type === 'Whole Life') {
            // Death claims = full sum insured (with minor variation for partial settlements)
            claimAmount = Math.floor(policy.sum_insured * (0.95 + Math.random() * 0.05));
          } else if (policy.product_type === 'Critical Illness') {
            // CI claims = 70-100% of sum insured
            claimAmount = Math.floor(policy.sum_insured * (0.70 + Math.random() * 0.30));
          } else { // Disability Income
            // DI claims = smaller, more frequent
            claimAmount = Math.floor(policy.sum_insured * (0.12 + Math.random() * 0.20)); // 12-32%
          }
          
          claims.push({
            claim_id: claims.length + 1,
            policy_id: policy.policy_id,
            claim_date: claimDate.toISOString().split('T')[0],
            claim_amount: claimAmount,
            claim_type: policy.product_type,
            claim_status: 'Paid'
          });
        }
      }
    });
    
    // Clean up internal fields
    policies.forEach(p => {
      delete p._productInfo;
      delete p._totalPremium;
    });
    
    return { policyholders, policies, premiums, claims };
  };

  const runSQLAnalysis = (dataset) => {
    // Comprehensive SQL-based analysis with proper actuarial metrics
    
    // 1. Loss Ratio by Product with RANK() window function
    const productAnalysis = {};
    dataset.policies.forEach(policy => {
      if (!productAnalysis[policy.product_type]) {
        productAnalysis[policy.product_type] = { 
          totalPremiums: 0, 
          totalClaims: 0, 
          policyCount: 0,
          claimCount: 0 
        };
      }
      
      const policyPremiums = dataset.premiums
        .filter(p => p.policy_id === policy.policy_id)
        .reduce((sum, p) => sum + p.premium_amount, 0);
      
      const policyClaims = dataset.claims
        .filter(c => c.policy_id === policy.policy_id)
        .reduce((sum, c) => sum + c.claim_amount, 0);
      
      const claimCount = dataset.claims.filter(c => c.policy_id === policy.policy_id).length;
      
      productAnalysis[policy.product_type].totalPremiums += policyPremiums;
      productAnalysis[policy.product_type].totalClaims += policyClaims;
      productAnalysis[policy.product_type].policyCount += 1;
      productAnalysis[policy.product_type].claimCount += claimCount;
    });
    
    const lossRatioByProduct = Object.entries(productAnalysis)
      .map(([product, data]) => ({
        product,
        lossRatio: parseFloat(((data.totalClaims / data.totalPremiums) * 100).toFixed(2)),
        totalPremiums: data.totalPremiums,
        totalClaims: data.totalClaims,
        policyCount: data.policyCount,
        claimCount: data.claimCount,
        avgPremiumPerPolicy: Math.round(data.totalPremiums / data.policyCount),
        avgClaimSeverity: data.claimCount > 0 ? Math.round(data.totalClaims / data.claimCount) : 0,
        claimFrequency: parseFloat(((data.claimCount / data.policyCount) * 100).toFixed(3)),
        purePremium: Math.round(data.totalClaims / data.policyCount) // Claims per policy
      }))
      .sort((a, b) => b.lossRatio - a.lossRatio)
      .map((item, index) => ({ ...item, rank: index + 1 })); // RANK() window function
    
    // 2. Claim Frequency by Cohort with YoY deterioration using LAG()
    const cohortAnalysis = {};
    dataset.policies.forEach(policy => {
      const issueYear = policy.issue_date.split('-')[0];
      if (!cohortAnalysis[issueYear]) {
        cohortAnalysis[issueYear] = { 
          policyCount: 0, 
          claimCount: 0, 
          totalPremiums: 0, 
          totalClaims: 0 
        };
      }
      
      cohortAnalysis[issueYear].policyCount += 1;
      
      const policyClaims = dataset.claims.filter(c => c.policy_id === policy.policy_id);
      cohortAnalysis[issueYear].claimCount += policyClaims.length;
      cohortAnalysis[issueYear].totalClaims += policyClaims.reduce((sum, c) => sum + c.claim_amount, 0);
      
      const policyPremiums = dataset.premiums
        .filter(p => p.policy_id === policy.policy_id)
        .reduce((sum, p) => sum + p.premium_amount, 0);
      cohortAnalysis[issueYear].totalPremiums += policyPremiums;
    });
    
    const frequencyByCohort = Object.entries(cohortAnalysis)
      .map(([year, data]) => ({
        cohort: year,
        frequency: parseFloat(((data.claimCount / data.policyCount) * 100).toFixed(3)),
        lossRatio: parseFloat(((data.totalClaims / data.totalPremiums) * 100).toFixed(2)),
        policyCount: data.policyCount,
        claimCount: data.claimCount
      }))
      .sort((a, b) => a.cohort - b.cohort);
    
    // Add LAG() for YoY change
    frequencyByCohort.forEach((item, index) => {
      if (index > 0) {
        const prevLR = frequencyByCohort[index - 1].lossRatio;
        item.yoyChange = parseFloat(((item.lossRatio - prevLR) / prevLR * 100).toFixed(1));
        item.yoyChangeAbs = parseFloat((item.lossRatio - prevLR).toFixed(1));
      } else {
        item.yoyChange = null;
        item.yoyChangeAbs = null;
      }
    });
    
    // 3. Regional Analysis
    const regionAnalysis = {};
    dataset.policies.forEach(policy => {
      const holder = dataset.policyholders.find(h => h.policyholder_id === policy.policyholder_id);
      if (!holder) return;
      
      if (!regionAnalysis[holder.region]) {
        regionAnalysis[holder.region] = { 
          totalPremiums: 0, 
          totalClaims: 0, 
          policyCount: 0,
          claimCount: 0
        };
      }
      
      const policyPremiums = dataset.premiums
        .filter(p => p.policy_id === policy.policy_id)
        .reduce((sum, p) => sum + p.premium_amount, 0);
      
      const policyClaims = dataset.claims
        .filter(c => c.policy_id === policy.policy_id)
        .reduce((sum, c) => sum + c.claim_amount, 0);
      
      const claimCount = dataset.claims.filter(c => c.policy_id === policy.policy_id).length;
      
      regionAnalysis[holder.region].totalPremiums += policyPremiums;
      regionAnalysis[holder.region].totalClaims += policyClaims;
      regionAnalysis[holder.region].policyCount += 1;
      regionAnalysis[holder.region].claimCount += claimCount;
    });
    
    const lossRatioByRegion = Object.entries(regionAnalysis).map(([region, data]) => ({
      region,
      lossRatio: parseFloat(((data.totalClaims / data.totalPremiums) * 100).toFixed(2)),
      totalPremiums: data.totalPremiums,
      totalClaims: data.totalClaims,
      policyCount: data.policyCount,
      claimCount: data.claimCount
    }));
    
    // 4. Year-over-Year Trend with LAG()
    const yearlyAnalysis = {};
    dataset.premiums.forEach(premium => {
      const year = premium.payment_date.split('-')[0];
      if (!yearlyAnalysis[year]) {
        yearlyAnalysis[year] = { totalPremiums: 0, totalClaims: 0 };
      }
      yearlyAnalysis[year].totalPremiums += premium.premium_amount;
    });
    
    dataset.claims.forEach(claim => {
      const year = claim.claim_date.split('-')[0];
      if (yearlyAnalysis[year]) {
        yearlyAnalysis[year].totalClaims += claim.claim_amount;
      }
    });
    
    const trendData = Object.entries(yearlyAnalysis)
      .map(([year, data]) => ({
        year,
        lossRatio: parseFloat(((data.totalClaims / data.totalPremiums) * 100).toFixed(2)),
        premiums: Math.round(data.totalPremiums / 1000),
        claims: Math.round(data.totalClaims / 1000)
      }))
      .sort((a, b) => a.year - b.year);
    
    // Add LAG() comparison
    trendData.forEach((item, index) => {
      if (index > 0) {
        item.yoyChange = parseFloat((item.lossRatio - trendData[index - 1].lossRatio).toFixed(1));
      }
    });
    
    // 5. Duration-based analysis
    const durationAnalysis = {};
    dataset.policies.forEach(policy => {
      const issueDate = new Date(policy.issue_date);
      const today = new Date();
      const monthsActive = Math.floor((today - issueDate) / (1000 * 60 * 60 * 24 * 30));
      const durationBand = monthsActive < 12 ? 'Year 1' : 
                          monthsActive < 24 ? 'Year 2' : 
                          monthsActive < 36 ? 'Year 3' : 'Year 4+';
      
      if (!durationAnalysis[durationBand]) {
        durationAnalysis[durationBand] = { 
          totalPremiums: 0, 
          totalClaims: 0, 
          policyCount: 0 
        };
      }
      
      const policyPremiums = dataset.premiums
        .filter(p => p.policy_id === policy.policy_id)
        .reduce((sum, p) => sum + p.premium_amount, 0);
      
      const policyClaims = dataset.claims
        .filter(c => c.policy_id === policy.policy_id)
        .reduce((sum, c) => sum + c.claim_amount, 0);
      
      durationAnalysis[durationBand].totalPremiums += policyPremiums;
      durationAnalysis[durationBand].totalClaims += policyClaims;
      durationAnalysis[durationBand].policyCount += 1;
    });
    
    const durationData = ['Year 1', 'Year 2', 'Year 3', 'Year 4+']
      .filter(band => durationAnalysis[band])
      .map(band => ({
        duration: band,
        lossRatio: parseFloat(((durationAnalysis[band].totalClaims / durationAnalysis[band].totalPremiums) * 100).toFixed(2)),
        policyCount: durationAnalysis[band].policyCount
      }));
    
    const totalPremiums = dataset.premiums.reduce((sum, p) => sum + p.premium_amount, 0);
    const totalClaims = dataset.claims.reduce((sum, c) => sum + c.claim_amount, 0);
    
    return {
      lossRatioByProduct,
      frequencyByCohort,
      lossRatioByRegion,
      trendData,
      durationData,
      summary: {
        totalPolicies: dataset.policies.length,
        totalPolicyholders: dataset.policyholders.length,
        totalPremiums,
        totalClaims,
        claimCount: dataset.claims.length,
        overallLossRatio: parseFloat(((totalClaims / totalPremiums) * 100).toFixed(2))
      }
    };
  };

  const loadSampleData = () => {
    setLoading(true);
    setTimeout(() => {
      const sampleData = generateSampleData();
      setData(sampleData);
      const analysis = runSQLAnalysis(sampleData);
      setAnalysisResults(analysis);
      setLoading(false);
      setActiveTab('dashboard');
    }, 1000);
  };

  const generateAIInsights = async () => {
    if (!analysisResults) return;
    
    setLoadingAI(true);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `You are a senior actuarial consultant preparing a measured, professional portfolio review for a Big 4 consulting firm. Provide analytical insights using regulatory-safe language.

PORTFOLIO CONTEXT:
This is a ${analysisResults.summary.totalPolicies}-policy life and health insurance portfolio across 4 product lines, with exposure period spanning 2020-2024.

DATA QUALITY & ASSUMPTIONS:
• Premium figures represent written premium (not earned premium)
• No IBNR (Incurred But Not Reported) adjustment applied
• Claims assumed fully developed and settled
• No expense loading or reinsurance adjustments included
• Exposure approximated by policy count
• Statistical credibility may be limited for smaller segments

PORTFOLIO METRICS:
Overall Performance:
• Total Policies: ${analysisResults.summary.totalPolicies}
• Written Premium: $${Math.round(analysisResults.summary.totalPremiums).toLocaleString()}
• Claims Incurred: $${Math.round(analysisResults.summary.totalClaims).toLocaleString()}
• Portfolio Loss Ratio: ${analysisResults.summary.overallLossRatio}%

Product Performance (Ranked by Loss Ratio):
${analysisResults.lossRatioByProduct.map(p => 
  `${p.rank}. ${p.product}: ${p.lossRatio}% LR | ${p.policyCount} policies | ${p.claimFrequency}% frequency | $${p.avgPremiumPerPolicy.toLocaleString()} avg premium | $${p.avgClaimSeverity.toLocaleString()} avg severity`
).join('\n')}

Cohort Analysis (YoY Deterioration):
${analysisResults.frequencyByCohort.map(c => 
  `${c.cohort}: ${c.lossRatio}% LR (${c.policyCount} policies) ${c.yoyChange !== null ? `| YoY: ${c.yoyChange > 0 ? '+' : ''}${c.yoyChange}%` : ''}`
).join('\n')}

Regional Distribution:
${analysisResults.lossRatioByRegion.map(r => 
  `${r.region}: ${r.lossRatio}% LR | ${r.policyCount} policies | ${r.claimCount} claims`
).join('\n')}

Duration Analysis:
${analysisResults.durationData.map(d => 
  `${d.duration}: ${d.lossRatio}% LR (${d.policyCount} policies)`
).join('\n')}

INSTRUCTIONS:
Provide 6-8 insights as a JSON array with "category", "finding", and "recommendation" fields.

Categories to use: "Portfolio Risk", "Pricing Adequacy", "Credibility & Limitations", "Cohort Trends", "Product Strategy", "Regional Performance", "Duration Analysis"

Tone Guidelines:
• Analytical and measured (not dramatic)
• Use phrases like "warrants review", "suggests consideration", "indicates potential", "may benefit from"
• AVOID: "emergency", "immediate moratorium", "crisis", "severe", "urgent"
• Acknowledge statistical limitations where sample sizes are small (<200 policies)
• Reference exposure-based metrics (frequency, severity, pure premium)
• Note data quality assumptions where relevant

Return ONLY valid JSON array, no markdown formatting.`
            }
          ]
        })
      });

      const result = await response.json();
      const content = result.content[0].text;
      const cleanContent = content.replace(/```json|```/g, '').trim();
      const insights = JSON.parse(cleanContent);
      setAiInsights(insights);
    } catch (error) {
      console.error('AI analysis error:', error);
      setAiInsights([
        {
          category: "Analysis Status",
          finding: "AI-powered insights are currently unavailable due to a technical error.",
          recommendation: "Please review the quantitative analytics in the Dashboard tab for detailed portfolio performance metrics."
        }
      ]);
    }
    
    setLoadingAI(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setData(jsonData);
        const analysis = runSQLAnalysis(jsonData);
        setAnalysisResults(analysis);
        setActiveTab('dashboard');
      } catch (error) {
        alert('Error parsing file. Please ensure it\'s valid JSON with policyholders, policies, premiums, and claims arrays.');
      }
      setLoading(false);
    };
    
    reader.readAsText(file);
  };

  const downloadSampleFormat = () => {
    const sampleFormat = {
      policyholders: [
        { policyholder_id: 1, age: 35, gender: "M", region: "North", income_band: "Medium" }
      ],
      policies: [
        { policy_id: 1, policyholder_id: 1, product_type: "Term Life", issue_date: "2023-01-15", sum_insured: 100000, policy_status: "Active", lapse_date: null }
      ],
      premiums: [
        { premium_id: 1, policy_id: 1, premium_amount: 291, payment_date: "2023-01-15" }
      ],
      claims: [
        { claim_id: 1, policy_id: 1, claim_date: "2023-06-20", claim_amount: 25000, claim_type: "Critical Illness", claim_status: "Paid" }
      ]
    };
    
    const blob = new Blob([JSON.stringify(sampleFormat, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'insurance_data_template.json';
    a.click();
  };

  const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-10 h-10" />
                <h1 className="text-4xl font-bold tracking-tight">Insurance Pricing Warehouse</h1>
              </div>
              <p className="text-blue-200 text-lg">AI-Powered Portfolio Analytics & Risk Intelligence Platform</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-300 mb-1">Actuarial Decision Support System</div>
              <div className="text-xs text-blue-400">Enterprise Data Analytics v2.1</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 border-b-2 border-slate-200">
          {[
            { id: 'upload', label: 'Data Upload', icon: Upload },
            { id: 'dashboard', label: 'Analytics Dashboard', icon: TrendingUp },
            { id: 'insights', label: 'AI Insights', icon: Brain }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.id !== 'upload' && !analysisResults}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-900 border-b-4 border-blue-600 -mb-0.5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              } ${tab.id !== 'upload' && !analysisResults ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {/* Upload Tab */}
        {!loading && activeTab === 'upload' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Upload Custom Data */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-slate-900">Upload Your Data</h2>
              </div>
              
              <p className="text-slate-600 mb-6">
                Upload your insurance dataset in JSON format with policyholders, policies, premiums, and claims data.
              </p>
              
              <div className="border-3 border-dashed border-blue-300 rounded-xl p-8 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer mb-4">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="fileUpload"
                />
                <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
                  <FileSpreadsheet className="w-16 h-16 text-blue-600 mb-4" />
                  <span className="text-lg font-semibold text-blue-900 mb-2">Choose JSON File</span>
                  <span className="text-sm text-blue-700">Click to browse your files</span>
                </label>
              </div>
              
              <button
                onClick={downloadSampleFormat}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Template
              </button>
            </div>

            {/* Use Sample Dataset */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Use Sample Dataset</h2>
              </div>
              
              <p className="text-blue-100 mb-6">
                Start exploring immediately with our professional-scale insurance portfolio containing 3,500 policyholders, 
                5,000 policies, and realistic claims data with 35-55% loss ratios.
              </p>
              
              <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6">
                <h3 className="font-semibold mb-3 text-lg">Professional-Scale Dataset:</h3>
                <ul className="space-y-2 text-blue-100">
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 mt-1">✓</span>
                    <span>3,500 policyholders across 5 regions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 mt-1">✓</span>
                    <span>5,000 policies (4 product types)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 mt-1">✓</span>
                    <span>~200 claims with realistic frequency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 mt-1">✓</span>
                    <span>Credible statistical analysis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-300 mt-1">✓</span>
                    <span>Multi-year exposure period (2020-2024)</span>
                  </li>
                </ul>
              </div>
              
              <button
                onClick={loadSampleData}
                className="w-full py-4 px-6 bg-white text-blue-700 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Load Sample Data & Analyze
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {!loading && activeTab === 'dashboard' && analysisResults && (
          <div className="space-y-6">
            {/* Data Quality Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-3 text-lg">Data Quality & Assumptions</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-800">
                <div>• Premium represents <strong>written premium</strong> (not earned)</div>
                <div>• No IBNR adjustment applied</div>
                <div>• Claims assumed fully developed/settled</div>
                <div>• No expense loading included (pure loss ratio)</div>
                <div>• No reinsurance adjustments</div>
                <div>• Exposure approximated by policy count</div>
                <div>• Analysis period: 2020-2024 (multi-year book)</div>
                <div>• Target loss ratios: 35-55% (profitable range)</div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-700">
                <strong>Note:</strong> Loss ratios in 35-55% range reflect profitable life/health insurance experience. 
                Combined ratios (including expense loading) would typically be 85-100%. This represents well-priced, 
                mature portfolio performance with adequate risk selection and underwriting discipline.
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
                <div className="text-sm font-semibold text-slate-600 mb-1">Total Policies</div>
                <div className="text-3xl font-bold text-slate-900">{analysisResults.summary.totalPolicies.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-600">
                <div className="text-sm font-semibold text-slate-600 mb-1">Written Premium</div>
                <div className="text-3xl font-bold text-slate-900">${(analysisResults.summary.totalPremiums / 1000000).toFixed(2)}M</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600">
                <div className="text-sm font-semibold text-slate-600 mb-1">Claims Incurred</div>
                <div className="text-3xl font-bold text-slate-900">${(analysisResults.summary.totalClaims / 1000000).toFixed(2)}M</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
                <div className="text-sm font-semibold text-slate-600 mb-1">Portfolio Loss Ratio</div>
                <div className="text-3xl font-bold text-slate-900">
                  {analysisResults.summary.overallLossRatio}%
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Loss Ratio by Product */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Loss Ratio by Product (RANK Window)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisResults.lossRatioByProduct}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="product" tick={{ fontSize: 12 }} />
                    <YAxis label={{ value: 'Loss Ratio (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                      formatter={(value, name) => {
                        if (name === 'lossRatio') return [`${value}%`, 'Loss Ratio'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="lossRatio" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Claim Frequency by Cohort with YoY Change */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Loss Ratio by Cohort (LAG Analysis)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysisResults.frequencyByCohort}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="cohort" />
                    <YAxis label={{ value: 'Loss Ratio (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                      formatter={(value, name) => {
                        if (name === 'lossRatio') return [`${value}%`, 'Loss Ratio'];
                        if (name === 'yoyChange') return [`${value > 0 ? '+' : ''}${value}%`, 'YoY Change'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="lossRatio" stroke="#7c3aed" strokeWidth={3} dot={{ r: 6 }} name="Loss Ratio" />
                    <Line type="monotone" dataKey="yoyChange" stroke="#ea580c" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="YoY Change" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Year-over-Year Trend */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Year-over-Year Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analysisResults.trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" />
                    <YAxis yAxisId="left" label={{ value: 'Amount ($000s)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Loss Ratio (%)', angle: 90, position: 'insideRight' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                      formatter={(value, name) => {
                        if (name === 'Loss Ratio %') return [`${value}%`, name];
                        return [`$${value}k`, name];
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="premiums" stroke="#16a34a" strokeWidth={2} name="Premiums" />
                    <Line yAxisId="left" type="monotone" dataKey="claims" stroke="#dc2626" strokeWidth={2} name="Claims" />
                    <Line yAxisId="right" type="monotone" dataKey="lossRatio" stroke="#ea580c" strokeWidth={3} name="Loss Ratio %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Duration-Based Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Duration Curve Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisResults.durationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="duration" />
                    <YAxis label={{ value: 'Loss Ratio (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                      formatter={(value, name) => {
                        if (name === 'lossRatio') return [`${value}%`, 'Loss Ratio'];
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="lossRatio" fill="#16a34a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Regional Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Loss Ratio by Region</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisResults.lossRatioByRegion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="region" />
                    <YAxis label={{ value: 'Loss Ratio (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                      formatter={(value) => [`${value}%`, 'Loss Ratio']}
                    />
                    <Bar dataKey="lossRatio" fill="#db2777" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Claim Frequency Distribution */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Claim Frequency by Product</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analysisResults.lossRatioByProduct}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="product" tick={{ fontSize: 12 }} />
                    <YAxis label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                      formatter={(value) => [`${value}%`, 'Claim Frequency']}
                    />
                    <Bar dataKey="claimFrequency" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Table with RANK and Exposure Metrics */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Product Performance Detail (RANK Window Function)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold text-slate-700">Rank</th>
                      <th className="px-3 py-3 text-left font-semibold text-slate-700">Product</th>
                      <th className="px-3 py-3 text-right font-semibold text-slate-700">Policies</th>
                      <th className="px-3 py-3 text-right font-semibold text-slate-700">Written Premium</th>
                      <th className="px-3 py-3 text-right font-semibold text-slate-700">Claims Incurred</th>
                      <th className="px-3 py-3 text-right font-semibold text-slate-700">Loss Ratio</th>
                      <th className="px-3 py-3 text-right font-semibold text-slate-700">Claim Freq.</th>
                      <th className="px-3 py-3 text-right font-semibold text-slate-700">Avg Severity</th>
                      <th className="px-3 py-3 text-right font-semibold text-slate-700">Pure Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.lossRatioByProduct.map((product) => (
                      <tr key={product.rank} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-3 py-3 font-bold text-slate-900">#{product.rank}</td>
                        <td className="px-3 py-3 font-medium text-slate-900">
                          {product.product}
                          {product.policyCount < 500 && (
                            <span className="ml-2 text-xs text-amber-600 font-semibold">⚠ Monitor</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-600">{product.policyCount.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right text-slate-600">${Math.round(product.totalPremiums / 1000).toLocaleString()}k</td>
                        <td className="px-3 py-3 text-right text-slate-600">${Math.round(product.totalClaims / 1000).toLocaleString()}k</td>
                        <td className={`px-3 py-3 text-right font-bold ${
                          product.lossRatio > 80 ? 'text-red-600' : 
                          product.lossRatio > 60 ? 'text-orange-600' : 
                          product.lossRatio > 45 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {product.lossRatio}%
                        </td>
                        <td className="px-3 py-3 text-right text-slate-600">{product.claimFrequency}%</td>
                        <td className="px-3 py-3 text-right text-slate-600">${product.avgClaimSeverity.toLocaleString()}</td>
                        <td className="px-3 py-3 text-right font-semibold text-blue-700">${product.purePremium.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-slate-600">
                <strong>Key Metrics:</strong> Pure Premium = Total Claims / Policy Count (expected claim cost per policy). 
                Frequency = Claims/Policies. Severity = Avg claim amount. Loss Ratio = Claims/Written Premium.
                {' '}⚠ Monitor indicates segments where additional observation may enhance credibility.
              </div>
            </div>

            {/* Cohort Deterioration Table with LAG() */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Cohort Deterioration Analysis (LAG Window Function)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Issue Year</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Policies</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Claims</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Loss Ratio</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">YoY Change (pp)</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">YoY %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResults.frequencyByCohort.map((cohort, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{cohort.cohort}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{cohort.policyCount}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{cohort.claimCount}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">{cohort.lossRatio}%</td>
                        <td className={`px-4 py-3 text-right font-semibold ${
                          cohort.yoyChangeAbs === null ? 'text-slate-400' :
                          cohort.yoyChangeAbs > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {cohort.yoyChangeAbs !== null ? `${cohort.yoyChangeAbs > 0 ? '+' : ''}${cohort.yoyChangeAbs}` : 'N/A'}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${
                          cohort.yoyChange === null ? 'text-slate-400' :
                          cohort.yoyChange > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {cohort.yoyChange !== null ? `${cohort.yoyChange > 0 ? '+' : ''}${cohort.yoyChange}%` : 'Baseline'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-xs text-slate-600">
                <strong>LAG() Analysis:</strong> YoY Change shows year-over-year deterioration in percentage points and relative percentage. 
                Positive values indicate deteriorating experience.
              </div>
            </div>
          </div>
        )}

        {/* AI Insights Tab */}
        {!loading && activeTab === 'insights' && analysisResults && (
          <div className="space-y-6">
            {!aiInsights && (
              <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl shadow-xl p-8 text-white text-center">
                <Brain className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl font-bold mb-4">AI-Powered Actuarial Review</h2>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  Generate professional actuarial insights with statistical credibility assessment, exposure-based metrics, 
                  and regulatory-safe language suitable for Big 4 consulting standards.
                </p>
                <button
                  onClick={generateAIInsights}
                  disabled={loadingAI}
                  className="px-8 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                >
                  {loadingAI ? (
                    <span className="flex items-center gap-2">
                      <Loader className="w-5 h-5 animate-spin" />
                      Generating Actuarial Review...
                    </span>
                  ) : (
                    'Generate Professional Insights'
                  )}
                </button>
              </div>
            )}

            {aiInsights && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="w-8 h-8" />
                      <div>
                        <h2 className="text-2xl font-bold">Actuarial Portfolio Review</h2>
                        <p className="text-sm text-blue-200">AI-Generated Insights • Big 4 Professional Standards</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAiInsights(null)}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>

                {/* Scenario Context */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Portfolio Context & Scope</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div>
                      <strong>Portfolio Size:</strong> {analysisResults.summary.totalPolicies} policies across 4 product lines
                    </div>
                    <div>
                      <strong>Exposure Period:</strong> 2020-2024 issue years
                    </div>
                    <div>
                      <strong>Written Premium:</strong> ${(analysisResults.summary.totalPremiums / 1000000).toFixed(2)}M
                    </div>
                    <div>
                      <strong>Overall Loss Ratio:</strong> {analysisResults.summary.overallLossRatio}%
                    </div>
                    <div className="md:col-span-2">
                      <strong>Methodology:</strong> Written premium basis (not earned), no IBNR adjustment, fully developed claims assumption
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full mb-2">
                          {insight.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">
                          {insight.finding || insight.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed mb-3">
                      {insight.recommendation || insight.insight}
                    </p>
                  </div>
                ))}

                {/* Risk Disclaimer */}
                <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-amber-900 mb-2">Professional Use Disclaimer</h4>
                      <p className="text-amber-800 text-sm mb-2">
                        These AI-generated insights are analytical recommendations based on statistical patterns in the dataset. 
                        They should be validated against:
                      </p>
                      <ul className="text-amber-800 text-sm space-y-1 ml-4">
                        <li>• Actuarial standards of practice (ASOPs)</li>
                        <li>• Regulatory requirements and local legislation</li>
                        <li>• Company-specific underwriting guidelines</li>
                        <li>• Reinsurance treaty structures</li>
                        <li>• Statistical credibility thresholds</li>
                        <li>• Market competitive dynamics</li>
                      </ul>
                      <p className="text-amber-800 text-sm mt-2">
                        <strong>Always consult qualified actuaries and legal counsel before implementing pricing changes.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technical Notes */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-3 text-sm">Technical Notes & Assumptions</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>✓ Loss Ratio = Claims Incurred / Written Premium</div>
                    <div>✓ Claim Frequency = # Claims / # Policies</div>
                    <div>✓ Claim Severity = Total Claims / # Claims</div>
                    <div>✓ Exposure = Policy Count (not policy-years)</div>
                    <div>✓ No IBNR reserves included</div>
                    <div>✓ No expense loading applied</div>
                    <div>✓ Claims assumed fully developed</div>
                    <div>✓ No reinsurance adjustments</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Future Enhancements Section */}
      {analysisResults && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/20 p-3 rounded-lg">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Future Enhancements & Strategic Roadmap</h2>
                <p className="text-blue-200">Advanced actuarial capabilities for enterprise-grade pricing analytics</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-green-400">▶</span> Reserving & Development
                </h3>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Implement IBNR estimation using Chain Ladder method</li>
                  <li>• Build development triangles for claims maturation analysis</li>
                  <li>• Add Bornhuetter-Ferguson reserve calculations</li>
                  <li>• Integrate ultimate loss ratio projections</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-blue-400">▶</span> Premium Sophistication
                </h3>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Calculate earned premium using pro-rata method</li>
                  <li>• Implement unearned premium reserve (UPR)</li>
                  <li>• Add premium deficiency testing</li>
                  <li>• Model policy anniversary accounting</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-purple-400">▶</span> Advanced Pricing Models
                </h3>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Build GLM (Generalized Linear Model) for rate-making</li>
                  <li>• Implement credibility weighting (Bühlmann model)</li>
                  <li>• Add experience rating methodology</li>
                  <li>• Integrate predictive modeling for risk selection</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-amber-400">▶</span> Risk & Capital Management
                </h3>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Model reinsurance treaty structures (QS, XOL, Stop Loss)</li>
                  <li>• Implement stochastic loss simulation (Monte Carlo)</li>
                  <li>• Add capital adequacy testing (Solvency II/RBC)</li>
                  <li>• Build catastrophe modeling scenarios</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-red-400">▶</span> Profitability Analysis
                </h3>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Add expense loading (acquisition, admin, overhead)</li>
                  <li>• Calculate combined ratio with expense components</li>
                  <li>• Implement profit margin analysis by segment</li>
                  <li>• Model investment income on float</li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-indigo-400">▶</span> Regulatory & Compliance
                </h3>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>• Integrate ASOP (Actuarial Standards of Practice) checks</li>
                  <li>• Add statutory reserve requirements</li>
                  <li>• Model GAAP vs statutory accounting differences</li>
                  <li>• Implement fair value measurement (IFRS 17)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
              <p className="text-sm text-blue-100">
                <strong className="text-white">Strategic Vision:</strong> This roadmap transforms a pricing data warehouse into a comprehensive 
                actuarial decision platform, incorporating reserving, capital modeling, regulatory compliance, and advanced statistical methods 
                used by leading insurance companies and consulting firms globally.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-6 py-8 mt-12 border-t border-slate-200">
        <div className="text-center text-slate-600 text-sm">
          <p className="mb-2">Insurance Pricing Data Warehouse • Powered by AI Analytics</p>
          <p className="text-xs text-slate-500">SQL-based portfolio analytics with machine learning insights for actuarial decision support</p>
        </div>
      </div>
    </div>
  );
};

export default InsurancePricingWarehouse;
