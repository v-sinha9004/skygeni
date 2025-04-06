import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import BarChart from './BarChart';
import DoughnutChart from './DoughnutChart';
import DataTable from './DataTable';
import { CustomerTypeData, AccountIndustryData, TeamData } from '../types/types';

interface DataCardProps {
  title: string;
  data: Array<CustomerTypeData | AccountIndustryData | TeamData>;
  categoryKey: 'Cust_Type' | 'Acct_Industry' | 'Team';
  categoryLabel: string;
}

const DataCard: React.FC<DataCardProps> = ({ title, data, categoryKey, categoryLabel }) => {
  return (
    <Card sx={{ margin: { xs: 1, sm: 2 } }}>
      <CardContent>
        {/* Card Title */}
        <Box display="flex" justifyContent="center" mb={2}>
          <Typography variant="h6" gutterBottom align="center">
            {title}
          </Typography>
        </Box>

        {/* Charts Section */}
        <Grid container spacing={2} sx={{ marginBottom: 2 }}>
          {/* BarChart with horizontal scroll */}
          <Grid>
            <Box
              sx={{
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE/Edge
              }}
            >
              <Box sx={{ minWidth: 300 }}>
                <BarChart data={data} categoryKey={categoryKey} />
              </Box>
            </Box>
          </Grid>

          {/* DoughnutChart normally rendered */}
          <Grid>
            <DoughnutChart data={data} categoryKey={categoryKey} />
          </Grid>
        </Grid>

        {/* Scrollable Table */}
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <DataTable data={data} categoryKey={categoryKey} categoryLabel={categoryLabel} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default DataCard;
