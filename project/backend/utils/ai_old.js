/**
 * AI Insights Generator for Street Food Vendor Platform
 * This module provides AI-powered insights for pricing, demand prediction, and recommendations
 */

/**
 * Generate AI insights for products
 * @param {Object} product - Product data
 * @param {Object} vendorLocation - Vendor's location coordinates
 * @param {Array} suppliers - Available suppliers for the product
 * @returns {Object} - AI insights
 */
const generateAIInsights = async (product, vendorLocation, suppliers = []) => {
  try {
    const insights = {
      priceAnalysis: generatePriceAnalysis(product, suppliers),
      demandPrediction: generateDemandPrediction(product),
      qualityScore: calculateQualityScore(suppliers),
      recommendations: generateRecommendations(product, suppliers, vendorLocation),
      marketTrends: generateMarketTrends(product),
      riskAssessment: generateRiskAssessment(product, suppliers)
    };

    return insights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return generateFallbackInsights();
  }
};

/**
 * Generate price analysis and predictions
 */
const generatePriceAnalysis = (product, suppliers) => {
  if (!suppliers || suppliers.length === 0) {
    return {
      status: 'unavailable',
      message: 'No suppliers available for analysis'
    };
  }

  const prices = suppliers.map(s => s.price);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const variability = (priceRange / avgPrice) * 100;

  // Analyze price changes
  const priceChanges = suppliers
    .filter(s => s.priceHistory && s.priceHistory.length > 0)
    .map(s => {
      const lastPrice = s.priceHistory[s.priceHistory.length - 1]?.price || s.price;
      return ((s.price - lastPrice) / lastPrice) * 100;
    });

  const avgPriceChange = priceChanges.length > 0 
    ? priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length 
    : 0;

  let trend = 'stable';
  let message = 'Prices are stable across suppliers.';
  let recommendation = 'Good time to buy at current market rates.';

  if (avgPriceChange < -3) {
    trend = 'decreasing';
    message = `Prices have dropped by ${Math.abs(avgPriceChange).toFixed(1)}% recently.`;
    recommendation = '💡 Great time to buy! Prices are lower than usual.';
  } else if (avgPriceChange > 3) {
    trend = 'increasing';
    message = `Prices have increased by ${avgPriceChange.toFixed(1)}% recently.`;
    recommendation = '⚠️ Consider buying soon as prices may continue to rise.';
  } else if (variability > 20) {
    message = 'Significant price variation between suppliers.';
    recommendation = '🔍 Compare suppliers carefully to get the best deal.';
  }

  // Future price prediction (simplified)
  const futurePrediction = generateFuturePricePrediction(product, avgPriceChange);

  return {
    trend,
    message,
    recommendation,
    avgPrice: Math.round(avgPrice),
    minPrice,
    maxPrice,
    variability: Math.round(variability),
    avgPriceChange: Math.round(avgPriceChange * 10) / 10,
    futurePrediction
  };
};

/**
 * Generate future price prediction
 */
const generateFuturePricePrediction = (product, currentTrend) => {
  const seasonalFactors = getSeasonalFactors(product.category);
  const currentMonth = new Date().getMonth() + 1;
  const seasonalMultiplier = seasonalFactors[currentMonth] || 1;

  let prediction = 'stable';
  let confidence = 'medium';
  let message = 'Prices expected to remain stable';
  let timeframe = 'next week';

  // Seasonal adjustments
  if (seasonalMultiplier > 1.1) {
    prediction = 'increase';
    message = 'Prices likely to increase due to seasonal demand';
    confidence = 'high';
  } else if (seasonalMultiplier < 0.9) {
    prediction = 'decrease';
    message = 'Prices may drop as supply increases seasonally';
    confidence = 'high';
  }

  // Market trend adjustments
  if (Math.abs(currentTrend) > 5) {
    confidence = 'high';
    if (currentTrend > 0) {
      prediction = 'increase';
      message = 'Strong upward trend likely to continue';
    } else {
      prediction = 'decrease';
      message = 'Downward trend expected to continue';
    }
  }

  return {
    prediction,
    confidence,
    message,
    timeframe,
    expectedChange: Math.round(currentTrend * seasonalMultiplier)
  };
};

/**
 * Generate demand prediction
 */
