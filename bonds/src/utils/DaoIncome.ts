import { BondV1 } from '../../generated/BCTBondV1/BondV1'
import { Address, BigDecimal, log } from '@graphprotocol/graph-ts'

 export function getDaoIncome(bondAddress: Address, payout : BigDecimal): BigDecimal {
     const bondContract = BondV1.bind(bondAddress)
     const terms_call = bondContract.try_terms()

     let daoIncome = BigDecimal.fromString("0")
     if (terms_call.reverted === false) {

         const feeRaw = terms_call.value.value4
         const feeDecimal = feeRaw.toBigDecimal().div(BigDecimal.fromString("10000"))
         daoIncome = feeDecimal.times(payout)
     }


     return daoIncome
 }
