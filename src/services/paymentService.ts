import * as paymentRepository from '../repositories/paymentRepository';

export async function payment (cardId: number, businessId: number, amount: number) {
    if (amount <= 0)
    throw {
      type: "wrong-body-format",
      message: "Amount must be > 0",
    };
    const result = await paymentRepository.insert({cardId, businessId, amount});
    return result
  }
  
  
  export async function checkCardNegativeBalance(id: number) {
    const result = await paymentRepository.findByCardId(id);
    return result;
  }