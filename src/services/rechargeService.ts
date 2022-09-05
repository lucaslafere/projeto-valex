import * as rechargeRepository from '../repositories/rechargeRepository';



export async function rechargeCard (cardId: number, amount: number){
    if (amount <= 0)
    throw {
      type: "wrong-body-format",
      message: "Amount must be > 0",
    };
    const result = await rechargeRepository.insert({cardId, amount});
    return result
  }

  export async function checkCardPositiveBalance(id: number){
    const result = await rechargeRepository.findByCardId(id);
    return result;
  }