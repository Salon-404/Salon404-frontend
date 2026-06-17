import axios from 'axios';
import { services } from './endpointsUrl';

export async function getSalons()
{
    const {data} = await axios.get(services.salon);
    return data;
}