const generateDemandPrediction = (product) => {
  const category = product.category;
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();
  const currentMonth = new Date().getMonth() + 1;

  let demandLevel = 'medium';
  let trend = 'stable';
  let message = 'Normal demand expected';

  // Time-based demand patterns
  if (category === 'vegetables') {
    if (currentHour >= 6 && currentHour <= 10) {
      demandLevel = 'high';
      message = 'Peak morning demand for fresh vegetables';
    } else if (currentHour >= 16 && currentHour <= 19) {
      demandLevel = 'high';
      message = 'Evening rush for dinner preparations';
    }
  }

  // Day-based patterns
  if ([0, 6].includes(currentDay)) { // Weekend
    demandLevel = demandLevel === 'high' ? 'very_high' : 'high';
    message += ' (weekend boost)';
  }

  // Seasonal patterns
  const seasonalDemand = getSeasonalDemand(category, currentMonth);
  if (seasonalDemand > 1.2) {
    demandLevel = 'high';
    trend = 'increasing';
    message = 'High seasonal demand period';
  }

  return {
    level: demandLevel,
    trend,
    message,
    factors: ['time_of_day', 'day_of_week', 'seasonal'],
    score: getDemandScore(demandLevel)
  };
};

/**
 * Calculate quality score based on suppliers
 */
const calculateQualityScore = (suppliers) => {
  if (!suppliers || suppliers.length === 0) {
    return { score: 0, message: 'No quality data available' };
  }

  const scores = suppliers.map(supplier => {
    let score = 3; // Base score

    // Rating impact
    if (supplier.supplierInfo?.stats?.rating) {
      score = supplier.supplierInfo.stats.rating;
    }

    // Delivery time impact
    if (supplier.delivery?.estimatedTime?.min < 2) {
      score += 0.5; // Fast delivery bonus
    }

    // Stock availability impact
    if (supplier.stock > 100) {
      score += 0.3; // Good stock bonus
    }

    // Certifications impact
    if (supplier.quality?.certifications?.length > 0) {
      score += 0.5;
    }

    return Math.min(5, score);
  });

  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const roundedScore = Math.round(avgScore * 10) / 10;

  let message = 'Average quality';
  if (roundedScore >= 4.5) {
    message = 'Excellent quality suppliers available';
  } else if (roundedScore >= 4.0) {
    message = 'Good quality suppliers';
  } else if (roundedScore < 3.0) {
    message = 'Quality varies - choose suppliers carefully';
  }

  return {
    score: roundedScore,
    message,
    distribution: scores
  };
};

/**
 * Generate personalized recommendations
 */
