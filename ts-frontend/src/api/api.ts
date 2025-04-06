import { CustomerTypeData, AccountIndustryData, TeamData } from '../types/types';

import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const fetchCustomerTypeData = async (): Promise<CustomerTypeData[]> => {
  const response = await axios.get(`${backendUrl}/api/customerType`);
  return response.data;
};

export const fetchAccountIndustryData = async (): Promise<AccountIndustryData[]> => {
  const response = await axios.get(`${backendUrl}/api/accountIndustry`);
  return response.data;
};

export const fetchTeamData = async (): Promise<TeamData[]> => {
  const response = await axios.get(`${backendUrl}/api/team`);
  return response.data;
};
