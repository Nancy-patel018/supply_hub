const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Generate AI insights for products using Gemini AI
 * @param {Object} product - Product data
 * @param {Object} vendorLocation - Vendor's location coordinates
 * @param {Array} suppliers - Available suppliers for the product
 * @returns {Object} - AI insights
 */
const generateAIInsights = async (product, vendorLocation, suppliers = []) => {
  try {
    const insights = {
      priceAnalysis: await generatePriceAnalysis(product, suppliers),
      demandPrediction: generateDemandPrediction(product),
      qualityScore: calculateQualityScore(suppliers),
      recommendations: await generateRecommendations(product, suppliers, vendorLocation),
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
 * Generate price analysis using Gemini AI
 */
const generatePriceAnalysis = async (product, suppliers) => {
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

  // Get AI-powered trend analysis
  let trendAnalysis = null;
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
      Analyze the price trend for ${product.name} with the following data:
      - Average Price: ₹${avgPrice}
      - Price Range: ₹${minPrice} - ₹${maxPrice}
      - Price Variability: ${variability.toFixed(1)}%
      - Category: ${product.category}
      - Season: ${getCurrentSeason()}
      
      Provide analysis in JSON format with:
      {
        "trend": "increasing/decreasing/stable",
        "forecast": "next week price prediction",
        "confidence": "percentage 0-100",
        "factors": ["factor1", "factor2"],
        "advice": "brief buying advice"
      }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        trendAnalysis = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
      }
    } catch (error) {
      console.error('Error with Gemini AI:', error);
    }
  }

  return {
    currentPrice: {
      average: Math.round(avgPrice * 100) / 100,
      minimum: minPrice,
      maximum: maxPrice,
      variability: Math.round(variability * 100) / 100
    },
    trend: trendAnalysis || {
      trend: variability > 20 ? 'volatile' : 'stable',
      forecast: `₹${Math.round((avgPrice * 1.02) * 100) / 100}`,
      confidence: variability < 10 ? 85 : 65,
      factors: ['Market supply', 'Seasonal demand'],
      advice: avgPrice === minPrice ? 'Good time to buy' : 'Consider waiting'
    },
    bestDeal: suppliers.find(s => s.price === minPrice),
    priceComparison: suppliers.map(s => ({
      supplierId: s._id,
      supplierName: s.supplierName,
      price: s.price,
      savings: Math.round((avgPrice - s.price) * 100) / 100,
      percentage: Math.round(((avgPrice - s.price) / avgPrice) * 10000) / 100,
      recommendation: s.price <= avgPrice * 0.9 ? 'excellent' : 
                     s.price <= avgPrice * 1.1 ? 'good' : 'expensive'
    }))
  };
};

/**
 * Generate demand prediction
 */