const generateRecommendations = (product, suppliers, vendorLocation) => {
  const recommendations = [];

  if (!suppliers || suppliers.length === 0) {
    return [{
      type: 'availability',
      priority: 'high',
      message: 'No suppliers currently available for this product',
      action: 'Check back later or search for alternatives'
    }];
  }

  // Price recommendations
  const prices = suppliers.map(s => s.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const savings = maxPrice - minPrice;

  if (savings > 5) {
    recommendations.push({
      type: 'price',
      priority: 'high',
      message: `Save up to ₹${savings} per unit by choosing the right supplier`,
      action: 'Compare all suppliers before ordering'
    });
  }

  // Distance recommendations
  if (vendorLocation && suppliers.length > 1) {
    const nearestSupplier = suppliers.reduce((nearest, supplier) => {
      const distance = calculateDistance(
        vendorLocation,
        supplier.supplierInfo?.profile?.address?.coordinates
      );
      return distance < nearest.distance ? { supplier, distance } : nearest;
    }, { distance: Infinity });

    if (nearestSupplier.distance < 5) {
      recommendations.push({
        type: 'logistics',
        priority: 'medium',
        message: `${nearestSupplier.supplier.supplierInfo.name} is just ${nearestSupplier.distance}km away`,
        action: 'Consider for faster delivery and lower costs'
      });
    }
  }

  // Bulk order recommendations
  const bulkSuppliers = suppliers.filter(s => s.discounts?.some(d => d.type === 'bulk'));
  if (bulkSuppliers.length > 0) {
    const bestBulkDeal = bulkSuppliers.reduce((best, supplier) => {
      const bulkDiscount = supplier.discounts.find(d => d.type === 'bulk');
      return bulkDiscount.discount > best.discount ? bulkDiscount : best;
    }, { discount: 0 });

    recommendations.push({
      type: 'bulk',
      priority: 'medium',
      message: `Save up to ${bestBulkDeal.discount}% with bulk orders`,
      action: 'Consider ordering larger quantities'
    });
  }

  // Quality recommendations
  const highQualitySuppliers = suppliers.filter(s => 
    s.supplierInfo?.stats?.rating >= 4.5
  );

  if (highQualitySuppliers.length > 0) {
    recommendations.push({
      type: 'quality',
      priority: 'medium',
      message: `${highQualitySuppliers.length} premium quality suppliers available`,
      action: 'Choose quality over price for better customer satisfaction'
    });
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
};

/**
 * Generate market trends analysis
 */
const generateMarketTrends = (product) => {
  const category = product.category;
  const currentMonth = new Date().getMonth() + 1;
  
  // Mock market trends (in production, this would use real market data)
  const trends = {
    vegetables: {
      general: 'Stable demand with seasonal variations',
      current: currentMonth >= 6 && currentMonth <= 9 
        ? 'Monsoon season affecting supply chains' 
        : 'Normal supply conditions',
      forecast: 'Prices expected to stabilize in coming weeks'
    },
    grains: {
      general: 'Steady demand from food vendors',
      current: 'Government policies supporting stable pricing',
      forecast: 'Gradual price increase expected due to inflation'
    },
    oils: {
      general: 'Price sensitive to global commodity markets',
      current: 'Import duties affecting pricing',
      forecast: 'Volatility expected in next quarter'
    }
  };

  return trends[category] || {
    general: 'Market conditions vary by region',
    current: 'Local factors influencing prices',
    forecast: 'Monitor prices regularly for best deals'
  };
};

/**
 * Generate risk assessment
 */
const generateRiskAssessment = (product, suppliers) => {
  const risks = [];
  let overallRisk = 'low';

  // Supply risk
  if (!suppliers || suppliers.length < 2) {
    risks.push({
      type: 'supply',
      level: 'high',
      description: 'Limited supplier options available',
      mitigation: 'Monitor alternative products or expand supplier network'
    });
    overallRisk = 'high';
  }

  // Price volatility risk
  const prices = suppliers?.map(s => s.price) || [];
  const priceVariability = prices.length > 1 
    ? (Math.max(...prices) - Math.min(...prices)) / Math.min(...prices) * 100 
    : 0;

  if (priceVariability > 30) {
    risks.push({
      type: 'price_volatility',
      level: 'medium',
      description: 'High price variation between suppliers',
      mitigation: 'Lock in prices with preferred suppliers or diversify orders'
    });
    overallRisk = overallRisk === 'low' ? 'medium' : overallRisk;
  }

  // Quality risk
  const avgRating = suppliers?.reduce((sum, s) => 
    sum + (s.supplierInfo?.stats?.rating || 3), 0
  ) / (suppliers?.length || 1);

  if (avgRating < 3.5) {
    risks.push({
      type: 'quality',
      level: 'medium',
      description: 'Some suppliers have lower quality ratings',
      mitigation: 'Verify quality before large orders and maintain backup suppliers'
    });
  }

  return {
    overallRisk,
    risks,
    score: getRiskScore(overallRisk),
    recommendations: generateRiskMitigationRecommendations(risks)
  };
};

// Helper functions
const getSeasonalFactors = (category) => {
  const factors = {
    vegetables: {
      1: 1.1, 2: 1.0, 3: 0.9, 4: 0.9, 5: 1.0, 6: 1.2,
      7: 1.3, 8: 1.2, 9: 1.1, 10: 1.0, 11: 0.9, 12: 1.1
    },
    grains: {
      1: 1.0, 2: 1.0, 3: 1.0, 4: 1.1, 5: 1.2, 6: 1.1,
      7: 1.0, 8: 1.0, 9: 1.0, 10: 1.1, 11: 1.2, 12: 1.1
    }
  };
  return factors[category] || {};
};

const getSeasonalDemand = (category, month) => {
  const demand = getSeasonalFactors(category);
  return demand[month] || 1.0;
};

const getDemandScore = (level) => {
  const scores = {
    'very_low': 1,
    'low': 2,
    'medium': 3,
    'high': 4,
    'very_high': 5
  };
  return scores[level] || 3;
};

const getRiskScore = (level) => {
  const scores = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'very_high': 4
  };
  return scores[level] || 1;
};

const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return null;
  
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
};

const generateRiskMitigationRecommendations = (risks) => {
  return risks.map(risk => risk.mitigation);
};

const generateFallbackInsights = () => {
  return {
    priceAnalysis: {
      trend: 'stable',
      message: 'Unable to analyze pricing at this time',
      recommendation: 'Compare available options manually'
    },
    demandPrediction: {
      level: 'medium',
      message: 'Normal demand expected'
    },
    qualityScore: {
      score: 3,
      message: 'Quality information not available'
    },
    recommendations: [{
      type: 'general',
      priority: 'low',
      message: 'Check supplier ratings and reviews before ordering',
      action: 'Compare multiple suppliers'
    }]
  };
};

module.exports = {
  generateAIInsights,
  generatePriceAnalysis,
  generateDemandPrediction,
  calculateQualityScore,
  generateRecommendations
};
