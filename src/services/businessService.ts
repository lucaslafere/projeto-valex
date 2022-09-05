import * as businessRepository from '../repositories/businessRepository';

export async function findBusinessById(id: number) {
    const result = await businessRepository.findById(id)
    return result
  }