import * as cardRepository from '../repositories/cardRepository';

export async function createCard (cardData: any) {
    return cardRepository.insert(cardData);
}