import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CustomerTypeData, AccountIndustryData, TeamData } from '../types/types';

// Type guard to narrow the type based on categoryKey
function getCategoryValue(
  item: CustomerTypeData | AccountIndustryData | TeamData,
  categoryKey: 'Cust_Type' | 'Acct_Industry' | 'Team',
): string {
  if (categoryKey === 'Cust_Type' && 'Cust_Type' in item) {
    return item.Cust_Type;
  } else if (categoryKey === 'Acct_Industry' && 'Acct_Industry' in item) {
    return item.Acct_Industry;
  } else if (categoryKey === 'Team' && 'Team' in item) {
    return item.Team;
  }
  throw new Error(`Invalid categoryKey ${categoryKey} for item`);
}

interface DoughnutChartProps {
  data: Array<CustomerTypeData | AccountIndustryData | TeamData>;
  categoryKey: 'Cust_Type' | 'Acct_Industry' | 'Team';
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, categoryKey }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    // Set up dimensions
    const width = 500;
    const height = 300;

    const radius = Math.min(width, height) / 2; // Adjusted radius to leave space for labels

    // Clear previous SVG content
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    svg.selectAll('*').remove();

    // Center the group within the SVG
    const g = svg.append('g').attr('transform', `translate(${width / 2},${height / 2})`);

    // Calculate total ACV by category using the type guard
    const totals = d3.rollup(
      data,
      (v) => d3.sum(v, (d) => d.acv),
      (d) => getCategoryValue(d, categoryKey),
    );

    const pie = d3.pie<[string, number]>().value((d) => d[1])(Array.from(totals.entries()));

    const arc = d3
      .arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(radius * 0.3) // For doughnut effect
      .outerRadius(radius * 0.7);

    const outerArc = d3
      .arc<d3.PieArcDatum<[string, number]>>()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);

    const color = d3.scaleOrdinal().domain(totals.keys()).range(d3.schemeCategory10);

    // Draw the doughnut chart
    g.selectAll('path')
      .data(pie)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data[0]) as string);

    // Calculate midAngles and label positions with boundary checks
    let labelPoints = pie.map((d) => {
      const midAngle = (d.startAngle + d.endAngle) / 2;
      const pos = outerArc.centroid(d);

      const labelRadius = radius * 1.2; // Reduced to 1.2 to stay closer to SVG
      const x = Math.cos(midAngle - Math.PI / 2) * labelRadius;
      const y = Math.sin(midAngle - Math.PI / 2) * labelRadius;

      return {
        ...d,
        labelPos: [x, y],
        midAngle,
      };
    });

    // Sort vertically (by y) to avoid collision and apply boundary constraints
    labelPoints.sort((a, b) => a.labelPos[1] - b.labelPos[1]);

    const maxOffset = 20; // Minimum vertical spacing
    for (let i = 1; i < labelPoints.length; i++) {
      const dy = labelPoints[i].labelPos[1] - labelPoints[i - 1].labelPos[1];
      if (Math.abs(dy) < maxOffset) {
        labelPoints[i].labelPos[1] =
          labelPoints[i - 1].labelPos[1] + maxOffset * (labelPoints[i].labelPos[1] > 0 ? 1 : -1);
      }
    }

    // Apply boundary constraints to keep within SVG
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    labelPoints = labelPoints.map((d) => ({
      ...d,
      labelPos: [
        Math.max(-halfWidth + 20, Math.min(halfWidth - 20, d.labelPos[0])), // -280 to 280
        Math.max(-halfHeight + 20, Math.min(halfHeight - 20, d.labelPos[1])), // -180 to 180
      ],
    }));

    // Draw polylines with boundary checks
    g.selectAll('polyline')
      .data(labelPoints)
      .enter()
      .append('polyline')
      .attr('stroke', 'gray')
      .attr('stroke-width', 1)
      .attr('fill', 'none')
      .attr('points', (d) => {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = d.labelPos;
        // Ensure all points stay within SVG boundaries
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const constrainedPosA = [
          Math.max(-halfWidth + 10, Math.min(halfWidth - 10, posA[0])),
          Math.max(-halfHeight + 10, Math.min(halfHeight - 10, posA[1])),
        ];
        const constrainedPosB = [
          Math.max(-halfWidth + 10, Math.min(halfWidth - 10, posB[0])),
          Math.max(-halfHeight + 10, Math.min(halfHeight - 10, posB[1])),
        ];
        const constrainedPosC = [
          Math.max(-halfWidth + 20, Math.min(halfWidth - 20, posC[0])),
          Math.max(-halfHeight + 20, Math.min(halfHeight - 20, posC[1])),
        ];
        return [constrainedPosA, constrainedPosB, constrainedPosC]
          .map((p) => p.join(','))
          .join(' ');
      });

    // Draw labels with boundary checks
    g.selectAll('text.label')
      .data(labelPoints)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('text-anchor', (d) => (d.labelPos[0] > 0 ? 'start' : 'end'))
      .attr('transform', (d) => `translate(${d.labelPos})`)
      .attr('dy', '0.35em')
      .attr('font-size', '16px')
      .text((d) => `${Math.round((d.data[1] / d3.sum(pie, (d) => d.data[1])) * 100)}%`);

    // Add total in the center
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-weight', 'bold')
      .selectAll('tspan')
      .data(['Total', `$${Math.round(d3.sum(pie, (d) => d.data[1]) / 1000)}K`])
      .enter()
      .append('tspan')
      .attr('x', 0)
      .attr('dy', (d, i) => (i === 0 ? 0 : '1.2em')) // Vertical offset between lines
      .text((d) => d);
  }, [data, categoryKey]);

  return (
    <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
      <svg ref={svgRef} viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default DoughnutChart;
