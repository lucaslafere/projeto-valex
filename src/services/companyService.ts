import * as companyRepository from '../repositories/companyRepository';

export async function validateApiKey (key: any) {
    const result = await companyRepository.findByApiKey(key);
}