const generateDemandPrediction = (product) => {
  const season = getCurrentSeason();
  const dayOfWeek = new Date().getDay();
  const hour = new Date().getHours();
  
  // Simple algorithm for demand prediction
  let demandScore = 50; // Base demand
  
  // Seasonal adjustments
  const seasonalFactors = {
    'summer': { 'beverages': 1.5, 'ice-cream': 2.0, 'fruits': 1.3 },
    'winter': { 'hot-drinks': 1.8, 'snacks': 1.2, 'vegetables': 1.1 },
    'monsoon': { 'hot-food': 1.4, 'beverages': 0.8, 'vegetables': 1.2 },
    'spring': { 'fruits': 1.4, 'vegetables': 1.3, 'snacks': 1.1 }
  };
  
  const categoryFactor = seasonalFactors[season]?.[product.category] || 1.0;
  demandScore *= categoryFactor;
  
  // Day of week factor (weekends typically higher demand)
  const dayFactor = [0.8, 0.9, 1.0, 1.0, 1.1, 1.3, 1.4][dayOfWeek];
  demandScore *= dayFactor;
  
  // Hour factor (meal times have higher demand)
  const hourFactor = hour >= 7 && hour <= 10 ? 1.4 : // Breakfast
                    hour >= 12 && hour <= 14 ? 1.6 : // Lunch
                    hour >= 17 && hour <= 20 ? 1.5 : // Dinner
                    hour >= 21 && hour <= 23 ? 1.2 : // Late snacks
                    0.7; // Off hours
  demandScore *= hourFactor;
  
  demandScore = Math.min(100, Math.max(0, demandScore));
  
  return {
    score: Math.round(demandScore),
    level: demandScore > 80 ? 'very-high' :
           demandScore > 60 ? 'high' :
           demandScore > 40 ? 'medium' :
           demandScore > 20 ? 'low' : 'very-low',
    factors: {
      seasonal: Math.round((categoryFactor - 1) * 100),
      dayOfWeek: Math.round((dayFactor - 1) * 100),
      timeOfDay: Math.round((hourFactor - 1) * 100)
    },
    prediction: {
      nextHour: Math.round(demandScore * (Math.random() * 0.2 + 0.9)),
      next24Hours: Math.round(demandScore * (Math.random() * 0.3 + 0.85)),
      nextWeek: Math.round(demandScore * (Math.random() * 0.4 + 0.8))
    }
  };
};

/**
 * Calculate quality score for suppliers
 */
const calculateQualityScore = (suppliers) => {
  if (!suppliers || suppliers.length === 0) {
    return { score: 0, factors: [] };
  }
  
  const scores = suppliers.map(supplier => {
    let score = 0;
    let factors = [];
    
    // Rating factor (40% weight)
    if (supplier.rating) {
      const ratingScore = (supplier.rating / 5) * 40;
      score += ratingScore;
      factors.push(`Rating: ${supplier.rating}/5 (${ratingScore.toFixed(1)} points)`);
    }
    
    // Review count factor (20% weight)
    if (supplier.totalReviews) {
      const reviewScore = Math.min(20, Math.log10(supplier.totalReviews + 1) * 10);
      score += reviewScore;
      factors.push(`Reviews: ${supplier.totalReviews} (${reviewScore.toFixed(1)} points)`);
    }
    
    // Distance factor (20% weight) - closer is better
    if (supplier.distance) {
      const distanceScore = Math.max(0, 20 - (supplier.distance * 2));
      score += distanceScore;
      factors.push(`Distance: ${supplier.distance}km (${distanceScore.toFixed(1)} points)`);
    }
    
    // Response time factor (10% weight)
    if (supplier.avgResponseTime) {
      const responseScore = Math.max(0, 10 - (supplier.avgResponseTime / 60));
      score += responseScore;
      factors.push(`Response: ${supplier.avgResponseTime}min (${responseScore.toFixed(1)} points)`);
    }
    
    // Availability factor (10% weight)
    const availabilityScore = supplier.availability === 'in-stock' ? 10 : 
                             supplier.availability === 'low-stock' ? 5 : 0;
    score += availabilityScore;
    factors.push(`Stock: ${supplier.availability} (${availabilityScore} points)`);
    
    return {
      supplierId: supplier._id,
      supplierName: supplier.supplierName,
      score: Math.round(score * 100) / 100,
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
      factors
    };
  });
  
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  const topSupplier = scores.reduce((best, current) => 
    current.score > best.score ? current : best, scores[0]);
  
  return {
    averageScore: Math.round(avgScore * 100) / 100,
    topSupplier,
    allScores: scores,
    recommendation: avgScore >= 70 ? 'Excellent suppliers available' :
                   avgScore >= 50 ? 'Good suppliers available' :
                   'Limited quality suppliers available'
  };
};

/**
 * Generate personalized recommendations using Gemini AI
 */
