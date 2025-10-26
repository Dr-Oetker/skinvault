import { useEffect, useRef, useState } from 'react';

interface CasePrice {
  id: number;
  case_id: number;
  recorded_at: string;
  highest_buy_order: number;
  lowest_sell_order: number;
  buy_order_count: number;
  sell_order_count: number;
  spread: number;
}

interface PriceChartProps {
  data: CasePrice[];
  maxPoints?: number;
}

interface TooltipData {
  x: number;
  y: number;
  price: CasePrice;
  type: 'buy' | 'sell';
}

// Sample data to reduce the number of points for better visualization
const sampleData = (data: CasePrice[], maxPoints: number): CasePrice[] => {
  if (data.length <= maxPoints) return data;
  
  const step = Math.floor(data.length / maxPoints);
  const sampled: CasePrice[] = [];
  
  // Always include the first and last points
  sampled.push(data[0]);
  
  // Sample points at regular intervals
  for (let i = step; i < data.length - 1; i += step) {
    sampled.push(data[i]);
  }
  
  // Always include the last point
  if (data.length > 1) {
    sampled.push(data[data.length - 1]);
  }
  
  return sampled;
};

export default function PriceChart({ data, maxPoints = 50 }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        // Responsive height based on screen size
        const height = window.innerWidth < 640 ? 280 : 350; // Smaller on mobile
        setDimensions({ width: rect.width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Mouse event handlers for tooltips
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Update mouse position for tooltip
    setMousePosition({ x: event.clientX, y: event.clientY });

    // Chart dimensions
    const padding = 50;
    const chartWidth = dimensions.width - (padding * 2);
    const chartHeight = dimensions.height - (padding * 2) - 30;
    
    // Check if mouse is within chart area
    if (x < padding || x > padding + chartWidth || y < padding || y > padding + chartHeight) {
      setTooltip(null);
      return;
    }

    const sortedData = [...data].reverse();
    const sampledData = sortedData.length > maxPoints 
      ? sampleData(sortedData, maxPoints)
      : sortedData;
    
    // Find closest data point by X coordinate
    let closestIndex = 0;
    let minDistance = Infinity;
    
    for (let i = 0; i < sampledData.length; i++) {
      const pointX = padding + (i / (sampledData.length - 1)) * chartWidth;
      const distance = Math.abs(x - pointX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    // Check if mouse is close enough to a data point (within 30px)
    if (minDistance < 30) {
      const point = sampledData[closestIndex];
      
      // Calculate price ranges
      const allPrices = sortedData.flatMap(d => [d.highest_buy_order, d.lowest_sell_order]);
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      const priceRange = maxPrice - minPrice;
      const pricePadding = priceRange * 0.1;
      const yMin = minPrice - pricePadding;
      const yMax = maxPrice + pricePadding;
      const priceToY = (price: number) => padding + ((price - yMin) / (yMax - yMin)) * chartHeight;
      
      const buyY = priceToY(point.highest_buy_order);
      const sellY = priceToY(point.lowest_sell_order);
      
      // Determine which line is closer
      const buyDistance = Math.abs(y - buyY);
      const sellDistance = Math.abs(y - sellY);
      
      if (buyDistance < sellDistance && buyDistance < 20) {
        // Calculate the exact position of the data point on the chart
        const pointX = padding + (closestIndex / (sortedData.length - 1)) * chartWidth;
        const pointY = buyY;
        
        console.log('Buy tooltip at:', { pointX, pointY, buyY, closestIndex });
        
        setTooltip({
          x: pointX,
          y: pointY,
          price: point,
          type: 'buy'
        });
      } else if (sellDistance < 20) {
        // Calculate the exact position of the data point on the chart
        const pointX = padding + (closestIndex / (sortedData.length - 1)) * chartWidth;
        const pointY = sellY;
        
        console.log('Sell tooltip at:', { pointX, pointY, sellY, closestIndex });
        
        setTooltip({
          x: pointX,
          y: pointY,
          price: point,
          type: 'sell'
        });
      } else {
        setTooltip(null);
      }
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  useEffect(() => {
    if (!data || data.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width * window.devicePixelRatio;
    canvas.height = dimensions.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Sort data by date (oldest first for charting)
    const sortedData = [...data].reverse();
    
    // Sample data if we have too many points
    const sampledData = sortedData.length > maxPoints 
      ? sampleData(sortedData, maxPoints)
      : sortedData;
    
    if (sampledData.length < 2) {
      // Not enough data to draw a chart
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Not enough data to display chart', dimensions.width / 2, dimensions.height / 2);
      return;
    }

    // Chart dimensions
    const padding = 50; // Increased to accommodate axis titles
    const chartWidth = dimensions.width - (padding * 2);
    const chartHeight = dimensions.height - (padding * 2) - 30; // Extra space for axis titles

    // Find min/max values for scaling
    const allPrices = sampledData.flatMap(d => [d.highest_buy_order, d.lowest_sell_order]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice;
    const pricePadding = priceRange * 0.1; // 10% padding
    const yMin = minPrice - pricePadding;
    const yMax = maxPrice + pricePadding;

    // Helper function to convert price to Y coordinate (higher prices at top)
    const priceToY = (price: number) => {
      return padding + ((price - yMin) / (yMax - yMin)) * chartHeight;
    };

    // Helper function to convert data index to X coordinate
    const indexToX = (index: number) => {
      return padding + (index / (sampledData.length - 1)) * chartWidth;
    };

    // Draw grid lines
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i / 5) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 5; i++) {
      const x = padding + (i / 5) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }

    // Draw buy order line
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    sampledData.forEach((point, index) => {
      const x = indexToX(index);
      const y = priceToY(point.highest_buy_order);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw sell order line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    sampledData.forEach((point, index) => {
      const x = indexToX(index);
      const y = priceToY(point.lowest_sell_order);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw data points
    sampledData.forEach((point, index) => {
      const x = indexToX(index);
      
      // Buy order point
      const buyY = priceToY(point.highest_buy_order);
      const isBuyHighlighted = tooltip && tooltip.price.id === point.id && tooltip.type === 'buy';
      ctx.fillStyle = isBuyHighlighted ? '#34d399' : '#10b981';
      ctx.beginPath();
      ctx.arc(x, buyY, isBuyHighlighted ? 5 : 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add white border for highlighted points
      if (isBuyHighlighted) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Sell order point
      const sellY = priceToY(point.lowest_sell_order);
      const isSellHighlighted = tooltip && tooltip.price.id === point.id && tooltip.type === 'sell';
      ctx.fillStyle = isSellHighlighted ? '#f87171' : '#ef4444';
      ctx.beginPath();
      ctx.arc(x, sellY, isSellHighlighted ? 5 : 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add white border for highlighted points
      if (isSellHighlighted) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Responsive font sizes based on screen size
    const isMobile = window.innerWidth < 640;
    const fontSize = isMobile ? '10px' : '12px';
    const titleFontSize = isMobile ? '12px' : '14px';
    const labelSpacing = isMobile ? 15 : 20;
    const titleSpacing = isMobile ? 35 : 45;

    // Draw Y-axis labels (Price values) - higher prices at top
    ctx.fillStyle = '#d1d5db';
    ctx.font = `bold ${fontSize} sans-serif`;
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = yMax - (i / 5) * (yMax - yMin); // Invert the price calculation
      const y = padding + (i / 5) * chartHeight;
      ctx.fillText(`$${price.toFixed(2)}`, padding - 10, y + 4);
    }

    // Draw Y-axis title
    ctx.save();
    ctx.translate(15, padding + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = '#9ca3af';
    ctx.font = `bold ${titleFontSize} sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Price ($)', 0, 0);
    ctx.restore();

    // Draw X-axis labels (dates) - fewer labels on mobile
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d1d5db';
    ctx.font = `bold ${fontSize} sans-serif`;
    const maxLabels = isMobile ? 3 : 5;
    const labelIndices = [];
    for (let i = 0; i < maxLabels; i++) {
      const index = Math.floor((i / (maxLabels - 1)) * (sampledData.length - 1));
      labelIndices.push(index);
    }
    
    labelIndices.forEach(index => {
      if (index < sampledData.length) {
        const x = indexToX(index);
        const date = new Date(sampledData[index].recorded_at);
        const dateStr = isMobile 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(dateStr, x, padding + chartHeight + labelSpacing);
      }
    });

    // Draw X-axis title
    ctx.fillStyle = '#9ca3af';
    ctx.font = `bold ${titleFontSize} sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Time', padding + chartWidth / 2, padding + chartHeight + titleSpacing);

    // Draw legend - responsive positioning
    const legendY = padding + chartHeight + titleSpacing + 10;
    ctx.textAlign = 'left';
    ctx.font = `bold ${fontSize} sans-serif`;
    
    // Buy order legend
    ctx.fillStyle = '#10b981';
    ctx.fillRect(padding, legendY, isMobile ? 10 : 12, isMobile ? 10 : 12);
    ctx.fillStyle = '#d1d5db';
    ctx.fillText('Buy Orders', padding + (isMobile ? 15 : 20), legendY + (isMobile ? 7 : 9));
    
    // Sell order legend
    const sellLegendX = isMobile ? padding + 80 : padding + 120;
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(sellLegendX, legendY, isMobile ? 10 : 12, isMobile ? 10 : 12);
    ctx.fillStyle = '#d1d5db';
    ctx.fillText('Sell Orders', sellLegendX + (isMobile ? 15 : 20), legendY + (isMobile ? 7 : 9));

  }, [data, dimensions, maxPoints]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-dark-bg-secondary rounded-lg">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <div className="text-dark-text-muted">No price data available</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full bg-dark-bg-secondary rounded-lg cursor-crosshair"
          style={{ 
            maxWidth: '100%', 
            height: window.innerWidth < 640 ? '280px' : '350px',
            minHeight: '280px'
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      
      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-50 bg-dark-bg-primary border border-dark-border-primary rounded-lg shadow-lg p-3 pointer-events-none"
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y - 10}px`,
            transform: 'translateY(-100%)',
            maxWidth: '200px'
          }}
        >
          <div className="text-sm">
            <div className="font-semibold text-dark-text-primary mb-1">
              {tooltip.type === 'buy' ? 'Buy Order' : 'Sell Order'}
            </div>
            <div className={`font-bold text-lg ${tooltip.type === 'buy' ? 'text-accent-success' : 'text-accent-error'}`}>
              ${tooltip.type === 'buy' ? tooltip.price.highest_buy_order.toFixed(2) : tooltip.price.lowest_sell_order.toFixed(2)}
            </div>
            <div className="text-xs text-dark-text-muted mt-1">
              {new Date(tooltip.price.recorded_at).toLocaleString()}
            </div>
            <div className="text-xs text-dark-text-muted">
              Spread: ${tooltip.price.spread.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
