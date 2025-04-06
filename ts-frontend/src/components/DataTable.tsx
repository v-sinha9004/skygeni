import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
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

interface DataTableProps {
  data: Array<CustomerTypeData | AccountIndustryData | TeamData>;
  categoryKey: 'Cust_Type' | 'Acct_Industry' | 'Team';
  categoryLabel: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, categoryKey, categoryLabel }) => {
  // Group data by fiscal quarter
  const groupedByQuarter = d3.group(data, (d) => d.closed_fiscal_quarter);
  const quarters = Array.from(groupedByQuarter.keys()).sort();

  // Group data by category and calculate aggregates for each quarter
  const groupedByCategory = d3.group(data, (d) => getCategoryValue(d, categoryKey));
  const totalAcvFromAllCategories = Array.from(groupedByCategory.values()).reduce(
    (sum, entries) => {
      return sum + d3.sum(entries, (d) => d.acv);
    },
    0,
  );

  const categoryData = Array.from(groupedByCategory.entries()).map(([category, entries]) => {
    const quarterStats = quarters.map((quarter) => {
      const quarterEntries = groupedByQuarter.get(quarter) || [];
      const filteredEntries = quarterEntries.filter(
        (item) => getCategoryValue(item, categoryKey) === category,
      );
      const oppCount = d3.sum(filteredEntries, (d) => d.count);
      const acv = d3.sum(filteredEntries, (d) => d.acv);
      const totalAcvForQuarter = d3.sum(quarterEntries, (d) => d.acv);
      const percentOfTotal = totalAcvForQuarter > 0 ? (acv / totalAcvForQuarter) * 100 : 0;
      return { oppCount, acv, percentOfTotal };
    });

    // Calculate totals for the category
    const totalOppCount = d3.sum(quarterStats, (d) => d.oppCount);
    const totalAcv = d3.sum(quarterStats, (d) => d.acv);
    const totalPercentOfTotal = (totalAcv / totalAcvFromAllCategories) * 100; // Average percentage

    return {
      category,
      quarterStats,
      totalOppCount,
      totalAcv,
      totalPercentOfTotal,
    };
  });

  // Calculate overall totals
  const overallTotals = quarters.map((quarter) => {
    const entries = groupedByQuarter.get(quarter) || [];
    return {
      oppCount: d3.sum(entries, (d) => d.count),
      acv: d3.sum(entries, (d) => d.acv),
      percentOfTotal: 100, // Total is always 100% for each quarter
    };
  });
  const overallTotalOppCount = d3.sum(overallTotals, (d) => d.oppCount);
  const overallTotalAcv = d3.sum(overallTotals, (d) => d.acv);
  const overallTotalPercentOfTotal = 100; // Total is 100% overall

  return (
    <Table
      sx={{
        '& td, & th': {
          border: '1px solid rgba(224, 224, 224, 1)',
          fontSize: '0.775rem',
        },
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold' }}>Closed Fiscal Quarter</TableCell>
          {quarters.map((quarter, index) => (
            <TableCell
              key={quarter}
              colSpan={3}
              align="center"
              sx={{
                backgroundColor: index % 2 === 0 ? '#4471c4' : '#5b9bd5',
              }}
            >
              {quarter}
            </TableCell>
          ))}
          <TableCell colSpan={3} align="center" style={{ backgroundColor: '#4471c4' }}>
            Total
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold' }}>{categoryLabel}</TableCell>
          {quarters.flatMap((quarter) => [
            <TableCell key={`${quarter}-opps`} align="center" sx={{ fontWeight: 'bold' }}>
              # of Opps
            </TableCell>,
            <TableCell key={`${quarter}-acv`} align="center" sx={{ fontWeight: 'bold' }}>
              ACV
            </TableCell>,
            <TableCell key={`${quarter}-pct`} align="center" sx={{ fontWeight: 'bold' }}>
              % of Total
            </TableCell>,
          ])}
          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
            # of Opps
          </TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
            ACV
          </TableCell>
          <TableCell align="center" sx={{ fontWeight: 'bold' }}>
            % of Total
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {categoryData.map(
          ({ category, quarterStats, totalOppCount, totalAcv, totalPercentOfTotal }) => (
            <TableRow key={category}>
              <TableCell>{category}</TableCell>
              {quarterStats.map(({ oppCount, acv, percentOfTotal }) => [
                <TableCell
                  key={`${category}-${
                    quarters[quarterStats.indexOf({ oppCount, acv, percentOfTotal })]
                  }-opps`}
                >
                  {oppCount}
                </TableCell>,
                <TableCell
                  key={`${category}-${
                    quarters[quarterStats.indexOf({ oppCount, acv, percentOfTotal })]
                  }-acv`}
                >
                  ${Math.round(acv).toLocaleString()}
                </TableCell>,
                <TableCell
                  key={`${category}-${
                    quarters[quarterStats.indexOf({ oppCount, acv, percentOfTotal })]
                  }-pct`}
                >
                  {Math.round(percentOfTotal)}%
                </TableCell>,
              ])}
              <TableCell>{totalOppCount}</TableCell>
              <TableCell>${Math.round(totalAcv).toLocaleString()}</TableCell>
              <TableCell>{Math.round(totalPercentOfTotal)}%</TableCell>
            </TableRow>
          ),
        )}
        <TableRow>
          <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
          {overallTotals.map(({ oppCount, acv, percentOfTotal }, index) => [
            <TableCell key={`total-${quarters[index]}-opps`} sx={{ fontWeight: 'bold' }}>
              {oppCount}
            </TableCell>,
            <TableCell key={`total-${quarters[index]}-acv`} sx={{ fontWeight: 'bold' }}>
              ${Math.round(acv).toLocaleString()}
            </TableCell>,
            <TableCell key={`total-${quarters[index]}-pct`} sx={{ fontWeight: 'bold' }}>
              {Math.round(percentOfTotal)}%
            </TableCell>,
          ])}
          <TableCell sx={{ fontWeight: 'bold' }}>{overallTotalOppCount}</TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>
            ${Math.round(overallTotalAcv).toLocaleString()}
          </TableCell>
          <TableCell sx={{ fontWeight: 'bold' }}>{overallTotalPercentOfTotal}%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default DataTable;