const generateRecommendations = async (product, suppliers, vendorLocation) => {
  const priceAnalysis = await generatePriceAnalysis(product, suppliers);
  const demandPrediction = generateDemandPrediction(product);
  const qualityScore = calculateQualityScore(suppliers);
  
  let aiRecommendations = [];
  
  // Get AI-powered recommendations
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `
      As a business advisor for street food vendors, provide 3 specific recommendations for purchasing ${product.name}.
      
      Context:
      - Average price: ₹${priceAnalysis.currentPrice?.average}
      - Demand level: ${demandPrediction.level}
      - Quality score: ${qualityScore.averageScore}/100
      - Available suppliers: ${suppliers.length}
      
      Format as JSON array:
      [
        {
          "type": "pricing/timing/supplier/quantity",
          "title": "Short recommendation title",
          "description": "Detailed explanation",
          "priority": "high/medium/low",
          "action": "specific action to take"
        }
      ]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        aiRecommendations = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing recommendations:', parseError);
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
    }
  }
  
  // Fallback recommendations if AI fails
  if (aiRecommendations.length === 0) {
    aiRecommendations = [
      {
        type: "pricing",
        title: "Best Price Available",
        description: `Get ${product.name} at ₹${priceAnalysis.currentPrice?.minimum} from ${priceAnalysis.bestDeal?.supplierName}`,
        priority: "high",
        action: "Order from best-priced supplier"
      },
      {
        type: "timing",
        title: "Demand Timing",
        description: `Current demand is ${demandPrediction.level}. ${demandPrediction.score > 70 ? 'Order soon to meet high demand' : 'Good time to stock up'}`,
        priority: demandPrediction.score > 70 ? "high" : "medium",
        action: demandPrediction.score > 70 ? "Order immediately" : "Plan regular orders"
      },
      {
        type: "supplier",
        title: "Quality Choice",
        description: `${qualityScore.topSupplier?.supplierName} offers the best quality with grade ${qualityScore.topSupplier?.grade}`,
        priority: "medium",
        action: "Consider quality over price"
      }
    ];
  }
  
  return {
    count: aiRecommendations.length,
    items: aiRecommendations,
    summary: `${aiRecommendations.filter(r => r.priority === 'high').length} high priority recommendations available`
  };
};

/**
 * Generate market trends
 */
const generateMarketTrends = (product) => {
  const season = getCurrentSeason();
  const trends = [];
  
  // Seasonal trends
  const seasonalTrends = {
    'summer': {
      'beverages': { trend: 'increasing', factor: 1.3 },
      'fruits': { trend: 'increasing', factor: 1.2 },
      'vegetables': { trend: 'stable', factor: 1.0 }
    },
    'winter': {
      'hot-drinks': { trend: 'increasing', factor: 1.4 },
      'snacks': { trend: 'increasing', factor: 1.1 },
      'fruits': { trend: 'decreasing', factor: 0.9 }
    },
    'monsoon': {
      'hot-food': { trend: 'increasing', factor: 1.2 },
      'beverages': { trend: 'decreasing', factor: 0.8 }
    }
  };
  
  const seasonalTrend = seasonalTrends[season]?.[product.category];
  if (seasonalTrend) {
    trends.push({
      type: 'seasonal',
      description: `${product.category} demand is ${seasonalTrend.trend} this ${season}`,
      impact: seasonalTrend.factor > 1.1 ? 'positive' : 
              seasonalTrend.factor < 0.9 ? 'negative' : 'neutral',
      confidence: 85
    });
  }
  
  // Weekly trends
  const dayOfWeek = new Date().getDay();
  const weekendEffect = [5, 6].includes(dayOfWeek);
  if (weekendEffect) {
    trends.push({
      type: 'weekly',
      description: 'Weekend typically shows increased food demand',
      impact: 'positive',
      confidence: 75
    });
  }
  
  // Daily trends
  const hour = new Date().getHours();
  const mealTime = (hour >= 7 && hour <= 10) || 
                  (hour >= 12 && hour <= 14) || 
                  (hour >= 17 && hour <= 20);
  if (mealTime) {
    trends.push({
      type: 'daily',
      description: 'Peak meal time - high demand period',
      impact: 'positive',
      confidence: 90
    });
  }
  
  return {
    count: trends.length,
    trends,
    overall: trends.length > 0 ? 
      (trends.filter(t => t.impact === 'positive').length > trends.filter(t => t.impact === 'negative').length ? 'positive' : 'negative') 
      : 'neutral'
  };
};

/**
 * Generate risk assessment
 */
const generateRiskAssessment = (product, suppliers) => {
  const risks = [];
  let riskScore = 0;
  
  // Supply risk
  if (suppliers.length < 3) {
    risks.push({
      type: 'supply',
      level: suppliers.length === 1 ? 'high' : 'medium',
      description: `Limited suppliers (${suppliers.length}) may affect availability`,
      mitigation: 'Find additional suppliers in your area'
    });
    riskScore += suppliers.length === 1 ? 30 : 15;
  }
  
  // Price volatility risk
  const prices = suppliers.map(s => s.price);
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const priceVariance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
  const volatility = Math.sqrt(priceVariance) / avgPrice * 100;
  
  if (volatility > 20) {
    risks.push({
      type: 'price',
      level: volatility > 40 ? 'high' : 'medium',
      description: `High price volatility (${volatility.toFixed(1)}%) across suppliers`,
      mitigation: 'Lock in prices with preferred suppliers'
    });
    riskScore += volatility > 40 ? 25 : 15;
  }
  
  // Quality risk
  const lowQualitySuppliers = suppliers.filter(s => s.rating && s.rating < 3).length;
  if (lowQualitySuppliers > 0) {
    risks.push({
      type: 'quality',
      level: lowQualitySuppliers / suppliers.length > 0.5 ? 'high' : 'medium',
      description: `${lowQualitySuppliers} suppliers have low ratings`,
      mitigation: 'Focus on higher-rated suppliers'
    });
    riskScore += lowQualitySuppliers / suppliers.length > 0.5 ? 20 : 10;
  }
  
  // Distance risk
  const distantSuppliers = suppliers.filter(s => s.distance && s.distance > 10).length;
  if (distantSuppliers > suppliers.length * 0.7) {
    risks.push({
      type: 'logistics',
      level: 'medium',
      description: 'Most suppliers are far away, affecting delivery time',
      mitigation: 'Plan orders in advance or find local suppliers'
    });
    riskScore += 10;
  }
  
  return {
    overallRisk: riskScore < 20 ? 'low' : riskScore < 50 ? 'medium' : 'high',
    riskScore: Math.min(100, riskScore),
    risks,
    recommendation: riskScore < 20 ? 'Low risk - proceed with confidence' :
                   riskScore < 50 ? 'Medium risk - take precautions' :
                   'High risk - consider alternatives'
  };
};

/**
 * Generate fallback insights when AI is unavailable
 */
const generateFallbackInsights = () => {
  return {
    priceAnalysis: {
      status: 'unavailable',
      message: 'Price analysis temporarily unavailable'
    },
    demandPrediction: {
      score: 50,
      level: 'medium',
      message: 'Using basic demand prediction'
    },
    qualityScore: {
      score: 0,
      message: 'Quality scoring unavailable'
    },
    recommendations: {
      count: 1,
      items: [{
        type: 'general',
        title: 'Compare Options',
        description: 'Review available suppliers and choose based on price and ratings',
        priority: 'medium',
        action: 'Manual comparison recommended'
      }]
    },
    marketTrends: {
      count: 0,
      trends: [],
      overall: 'neutral'
    },
    riskAssessment: {
      overallRisk: 'unknown',
      riskScore: 0,
      risks: []
    }
  };
};

/**
 * Helper function to get current season
 */
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'summer';
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 10 && month <= 11) return 'winter';
  return 'spring';
};

module.exports = {
  generateAIInsights,
  generatePriceAnalysis,
  generateDemandPrediction,
  calculateQualityScore,
  generateRecommendations,
  generateMarketTrends,
  generateRiskAssessment
};
