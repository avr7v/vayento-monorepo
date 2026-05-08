import { http } from './http';

export interface CountryOption {
  code: string;
  name: string;
}

export const metadataService = {
  async getCountries() {
    const { data } = await http.get<CountryOption[]>('/metadata/countries');
    return data;
  },
};
