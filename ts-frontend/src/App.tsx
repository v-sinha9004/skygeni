import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Button } from '@mui/material';
import DataCard from './components/DataCard';
import { fetchCustomerTypeData, fetchAccountIndustryData, fetchTeamData } from './api/api';
import { CustomerTypeData, AccountIndustryData, TeamData } from './types/types';

const App: React.FC = () => {
  // State for each dataset
  const [customerTypeData, setCustomerTypeData] = useState<CustomerTypeData[]>([]);
  const [accountIndustryData, setAccountIndustryData] = useState<AccountIndustryData[]>([]);
  const [teamData, setTeamData] = useState<TeamData[]>([]);

  // State to manage which card is open or if in small cards view
  const [selectedCard, setSelectedCard] = useState<'Cust_Type' | 'Acct_Industry' | 'Team' | null>(
    null,
  );

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const customerData = await fetchCustomerTypeData();
        const industryData = await fetchAccountIndustryData();
        const teamData = await fetchTeamData();

        setCustomerTypeData(customerData);
        setAccountIndustryData(industryData);
        setTeamData(teamData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Render small cards view
  const renderSmallCards = () => (
    <Grid
      container
      spacing={2}
      style={{
        padding: '24px',
        alignItems: 'flex-start',
      }}
    >
      {customerTypeData.length > 0 && (
        <div>
          <Card
            onClick={() => setSelectedCard('Cust_Type')}
            style={{
              cursor: 'pointer',
              height: '150px',
              width: '250px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <CardContent>
              <Typography variant="h6" align="center">
                Won ACV Mix by Customer Type
              </Typography>
            </CardContent>
          </Card>
        </div>
      )}

      {accountIndustryData.length > 0 && (
        <div>
          <Card
            onClick={() => setSelectedCard('Acct_Industry')}
            style={{
              cursor: 'pointer',
              height: '150px',
              width: '250px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <CardContent>
              <Typography variant="h6" align="center">
                Won ACV Mix by Account Industry
              </Typography>
            </CardContent>
          </Card>
        </div>
      )}

      {teamData.length > 0 && (
        <div>
          <Card
            onClick={() => setSelectedCard('Team')}
            style={{
              cursor: 'pointer',
              height: '150px',
              width: '250px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <CardContent>
              <Typography variant="h6" align="center">
                Won ACV Mix by Team
              </Typography>
            </CardContent>
          </Card>
        </div>
      )}
    </Grid>
  );

  // Render full DataCard view with Back button
  const renderFullCard = () => {
    if (!selectedCard) return null;

    const cardConfig = {
      Cust_Type: {
        data: customerTypeData,
        categoryLabel: 'Cust Type',
        title: 'Won ACV Mix by Customer Type',
      },
      Acct_Industry: {
        data: accountIndustryData,
        categoryLabel: 'Acct Industry',
        title: 'Won ACV Mix by Account Industry',
      },
      Team: {
        data: teamData,
        categoryLabel: 'Team',
        title: 'Won ACV Mix by Team',
      },
    }[selectedCard];

    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setSelectedCard(null)}
            style={{ marginBottom: '20px' }}
          >
            Back
          </Button>
          {cardConfig.data.length > 0 && (
            <DataCard
              title={cardConfig.title}
              data={cardConfig.data}
              categoryKey={selectedCard}
              categoryLabel={cardConfig.categoryLabel}
            />
          )}
        </Grid>
      </Grid>
    );
  };

  return selectedCard ? renderFullCard() : renderSmallCards();
};

export default App;
