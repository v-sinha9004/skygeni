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

interface StackData {
  quarter: string;
  [key: string]: number | string;
}

interface BarChartProps {
  data: Array<CustomerTypeData | AccountIndustryData | TeamData>;
  categoryKey: 'Cust_Type' | 'Acct_Industry' | 'Team';
}

const BarChart: React.FC<BarChartProps> = ({ data, categoryKey }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const width = 780;
    const height = 420;
    const margin = { top: 20, right: 30, bottom: 80, left: 50 };

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const groupedData = d3.group(data, (d) => d.closed_fiscal_quarter);
    const quarters = Array.from(groupedData.keys()).sort();
    const categories = Array.from(new Set(data.map((d) => getCategoryValue(d, categoryKey))));

    const stackData: StackData[] = quarters.map((quarter) => {
      const entries = groupedData.get(quarter) || [];
      const quarterData: StackData = { quarter } as StackData;
      categories.forEach((category) => {
        const entry = entries.find((item) => getCategoryValue(item, categoryKey) === category);
        quarterData[category] = entry ? entry.acv : 0;
      });
      return quarterData;
    });

    const stack = d3
      .stack<StackData>()
      .keys(categories)
      .value((d, key) => Number(d[key]));

    const stackedData = stack(stackData);

    const x = d3
      .scaleBand()
      .domain(quarters)
      .range([0, width - margin.left - margin.right])
      .padding(0.6);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(stackedData, (d) => d3.max(d, (d) => d[1])) || 1000])
      .nice()
      .range([height - margin.top - margin.bottom, 0]);

    const color = d3.scaleOrdinal().domain(categories).range(d3.schemeCategory10);

    const yTicks = y.ticks().filter((t) => t % 200 === 0 || t === 0);
    g.selectAll('.grid-line')
      .data(yTicks)
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', width - margin.left - margin.right)
      .attr('y1', (d) => y(d))
      .attr('y2', (d) => y(d))
      .attr('stroke', '#d3d3d3')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4')
      .attr('opacity', 0.7);

    // Create tooltip
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '8px')
      .style('background', 'black')
      .style('border-radius', '4px')
      .style('color', 'white')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('opacity', 0);

    g.selectAll('.layer')
      .data(stackedData)
      .enter()
      .append('g')
      .attr('class', 'layer')
      .attr('fill', (d) => color(d.key) as string)
      .each(function (layerData) {
        d3.select(this)
          .selectAll('rect')
          .data(layerData)
          .enter()
          .append('rect')
          .attr('x', (d) => x(d.data.quarter) ?? 0)
          .attr('y', (d) => y(d[1]))
          .attr('height', (d) => y(d[0]) - y(d[1]))
          .attr('width', x.bandwidth())
          .attr('data-key', layerData.key)
          .on('mouseover', function (event, d) {
            const value = d[1] - d[0];
            const total = d3.sum(categories.map((k) => Number(d.data[k])));
            const percent = total ? ((value / total) * 100).toFixed(1) : '0.0';

            const key = d3.select(this).attr('data-key');
            const barColor = color(key);

            tooltip
              .style('opacity', 1)
              .style('background', barColor as string)
              // .style('color', 'white')
              .html(
                `<strong>Value:</strong> ${Math.round(
                  value,
                )}<br/><strong>Percentage:</strong> ${percent}%`,
              );
          })
          .on('mousemove', function (event) {
            tooltip.style('left', event.pageX + 10 + 'px').style('top', event.pageY - 28 + 'px');
          })
          .on('mouseout', function () {
            tooltip.style('opacity', 0);
          });
      });

    // Add total value text at the top of each bar
    const totals = stackData.map((d) => {
      const total = categories.reduce((sum, cat) => sum + Number(d[cat]), 0);
      return { quarter: d.quarter, total };
    });

    g.selectAll('.bar-total-label')
      .data(totals)
      .enter()
      .append('text')
      .attr('class', 'bar-total-label')
      .attr('x', (d) => (x(d.quarter) ?? 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.total) - 5) // 5px above the top
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '12px')
      .text((d) => `$${Math.round(d.total / 1000)}k`);

    g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x));

    g.append('g').call(d3.axisLeft(y).ticks(10).tickValues(yTicks).tickFormat(d3.format('~s')));

    const color1 = d3.scaleOrdinal().domain(categories).range(d3.schemeCategory10);

    // Legend group positioned below the chart
    const legendG = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${height - margin.bottom + 30})`); // move legend below chart

    let legendX = 0;
    let legendY = 0;
    const legendPadding = 15;
    const legendSpacingY = 25;
    const maxLegendWidth = width - margin.left - margin.right;

    categories.forEach((category) => {
      const legendGroup = legendG
        .append('g')
        .attr('transform', `translate(${legendX}, ${legendY})`);

      // Colored box
      legendGroup
        .append('rect')
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', color1(category) as string);

      // Text label
      legendGroup.append('text').attr('x', 24).attr('y', 14).text(category).attr('font-size', 12);

      // Calculate total width of this legend item
      const legendItemWidth = (legendGroup.node() as SVGGElement).getBBox().width;

      // Wrap to next row if necessary
      if (legendX + legendItemWidth + legendPadding > maxLegendWidth) {
        legendX = 0;
        legendY += legendSpacingY;
        legendGroup.attr('transform', `translate(${legendX}, ${legendY})`);
      }

      legendX += legendItemWidth + legendPadding;
    });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, categoryKey]);

  return <svg ref={svgRef}></svg>;
};

export default BarChart;
